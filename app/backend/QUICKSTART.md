# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment
Create a `.env` file in the `backend` directory:

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

**Important:** Change the `JWT_SECRET` and `JWT_REFRESH_SECRET` to secure random strings in production!

### Step 3: Start MongoDB
Make sure MongoDB is running on your system:

**Local MongoDB:**
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
net start MongoDB
```

**Or use MongoDB Atlas:**
- Create a free account at https://www.mongodb.com/cloud/atlas
- Get your connection string
- Update `MONGODB_URI` in `.env`

### Step 4: Seed Database (Optional)
Create a default user with sample data:

```bash
npm run seed
```

This creates:
- **Email:** `demo@example.com`
- **Password:** `Demo123!`
- Sample transactions and budgets

### Step 5: Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

### Step 6: Test the API

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Sign In (using seeded user):**
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Demo123!"
  }'
```

**Get Transactions (use accessToken from signin response):**
```bash
curl http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📝 Frontend Integration

In your Next.js frontend, update your API calls to point to the backend:

```javascript
// Example: lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const signIn = async (email, password) => {
  const response = await fetch(`${API_URL}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  
  return data;
};

export const getTransactions = async (token) => {
  const response = await fetch(`${API_URL}/api/transactions`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
};
```

## 🔧 Common Issues

### MongoDB Connection Error
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`
- For Atlas, ensure your IP is whitelisted

### Port Already in Use
- Change `PORT` in `.env` to another port (e.g., 5001)
- Or stop the process using port 5000

### JWT Token Errors
- Make sure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
- Tokens expire based on `JWT_EXPIRE` setting

## 📚 Next Steps

1. Update your frontend to use the API endpoints
2. Test all endpoints with Postman or similar tool
3. Customize validation rules in `src/utils/validations.js`
4. Adjust category keywords in `src/utils/csvParser.js`
5. Deploy to production (Heroku, AWS, DigitalOcean, etc.)

## 🆘 Need Help?

Check the main [README.md](./README.md) for detailed documentation.

