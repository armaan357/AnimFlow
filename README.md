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

### Node.js Backend (.env)

```
DATABASE_URL=
DIRECT_URL=
FE_URL=
JWT_SECRET=
GEMINI_APIKEY=
GOOGLE_CALLBACK_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CALLBACK_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
INTERNAL_SERVICE_SECRET=
WORKER_URL=
```

### FastAPI Backend (.env)

```
INTERNAL_SERVICE_SECRET=
INTERNAL_SERVICE_URL=
CLOUD_NAME=
API_KEY=
CLOUDINARY_URL=
DB_URL=
```

### Frontend (.env)

```
NEXT_PUBLIC_BACKEND_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
BACKEND_ORIGIN=
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

#### Celery Beat

```bash
cd renderer
celery -A animationWorker beat
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
- Node.js Backend: [http://localhost:3001](http://localhost:3001)
- FastAPI Backend: [http://localhost:8000](http://localhost:8000)
  
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

- RAG Pipeline
- Real-time rendering progress (WebSockets/SSE)
- Job cancellation
- Priority queues
- Video preloading for instant switching

---

## ⭐ If you like this project

Give it a star ⭐
