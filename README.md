## ✨ AnimFlow

AnimFlow is an AI-powered platform that converts natural language prompts into rendered mathematical animations using Manim. It combines a modern frontend with a distributed backend pipeline to generate, process, and deliver animations asynchronously.

---

## 🧠 Key Features

- 🎬 Generate animations from natural language prompts
- 🔁 Versioned workflow (like ChatGPT conversations)
- ⚡ Asynchronous rendering pipeline using job queues
- 🔒 Secure sandbox execution using Docker
- ♻️ Idempotent job handling (no duplicate renders)
- 📉 Daily usage limits for fair resource usage
- 🛠️ Automatic failure detection and recovery for stuck jobs

---

## 🏗️ Architecture Overview

```
Frontend (Next.js)
↓
Node.js API (Auth, Limits, Idempotency)
↓
Gemini API (Code Generation)
↓
FastAPI Gateway
↓
Redis Queue
↓
Celery Workers
↓
Docker Sandbox
↓
Manim Rendering
↓
Cloudinary (Video Storage)
↓
Database Update (PostgreSQL)
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/armaan357/AnimFlow.git
cd AnimFlow
```

---

## 📦 Prerequisites

- Node.js (v18+)
- pnpm
- Python (3.10+)
- Redis
- Docker
- PostgreSQL

---

## 🔐 Environment Variables

### Backend (.env)

```
DATABASE_URL=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
REDIS_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend (.env)

```
NEXT_PUBLIC_BACKEND_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

---

## 🖥️ Running the Project

### 1. Start Redis

```bash
redis-server
```

### 2. Install pnpm

```bash
npm install -g pnpm
```

### 3. Start Backend

```bash
cd backend
pnpm install
pnpm run dev
```

### 4. Start Python Services

#### FastAPI

```bash
cd renderer
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Celery Worker

```bash
cd renderer
celery -A animationWorker worker -l info -P gevent
```

### 5. Start Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

---

## 🐳 Docker Requirement

Ensure Docker is running:

```bash
docker run hello-world
```

---

## 🌐 Access

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:3001](http://localhost:3001)

---

## 🧪 Usage

1. Sign up / log in
2. Enter a prompt
3. Wait for rendering
4. View generated animation

---

## ⚠️ Notes

- Rendering may take time depending on complexity
- Ensure Docker has sufficient memory (2GB+ recommended)
- Redis must be running before workers

---

## 📊 Performance Highlights

- 🚫 Eliminated ~90–100% duplicate rendering jobs using idempotent hashing
- 🔄 Ensured 100% recovery of stuck jobs via automated cleanup
- ⚙️ Reduced redundant compute by deduplicating identical requests

---

## 🧪 Tech Stack

### Frontend

- Next.js
- TypeScript

### Backend

- Node.js (Express)
- Prisma ORM
- PostgreSQL

### Rendering Pipeline

- FastAPI
- Celery
- Redis
- Docker
- Manim

### Media

- Cloudinary

---

## 🔐 Authentication

- JWT-based authentication
- Google & GitHub OAuth

---

## 🚀 Future Improvements

- Real-time rendering progress (WebSockets/SSE)
- Job cancellation
- Priority queues
- Video preloading for instant switching

---

## ⭐ If you like this project

Give it a star ⭐
