# Notes Backend API

A robust RESTful API backend for a notes application built with Node.js, Express, TypeScript, and MongoDB. This API provides user authentication, note management, and secure data handling.

## 🚀 Features

- **User Authentication**: Secure signup, signin, and OTP verification
- **JWT Authentication**: Access and refresh token management
- **Note Management**: CRUD operations for notes
- **Email OTP**: Secure OTP verification via email
- **TypeScript**: Full TypeScript support with type safety
- **MongoDB**: MongoDB database with Mongoose ODM
- **CORS Support**: Cross-origin resource sharing enabled
- **Cookie Management**: Secure cookie-based authentication
- **Vercel Deployment**: Ready for deployment on Vercel

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer for OTP delivery
- **Password Hashing**: bcryptjs
- **CORS**: Cross-origin resource sharing
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- Email service (for OTP delivery)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd notes-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

### 4. Run the Application

**Development mode:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

**Type checking:**
```bash
npm run type-check
```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "dob": "1990-01-01"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

#### POST `/api/auth/signin`
Sign in with email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

#### POST `/api/auth/verify-otp`
Verify OTP and complete authentication.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "accessToken": "access_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST `/api/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

#### GET `/api/auth/me`
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

#### POST `/api/auth/logout`
Logout user (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

### Notes Endpoints

All notes endpoints require authentication.

#### POST `/api/notes`
Create a new note.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "My First Note",
  "content": "This is the content of my note"
}
```

#### GET `/api/notes`
Get all notes for the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

#### PUT `/api/notes/:id`
Update a note.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

#### DELETE `/api/notes/:id`
Delete a note.

**Headers:**
```
Authorization: Bearer <access_token>
```

## 🏗️ Project Structure

```
notes-backend/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── config/                # Configuration files
│   ├── controllers/           # Route controllers
│   │   ├── authController.ts  # Authentication logic
│   │   └── noteController.ts  # Notes CRUD logic
│   ├── middleware/            # Custom middleware
│   │   └── authMiddleware.ts   # JWT verification
│   ├── models/                # Database models
│   │   ├── User.ts           # User schema
│   │   └── Note.ts           # Note schema
│   ├── routes/                # API routes
│   │   ├── authRoutes.ts     # Authentication routes
│   │   └── noteRoutes.ts     # Notes routes
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
│       └── sendOtp.ts         # Email OTP utility
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | No (default: 5000) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT access token secret | Yes |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |
| `EMAIL_USER` | Email service username | Yes |
| `EMAIL_PASS` | Email service password | Yes |

## 🚀 Deployment

### Vercel Deployment

This project is configured for easy deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

The `vercel.json` file is already configured for Node.js deployment.

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## 🔒 Security Features

- JWT-based authentication with access and refresh tokens
- Password hashing with bcryptjs
- CORS configuration for secure cross-origin requests
- Cookie-based token storage
- Email OTP verification for enhanced security
- Protected routes with middleware authentication

## 📝 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Clean build directory
- `npm run type-check` - Run TypeScript type checking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**vighnesh**

---

For any questions or issues, please open an issue in the repository. 