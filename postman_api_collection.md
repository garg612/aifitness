# AI Fitness & Nutrition Tracker - Postman API Documentation

This document contains details of all endpoints available in the backend. 
Use these details to construct your requests manually in Postman.

* **Base URL:** `http://localhost:3000/api/v1`
* **Authorization:** For all endpoints marked with **[Requires Auth]**, pass the `accessToken` in the headers:
  ```http
  Authorization: Bearer <your_jwt_access_token>
  ```

---

## 1. Authentication Module (`/auth`)

### Register User
* **Method:** `POST`
* **Route:** `/auth/signup`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "fullName": "Kushagra Garg",
    "email": "kushagra@example.com",
    "password": "Password123!"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "User registered successfully, please check your email to verify your account",
    "data": null
  }
  ```

### Verify Email
* **Method:** `GET`
* **Route:** `/auth/verify-email/:token`
* **Params:** `:token` - The verification token received in the verification email template (console logged by Mailtrap during signup).
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Email verified successfully, you can now log in"
  }
  ```

### Login
* **Method:** `POST`
* **Route:** `/auth/login`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "email": "kushagra@example.com",
    "password": "Password123!"
  }
  ```
* **Response (200 OK):** *(Note: Sets an `HttpOnly` `refreshToken` cookie on the client)*
  ```json
  {
    "success": true,
    "accessToken": "ey...",
    "user": {
      "_id": "603d...",
      "fullName": "Kushagra Garg",
      "email": "kushagra@example.com",
      "isVerified": true,
      "role": "user"
    }
  }
  ```

### Refresh Access Token
* **Method:** `POST`
* **Route:** `/auth/refresh-token`
* **Headers:** *(Relies on browser/Postman sending the `refreshToken` Cookie automatically)*
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Token refreshed successfully",
    "data": {
      "accessToken": "ey..."
    }
  }
  ```

### Get Current User Profile details **[Requires Auth]**
* **Method:** `GET`
* **Route:** `/auth/me`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Current user fetched successfully",
    "data": {
      "_id": "603d...",
      "fullName": "Kushagra Garg",
      "email": "kushagra@example.com"
    }
  }
  ```

### Request Password Reset Link (Forgot Password)
* **Method:** `POST`
* **Route:** `/auth/forgot-password`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "email": "kushagra@example.com"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Password reset link has been sent to your email"
  }
  ```

### Complete Password Reset
* **Method:** `POST`
* **Route:** `/auth/reset-password`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "token": "<token_extracted_from_email_link>",
    "password": "NewSecurePassword123!"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Password has been reset successfully. You can now log in."
  }
  ```

### Logout **[Requires Auth]**
* **Method:** `POST`
* **Route:** `/auth/logout`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Logged out successfully"
  }
  ```

### Logout All Devices **[Requires Auth]**
* **Method:** `POST`
* **Route:** `/auth/logout-all`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Logged out from all devices"
  }
  ```

---

## 2. Personal Fitness Profile Module (`/profile`)

### Fetch Profile **[Requires Auth]**
* **Method:** `GET`
* **Route:** `/profile`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Profile fetched successfully",
    "data": {
      "user": "603d...",
      "gender": "male",
      "dob": "1995-05-15T00:00:00.000Z",
      "height": 180,
      "weight": 80,
      "targetWeight": 75,
      "startWeight": 80,
      "dietPreference": "Non-Vegetarian",
      "goal": "weight_loss",
      "activityLevel": "moderate",
      "experienceLevel": "intermediate"
    }
  }
  ```

### Update/Complete Profile **[Requires Auth]**
* **Method:** `PATCH`
* **Route:** `/profile`
* **Headers:** `Content-Type: application/json`
* **Request Body:** *(All fields are optional)*
  ```json
  {
    "gender": "male",
    "dob": "1995-05-15",
    "height": 180,
    "weight": 80,
    "targetWeight": 75,
    "dietPreference": "Non-Vegetarian",
    "goal": "weight_loss",
    "activityLevel": "moderate",
    "experienceLevel": "intermediate"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Profile updated successfully",
    "data": { ... }
  }
  ```

---

## 3. BMI Module (`/bmi`)

### Record BMI **[Requires Auth]**
* **Method:** `POST`
* **Route:** `/bmi`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "height": 180,
    "weight": 80
  }
  ```
* **Response (201 Created):** *(Category is auto-computed)*
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "BMI record created successfully",
    "data": {
      "user": "603d...",
      "height": 180,
      "weight": 80,
      "bmi": 24.69,
      "category": "Normal"
    }
  }
  ```

### Fetch BMI History **[Requires Auth]**
* **Method:** `GET`
* **Route:** `/bmi`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "BMI records retrieved successfully",
    "data": [
      {
        "height": 180,
        "weight": 80,
        "bmi": 24.69,
        "category": "Normal",
        "createdAt": "2026-06-17T12:00:00.000Z"
      }
    ]
  }
  ```

---

## 4. Workout Management Module (`/workouts`)

### Create Manual Workout Plan **[Requires Auth]**
* **Method:** `POST`
* **Route:** `/workouts`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "title": "Push Day Routine",
    "description": "Chest, shoulders, and triceps focus",
    "duration": 60,
    "difficulty": "intermediate",
    "exercises": [
      {
        "exerciseName": "Incline Dumbbell Press",
        "sets": 4,
        "reps": 12,
        "weight": 24,
        "duration": 15,
        "caloriesBurned": 120
      },
      {
        "exerciseName": "Overhead Press",
        "sets": 3,
        "reps": 10,
        "weight": 40,
        "duration": 15,
        "caloriesBurned": 90
      }
    ]
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Workout created successfully",
    "data": {
      "_id": "603f...",
      "title": "Push Day Routine",
      "duration": 60,
      "difficulty": "intermediate"
    }
  }
  ```

### List Created Workout Plans **[Requires Auth]**
* **Method:** `GET`
* **Route:** `/workouts/list`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Workouts retrieved successfully",
    "data": [ ... ]
  }
  ```

### Get Single Workout Detail **[Requires Auth]**
* **Method:** `GET`
* **Route:** `/workouts/:id`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Workout retrieved successfully",
    "data": {
      "workout": { ... },
      "exercises": [ ... ]
    }
  }
  ```

### Update Workout Plan **[Requires Auth]**
* **Method:** `PUT`
* **Route:** `/workouts/:id`
* **Headers:** `Content-Type: application/json`
* **Request Body:** *(Fields to update)*
  ```json
  {
    "title": "Updated Push Day",
    "duration": 50
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Workout updated successfully",
    "data": { ... }
  }
  ```

### Log Completed Workout **[Requires Auth]**
* **Method:** `POST`
* **Route:** `/workouts/:id/log`
* **Headers:** `Content-Type: application/json`
* **Request Body:** *(Parameters optional; falls back to template defaults if blank)*
  ```json
  {
    "duration": 55,
    "caloriesBurned": 420
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Workout logged successfully",
    "data": {
      "user": "603d...",
      "workout": "603f...",
      "completed": true,
      "status": "completed",
      "duration": 55,
      "caloriesBurned": 420,
      "completedAt": "2026-06-17T12:05:00.000Z"
    }
  }
  ```

### Fetch Workout History Logs **[Requires Auth]**
* **Method:** `GET`
* **Route:** `/workouts/history`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Workout history retrieved successfully",
    "data": [
      {
        "_id": "603e...",
        "user": "603d...",
        "workout": {
          "_id": "603f...",
          "title": "Push Day Routine",
          "duration": 60
        },
        "completed": true,
        "status": "completed",
        "duration": 55,
        "caloriesBurned": 420,
        "completedAt": "2026-06-17T12:05:00.000Z"
      }
    ]
  }
  ```

### Delete Workout Plan **[Requires Auth]**
* **Method:** `DELETE`
* **Route:** `/workouts/:id`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Workout deleted successfully"
  }
  ```

---

## 5. Meal Planning Module (`/meals`)

### Create Manual Meal Plan **[Requires Auth]**
* **Method:** `POST`
* **Route:** `/meals`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "title": "High Protein Breakfast",
    "description": "Scrambled eggs, oatmeal, and whey shake",
    "mealType": "breakfast",
    "items": [
      {
        "foodName": "Whole Eggs",
        "quantity": "3",
        "calories": 210,
        "protein": 18,
        "carbs": 1.5,
        "fats": 15
      },
      {
        "foodName": "Oats",
        "quantity": "50g",
        "calories": 190,
        "protein": 7,
        "carbs": 33,
        "fats": 3
      }
    ]
  }
  ```
* **Response (201 Created):** *(Calories are calculated automatically from items)*
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Meal created successfully",
    "data": {
      "_id": "604b...",
      "title": "High Protein Breakfast",
      "mealType": "breakfast",
      "totalCalories": 400
    }
  }
  ```

### List Created Meal Plans **[Requires Auth]**
* **Method:** `GET`
* **Route:** `/meals`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Meals fetched successfully",
    "data": [ ... ]
  }
  ```

### Get Single Meal Plan Detail **[Requires Auth]**
* **Method:** `GET`
* **Route:** `/meals/:mealId`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Meal fetched successfully",
    "data": {
      "meal": { ... },
      "item": [ ... ]
    }
  }
  ```

### Update Meal Plan **[Requires Auth]**
* **Method:** `PUT`
* **Route:** `/meals/:mealId`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "title": "Super High Protein Breakfast"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Meal updated successfully",
    "data": { ... }
  }
  ```

### Consume Meal (Log Consumption) **[Requires Auth]**
* **Method:** `POST`
* **Route:** `/meals/:mealId/consume`
* **Headers:** `Content-Type: application/json`
* **Request Body:** 
  * *For Manual Meals (leaves body empty):*
    ```json
    {}
    ```
  * *For AI-Generated Weekly Plans (requires specifying which day/meal to consume):*
    ```json
    {
      "day": "Monday",
      "mealType": "Breakfast"
    }
    ```
* **Response (200 OK):** *(Auto-aggregates all macros multiplied by quantity for manual items)*
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Meal consumed successfully",
    "data": {
      "user": "603d...",
      "mealPlan": "604b...",
      "totalCalories": 400,
      "totalProtein": 25,
      "totalCarbs": 34.5,
      "totalFat": 18,
      "consumedAt": "2026-06-17T12:08:00.000Z"
    }
  }
  ```

### Fetch Meal Consumption History **[Requires Auth]**
* **Method:** `GET`
* **Route:** `/meals/history`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Meal history fetched successfully",
    "data": [
      {
        "_id": "604c...",
        "user": "603d...",
        "mealPlan": {
          "_id": "604b...",
          "title": "High Protein Breakfast"
        },
        "totalCalories": 400,
        "totalProtein": 25,
        "totalCarbs": 34.5,
        "totalFat": 18,
        "consumedAt": "2026-06-17T12:08:00.000Z"
      }
    ]
  }
  ```

### Delete Meal Plan **[Requires Auth]**
* **Method:** `DELETE`
* **Route:** `/meals/:mealId`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Meal deleted successfully"
  }
  ```

---

## 6. AI Recommendation Module (`/ai`)

### Generate AI Workout Plan **[Requires Auth]**
* **Method:** `POST`
* **Route:** `/ai/generate`
* **Response (201 Created):** *(Takes metrics dynamically from your current UserProfile and BMIRecord. Generates a 7-day plan using Groq Llama-3)*
  ```json
  {
    "message": "AI workout plan generated and saved successfully.",
    "workout": {
      "_id": "605d...",
      "user": "603d...",
      "title": "AI Workout Plan",
      "duration": 225,
      "difficulty": "intermediate",
      "weeklyPlan": [ ... ],
      "generatedByAI": true,
      "source": "ai-generated"
    }
  }
  ```

### Generate AI Meal Plan **[Requires Auth]**
* **Method:** `POST`
* **Route:** `/ai/meal-generate`
* **Response (201 Created):** *(Takes metrics and dietPreference from UserProfile/BMIRecord and calculates TDEE target dynamically)*
  ```json
  {
    "message": "AI meal plan generated and saved successfully.",
    "workout": {
      "_id": "605e...",
      "user": "603d...",
      "title": "AI Meal Plan",
      "mealType": "full_day",
      "totalCalories": 2400,
      "dailyCalorieTarget": 2400,
      "weeklyPlan": [ ... ],
      "dietPreference": "Vegetarian",
      "generatedByAI": true,
      "source": "ai-generated"
    }
  }
  ```

---

## 7. Dashboard Module (`/dashboard`)

### Fetch Dashboard Overview **[Requires Auth]**
* **Method:** `GET`
* **Route:** `/dashboard`
* **Response (200 OK):** *(Aggregates active greeting info, bmi history trends, today's workout target, remaining daily nutrition calories, macros logs count, and weekly workout consistency percentages)*
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Dashboard fetched successfully",
    "data": {
      "greeting": {
        "name": "Kushagra Garg",
        "today": "Wednesday",
        "date": "Wed Jun 17 2026"
      },
      "profile": {
        "goal": "weight_loss",
        "activityLevel": "moderate",
        "dietPreference": "Non-Vegetarian",
        "height": 180,
        "weight": 80
      },
      "bmi": {
        "current": 24.69,
        "category": "Normal",
        "trend": [ ... ]
      },
      "todaysWorkout": { ... },
      "todaysMeal": { ... },
      "todayNutrition": {
        "caloriesConsumed": 400,
        "caloriesRemaining": 2000,
        "dailyTarget": 2400,
        "macros": {
          "protein": 25,
          "carbs": 34.5,
          "fats": 18
        }
      },
      "workoutConsistency": {
        "completedThisWeek": 1,
        "totalThisWeek": 1,
        "percentage": 100
      },
      "stats": {
        "totalWorkouts": 1,
        "totalMealPlans": 1,
        "aiWorkouts": 0,
        "aiMealPlans": 0
      },
      "goalProgress": {
        "startWeight": 80,
        "currentWeight": 80,
        "targetWeight": 75,
        "progressPercentage": 0
      }
    }
  }
  ```
