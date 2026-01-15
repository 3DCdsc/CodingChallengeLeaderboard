//load env
require("dotenv").config();
const express = require("express");
const Redis = require("ioredis");

const app = express();
const PORT = process.env.PORT || 3000;

//connect to frontend
const cors = require("cors");
app.use(cors());

//Connect to Redis
const redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    //password: process.env.REDIS_PASSWORD
})

//set up a key to get the leaderboard
const LEADERBOARD_KEY = "leaderboard:yeetcode"

app.use(express.json())

/**
 * @route PUT /leaderboard/update
 * @description update the leaderboard
 */
app.put("/leaderboard/update", async (req, res) => {
    try {
        const { player, timing } = req.body;

        if (!player || !timing) {
            return res.status(400).json({ message: "Player and timing required"})
        }
        await redis.zadd(LEADERBOARD_KEY, timing, player);
        res.json({message: "Leaderboard updated"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" })
    }
})

/**
 * @route GET /leaderboard/rank
 * @description Fetches the rank of leaderboard
 */
app.get("/leaderboard/rank", async (req, res) => {
    try {
        const rank = await redis.zrange(LEADERBOARD_KEY, 0, 9, "WITHSCORES")

        const leaderboard = []

        for (let i = 0; i < rank.length; i += 2) {
            leaderboard.push({
                player : rank[i],
                timing : rank[i + 1]
            })
        }
        res.json({
            success : true,
            data : leaderboard
        })
    } catch (error) {
        console.error(("Leaderboard Fetch Error:", error))
        res.status(500).json({ message: "Internal server error" });
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
});