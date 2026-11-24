# 🎓 Student Attendance Tracker (MERN Stack)

A production-grade, role-based Student Attendance Tracker built strictly with the **MERN** stack (MongoDB, Express, React, Node.js). Designed for colleges and universities to eliminate paper registers, automate attendance percentage calculations, and proactively alert students when their attendance drops below the statutory 75% threshold.

---

## 🚀 Key Features

### 👑 Admin Portal
- **User Management**: Create, view, search, and paginate students and teachers.
- **Subject Management**: Create subjects (with unique codes and semesters), assign teachers, and enroll students.
- **System Hardening**: Role enforcement, rate limiting, and centralized validation.

### 👨‍🏫 Teacher Portal
- **Assigned Subjects**: View all subjects allocated by the administrator.
- **Daily Attendance Marking**: Interactive date picker, bulk present/absent toggling, and instant submission.
- **Duplicate Prevention**: Database-level unique compound index prevents duplicate attendance records for the same subject on the same day.
- **Class Reports**: Filter date-wise records, inspect student attendance percentages, and highlight at-risk students.

### 🧑‍🎓 Student Portal
- **Overall Attendance Summary**: Big-number KPI card showing total classes, attended classes, and aggregated percentage.
- **Per-Subject Attendance Cards**: Color-coded progress indicators:
  - 🟢 **Green** (`>= 75%`): Safe zone
  - 🟡 **Amber** (`70% - 74.9%`): Warning zone
  - 🔴 **Red** (`< 70%`): Critical shortage
- **Smart Prediction Math**:
  - *Below 75%*: Displays exact number of consecutive classes needed to recover to 75%.
  - *At or Above 75%*: Displays buffer classes the student can safely miss without falling below 75%.
- **Comparative Analytics**: Interactive Recharts bar chart comparing subject attendance against the 75% statutory reference line.
- **Detailed History Modal**: Full date-by-date attendance timeline.

### 🔐 Authentication & Security Hardening
- **JWT Authentication**: Secure Bearer tokens with 30-day expiry; server reads role exclusively from verified JWTs.
- **Password Security**: Passwords hashed with bcrypt (salt rounds = 10).
- **Public Self-Registration**: Students and teachers can self-register with automatic role validation.
- **OTP Password Recovery**: 6-digit numeric OTP delivered directly to user inbox via Nodemailer SMTP.
- **Security Middleware**: Helmet HTTP security headers, Express-Rate-Limit (strict limiter on auth endpoints), and Mongo-Sanitize against NoSQL injection.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19 (Vite), React Router v6, Axios, Context API, Tailwind CSS, Recharts, React Hot Toast |
| **Backend** | Node.js, Express 5, Mongoose 9, jsonwebtoken, bcryptjs, express-validator, express-rate-limit, helmet, express-mongo-sanitize, nodemailer |
| **Database** | MongoDB Atlas (Cloud Cluster) |
| **Testing** | Jest, Supertest |
| **Language** | JavaScript (ES6+), not TypeScript |

---

## 🏗 System Architecture

```text
+-------------------------------------------------------------------------------+
|                                CLIENT (React + Vite)                          |
|  [Admin Pages]          [Teacher Pages]          [Student Pages]              |
|  - ManageStudents       - MarkAttendance         - AttendanceCards            |
|  - ManageTeachers       - ClassReport            - 75% Alert Badges           |
|  - ManageSubjects       - AttendanceEdit         - Recharts Analytics         |
|                         Context API (AuthContext)                             |
|                         Axios Interceptors (Bearer JWT)                       |
+---------------------------------------+---------------------------------------+
                                        | HTTPS / REST JSON
                                        v
+-------------------------------------------------------------------------------+
|                            BACKEND (Node.js + Express 5)                      |
|  Security Middleware: Helmet | MongoSanitize | RateLimiter | CORS             |
|  Auth Middleware:     protect (JWT verification) | authorize (RBAC)           |
|                                                                               |
|  Routes & Controllers:                                                        |
|  - /api/auth       -> login, signup, forgot-password, reset-password          |
|  - /api/users      -> CRUD, search & pagination (Admin only)                  |
|  - /api/subjects   -> subject creation, teacher assignment, student enroll    |
|  - /api/attendance -> mark, update, class report, student aggregation pipeline|
+---------------------------------------+---------------------------------------+
                                        | Mongoose ODM
                                        v
+-------------------------------------------------------------------------------+
|                           DATABASE (MongoDB Atlas)                            |
|  - Users Collection       { name, email, password, role, rollNo, semester }   |
|  - Subjects Collection    { name, code, semester, teacher, students[] }       |
|  - Attendance Collection  { subject, date, records[{ student, status }], ... }|
|    * Unique Compound Index: { subject: 1, date: 1 }                           |
+-------------------------------------------------------------------------------+
```

---

## 📁 Folder Structure

```text
attendance-tracker/
├── server/
│   ├── config/
│   │   ├── db.js                     # MongoDB Mongoose connection
│   │   └── email.js                  # Nodemailer SMTP transporter
│   ├── controllers/
│   │   ├── attendanceController.js   # Mark, update, class report & student aggregation
│   │   ├── authController.js         # Login, signup, password reset & OTP
│   │   ├── subjectController.js      # Subject CRUD & student enrollment
│   │   └── userController.js         # User CRUD with search & pagination
│   ├── middleware/
│   │   ├── auth.js                   # JWT protect & RBAC authorize middleware
│   │   ├── errorHandler.js           # Centralized Mongoose/JWT/Cast error handler
│   │   └── validate.js               # express-validator field error formatting
│   ├── models/
│   │   ├── Attendance.js             # Attendance model with compound {subject, date} index
│   │   ├── Subject.js                # Subject model referencing Teacher & Students
│   │   └── User.js                   # User model with bcrypt pre-save hook
│   ├── routes/
│   │   ├── attendanceRoutes.js
│   │   ├── authRoutes.js
│   │   ├── subjectRoutes.js
│   │   └── userRoutes.js
│   ├── tests/
│   │   ├── testHelper.js             # Mock data and test JWT generators
│   │   ├── auth.test.js              # Auth & signup Jest tests
│   │   ├── roleProtection.test.js    # RBAC 401/403 Jest tests
│   │   ├── duplicateAttendance.test.js# Duplicate attendance 409 tests
│   │   └── percentageCalculation.test.js # Threshold & mathematical formula tests
│   ├── .env.example
│   ├── package.json
│   └── server.js                     # Express app setup and server entry point
└── client/
    ├── src/
    │   ├── api/
    │   │   └── axios.js              # Axios instance with Bearer token interceptor
    │   ├── components/
    │   │   ├── AttendanceCard.jsx    # Per-subject card with progress bar & predictions
    │   │   ├── ChangePasswordModal.jsx
    │   │   ├── ConfirmDialog.jsx
    │   │   ├── FormInput.jsx
    │   │   ├── Modal.jsx
    │   │   ├── Navbar.jsx            # Responsive role-aware header with mobile menu
    │   │   ├── ProtectedRoute.jsx    # Client-side RBAC route protector
    │   │   ├── Skeleton.jsx          # Table & card skeleton loaders
    │   │   └── Table.jsx             # Reusable data table
    │   ├── context/
    │   │   └── AuthContext.jsx       # Auth provider storing user and token
    │   ├── pages/
    │   │   ├── admin/                # Admin Dashboard, ManageStudents/Teachers/Subjects
    │   │   ├── teacher/              # Teacher Dashboard, MarkAttendance, ClassReport
    │   │   ├── student/              # Student Dashboard with Recharts bar chart
    │   │   ├── ForgotPassword.jsx    # 2-step OTP password reset page
    │   │   ├── Login.jsx             # Login page with demo credentials
    │   │   ├── NotFound.jsx          # 404 error page
    │   │   └── Signup.jsx            # Student / Teacher self-registration
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    ├── package.json
    ├── vercel.json                   # Vercel SPA client-side rewrite configuration
    └── vite.config.js
```

---

## ⚙️ Setup and Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn
- MongoDB Atlas cluster or local MongoDB instance

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/Student-Attendance-Tracker.git
cd Student-Attendance-Tracker
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/attendance_tracker?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRE=30d
ADMIN_EMAIL=admin@college.edu
ADMIN_PASSWORD=Admin@12345
CLIENT_URL=http://localhost:5173

# Optional: Real Nodemailer SMTP for live OTP emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="Student Attendance Tracker" <your_email@gmail.com>
```

Seed initial database (Admin, Teachers, Students, Subjects, Attendance):
```bash
node seedPhase5Data.js
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

Run the complete backend Jest test suite:

```bash
cd server
npm test
```

Expected result:
```text
PASS tests/duplicateAttendance.test.js
PASS tests/auth.test.js
PASS tests/percentageCalculation.test.js
PASS tests/roleProtection.test.js

Test Suites: 4 passed, 4 total
Tests:       23 passed, 23 total
Snapshots:   0 total
Time:        4.75 s
```

---

## 📡 API Documentation

| Method | Endpoint | Access Role | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates user, returns JWT and user profile |
| `POST` | `/api/auth/signup` | Public | Self-registration for Student or Teacher |
| `POST` | `/api/auth/forgot-password` | Public | Generates and emails 6-digit numeric OTP |
| `POST` | `/api/auth/reset-password` | Public | Verifies OTP and resets account password |
| `GET` | `/api/auth/me` | Authenticated | Fetches profile of currently logged-in user |
| `PUT` | `/api/auth/change-password` | Authenticated | Changes password verifying current password |
| `GET` | `/api/users?role=<role>` | Admin | List users with search (`?search=`) and pagination (`?page=&limit=`) |
| `POST` | `/api/auth/register` | Admin | Creates a user account directly |
| `POST` | `/api/subjects` | Admin | Creates a new subject |
| `PUT` | `/api/subjects/:id/enroll` | Admin | Enrolls a list of students into a subject |
| `GET` | `/api/subjects/my` | Teacher | Retrieves subjects assigned to the logged-in teacher |
| `POST` | `/api/attendance` | Teacher | Marks daily attendance (validates subject, date, and enrolled students) |
| `PUT` | `/api/attendance/:id` | Teacher | Updates an existing attendance record |
| `GET` | `/api/attendance/subject/:id` | Teacher, Admin | Generates comprehensive class report and percentages |
| `GET` | `/api/attendance/student/me` | Student | Aggregated attendance per subject, 75% thresholds, and overall % |

---

## 📸 Screenshots

| Feature | Preview |
|---|---|
| **Student Dashboard** | *Overall attendance card, color-coded subject cards, and 75% threshold badge* |
| **Analytics Chart** | *Recharts comparative bar chart displaying subject attendance vs. 75% reference line* |
| **Teacher Attendance** | *Clean table with Present/Absent toggles and bulk mark controls* |
| **Admin Portal** | *Paginated user lists with live search filter and enrollment modals* |

---

## 🔮 Future Improvements

1. **Biometric & QR Code Integration**: Time-bound dynamic QR codes generated by teachers for contactless check-ins.
2. **Automated Low-Attendance SMS/WhatsApp Alerts**: Automated Twilio notifications to parents/guardians when attendance falls below 65%.
3. **Automated Timetable Scheduling**: Auto-generate daily attendance sheets based on weekly classroom timetables.
4. **PDF & Excel Export**: Download semester-wise attendance sheets for university accreditation audits.
