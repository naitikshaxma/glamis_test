import redis from 'redis';
import IORedis from 'ioredis';

let redisClient;
let ioRedisConnection;

// In-memory fallback store for development (when Redis is not available)
const memoryStore = new Map();

const memoryClient = {
    set: (key, value) => { memoryStore.set(key, { value: String(value), expiry: null }); },
    get: async (key) => {
        const entry = memoryStore.get(key);
        if (!entry) return null;
        if (entry.expiry && Date.now() > entry.expiry) {
            memoryStore.delete(key);
            return null;
        }
        return entry.value;
    },
    expire: (key, seconds) => {
        const entry = memoryStore.get(key);
        if (entry) {
            entry.expiry = Date.now() + seconds * 1000;
        }
    }
};

async function connectRedis() {
    if (!redisClient) {
        const redisURL = process.env.REDIS_URL;
        if (redisURL) {
            redisClient = redis.createClient({
                url: redisURL,
                socket: {
                    reconnectStrategy: (retries) => {
                        console.log(`Redis reconnecting, attempt: ${retries}`);
                        return Math.min(retries * 50, 2000);
                    }
                }
            }).on("error", (e) => {
                console.error("Redis client error:", e);
            });
        } else {
            console.log("Redis URL not configured. Using in-memory store for OTP (development mode).");
            return memoryClient;
        }
    }
    if (!redisClient.isOpen) {
        try {
            await redisClient.connect();
            console.log("Connected to Redis successfully!");
        } catch (e) {
            console.error("Connection to Redis failed, falling back to in-memory store:", e);
            return memoryClient;
        }
    }
    return redisClient;
}

export function getIORedisConnection() {
    if (!ioRedisConnection) {
        const redisURL = process.env.REDIS_URL;
        if (redisURL) {
            try {
                ioRedisConnection = new IORedis(redisURL, {
                    maxRetriesPerRequest: null,
                    lazyConnect: true,
                });
                ioRedisConnection.on("error", (err) => {
                    console.error("IORedis connection error (non-fatal):", err.message);
                });
            } catch (err) {
                console.error("IORedis instantiation failed:", err.message);
                return null;
            }
        } else {
            console.log("Redis URL not configured. getIORedisConnection returning null (fallback active).");
            return null;
        }
    }
    return ioRedisConnection;
}

export { redisClient };
export default connectRedis;