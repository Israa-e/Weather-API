import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (error) => {
  console.error("Redis error:", error);
});

export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

export async function getCache(key: string) {
  return await redis.get(key);
}

export async function setCache(
  key: string,
  value: string,
  expirationInSeconds: number,
) {
  await redis.set(key, value, {
    EX: expirationInSeconds,
  });
}
