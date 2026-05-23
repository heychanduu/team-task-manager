# Team Task Manager – TaskFlow

A full-stack team task management web application where users can create projects, manage tasks, and collaborate with team members. Built as a simplified version of tools like Trello or Asana.

## Features

- **User Authentication** – Signup and login with JWT-based authentication
- **Project Management** – Create projects, add/remove team members
- **Task Management** – Create tasks with title, description, due date, and priority. Assign tasks to team members and track status (To Do → In Progress → Done)
- **Dashboard** – View task statistics: total tasks, tasks by status, overdue tasks, and tasks per user
- **Role-Based Access** – Admins manage tasks and members; Members can only view and update their assigned tasks

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, React Router |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Deployment | Railway |

## Project Structure

```
├── client/          # React frontend (Vite)
│   └── src/
│       ├── context/ # Auth context
│       ├── pages/   # Login, Signup, Dashboard, Projects, ProjectDetail
│       └── utils/   # API helper
├── server/          # Express backend
│   ├── config/      # Database connection
│   ├── middleware/   # JWT auth middleware
│   ├── models/      # Mongoose schemas (User, Project, Task)
│   └── routes/      # API routes (auth, projects, tasks, dashboard)
└── package.json     # Root scripts for deployment
```

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone <repo-url>
cd team-task-manager
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Configure environment variables
Create `server/.env`:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskflow
JWT_SECRET=your_secret_key_here
PORT=5000
```

### 4. Run in development
Start the backend:
```bash
npm run dev:server
```

In a separate terminal, start the frontend:
```bash
npm run dev:client
```

The frontend runs on `http://localhost:5173` and proxies API requests to the backend on port 5000.

### 5. Build for production
```bash
npm run build
```

The built frontend is served by Express in production mode.

## Deployment (Railway)

1. Push code to GitHub
2. Create a new Railway project
3. Connect your GitHub repository
4. Add environment variables:
   - `MONGO_URI` – Your MongoDB Atlas connection string
   - `JWT_SECRET` – A random secret string
   - `NODE_ENV` – Set to `production`
   - `PORT` – Railway sets this automatically
5. Set the start command to `npm start`
6. Deploy

## API Endpoints

### Auth
- `POST /api/auth/signup` – Register a new user
- `POST /api/auth/login` – Login and get JWT token
- `GET /api/auth/me` – Get current user

### Projects
- `GET /api/projects` – List user's projects
- `POST /api/projects` – Create a project
- `GET /api/projects/:id` – Get project details
- `DELETE /api/projects/:id` – Delete project (admin only)
- `POST /api/projects/:id/members` – Add member by email (admin only)
- `DELETE /api/projects/:id/members/:userId` – Remove member (admin only)

### Tasks
- `GET /api/projects/:id/tasks` – List tasks in a project
- `POST /api/projects/:id/tasks` – Create a task (admin only)
- `PATCH /api/tasks/:id` – Update task (admin: all fields, member: status only)
- `DELETE /api/tasks/:id` – Delete task (admin only)

### Dashboard
- `GET /api/dashboard` – Get aggregated task statistics
