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

### 1. Install Docker Desktop and Postman


### 2. Install Dependencies
```bash
npm install
```

### 3. Set up Redis

In your terminal type in the following
```bash
docker run -d --name redis-stack -p 6379:6379 redis/redis-stack:latest
```


### 4. Open up Docker
In the container section, you should see a container running in the background 


## Running the Project

### Start Backend
```bash
npx nodemon app.js
```

The backend will run on `http://localhost:3000`

### Open Frontend
 Open `frontend/index.html` in your browser


## API Endpoints
You can try the following PUT and GET requests in postman
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

## Viewing Data

### Redis Stack UI
Access the Redis database visually:
```
http://localhost:8001
```
You can see all stored data, including the `leaderboard:yeetcode` key with player data.

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


