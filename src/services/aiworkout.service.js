import groq from "../ai/groq.js";
import UserProfile from "../models/userprofile.models.js"
import BMIRecord from "../models/bmirecord.models.js";
import Workout from "../models/workout.models.js";
import ApiError from "../utils/ApiError.js";
import AIRequest from "../models/airequest.models.js";

const buildWorkoutPrompt = (profile, bmi) => {
  return `
You are a professional fitness trainer.

Create a 7-day workout plan for this user:

Goal: ${profile.goal}
Height: ${profile.height} cm
Weight: ${profile.weight} kg
BMI: ${bmi.bmi}
BMI Category: ${bmi.category}
Activity Level: ${profile.activityLevel}
Gender: ${profile.gender}

Return ONLY a valid JSON object. No explanation. No markdown. No extra text. Just raw JSON.

Use exactly this structure:
{
  "title": "string",
  "difficulty": "Beginner or Intermediate or Advanced",
  "weeklyPlan": [
    {
      "day": "Monday",
      "focus": "string",
      "isRestDay": false,
      "exercises": [
        {
          "exerciseName": "string",
          "sets": 3,
          "reps": 12,
          "restSeconds": 60,
          "caloriesBurned": 50
        }
      ]
    }
  ]
}

For rest days set isRestDay to true and exercises to empty array [].
Generate exactly 7 days from Monday to Sunday.
`;
};

const parseAIResponse = (rawText) => {
  const cleaned = rawText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
};

const normalizeDifficulty = (difficulty = "") => {
  const value = String(difficulty).trim().toLowerCase();
  if (["beginner", "intermediate", "advanced"].includes(value)) {
    return value;
  }
  return "beginner";
};

const hasRecentGeneration = async (userId) => {
  const recentWorkout = await Workout.findOne({
    user: userId,
    generatedByAI: true,
    source: "ai-generated",
  }).sort({ createdAt: -1 });

  if (!recentWorkout) {
    return null;
  }

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  if (new Date(recentWorkout.createdAt).getTime() > sevenDaysAgo) {
    return recentWorkout;
  }

  return null;
};

export const generateWorkoutPlanService = async (userId) => {
  const recentWorkout = await hasRecentGeneration(userId);
  if (recentWorkout) {
    throw new ApiError(409, "You already generated a workout plan this week. Please try again after 7 days or update your profile and BMI for the next cycle.");
  }

  // Fetch profile and latest BMI in parallel
  const [profile, bmi] = await Promise.all([
    UserProfile.findOne({ user: userId }),
    BMIRecord.findOne({ user: userId }).sort({ createdAt: -1 }),
  ]);

  // Validate data exists
  if (!profile) {
    const error = new Error("Please complete your profile first before generating a plan.");
    error.statusCode = 400;
    throw error;
  }

  if (!bmi) {
    const error = new Error("Please add your BMI record first before generating a plan.");
    error.statusCode = 400;
    throw error;
  }

  // Build prompt
  const prompt = buildWorkoutPrompt(profile, bmi);

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
    const errorMsg = error.message || "Failed to generate or parse workout plan";
    await AIRequest.create({
      user: userId,
      requestType: "workout-plan",
      prompt,
      response: rawText || "",
      tokensUsed: response?.usage?.total_tokens || 0,
      status: "failed",
      errorMessage: errorMsg,
    }).catch(err => console.error("Failed to log failed AIRequest:", err));

    throw new ApiError(500, errorMsg);
  }

  const tokensUsed = response?.usage?.total_tokens || 0;

  // Log successful request
  await AIRequest.create({
    user: userId,
    requestType: "workout-plan",
    prompt,
    response: rawText,
    tokensUsed,
    status: "success",
  }).catch(err => console.error("Failed to log successful AIRequest:", err));

  // Save to DB
  const weeklyPlan = Array.isArray(data.weeklyPlan) ? data.weeklyPlan : [];
  const activeDays = weeklyPlan.filter((day) => !day?.isRestDay).length;
  const duration = activeDays > 0 ? activeDays * 45 : 45;

  const workout = await Workout.create({
    user: userId,
    title: data.title || "AI Workout Plan",
    duration,
    difficulty: normalizeDifficulty(data.difficulty),
    generatedByAI: true,
    source: "ai-generated",
    weeklyPlan,
  });

  return workout;
};