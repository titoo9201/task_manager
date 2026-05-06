# 🚀 Team Task Manager - TaskFlow

A full-stack team project and task management app built with the MERN stack.

## ✨ Features

- **Authentication** - JWT-based login/signup with bcrypt password hashing
- **Role-based Access** - Admin and Member roles with different permissions
- **Project Management** - Create, update, delete projects; manage team members
- **Task Board** - Kanban-style board with Todo, In-Progress, and Done columns
- **Dashboard** - Stats overview, overdue highlights, completion tracking
- **Real-time Filters** - Filter tasks by status, priority, and search
- **Toast Notifications** - User-friendly feedback for all actions
- **Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT, bcryptjs |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Icons | Lucide React |

## 📁 Project Structure

```
team-task-manager/
├── backend/          # Express API server
│   ├── config/       # DB connection
│   ├── controllers/  # Route handlers
│   ├── middleware/   # Auth & error middleware
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   └── server.js     # Entry point
└── frontend/         # React application
    └── src/
        ├── api/      # Axios instance
        ├── components/ # Reusable components
        ├── context/  # Auth context
        ├── pages/    # Page components
        └── routes/   # Protected routes
```

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/team-task-manager.git
cd team-task-manager
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
```

**Backend `.env`:**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
JWT_SECRET=your_long_random_secret_key_here
JWT_EXPIRE=30d
```

```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the app
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Private |
| GET | /api/auth/users | Admin |

### Projects
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/projects | Private |
| POST | /api/projects | Admin |
| PUT | /api/projects/:id | Admin |
| DELETE | /api/projects/:id | Admin |
| POST | /api/projects/:id/members | Admin |
| DELETE | /api/projects/:id/members/:userId | Admin |

### Tasks
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/tasks | Private |
| GET | /api/tasks/stats | Private |
| POST | /api/tasks | Admin |
| PUT | /api/tasks/:id | Private |
| DELETE | /api/tasks/:id | Admin |

## 🚀 Deploy to Railway

### Option 1: Separate services (Recommended)

**Backend:**
1. Go to [railway.app](https://railway.app) → New Project
2. Connect your GitHub repository
3. Select the `backend` folder as root
4. Add environment variables:
   ```
   NODE_ENV=production
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   FRONTEND_URL=https://your-frontend.railway.app
   ```
5. Deploy!

**Frontend:**
1. New Service → GitHub repo → `frontend` folder
2. Add build command: `npm run build`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```

### Option 2: Full-stack monorepo

Add to root `package.json`:
```json
{
  "scripts": {
    "build": "cd frontend && npm install && npm run build",
    "start": "cd backend && node server.js",
    "install-all": "cd backend && npm install && cd ../frontend && npm install"
  }
}
```

Set `NODE_ENV=production` and the backend will serve the built frontend.

## 👤 Default Roles

- **First registered user** → Automatically becomes Admin
- **Subsequent users** → Member by default
- Admin can create projects, create/assign tasks, manage members
- Members can view their projects, update task status

## 🧪 Demo Credentials

After seeding or first signup:
- Email: `admin@demo.com`
- Password: `password123`

## 🎨 UI Features

- Glassmorphism login page
- Kanban board with color-coded columns
- Animated cards and modals
- Overdue task highlighting in red
- Member avatars from UI Avatars API
- Color picker for projects
- Responsive sidebar with mobile overlay


# ============================================
# STEP 1: Initialize the project
# ============================================
mkdir team-task-manager && cd team-task-manager
git init

# ============================================
# STEP 2: Backend setup
# ============================================
mkdir backend && cd backend
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cors dotenv \
            express-validator morgan
npm install -D nodemon

# Create all backend files as shown above...

# ============================================
# STEP 3: Frontend setup
# ============================================
cd ..
npm create vite@latest frontend -- --template react
cd frontend
npm install axios react-router-dom react-hot-toast \
            date-fns lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Create all frontend files as shown above...

# ============================================
# STEP 4: Run in development
# ============================================
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev

# ============================================
# STEP 5: Build for production
# ============================================
cd frontend
npm run build
# dist/ folder is created

# ============================================
# STEP 6: Deploy to Railway
# ============================================
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# In backend folder
cd backend
railway init
railway up

# Set environment variables
railway variables set NODE_ENV=production
railway variables set MONGO_URI="your_mongodb_uri"
railway variables set JWT_SECRET="your_secret"

# Get your deployment URL from Railway dashboard