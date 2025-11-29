# Finovia - Personal Finance Management Application

<div align="center">

![FinTech](https://img.shields.io/badge/FinTech-Financial-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![Express](https://img.shields.io/badge/Express-4-lightgrey)

A modern, full-stack personal finance management application built with Next.js and Express.js. Manage your transactions, budgets, and gain insights into your spending habits with beautiful analytics and charts.

</div>

## ✨ Features

### 📊 Dashboard
- **Financial Overview**: Get a quick snapshot of your income, expenses, and balance
- **Category Breakdown**: Visual pie charts showing spending by category
- **Recent Transactions**: Quick access to your latest financial activities
- **Budget Alerts**: Real-time notifications when budgets are exceeded

### 💰 Transaction Management
- **CRUD Operations**: Create, read, update, and delete transactions
- **CSV Import**: Bulk import transactions from CSV files
- **Advanced Filtering**: Filter by date range, category, type, and amount
- **Smart Categorization**: Automatic category detection for imported transactions
- **Multiple Formats**: Support for various CSV formats and delimiters

### 📈 Budget Management
- **Flexible Budgets**: Set budgets by category with custom limits
- **Auto-Recalculated Spending**: Real-time tracking of budget usage
- **Visual Indicators**: See at a glance which budgets are over or under
- **Budget Alerts**: Get notified when approaching or exceeding budget limits

### 📉 Analytics & Insights
- **Financial Summary**: Comprehensive overview of income vs expenses
- **Spending Trends**: Track your spending patterns over time
- **Category Analysis**: Understand where your money goes
- **Interactive Charts**: Beautiful visualizations using Recharts
- **Date Range Filtering**: Analyze specific time periods

### ⚙️ Settings & Preferences
- **User Profile**: Manage your personal information
- **Currency Settings**: Set your preferred currency
- **Theme Customization**: Light and dark mode support
- **Security**: Update email and password securely

### 🔐 Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Protected Routes**: Middleware for route protection
- **Session Management**: Secure session handling

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context API
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 4
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Security**: bcryptjs
- **Validation**: Zod & Express Validator
- **File Upload**: Multer
- **Security**: Helmet & CORS

### Development Tools
- **Type Safety**: TypeScript
- **Code Quality**: ESLint
- **Package Manager**: npm
- **Development Server**: Nodemon (backend)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18 or higher
- **npm**: v9 or higher (comes with Node.js)
- **MongoDB**: Local installation or MongoDB Atlas account
- **Git**: For version control

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Finovia
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd app/backend
npm install
cd ../..
```

### 4. Configure Environment Variables

#### Backend Configuration

Create a `.env` file in `app/backend/` directory:

```bash
cd app/backend
cp env.template .env
```

Edit `app/backend/.env` with your configuration:

```env
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/pocketguard-ai
# For MongoDB Atlas:
# Get your connection string from MongoDB Atlas dashboard and set it below:
# MONGODB_URI=your-mongodb-atlas-connection-string-here

# JWT Configuration
# Generate secure secrets using:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

#### Frontend Configuration (Optional)

Create a `.env.local` file in the root directory if you need to override API endpoints:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 5. Start MongoDB

#### Local MongoDB
```bash
# macOS/Linux
mongod

# Windows
# Start MongoDB service from Services panel or:
net start MongoDB
```

#### MongoDB Atlas
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

### 6. Seed the Database (Optional)

Populate the database with sample data:

```bash
cd app/backend
npm run seed
```

This creates a default user:
- **Email**: `demo@example.com`
- **Password**: `Demo123!`

### 7. Run the Application

#### Development Mode

**Terminal 1 - Start Backend Server:**
```bash
cd app/backend
npm run dev
```

The backend API will run on `http://localhost:5000`

**Terminal 2 - Start Frontend Server:**
```bash
npm run dev
```

The frontend application will run on `http://localhost:3000`

#### Production Mode

**Build the frontend:**
```bash
npm run build
```

**Start production servers:**
```bash
# Frontend
npm start

# Backend (in app/backend directory)
npm start
```

## 📁 Project Structure

```
Finovia/
├── app/                          # Next.js App Router directory
│   ├── api/                      # Next.js API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── transactions/         # Transaction endpoints
│   │   ├── budgets/              # Budget endpoints
│   │   ├── dashboard/            # Dashboard endpoints
│   │   └── user/                 # User endpoints
│   ├── backend/                  # Express.js backend server
│   │   ├── src/
│   │   │   ├── config/           # Configuration files
│   │   │   ├── controllers/      # Request controllers
│   │   │   ├── middleware/       # Express middleware
│   │   │   ├── models/           # MongoDB models
│   │   │   ├── routes/           # API routes
│   │   │   └── utils/            # Utility functions
│   │   ├── uploads/              # CSV upload directory
│   │   └── package.json
│   ├── components/               # React components
│   │   ├── ui/                   # UI components (Radix UI)
│   │   └── ...                   # Feature components
│   ├── lib/                      # Utility libraries
│   │   ├── api.ts                # API client
│   │   ├── auth.ts               # Auth utilities
│   │   └── ...
│   ├── models/                   # TypeScript models
│   ├── transactions/             # Transactions page
│   ├── budgets/                  # Budgets page
│   ├── analytics/                # Analytics page
│   ├── settings/                 # Settings page
│   ├── signin/                   # Sign in page
│   ├── signup/                   # Sign up page
│   ├── page.tsx                  # Dashboard page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── public/                       # Static assets
├── .gitignore
├── package.json                  # Frontend dependencies
├── tsconfig.json                 # TypeScript configuration
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `GET /api/user/me` - Get current user (Protected)
- `PUT /api/user/update-email` - Update email (Protected)
- `PUT /api/user/update-password` - Update password (Protected)
- `POST /api/auth/logout` - Logout user (Protected)

### Transactions
- `GET /api/transactions/list` - Get all transactions with filters (Protected)
- `POST /api/transactions/create` - Create transaction (Protected)
- `PUT /api/transactions/update` - Update transaction (Protected)
- `DELETE /api/transactions/delete` - Delete transaction (Protected)
- `POST /api/transactions/upload` - Upload CSV file (Protected)

### Budgets
- `GET /api/budgets/list` - Get all budgets (Protected)
- `POST /api/budgets/create` - Create budget (Protected)
- `PUT /api/budgets/update` - Update budget (Protected)
- `DELETE /api/budgets/delete` - Delete budget (Protected)

### Analytics
- `GET /api/dashboard/summary` - Get financial summary (Protected)
- `GET /api/dashboard/analytics` - Get analytics data (Protected)
- `GET /api/dashboard/alerts` - Get spending alerts (Protected)

### Settings
- `GET /api/user/settings` - Get user settings (Protected)
- `PUT /api/user/settings` - Update user settings (Protected)

## 📝 CSV Upload Format

The application supports CSV import with the following format:

```csv
date,merchant,amount,type,category
2024-01-15,Carrefour,85.50,expense,Food
2024-01-14,Uber,25.00,expense,Transport
2024-01-01,Monthly Salary,1500.00,income,Salary
```

**Supported fields:**
- `date` - Date in ISO format (YYYY-MM-DD) or various formats
- `merchant` / `description` / `name` - Merchant/transaction name
- `amount` / `value` - Transaction amount
- `type` - `income` or `expense`
- `category` - Optional (auto-detected if missing)

## 🔒 Security Features

- ✅ JWT-based authentication with access and refresh tokens
- ✅ Password hashing using bcrypt
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Input validation with Zod
- ✅ Error handling middleware
- ✅ File upload size limits
- ✅ SQL injection protection (MongoDB)
- ✅ XSS protection

## 🧪 Testing

### Backend API Testing

```bash
cd app/backend
npm test
```

### Manual Testing

1. Use the seeded demo account:
   - Email: `demo@example.com`
   - Password: `Demo123!`

2. Test API endpoints using:
   - Postman
   - Thunder Client (VS Code extension)
   - Browser DevTools

## 🚢 Deployment

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy

### Backend Deployment

**Option 1: Vercel Serverless Functions**
- Deploy Next.js API routes directly with frontend

**Option 2: Separate Server (Railway, Render, Heroku)**
1. Set up Node.js environment
2. Configure MongoDB Atlas
3. Set environment variables
4. Deploy Express backend

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👤 Author

Your Name

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Radix UI for accessible components
- MongoDB for the database solution
- All contributors and open-source libraries used

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Note**: Remember to change all default secrets and configuration values before deploying to production!

