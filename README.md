# 📝 CollabEditor — Real-Time Collaborative Document Editor

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

A full-stack, real-time collaborative document editor built with React, Node.js, Socket.IO, and MongoDB. Multiple users can edit the same document simultaneously, with all changes seamlessly synced in real time.

---

## ✨ Features

- **Real-Time Collaboration**: Instantaneously sync keystrokes and document changes across all open sessions using Socket.IO.
- **Rich Text Editing**: Full-featured text formatting enabled by Quill.js.
- **Secure Authentication**: End-to-end user authentication with JWT and password hashing via bcrypt.
- **Access Control & Sharing**: Restrict document access. Add or remove collaborators effortlessly.
- **Live Presence Indicators**: See exactly who is currently viewing or editing the document.
- **Auto-Save**: Worry-free typing with automatic background saving every 2 seconds.
- **Responsive UI**: A clean, scalable interface that works wherever you go.

## 🛠 Tech Stack

**Frontend:** React, React Router, Axios, Quill, Socket.IO Client  
**Backend:** Node.js, Express, Socket.IO, Mongoose  
**Database:** MongoDB Atlas  
**Security/Auth:** JSON Web Tokens (JWT), bcrypt, helmet, express-rate-limit

---

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

- [Node.js](https://nodejs.org/en/) v18 or higher
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB instance)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/collab-editor.git
   cd collab-editor
   ```

2. **Set up the backend**

   ```bash
   cd server
   npm install
   cp .env.example .env
   ```

   _Make sure to update the new `.env` file with your own `MONGODB_URI` and `JWT_SECRET`._

   ```bash
   npm run dev
   ```

3. **Set up the frontend (in a new terminal)**

   ```bash
   cd client/collab-editor
   npm install
   npm run dev
   ```

4. **Open the application**
   Visit `http://localhost:5173` in your browser.

---

## 📂 Project Structure

```text
collab-editor/
├── client/                     # React Frontend
│   └── collab-editor/          # Vite + React app
│       ├── src/
│       │   ├── components/     # UI Components (Editor, Navbar, etc.)
│       │   ├── context/        # React Context (Auth, Socket)
│       │   ├── pages/          # Full Page Views (Dashboard, Login, etc.)
│       │   ├── services/       # API & Socket Services
│       │   └── App.jsx         # Root React Component
│       └── package.json
└── server/                     # Node.js + Express Backend
    ├── config/                 # DB Config
    ├── middleware/             # Auth, validation, errors, rate limits
    ├── models/                 # Mongoose schemas (User, Document)
    ├── routes/                 # API controllers (auth.js, documents.js)
    ├── index.js                # Core Express App Server
    ├── socket.js               # WebSockets event handlers
    └── package.json
```

---

## 🔌 API Endpoints

| Method   | Endpoint                                   | Description                    | Auth Required |
| -------- | ------------------------------------------ | ------------------------------ | :-----------: |
| `POST`   | `/api/auth/register`                       | Register new user              |      ❌       |
| `POST`   | `/api/auth/login`                          | Log in user                    |      ❌       |
| `GET`    | `/api/documents`                           | Get all documents for the user |      ✅       |
| `POST`   | `/api/documents`                           | Create a new document          |      ✅       |
| `GET`    | `/api/documents/:id`                       | Get a specific document        |      ✅       |
| `PUT`    | `/api/documents/:id/content`               | Save document content          |      ✅       |
| `PATCH`  | `/api/documents/:id/title`                 | Update document title          |      ✅       |
| `DELETE` | `/api/documents/:id`                       | Delete a document              |      ✅       |
| `POST`   | `/api/documents/:id/collaborators`         | Share document with user       |      ✅       |
| `DELETE` | `/api/documents/:id/collaborators/:userId` | Revoke access                  |      ✅       |

---

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables to your `server/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/collab-editor
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

_Built with ❤️ for real-time collaboration._
