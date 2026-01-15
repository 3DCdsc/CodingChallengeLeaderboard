# Coding Challenge Leaderboard

A real-time leaderboard application built with Express.js backend and vanilla JavaScript frontend, using Redis for data storage.

## Features
- Add players with their timing scores
- Real-time leaderboard display (auto-refreshes every 3 seconds)
- Persistent data storage with Redis
- REST API backend
- Simple HTML/CSS frontend

## Prerequisites
- Node.js (v14+)
- Redis running locally or in Docker
- npm

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Redis
Option A: Local Redis
```bash
# Make sure Redis is running on port 6379
redis-server
```

Option B: Docker
```bash
docker run -d --name redis -p 6379:6379 redis:latest
```

### 3. Environment Variables
Create a `.env` file:
```
PORT=3000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

## Running the Project

### Start Backend
```bash
npm start
# or with nodemon for development
npx nodemon app.js
```

The backend will run on `http://localhost:3000`

### Open Frontend
1. Open `frontend/index.html` in your browser
2. Or serve it with a local server:
```bash
cd frontend
npx http-server
```

## API Endpoints

### Add/Update Player
**PUT** `/leaderboard/update`
```json
{
  "player": "John",
  "timing": 45.2
}
```

### Get Leaderboard
**GET** `/leaderboard/rank`

Response:
```json
{
  "success": true,
  "data": [
    {"player": "John", "timing": "45.2"},
    {"player": "Jane", "timing": "48.5"}
  ]
}
```

## Project Structure
```
leaderboard/
├── app.js                    # Express backend
├── package.json
├── .env                      # Environment variables
├── frontend/
│   ├── index.html           # Main HTML file
│   ├── script.js            # JavaScript logic
│   └── style.css            # Styling
└── README.md
```

## Technologies Used
- **Backend:** Express.js, Node.js
- **Database:** Redis (ioredis)
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **CORS:** Enabled for frontend-backend communication

## License
ISC


