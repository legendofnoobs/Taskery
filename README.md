# Taskery - An AI-powered MERN Stack Task Manager

> **Taskery** is an AI-powered full-stack task management application built with the MERN (MongoDB, Express.js, React.js, Node.js) stack. It helps you organize your projects and tasks efficiently with a clean, modern, and intuitive user interface.

---

## ✨ Features

- **User Authentication**: Secure registration and login using JWT. Passwords are hashed with bcryptjs.
- **Project Management**: Create, view, update, and delete projects. Edit project details and manage favorite projects.
- **Task Management**: Add, edit, delete, and view tasks within projects. Tasks can be sorted, searched, and filtered.
- **Notes Management**: Create, view, update, and delete notes.
- **AI Chat**: An AI-powered chat feature to help you with your tasks. AI can do operations

- **Inbox**: View all tasks assigned to you across all projects in a single inbox page.
- **Activity Log**: Track all user and project activities (create, update, delete) in a dashboard log.
- **Search**: Search tasks across all projects with instant results.
- **Settings**: Update profile, change password, and manage notification preferences.
- **Responsive Design**: Fully responsive UI for desktop, tablet, and mobile.
- **Dark/Light Theme**: Toggle between dark and light modes.
- **Modern UI**: Built with Tailwind CSS for a sleek, fast, and accessible experience.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (SPA, hooks, context API)
- **React Router** (routing)
- **Axios** (API requests)
- **Tailwind CSS** (utility-first styling)
- **Vite** (fast dev/build tool)

### Backend
- **Node.js** (runtime)
- **Express.js** (API server)
- **MongoDB** (database)
- **Mongoose** (ODM)
- **JWT** (authentication)
- **bcryptjs** (password hashing)
- **dotenv** (env management)

### AI
- **Gemini** (Using their free Api)

---

## 📂 Folder Structure

```
task-manager/
├── client/                # React Frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── assets/        # Images, icons, etc.
│   │   ├── components/    # Reusable UI components
│   │   │   ├── common/    # Modals, cards, sidebar, etc.
│   │   │   ├── landing/   # Landing page components
│   │   │   ├── settings/  # Settings page components
│   │   ├── context/       # React context providers (auth, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page-level components (Home, Login, Register, Dashboard, etc.)
│   │   │   ├── dashboard/ # Dashboard sub-pages (Inbox, Projects, ActivityLog, etc.)
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite config
│   └── ...
├── server/                # Node.js/Express Backend
│   ├── config/            # DB config
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth middleware
│   ├── models/            # Mongoose models
│   │   └── schemaArch/    # JSON schema archive
│   ├── routes/            # Express routes
│   ├── server.js          # Entry point
│   ├── package.json       # Backend dependencies
│   └── vercel.json        # Vercel deployment config
├── README.md
└── ...
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/legendofnoobs/Taskery.git
   cd task-manager
   ```

2. **Backend setup:**
   ```bash
   cd server
   npm install
   # Create .env file (see .env.example)
   # Example .env:
   # PORT=5000
   # MONGO_URI=your_mongodb_connection_string
   # JWT_SECRET=your_super_secret_jwt_key
   ```

3. **Frontend setup:**
   ```bash
   cd ../client
   npm install
   # Optionally add to client/package.json:
   # "proxy": "http://localhost:5000"
   ```

### Running the Application

1. **Start backend:**
   ```bash
   cd server
   npm run dev
   # Server: http://localhost:5000
   ```
2. **Start frontend:**
   ```bash
   cd client
   npm run dev
   # App: http://localhost:3000
   ```

---

## 🎨 UI Overview

- **Landing Page**: Hero section, features, and footer.
- **Auth Pages**: Login and Register forms.
- **Dashboard**: Sidebar navigation, project cards, favorite projects, inbox, activity log, and search.
- **Project Details**: Task list, create/edit/delete tasks, project settings.
- **Task Details**: Modal/page for task info, edit, and delete.
- **Settings**: Profile, password, and notification settings.

---

## 🔒 Authentication & Authorization

- JWT-based authentication (token stored in localStorage).
- Auth middleware protects all API routes except login/register.
- Passwords are hashed with bcryptjs before storage.

---

## 📖 API Endpoints

### Auth/User
- `POST /api/users/register` — Register new user
- `POST /api/users/login` — Login and receive JWT

### Projects
- `GET /api/projects` — List all user projects
- `POST /api/projects` — Create project
- `GET /api/projects/:id` — Get project by ID
- `PUT /api/projects/:id` — Update project
- `DELETE /api/projects/:id` — Delete project
- `PUT /api/projects/:id/favorite` — Toggle favorite

### Tasks
- `GET /api/projects/:projectId/tasks` — List tasks in project
- `POST /api/projects/:projectId/tasks` — Create task
- `PUT /api/tasks/:taskId` — Update task
- `DELETE /api/tasks/:taskId` — Delete task

### Notes
- `GET /api/notes` — List all user notes
- `POST /api/notes` — Create note
- `GET /api/notes/:id` — Get note by ID
- `PUT /api/notes/:id` — Update note
- `DELETE /api/notes/:id` — Delete note

### AI Chat
- `POST /api/ai/chat` — Send a message to the AI chat

### Activity Log
- `GET /api/activity-logs` — List activity logs

---

## 🧩 Main Components & Hooks

### Components
- **common/**: Modals (create/edit/delete), Sidebar, ProjectCard, TaskCard, TaskDetailsModal, etc.
- **landing/**: Hero, Features, Footer
- **settings/**: Profile, Security, Notification settings
- **dashboard/**: Inbox, Projects, ActivityLog, SearchPage

### Hooks
- `useAuth` — Auth state and actions
- `useProjects` — Project CRUD
- `useProjectTasks` — Task CRUD
- `useNotes` — Notes CRUD
- `useAiChat` — AI Chat
- `useFavoriteProjects` — Favorite/unfavorite logic
- `useInboxTasks` — Inbox logic
- `useActivityLogs` — Activity log fetch
- `useSearchTasks` — Search logic
- `useSidebarToggle` — Sidebar open/close
- `useTaskCreation` — Task creation helpers
- `useTaskSorting` — Task sorting
- `useProfileSettings` — Profile update
- `usePasswordSecurity` — Password change
- `useNotificationSettings` — Notification prefs

---

## 🛡️ Security

- Passwords hashed with bcryptjs
- JWT tokens for authentication
- Sensitive config in `.env` (never commit secrets)

---

## 🧪 Testing

- Manual testing via UI and API endpoints


---

## 🌐 Deployment

- Vercel config for both frontend and backend (`vercel.json` in each)
- Environment variables set in Vercel dashboard

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to your branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
