# Real-Time Opinion Polls Platform

A full-stack real-time polling application built with Next.js and FastAPI, allowing users to create, vote on, and like opinion polls with real-time updates.

## 🏗️ System Design & Architecture

### Frontend (Next.js)
- **Framework**: Next.js 16 with App Router
- **UI Components**: Built with Tailwind CSS
- **Real-time Updates**: WebSocket integration for live poll updates
### Backend (FastAPI)
- **RESTful API**: FastAPI for high-performance API endpoints
- **WebSocket**: Real-time communication for live poll updates
- **Database**: SQLite with SQLAlchemy ORM (stored in `backend/polls.db`)
- **CORS**: Configured for secure cross-origin requests

### Architecture Diagram
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Next.js       │◄───►│   FastAPI       │◄───►│    SQLite       │
│   Frontend      │     │   Backend       │     │   Database      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                         ▲
        │                         │
        ▼                         │
 ┌─────────────────┐              │
 │                 │              │
 │   WebSocket     │              │
 │   Connection    │──────────────┘
 │                 │
 └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Create a `.env.local` file in the frontend directory with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the backend directory with:
   ```
   DATABASE_URL=sqlite:///./polls.db
   ```
5. The database will be automatically created when you first run the application.
6. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

## 🌐 API Documentation

Once the backend is running, access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🛠️ Built With

### Frontend
- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type checking
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Socket.io](https://socket.io/) - Real-time communication

### Backend
- [FastAPI](https://fastapi.tiangolo.com/) - Web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) - ORM
- [Alembic](https://alembic.sqlalchemy.org/) - Database migrations
- [WebSockets](https://fastapi.tiangolo.com/advanced/websockets/) - Real-time updates

## 📚 Resources & References

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

