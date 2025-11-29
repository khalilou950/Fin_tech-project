# PocketGuard AI Backend API

A secure, scalable backend API for the PocketGuard AI FinTech application built with Node.js, Express.js, and MongoDB.

## 🚀 Features

- ✅ JWT Authentication (Access + Refresh Tokens)
- ✅ User Management (Signup, Signin, Profile Updates)
- ✅ Transaction Management (CRUD, CSV Upload, Filtering)
- ✅ Budget Management (Auto-recalculation based on transactions)
- ✅ Analytics Engine (Summary, Alerts, Forecasts)
- ✅ Settings Management (Currency, Theme, Profile)
- ✅ CSV Import with Category Auto-detection
- ✅ Secure Password Hashing with bcrypt
- ✅ Request Validation with Zod
- ✅ Error Handling Middleware
- ✅ CORS & Helmet Security

## 📦 Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Validation:** Zod
- **File Upload:** Multer
- **Security:** Helmet, CORS

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   ├── jwt.js           # JWT configuration
│   │   └── multer.js        # File upload configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── settingsController.js
│   │   ├── transactionController.js
│   │   ├── budgetController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication middleware
│   │   ├── errorHandler.js  # Global error handler
│   │   └── validateRequest.js # Request validation middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   └── Budget.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── settingsRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── index.js
│   ├── utils/
│   │   ├── csvParser.js     # CSV parsing utility
│   │   ├── generateTokens.js # JWT token generation
│   │   ├── validations.js   # Zod validation schemas
│   │   └── seed.js          # Database seeding script
│   └── server.js            # Express app entry point
├── uploads/                 # CSV upload directory (auto-created)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Steps

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/pocketguard-ai
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start MongoDB:**
   - Local: Make sure MongoDB is running on `localhost:27017`
   - Atlas: Use your MongoDB Atlas connection string

4. **Seed the database (optional):**
   ```bash
   npm run seed
   ```
   
   This creates a default user:
   - Email: `demo@example.com`
   - Password: `Demo123!`

5. **Start the server:**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

The server will run on `http://localhost:5000` (or the port specified in `.env`).

## 📡 API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/update-email` - Update email (Protected)
- `PUT /api/auth/update-password` - Update password (Protected)
- `POST /api/auth/logout` - Logout user (Protected)

### Settings (`/api/settings`)

- `PUT /api/settings/currency` - Update currency (Protected)
- `PUT /api/settings/theme` - Update theme (Protected)
- `PUT /api/settings/profile` - Update profile (Protected)

### Transactions (`/api/transactions`)

- `GET /api/transactions` - Get all transactions with filters (Protected)
  - Query params: `startDate`, `endDate`, `category`, `type`, `minAmount`, `maxAmount`, `search`, `page`, `limit`
- `POST /api/transactions` - Create transaction (Protected)
- `PUT /api/transactions/:id` - Update transaction (Protected)
- `DELETE /api/transactions/:id` - Delete transaction (Protected)
- `POST /api/transactions/upload-csv` - Upload CSV file (Protected, multipart/form-data)

### Budgets (`/api/budgets`)

- `GET /api/budgets` - Get all budgets (Protected, auto-recalculates spent)
- `POST /api/budgets` - Create budget (Protected)
- `PUT /api/budgets/:id` - Update budget (Protected)
- `DELETE /api/budgets/:id` - Delete budget (Protected)

### Analytics (`/api/analytics`)

- `GET /api/analytics/summary` - Get financial summary (Protected)
  - Query params: `startDate`, `endDate`
- `GET /api/analytics/alerts` - Get spending alerts (Protected)
- `GET /api/analytics/forecast` - Get spending forecast (Protected)

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Example Request:

```javascript
fetch('http://localhost:5000/api/transactions', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
```

## 📊 CSV Upload Format

The CSV file should have the following columns:

```csv
date,merchant,amount,type,category
2024-01-15,Carrefour,8500,expense,Food
2024-01-14,Uber,2500,expense,Transport
2024-01-01,Monthly Salary,150000,income,Salary
```

**Supported fields:**
- `date` - Date in ISO format (YYYY-MM-DD)
- `merchant` / `description` / `name` - Merchant name
- `amount` / `value` - Transaction amount
- `type` - `income` or `expense`
- `category` - Optional (auto-detected if missing)

## 🧪 Testing with Default User

After running `npm run seed`, you can test the API with:

**Email:** `demo@example.com`  
**Password:** `Demo123!`

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Helmet.js for security headers
- CORS configuration
- Input validation with Zod
- Error handling middleware
- File upload size limits (5MB)

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT access token secret | Required |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Required |
| `JWT_EXPIRE` | Access token expiration | `7d` |
| `JWT_REFRESH_EXPIRE` | Refresh token expiration | `30d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 🐛 Error Handling

All errors are handled centrally by the error handler middleware. Responses follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Optional validation errors
}
```

## 📦 Dependencies

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT tokens
- `bcryptjs` - Password hashing
- `zod` - Schema validation
- `multer` - File upload handling
- `cors` - CORS middleware
- `helmet` - Security headers
- `dotenv` - Environment variables

## 🚀 Deployment

1. Set `NODE_ENV=production` in your production environment
2. Use a strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
3. Configure MongoDB Atlas or production MongoDB instance
4. Update `FRONTEND_URL` to your production frontend URL
5. Consider using PM2 or similar for process management

## 📄 License

ISC

## 🤝 Support

For issues and questions, please open an issue in the repository.

