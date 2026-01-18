import { createClient } from "redis";
import type { RedisClientType } from "redis";

let client: RedisClientType | null = null;

export const connectRedis = async (): Promise<RedisClientType> => {
    if (client && client.isOpen) return client;

    const url = process.env.REDIS_URL || "redis://localhost:6379";
    client = createClient({ url });

    client.on("error", (err: Error) => {
        console.error("Redis Client Error:", err);
    });

    await client.connect();
    return client;
};

export const getRedis = (): RedisClientType => {
    if (!client || !client.isOpen) {
        throw new Error(
            "Redis client not connected. Call connectRedis() first.",
        );
    }
    return client;
};

export const quitRedis = async (): Promise<void> => {
    if (client && client.isOpen) {
        await client.quit();
    }
};

export const setJSON = async (key: string, value: unknown) => {
    const c = getRedis();
    const json = JSON.stringify(value);
    const TTL_SECONDS = 15 * 60; // 15 minutes
    await c.set(key, json, { EX: TTL_SECONDS });
};

export const getJSON = async <T = unknown>(key: string): Promise<T | null> => {
    const c = getRedis();
    const raw = await c.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
};
