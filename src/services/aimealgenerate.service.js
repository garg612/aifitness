import groq from "../ai/groq.js";
import UserProfile from "../models/userprofile.models.js"
import BMIRecord from "../models/bmirecord.models.js";
import MealPlan from "../models/mealPlan.models.js";
import ApiError from "../utils/ApiError.js";
import AIRequest from "../models/airequest.models.js";

// TDEE Calculator using Mifflin-St Jeor formula
const calculateTDEE = (profile, bmi) => {
  const age = Math.floor(
    (new Date() - new Date(profile.dob)) / (365.25 * 24 * 60 * 60 * 1000)
  );

  let bmr;
  if (profile.gender === "male") {
    bmr = 10 * bmi.weight + 6.25 * profile.height - 5 * age + 5;
  } else {
    bmr = 10 * bmi.weight + 6.25 * profile.height - 5 * age - 161;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };

  const multiplier = activityMultipliers[profile.activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
};

const buildMealPrompt = (profile, bmi, tdee) => {
  return `
You are a professional nutritionist.

Create a 7-day meal plan for this user:

Goal: ${profile.goal}
Weight: ${bmi.weight} kg
Height: ${profile.height} cm
BMI: ${bmi.bmi}
BMI Category: ${bmi.category}
Gender: ${profile.gender}
Daily Calorie Target (TDEE): ${tdee} kcal
Diet Preference: ${profile.dietPreference}

Important instructions:
- Generate exactly 7 days from Monday to Sunday
- Total calories for each day should be within 100 kcal of ${tdee}
- Respect the diet preference strictly
- Include practical ingredients available in India
- Return ONLY a valid JSON object. No explanation. No markdown. No extra text. Just raw JSON.

Use exactly this structure:
{
  "dailyCalorieTarget": ${tdee},
  "weeklyPlan": [
    {
      "day": "Monday",
      "meals": [
        {
          "mealType": "Breakfast",
          "mealName": "string",
          "calories": 0,
          "protein": 0,
          "carbs": 0,
          "fats": 0,
          "ingredients": ["string"],
          "instructions": "string"
        }
      ]
    },
    {
      "day": "Tuesday",
      "meals": [
        {
          "mealType": "Breakfast",
          "mealName": "string",
          "calories": 0,
          "protein": 0,
          "carbs": 0,
          "fats": 0,
          "ingredients": ["string"],
          "instructions": "string"
        }
      ]
    }
  ]
}
`;
};

const hasRecentGeneration = async (userId) => {
  const recentPlan = await MealPlan.findOne({
    user: userId,
    generatedByAI: true,
    source: "ai-generated",
  }).sort({ createdAt: -1 });

  if (!recentPlan) {
    return null;
  }

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  if (new Date(recentPlan.createdAt).getTime() > sevenDaysAgo) {
    return recentPlan;
  }

  return null;
};

const parseAIResponse = (rawText) => {
  const cleaned = rawText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
};

const extractWeeklyPlan = (data) => {
  if (Array.isArray(data?.weeklyPlan) && data.weeklyPlan.length > 0) {
    return data.weeklyPlan;
  }

  // AI may return a single-day flat meals array instead of weeklyPlan
  if (Array.isArray(data?.meals) && data.meals.length > 0) {
    const first = data.meals[0];
    if (first?.day && Array.isArray(first?.meals)) {
      return data.meals;
    }
    return [{ day: "Day 1", meals: data.meals }];
  }

  return [];
};

export const generateMealPlanService = async (userId) => {
  const recentPlan = await hasRecentGeneration(userId);
  if (recentPlan) {
    throw new ApiError(409, "You already generated a meal plan this week. Please try again after 7 days or update your profile and BMI for the next cycle.");
  }

  // Fetch profile and latest BMI from DB in parallel
  // dietPreference comes from profile — no req.body, no query param
  const [profile, bmi] = await Promise.all([
    UserProfile.findOne({ user: userId }),
    BMIRecord.findOne({ user: userId }).sort({ createdAt: -1 }),
  ]);

  if (!profile) {
    throw new ApiError(400, "Please complete your profile first before generating a meal plan.");
  }

  if (!bmi) {
    throw new ApiError(400, "Please add your BMI record first before generating a meal plan.");
  }

  // Validate diet preference exists in profile
  const dietPreference = profile.dietPreference || "Non-Vegetarian";

  // Calculate TDEE from DB data
  const tdee = calculateTDEE(profile, bmi);

  // Build prompt using only DB data
  const prompt = buildMealPrompt(profile, bmi, tdee);

  // Call Groq
  let response;
  let rawText;
  let data;

  try {
    response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    rawText = response.choices[0].message.content;
    data = parseAIResponse(rawText);
  } catch (error) {
    const errorMsg = error.message || "Failed to generate or parse meal plan";
    await AIRequest.create({
      user: userId,
      requestType: "meal-plan",
      prompt,
      response: rawText || "",
      tokensUsed: response?.usage?.total_tokens || 0,
      status: "failed",
      errorMessage: errorMsg,
    }).catch(err => console.error("Failed to log failed AIRequest:", err));

    throw new ApiError(502, errorMsg);
  }

  const tokensUsed = response?.usage?.total_tokens || 0;

  // Log successful request
  await AIRequest.create({
    user: userId,
    requestType: "meal-plan",
    prompt,
    response: rawText,
    tokensUsed,
    status: "success",
  }).catch(err => console.error("Failed to log successful AIRequest:", err));

  const weeklyPlan = extractWeeklyPlan(data);

  if (weeklyPlan.length === 0) {
    throw new ApiError(502, "AI returned an empty meal plan. Please try again.");
  }

  const mealPlan = await MealPlan.create({
    user: userId,
    title: data.title || "AI Meal Plan",
    description: data.description || `Generated meal plan for ${dietPreference} diet.`,
    mealType: "full_day",
    totalCalories: data.dailyCalorieTarget || tdee,
    dailyCalorieTarget: data.dailyCalorieTarget || tdee,
    tdee,
    dietPreference,
    generatedByAI: true,
    source: "ai-generated",
    meals: weeklyPlan,
    weeklyPlan,
  });

  return mealPlan;
};