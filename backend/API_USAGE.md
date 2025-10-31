# QuickPoll API Usage Guide

## Authentication Endpoints

### Register User
```
POST /auth/register
{
  "username": "john_doe",
  "email": "john@example.com", 
  "password": "password123"
}
```

### Login User
```
POST /auth/login
{
  "username": "john_doe",
  "password": "password123"
}
```

## Poll Management

### Create Poll
```
POST /polls/?creator_id=1
{
  "title": "What's your favorite programming language?",
  "description": "Choose your preferred language",
  "options": ["Python", "JavaScript", "Java", "Go"]
}
```

### Get All Polls
```
GET /polls/?user_id=1&skip=0&limit=10
```

### Get Specific Poll
```
GET /polls/1?user_id=1
```

### Update Poll
```
PUT /polls/1?user_id=1
{
  "title": "Updated poll title",
  "is_active": true
}
```

### Delete Poll
```
DELETE /polls/1?user_id=1
```

## Voting

### Cast Vote
```
POST /votes/?user_id=1
{
  "poll_id": 1,
  "option_id": 2
}
```

### Get Poll Votes
```
GET /votes/poll/1
```

### Delete Vote
```
DELETE /votes/1?user_id=1
```

## Likes

### Toggle Like
```
POST /likes/?user_id=1
{
  "poll_id": 1
}
```

### Get Poll Likes
```
GET /likes/poll/1
```

### Get User Likes
```
GET /likes/user/1
```

## WebSocket Connections

### Connect to Poll Updates
```
ws://localhost:8000/ws/1  # For poll ID 1
```

### General Updates
```
ws://localhost:8000/ws
```

## Features Implemented

✅ User registration and authentication
✅ Create polls with multiple options
✅ Vote on polls (one vote per user per poll)
✅ Like/unlike polls
✅ Real-time updates via WebSocket
✅ Poll statistics (vote counts, like counts)
✅ User authorization (only creators can modify polls)
✅ Comprehensive CRUD operations
✅ Data validation with Pydantic schemas
✅ Database relationships and constraints