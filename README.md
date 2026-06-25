# 🏋️ AI Fitness Platform

An AI-powered fitness management platform that helps users track their health metrics, generate personalized workout and meal plans, monitor fitness progress, and achieve their health goals through intelligent recommendations.

---

## 🚀 Features

### 🔐 Authentication & Security

* JWT Authentication
* Refresh Token Mechanism
* Email Verification
* Forgot Password & Reset Password
* Google OAuth Authentication
* Microsoft OAuth Authentication
* Secure Password Hashing
* Protected Routes

### 👤 User Profile Management

* User Registration & Login
* Profile Management
* Fitness Goal Selection
* Activity Level Tracking
* Experience Level Tracking

### 📊 Health Metrics

* BMI Calculation
* BMI History Tracking
* Weight Progress Monitoring
* Personalized Health Analytics

### 💪 Workout Management

* Personalized Workout Plans
* Workout Tracking
* Exercise Management
* Workout Completion Logs
* Weekly Workout Scheduling

### 🥗 Meal Management

* Personalized Meal Plans
* Nutrition Tracking
* Meal Consumption Logs
* Daily Calorie Tracking

### 🤖 AI-Powered Recommendations

* AI Generated Workout Plans
* AI Generated Meal Plans
* Personalized Recommendations Based on User Profile
* Groq LLM Integration

### 📈 Dashboard Analytics

* Workout Statistics
* Meal Statistics
* BMI Overview
* Weight Progress Tracking
* Calories Burned & Consumed
* Personalized Health Insights

---

## 🏗️ System Architecture

Frontend (React + Vite)
│
▼
Node.js + Express.js API
│
┌──────┼──────┐
▼      ▼      ▼

MongoDB  Groq AI  Email Service
Atlas

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

### Authentication

* JWT
* Refresh Tokens
* Google OAuth
* Microsoft OAuth

### AI Integration

* Groq API

### Deployment

* AWS EC2
* PM2
* GitHub

---

## 📁 Project Structure

```text
src
│
├── ai
├── constants
├── controllers
├── db
├── middlewares
├── models
├── routes
├── services
├── utils
├── validation
│
├── app.js
└── index.js
```

### Architecture Pattern

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Models
  ↓
MongoDB
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory.

```env
PORT=

MONGODB_URI=

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=

FRONTEND_URL=

MAIL_TRAP_SMTP_HOST=
MAIL_TRAP_SMTP_PORT=
MAIL_TRAP_SMTP_USER=
MAIL_TRAP_SMTP_PASS=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=

GROQ_API_KEY=
```

---

## 🚀 Installation

### Clone Repository

```bash
git clone <repository-url>
cd ai-fitness
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file and add all required environment variables.

### Run Development Server

```bash
npm run dev
```

### Run Production Server

```bash
npm start
```

---

## 🔒 Security Features

* Password Hashing using bcrypt
* JWT Authentication
* Refresh Token Rotation
* Email Verification
* Password Reset Workflow
* OAuth Authentication
* Input Validation
* Environment Variable Protection
* CORS Configuration
* Secure Token Storage

---

## 🌐 Deployment

The backend application is deployed on AWS EC2 using:

* Ubuntu Server
* Node.js
* PM2 Process Manager
* MongoDB Atlas

---

## 🔮 Future Enhancements

* Exercise Recommendation Engine
* Health Risk Prediction
* Wearable Device Integration
* Real-Time Notifications
* Social Fitness Features
* Advanced Analytics Dashboard
* Fitness Challenge System

---

## 👨‍💻 Contributor

* Kushagra Garg


---

## 📜 License

This project is developed for educational and learning purposes.
