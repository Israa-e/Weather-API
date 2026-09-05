import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import axios from "axios";
import {
    connectRedis,
    getCache,
    setCache,
} from "./services/cacheService.js";


const app = express();
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        error: "Too many requests, please try again later."
    }
})
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.WEATHER_API_KEY;

app.get("/weather", limiter, async (req, res) => {
    const city = req.query.city;

    if (!city || typeof city !== "string") {
        return res.status(400).json({
            error: "City is required",
        });
    }

    const cacheKey = `weather:${city.toLowerCase()}`;

    try {
        // Check Redis cache
        const cachedWeather = await getCache(cacheKey);

        if (cachedWeather) {
            console.log("Returning weather from cache");

            return res.json(JSON.parse(cachedWeather));
        }

        // Cache miss → call Visual Crossing
        console.log("Fetching weather from Visual Crossing");

        const response = await axios.get(
            `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}`,
            {
                params: {
                    key: API_KEY,
                    unitGroup: "metric",
                    include: "current",
                },
            },
        );

        const weather = {
            city: response.data.address,
            temperature: response.data.currentConditions.temp,
            condition: response.data.currentConditions.conditions,
        };

        // Cache for 12 hours
        await setCache(
            cacheKey,
            JSON.stringify(weather),
            12 * 60 * 60,
        );

        return res.json(weather);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(
                "Visual Crossing error:",
                error.response?.data,
            );

            if (error.response?.status === 400) {
                return res.status(400).json({
                    error: "Invalid city or request",
                });
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                return res.status(500).json({
                    error: "Weather API authentication failed",
                });
            }

            if (error.response?.status === 404) {
                return res.status(404).json({
                    error: "City not found",
                });
            }

            return res.status(502).json({
                error: "Weather service is unavailable",
            });
        }

        console.error("Server error:", error);

        return res.status(500).json({
            error: "Internal server error",
        });
    }
});

async function startServer() {
    try {
        await connectRedis();

        console.log("Connected to Redis");

        app.listen(PORT, () => {
            console.log(
                `Weather API running on http://localhost:${PORT}`,
            );
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
