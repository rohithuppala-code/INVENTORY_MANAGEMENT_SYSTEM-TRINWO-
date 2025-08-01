# TRINWO SOLUTIONS Inventory Management System

A modern inventory management system with a React frontend and Node.js/Express backend.

---
For admin registering:
1.First in backend folder run: node generateAdminHash.js file to set ur admin pass and hash it and copy it 
2. Now in mongodb atlas in our database users section manually insert the below one
{
  "name":" Admin name",
  "email": "Admin email",
  "password": "copied  hashed password",
  "role": "admin",
  "isActive": true,
  "createdAt": { "$date": "0000-00-00T00:00:00.000Z" },
  "updatedAt": { "$date": "0000-00-00T00:00:00.000Z" }
}
3. after this normally signin with admin email and your normal password



## Folder Structure

```
project/
├── backend/                # Backend (Node.js/Express, MongoDB)
│   ├── config/             # Database configuration
│   │   └── database.js
│   ├── middleware/         # Express middleware (auth, error handling)
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/             # Mongoose models
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── StockMovement.js
│   │   └── User.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── categories.js
│   │   ├── dashboard.js
│   │   ├── products.js
│   │   └── stock.js
│   ├── package.json        # Backend dependencies
│   ├── package-lock.json
│   └── server.js           # Entry point for backend
│
├── public/                 # Static assets
│   └── vite.svg
├── src/                    # Frontend source code (React)
│   ├── assets/             # Images and static assets
│   │   └── react.svg
│   ├── components/         # Reusable React components
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/            # React context providers
│   │   ├── AuthContext.jsx
│   │   └── InventoryContext.jsx
│   ├── pages/              # Main app pages
│   │   ├── Categories.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Products.jsx
│   │   ├── Register.jsx
│   │   └── StockMovements.jsx
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html              # Main HTML file
├── package.json            # Frontend dependencies
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── eslint.config.js
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)
- MongoDB (local or cloud instance)

### 1. Clone the repository
```sh
git clone <repo-url>
cd TRINWO-InventoryManagementSystem/project
```

### 2. Install dependencies (frontend & backend)
```sh
npm run setup
```
This will install dependencies for both the frontend and backend.

### 3. Configure environment variables
- Create a `.env` file in `backend/` with the following content:
  ```env
  PORT = your port number
  MONGODB_URI=mongodb://localhost:27017/trinwo_inventory
  JWT_SECRET=your_jwt_secret
  JWT_EXPIRE=30d
  ```

### 4. Start the development servers
```sh
npm run dev:all
```
- Frontend: http://localhost:5173
- Backend:  http://localhost:4000

---

## Frontend Dependencies
- react
- react-dom
- react-router-dom
- axios
- lucide-react
- tailwindcss
- vite

## Backend Dependencies
- express 
- mongoose
- cors
- dotenv
- bcryptjs
- jsonwebtoken
- helmet
- express-rate-limit
- nodemailer
- nodemon (dev)

---

