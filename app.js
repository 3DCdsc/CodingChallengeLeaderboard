//load env
require("dotenv").config();
const express = require("express");
const Redis = require("ioredis");

const app = express();
const PORT = process.env.PORT || 3000;
const CATEGORY_UPDATES_KEY = "leaderboard_updates";
const LATEST_SUBMISSION_PREFIX = "leaderboard_latest_submission:";

//connect to frontend
const cors = require("cors");
app.use(cors());

//Connect to Redis
const redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    //password: process.env.REDIS_PASSWORD
})

app.use(express.json())

/**
 * Helper function to generate leaderboard key
 */
function getLeaderboardKey(category) {
    return `leaderboard:${category}`;
}

function getLatestSubmissionKey(category) {
    return `${LATEST_SUBMISSION_PREFIX}${category}`;
}

/**
 * @route GET /leaderboard/categories
 * @description Get all available leaderboard categories
 */
app.get("/leaderboard/categories", async (req, res) => {
    try {
        const keys = await redis.keys("leaderboard:*");
        const categories = keys.map(key => key.replace("leaderboard:", ""));
        const recentlyUpdated = await redis.zrevrange(CATEGORY_UPDATES_KEY, 0, -1);

        const orderedUpdatedCategories = recentlyUpdated.filter(category => categories.includes(category));
        const remainingCategories = categories
            .filter(category => !orderedUpdatedCategories.includes(category))
            .sort();

        const orderedCategories = [...orderedUpdatedCategories, ...remainingCategories];

        res.json({
            success: true,
            data: orderedCategories
        });
    } catch (error) {
        console.error("Categories Fetch Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @route PUT /leaderboard/update
 * @description update the leaderboard
 */
app.put("/leaderboard/update", async (req, res) => {
    try {
        const { player, timing, category } = req.body;

        if (!player || !timing || !category) {
            return res.status(400).json({ message: "Player, timing, and category required"})
        }
        
        const leaderboardKey = getLeaderboardKey(category);
        const numericTiming = Number.parseFloat(timing);

        await redis.zadd(leaderboardKey, numericTiming, player);
        await redis.zadd(CATEGORY_UPDATES_KEY, Date.now(), category);
        await redis.set(
            getLatestSubmissionKey(category),
            JSON.stringify({
                player,
                timing: numericTiming,
                updatedAt: Date.now()
            })
        );
        res.json({message: "Leaderboard updated", category});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" })
    }
})

/**
 * @route GET /leaderboard/rank/:category
 * @description Fetches the rank of leaderboard for a specific category
 */
app.get("/leaderboard/rank/:category", async (req, res) => {
    try {
        const { category } = req.params;
        
        if (!category) {
            return res.status(400).json({ message: "Category required" });
        }
        
        const leaderboardKey = getLeaderboardKey(category);
        const latestSubmissionRaw = await redis.get(getLatestSubmissionKey(category));
        const latestSubmission = latestSubmissionRaw ? JSON.parse(latestSubmissionRaw) : null;
        const rank = await redis.zrange(leaderboardKey, 0, 9, "WITHSCORES")

        const leaderboard = []

        for (let i = 0; i < rank.length; i += 2) {
            const player = rank[i];
            const timing = rank[i + 1];
            const numericTiming = Number.parseFloat(timing);
            const isLatest = Boolean(
                latestSubmission &&
                latestSubmission.player === player &&
                Math.abs(Number.parseFloat(latestSubmission.timing) - numericTiming) < 0.0000001
            );

            leaderboard.push({
                player,
                timing,
                isLatest
            })
        }
        res.json({
            success : true,
            category : category,
            data : leaderboard,
            latestSubmission
        })
    } catch (error) {
        console.error(("Leaderboard Fetch Error:", error))
        res.status(500).json({ message: "Internal server error" });
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
});