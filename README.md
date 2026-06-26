# 📝 CollabEditor — Real-Time Collaborative Document Editor

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JSON Web Tokens](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)

A production-ready, full-stack, real-time collaborative document editor. CollabEditor features rich text formatting, multi-user document synchronization, interactive presence indicators, history control, document exporting, and granular sharing controls.

---

## 🚀 Key Features

*   👥 **Real-Time Collaboration**: Instant, multi-session document synchronization using WebSockets (Socket.IO) and the Quill editor.
*   🎭 **Presence & Live Indicators**:
    *   **Avatars**: Real-time listing of active users currently reading/editing.
    *   **Typing Indicators**: Live indication of who is typing in the document.
*   💾 **Worry-Free Editing**:
    *   **Auto-Save**: Automatic backup of document states to the database every 2 seconds.
    *   **Manual Save Shortcut**: Quick saving with `Ctrl + S`.
*   📜 **Version History**: Interactive version logging. Compare previous versions, track edits, and restore past versions.
*   📈 **Document Statistics**: Live character count, word count, and estimated read time metrics.
*   🛠 **Document Templates**: Get started quickly with ready-made layouts (Blank, Meeting Notes, Project Spec, Resume).
*   🌐 **Export in Multiple Formats**:
    *   `Plain Text (.txt)`
    *   `Markdown (.md)`
    *   `HTML (.html)`
    *   `JSON Delta (.json)` for raw data re-importing.
*   🔍 **Command Palette (`Ctrl + K`)**: Keyboard-driven UI to instantly search documents, create files, or jump between navigation pages.
*   🔒 **Access Control & Permissions**: Manage document-level collaborations with user-specific permissions (Read/Write, Read-Only).
*   🧹 **Trash & Recycle Bin**: Safely delete files. Files in trash are automatically purged after 24 hours via a background worker job.
*   📶 **Offline Protection**: Intercepts socket dropouts with an offline status banner.

---

## 📐 System Architecture

```mermaid
graph TD
    subgraph Client [Client Application (React)]
        UI[React UI Components]
        Vite[Vite Dev Server]
        Quill[Quill Rich Text Editor]
        SocketClient[Socket.IO Client]
        APIClient[Axios Client]
    end

    subgraph Backend [Backend Server (Node.js + Express)]
        ExpressApp[Express Router]
        SocketServer[Socket.IO Server]
        AuthMiddleware[JWT / Security Middleware]
        CronJob[Cleanup Trash Cron Job]
    end

    subgraph Database [Database & Persistence]
        MongoDB[(MongoDB Server)]
    end

    UI --> Quill
    Quill <--> SocketClient
    UI --> APIClient
    
    SocketClient <-->|WebSocket Connection| SocketServer
    APIClient -->|HTTPS REST API| ExpressApp
    ExpressApp --> AuthMiddleware
    
    AuthMiddleware --> MongoDB
    SocketServer --> MongoDB
    CronJob -->|Periodic Purge| MongoDB
```

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, React Router Dom, Axios, Socket.IO Client | Client UI, client routing, and API communication |
| **Rich Text Editor** | Quill.js | Document styling, delta tracks, and format configurations |
| **Backend** | Node.js, Express, Socket.IO | App routing, server listening, and WebSockets controller |
| **Database** | MongoDB (Mongoose ORM) | Document models, user schemas, and connection streams |
| **Security** | Helmet, JWT, bcryptjs, Express Rate Limit, Express Mongo Sanitize | XSS prevention, encryption, token auth, rate limiting, and SQL/NoSQL injection guards |

---

## 📂 Project Structure

```text
collab-editor/
├── client/                     # React Frontend
│   └── collab-editor/          # Vite + React app
│       ├── public/             # Static public assets
│       ├── src/
│       │   ├── assets/         # App logos and media
│       │   ├── components/     # Reusable UI components (Editor, ShareModal, Avatars)
│       │   ├── context/        # React Context (AuthContext, SocketContext)
│       │   ├── hooks/          # Custom hooks (Keyboard Shortcuts, debounce)
│       │   ├── pages/          # Primary views (Dashboard, Editor, Settings, Trash)
│       │   ├── services/       # Network layers (API Clients, Socket emitters)
│       │   ├── styles/         # CSS design rules
│       │   ├── utils/          # Utility helpers
│       │   ├── App.jsx         # App router layout
│       │   └── main.jsx        # App entry point
│       └── package.json
└── server/                     # Node.js + Express Backend
    ├── config/                 # Database configurations (Mongoose)
    ├── jobs/                   # Recurrent server-side jobs (Trash cleanup worker)
    ├── middleware/             # Rate limiters, JWT authorization, validators
    ├── models/                 # Database models (User, Document, Version History)
    ├── routes/                 # Express API endpoints
    ├── utils/                  # Server-side helpers
    ├── socket.js               # WebSockets event listener (room joining, updates)
    ├── index.js                # Server entry point
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (version 18 or above recommended)
*   [MongoDB](https://www.mongodb.com/) (Either local MongoDB or MongoDB Atlas instance)

### Local Installation & Run

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/bansaldhruv07/collab-editor.git
    cd collab-editor
    ```

2.  **Start the Backend Server**
    ```bash
    cd server
    npm install
    ```
    *   Create a `.env` file inside the `server/` directory:
        ```bash
        cp .env.example .env
        ```
    *   Open `.env` and fill in the required variables (see [Environment Variables](#-environment-variables) section below).
    *   Run the server in development mode:
        ```bash
        npm run dev
        ```

3.  **Start the Frontend Client**
    *   Open a new terminal session in the root folder.
    ```bash
    cd client/collab-editor
    npm install
    ```
    *   Create a `.env` file in the `client/collab-editor/` directory:
        ```env
        VITE_API_URL=http://localhost:5000
        ```
    *   Run the Vite development server:
        ```bash
        npm run dev
        ```

4.  **Access the App**
    *   Open your browser and visit `http://localhost:5173`.
    *   Register a new account or log in with existing credentials to begin editing!

---

## 🔌 API Endpoints

### Authentication
*   `POST /api/auth/register` — Register a new user account.
*   `POST /api/auth/login` — Sign in and retrieve a JWT authorization token.
*   `GET /api/auth/me` — Retrieve details of the currently authenticated user.

### Document Management
*   `GET /api/documents` — Fetch all documents the user owns or collaborates on.
*   `POST /api/documents` — Create a new document (supports template initialization).
*   `GET /api/documents/:id` — Retrieve a specific document's details and content.
*   `PUT /api/documents/:id/content` — Save document changes/deltas.
*   `PATCH /api/documents/:id/title` — Rename a document title.
*   `DELETE /api/documents/:id` — Soft-delete a document (move it to trash).

### Sharing & Collaboration
*   `POST /api/documents/:id/collaborators` — Add a user as a document collaborator (read-only/read-write).
*   `DELETE /api/documents/:id/collaborators/:userId` — Revoke collaborator access.

---

## ⚙️ Environment Variables

### Backend Configuration (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/collab_editor # Local or MongoDB Atlas URI
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend Configuration (`client/collab-editor/.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Context | Action |
| :--- | :--- | :--- |
| **`Ctrl + K`** | Global | Open the Command Palette search |
| **`?`** | Global | Display keyboard shortcuts menu |
| **`Ctrl + N`** | Dashboard | Create a new blank document |
| **`Ctrl + S`** | Editor | Manually save document state |
| **`Ctrl + B`** | Editor | Toggle Bold format on selection |
| **`Ctrl + I`** | Editor | Toggle Italic format on selection |
| **`Ctrl + Z`** | Editor | Undo last change |
| **`Ctrl + Shift + Z`** | Editor | Redo last change |

---

_Built with ❤️ for real-time collaboration._
