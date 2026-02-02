# Real-Time Opinion Polls Platform

A full-stack real-time polling application built with Next.js and FastAPI, allowing users to create, vote on, and like opinion polls with real-time updates.

## 🏗️ System Design & Architecture

### Frontend (Next.js)
- **Framework**: Next.js 16 with App Router
- **UI Components**: Built with Tailwind CSS with custom design system
- **Real-time Updates**: WebSocket integration for live poll updates
- **Theme System**: Full dark/light mode support with consistent color palette

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
│   WebSocket     │──────────────┘
│   Connection    │
│                 │
└─────────────────┘
```

## 🎨 Design System

### Theme Colors
The application uses a consistent color palette defined in `tailwind.config.ts`:

| Color | Usage |
|-------|-------|
| `primary` (Indigo) | Main brand color, buttons, links, active states |
| `accent` (Purple) | Secondary accents, highlights |
| `success` (Emerald) | Success states, positive actions |
| `warning` (Amber) | Warning states, attention needed |
| `error` (Red) | Error states, destructive actions |
| `neutral` (Zinc) | Text, backgrounds, borders |

### Design Principles
- **Sharp Edges**: All components use minimal border-radius for a clean, modern look
- **Consistent Spacing**: 4px grid system for all spacing values
- **Elevated Shadows**: Subtle shadows for depth and hierarchy
- **Dark Mode**: Full dark mode support with proper contrast ratios

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

## 📱 Features

### Core Features
- **Create Polls**: Create polls with custom options and duration
- **Vote on Polls**: Cast votes on active polls
- **Like Polls**: Like your favorite polls
- **Real-time Updates**: Live updates via WebSocket
- **Dark Mode**: Toggle between light and dark themes

### Dashboard Features
- **Overview Stats**: View active polls, closed polls, total votes, total likes
- **Participation Rate**: Track community engagement
- **Top Performer**: Highlight the most voted poll
- **Highlights Section**: Feature cards with platform capabilities

### UI Components
- **Button**: Multiple variants (primary, secondary, outline, ghost, destructive)
- **Card**: Flexible card component with header, content, footer
- **Badge**: Status badges (default, success, warning, error, primary)
- **Input**: Form inputs with validation states
- **EmptyState**: Empty state component for better UX

## 🛠️ Built With

### Frontend
- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type checking
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Socket.io](https://socket.io/) - Real-time communication
- [Lucide React](https://lucide.dev/) - Icon library

### Backend
- [FastAPI](https://fastapi.tiangolo.com/) - Web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) - ORM
- [Alembic](https://alembic.sqlalchemy.org/) - Database migrations
- [WebSockets](https://fastapi.tiangolo.com/advanced/websockets/) - Real-time updates

## 📁 Project Structure

```
rttime opinion polls/
├── readme.md
├── frontend/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── dashboard/
│   │   │   ├── explore/
│   │   │   └── create-poll/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── dashboard/
│   │   ├── forms/
│   │   ├── layout/
│   │   └── polls/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   └── tailwind.config.ts
├── backend/
│   ├── app/
│   │   ├── db/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── main.py
│   │   └── websocket.py
│   └── requirements.txt
└── plans/
    └── frontend-improvement-plan.md
```

## 🌐 API Documentation

Once the backend is running, access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📚 Resources & References

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

*Last Updated: 2026-01-28*
