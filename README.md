# Taskery - A MERN Stack Task Manager

Welcome to Taskery! A full-stack task management application built with the MERN (MongoDB, Express.js, React.js, Node.js) stack. Taskery helps you organize your projects and tasks efficiently with a clean and intuitive user interface.

## ✨ Features

*   **User Authentication**: Secure user registration and login using JSON Web Tokens (JWT).
*   **Project Management**: Create, view, update, and delete your projects.
*   **Task Management**: Add, edit, and remove tasks within each project.
*   **Favorite Projects**: Mark your important projects as favorites for quick access. The UI updates smoothly without flickering.
*   **Responsive Design**: A clean and user-friendly interface that works on all devices.
*   **Dark Theme**: Switch between light and dark modes for comfortable viewing.

## 🛠️ Tech Stack

The application is built using modern web technologies:

*   **Frontend**:
    *   [React.js](https://reactjs.org/) - A JavaScript library for building user interfaces.
    *   [React Router](https://reactrouter.com/) - For client-side routing and navigation.
    *   [Axios](https://axios-http.com/) - For making promise-based HTTP requests to the backend API.
    *   [React Context API](https://reactjs.org/docs/context.html) - For global state management (e.g., theme, user authentication).
    *   [Tailwind CSS](https://tailwindcss.com/) / [Styled-Components](https://styled-components.com/) - For styling the application.

*   **Backend**:
    *   [Node.js](https://nodejs.org/) - JavaScript runtime environment.
    *   [Express.js](https://expressjs.com/) - A minimal and flexible web framework for Node.js.
    *   [MongoDB](https://www.mongodb.com/) - A NoSQL database for storing application data.
    *   [Mongoose](https://mongoosejs.com/) - An Object Data Modeling (ODM) library for MongoDB and Node.js.
    *   [JSON Web Token (JWT)](https://jwt.io/) - For implementing secure, token-based authentication.
    *   [bcryptjs](https://www.npmjs.com/package/bcryptjs) - For hashing user passwords before storing them.
    *   [dotenv](https://www.npmjs.com/package/dotenv) - For managing environment variables.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed on your system:

*   [Node.js](https://nodejs.org/en/download/) (v16 or later recommended)
*   [npm](https://www.npmjs.com/get-npm) or [yarn](https://classic.yarnpkg.com/en/docs/install/)
*   [MongoDB](https://www.mongodb.com/try/download/community) - Installed and running locally, or a connection string to a cloud instance (e.g., MongoDB Atlas).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/legendofnoobs/Taskery.git
    cd Taskery
    ```

2.  **Setup Backend:**
    *   Navigate to the server directory (this might be the root directory or a `server/` folder).
        ```bash
        # If in a separate folder:
        # cd server
        npm install
        ```
    *   Create a `.env` file in the backend's root directory. You can copy the `.env.example` if one exists. Add the following environment variables:
        ```env
        PORT=5000
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_super_secret_jwt_key
        ```

3.  **Setup Frontend:**
    *   Navigate to the client directory (assuming it's named `client/`).
        ```bash
        # From the root directory:
        cd client
        npm install
        ```
    *   To ensure the frontend can communicate with the backend during development, you can add a `proxy` to your `client/package.json`:
        ```json
        "proxy": "http://localhost:5000"
        ```

### Running the Application

1.  **Start the Backend Server:**
    *   From the backend directory:
        ```bash
        npm run dev
        ```
    *   The server will start on `http://localhost:5000` (or the port you specified in `.env`).

2.  **Start the Frontend Development Server:**
    *   From the `client/` directory:
        ```bash
        npm run dev
        ```
    *   The application should open automatically in your browser at `http://localhost:3000`.

## 📂 Project Structure

The project follows a standard MERN structure, separating the client and server code for better organization and scalability.

```
task-manager/
├── client/         # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── ...
├── server/         # Node.js/Express Backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```
*(Note: This is a representative structure. The actual folder names and layout might vary slightly.)*

## 📖 API Endpoints

The backend provides a RESTful API for managing users, projects, and tasks. All routes are protected and require authentication, except for login/register.

### User Routes
*   `POST /api/users/register` - Register a new user.
*   `POST /api/users/login` - Log in a user and receive a JWT.

### Project Routes
*   `GET /api/projects` - Get all projects for the logged-in user.
*   `POST /api/projects` - Create a new project.
*   `GET /api/projects/:id` - Get a single project by its ID.
*   `PUT /api/projects/:id` - Update a project's details.
*   `DELETE /api/projects/:id` - Delete a project.
*   `PUT /api/projects/:id/favorite` - Toggle the favorite status of a project.

### Task Routes
*   `GET /api/projects/:projectId/tasks` - Get all tasks for a specific project.
*   `POST /api/projects/:projectId/tasks` - Create a new task within a project.
*   `PUT /api/tasks/:taskId` - Update a task (e.g., content, status).
*   `DELETE /api/tasks/:taskId` - Delete a task.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
