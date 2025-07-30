# StudyHorizon Backend 🎓

Welcome to the backend repository for **StudyHorizon**, a feature-rich EdTech platform that empowers **students to learn** and **instructors to teach** seamlessly, with integrated tools for content creation, secure payments, structured curriculum delivery, and more.

🔗 **Backend Repository:** [StudyHorizon-Backend](https://github.com/anishbhujbal7/StudyHorizon-Backend)

## 📌 Table of Contents

- [✨ Features](#-features)
- [⚙️ Tech Stack](#️-tech-stack)
- [🛠️ Setup Instructions](#️-setup-instructions)
- [📦 API Endpoints](#-api-endpoints)
- [💳 Payment Gateway (Razorpay)](#-payment-gateway-razorpay)
- [📁 Project Structure](#-project-structure)
- [🧪 Testing](#-testing)
- [🔐 Environment Variables](#-environment-variables)
- [📄 License](#-license)

## ✨ Features

StudyHorizon backend has been built with **modular design**, **security**, and **scalability** in mind.

### 🔐 Authentication & Authorization
- JWT-based login/signup system
- OTP verification for user registration
- Secure password reset flow using email and tokens
- Authentication middleware ensures protected routes are accessible only to logged-in users
- Role-based access control differentiates `Student`, `Instructor`, and `Admin`

### 🧑‍🏫 Role-Based Functionalities
- **Students** can browse, purchase, and enroll in courses
- **Instructors** can create courses, sections, and upload content
- Protected routes ensure users can only access features relevant to their role

### 📂 Categories, Sections & Subsections
- Courses are organized by **Categories** (e.g., Programming, Business)
- Each course includes multiple **Sections** (chapters/modules)
- **Subsections** represent lessons/videos/files inside sections
- CRUD operations are implemented for each layer

### 💬 Ratings & Reviews
- Students can submit **course reviews** and **star ratings** post-enrollment
- Instructors can view feedback and use it to improve content
- Average ratings are computed and shown with each course

### 🖼️ Media Uploads with Cloudinary
- All media files (thumbnails, profile pics, lecture videos) are uploaded using **Cloudinary**
- Uploads are secured and optimized for performance

### 📧 Mailing System
- Email verification, OTP delivery, and password reset handled via **Nodemailer**
- Emails are styled using **HTML templates** for a professional UX

### 🧱 Middleware Integration
- `auth` middleware protects sensitive endpoints
- `isStudent`, `isInstructor` middleware ensures role-restricted access
- `upload` middleware handles file handling using **Multer + Cloudinary**

### 🔒 Protected Routes
- Users cannot access others' data
- Auth-required routes return 401 if JWT is missing/invalid
- Role checks built into course, profile, and payment routes

### 🔗 Tight Feature Integration
All components work together cohesively:
- Authenticated students can purchase a course via Razorpay → auto-enrollment → course visible in their dashboard
- Instructors upload course content → tied to sections/subsections → students progress tracked → ratings enabled only after watching
- Email OTPs and password resets are connected to the user model and mail template engine
- Cloudinary uploads store all assets under user/course-specific folders

## ⚙️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js + Express | Backend Server |
| MongoDB (Mongoose) | NoSQL Database |
| JWT | User Authentication |
| Bcrypt | Password Hashing |
| Multer + Cloudinary | File Uploads |
| Razorpay SDK | Payment Gateway |
| Nodemailer | Email Sending |
| dotenv | Environment Config |

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account
- Razorpay account
- Email service (Gmail/SMTP)

### Installation

```bash
# Clone the repository
git clone https://github.com/anishbhujbal7/StudyHorizon-Backend.git
cd StudyHorizon-Backend

# Install dependencies
npm install

# Create .env file with credentials (see Environment Variables section)
touch .env

# Run the server
npm run dev
```

The server will start on `http://localhost:5000` (or your specified PORT).

## 📦 API Endpoints

### Auth Routes
- `POST /auth/sendotp` → Send email OTP
- `POST /auth/signup` → Create account (Student or Instructor)
- `POST /auth/login` → Authenticate and return JWT
- `POST /auth/reset-password-token` → Request reset token
- `POST /auth/reset-password` → Reset password
- `POST /auth/changepassword` → Change password (auth required)

### Course & Content Routes
- `POST /course/create` → Instructor adds course
- `POST /course/section` → Add section to course
- `POST /course/subsection` → Add lesson/video to section
- `POST /course/edit` → Edit course content
- `GET /course/:id` → Get full course details
- `GET /course/category/:id` → List courses by category

### Categories Routes
- `POST /category/create` → Admin adds new category
- `GET /category/all` → List all categories

### Payment Routes (Razorpay)
- `POST /payment/capture` → Create Razorpay order
- `POST /payment/verify` → Verify Razorpay signature and enroll student

### Reviews Routes
- `POST /review/create` → Submit course rating & review
- `GET /review/:courseId` → Get all reviews for course

### Profile Routes
- `GET /profile/me` → Fetch current user's profile
- `PUT /profile/edit` → Update personal info
- `POST /profile/upload-image` → Upload profile picture

## 💳 Payment Gateway (Razorpay)

Payment integration with **Razorpay** enables:
- One-click secure checkout
- Verification of transactions using Razorpay's HMAC signature
- Students automatically enrolled into course post-payment
- Payment history stored per user

✅ **The Razorpay payment system is fully functional and tested.**

## 📁 Project Structure

```
StudyHorizon-Backend/
│
├── config/              # Database and cloud configs
├── controllers/         # Auth, Course, Payment, Profile, Review
├── mail/
│   └── templates/       # HTML Email templates
├── middleware/          # Auth and role-based middleware
├── models/              # Mongoose schemas
├── routes/              # API routes
├── utils/               # OTP generator, email sender, etc.
├── .env                 # Environment variables
├── index.js             # Main server file
└── package.json         # Dependencies and scripts
```

## 🧪 Testing

You can use **Postman** to test each flow:

1. **Register** → `/auth/sendotp`, then `/auth/signup`
2. **Login** → `/auth/login`
3. **Course** → `/course/create`, then add sections/subsections
4. **Payment** → `/payment/capture`, then `/payment/verify`
5. **Profile** → `/profile/edit` or `/profile/upload-image`

### Running Tests
```bash
# If you have test scripts configured
npm test
```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000

# Database
MONGODB_URI=your_mongo_uri

# JWT
JWT_SECRET=your_secret_key

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret

# Razorpay
RAZORPAY_KEY=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret

# Email Configuration
MAIL_USER=your_email@example.com
MAIL_PASS=your_email_password
```

| Variable | Description |
|----------|-------------|
| `PORT` | Server port |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT secret key |
| `CLOUDINARY_*` | Cloudinary API credentials |
| `RAZORPAY_*` | Razorpay credentials |
| `MAIL_USER`, `MAIL_PASS` | Email SMTP credentials |

## 🚀 Deployment

The application can be deployed on platforms like:
- Heroku
- Vercel
- AWS
- Railway
- DigitalOcean

Make sure to configure environment variables on your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the **MIT License**. You may use, modify, and distribute it for personal or commercial purposes.

## 👨‍💻 Author

Made with ❤️ by **Anish Bhujbal**

📘 **Backend of StudyHorizon – The Future of Learning**

---

## 📚 Additional Resources

- [Swagger UI API Documentation](link-to-swagger) (Coming Soon)
- [Postman Collection](link-to-postman) (Coming Soon)
- [Frontend Integration Guide](link-to-frontend-guide) (Coming Soon)

## 🐛 Issues & Support

If you encounter any issues or have questions, please [open an issue](https://github.com/anishbhujbal7/StudyHorizon-Backend/issues) on GitHub.

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!