# EduConnect - Peer-to-Peer Learning Platform

**UN SDG 4: Quality Education** - Ensuring inclusive and equitable quality education and promoting lifelong learning opportunities for all.

## Project Structure

```
educonnect/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env
├── .gitignore
└── README.md
```

## Features

- User Registration & Authentication (Student/Tutor roles)
- Tutor Profiles with ratings and reviews
- Create and browse tutoring sessions
- Book free tutoring sessions
- Session management dashboard
- Mobile-responsive design
- Free peer-to-peer learning (supporting SDG 4)

## Setup Instructions

### 1. MongoDB Atlas Setup

1. Go to mongodb.com/cloud/atlas
2. Create free account
3. Create a new cluster (free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_12345
PORT=5000
```

Run backend:
```bash
npm start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in frontend folder:
```
VITE_API_URL=http://localhost:5000/api
```

Run frontend:
```bash
npm run dev
```

## Deployment

### Backend (Render.com)

1. Push code to GitHub
2. Go to render.com
3. New → Web Service
4. Connect your repo, select backend folder
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables (MONGODB_URI, JWT_SECRET)

### Frontend (Vercel)

1. Go to vercel.com
2. Import your GitHub repo
3. Root directory: `frontend`
4. Framework preset: Vite
5. Add environment variable: `VITE_API_URL=your_backend_url/api`
6. Deploy

## Tech Stack

- **MongoDB** - Database
- **Express** - Backend framework
- **React** - Frontend framework
- **Node.js** - Runtime
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **JWT** - Authentication

## User Roles

**Student:**
- Browse tutors and sessions
- Book tutoring sessions
- Leave reviews

**Tutor:**
- Create tutoring sessions
- Manage your sessions
- Build reputation through ratings

## License

MIT
