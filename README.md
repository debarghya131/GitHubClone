# GitHub Clone

A full-stack GitHub-style project built with a Node.js/Express backend and a React/Vite frontend. The app supports user authentication, repository creation and management, public repository discovery, profile pages, project updates, and issue tracking. The backend also includes a small Git-like CLI that stores local commits in `.apnaGit` and can sync them with AWS S3.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Socket.IO, AWS SDK for S3
- Frontend: React, Vite, React Router, Axios, Primer React
- Database: MongoDB
- Storage: AWS S3 for CLI commit sync

## Project Structure

```text
.
├── backend
│   ├── config
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── index.js
│   └── package.json
└── frontend
    ├── public
    ├── src
    │   ├── assets
    │   ├── components
    │   ├── config
    │   ├── Routes.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

## Features

- Sign up and login with JWT-based sessions
- Create, view, update, delete, and search repositories
- Public/private repository visibility
- User profile with repository statistics
- Repository detail pages with project updates
- Create, close/reopen, and delete issues
- Local Git-like CLI commands: `init`, `add`, `commit`, `push`, `pull`, and `revert`

## Prerequisites

- Node.js
- npm
- MongoDB connection string
- AWS credentials configured locally if you want to use the S3-backed CLI commands

## Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3002
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
AWS_REGION=ap-south-1
S3_BUCKET=your_s3_bucket_name
```

Start the backend:

```bash
npm run dev
```

The API runs on `http://localhost:3002` by default.

## Frontend Setup

```bash
cd frontend
npm install
```

Optional frontend env file:

```env
VITE_API_BASE_URL=http://localhost:3002
```

Start the frontend:

```bash
npm run dev
```

The Vite app usually runs on `http://localhost:5173`.

## Available Scripts

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
```

## API Overview

User routes:

- `POST /signup`
- `POST /login`
- `GET /allUsers`
- `GET /userProfile/:id`
- `PUT /updateProfile/:id`
- `DELETE /deleteProfile/:id`

Repository routes:

- `POST /repo/create`
- `GET /repo/all`
- `GET /repo/:id`
- `GET /repo/name/:name`
- `GET /repo/user/:userID`
- `PUT /repo/update/:id`
- `PATCH /repo/toggle/:id`
- `DELETE /repo/delete/:id`

Issue routes:

- `POST /issue/create`
- `GET /issue/all`
- `GET /issue/:id`
- `PUT /issue/update/:id`
- `DELETE /issue/delete/:id`

## CLI Usage

Run CLI commands from the `backend` directory:

```bash
node index.js init
node index.js add path/to/file.txt
node index.js commit "Initial commit"
node index.js push
node index.js pull
node index.js revert <commitID>
```

The CLI creates a local `.apnaGit` directory with staged files and commits. `push` and `pull` use the configured S3 bucket.

## Notes

- Do not commit real `.env` files or secrets.
- The frontend stores `token` and `userId` in `localStorage`.
- The backend expects either `MONGODB_URI` or `MONGODB_URL`.
- If the frontend cannot reach the backend, check `VITE_API_BASE_URL` and `ALLOWED_ORIGINS`.

## Author Details

### Be My Friend

I always like to make new friends. Follow me on:

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Profile-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/debarghya-bandyopadhyay-953b02400?utm_source=share_via&utm_content=profile&utm_medium=member_android)

[![X](https://img.shields.io/badge/X-debarghya131-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/debarghya131)

[![GitHub](https://img.shields.io/badge/GitHub-debarghya131-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/debarghya131)

[![Portfolio](https://img.shields.io/badge/Portfolio-debarghya.org-FF7139?style=for-the-badge&logo=firefoxbrowser&logoColor=white)](https://portfolio.debarghya.org)

[![Email](https://img.shields.io/badge/Email-debarghyabandyopadhyay191%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:debarghyabandyopadhyay191@gmail.com)
