import redis from 'redis';

let redisClient;

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
        let redisURL = process.env.REDIS_URL;
        if (redisURL) {
            redisClient = redis.createClient({ url: redisURL }).on("error", (e) => {
            console.error(`Failed to create the Redis client with error:`);
            console.error(e);
          });
      
          try {
            await redisClient.connect();
            console.log(`Connected to Redis successfully!`);
            return redisClient;
          } catch (e) {
            console.error(`Connection to Redis failed with error:`);
            console.error(e);
          }
        }

        // Fallback to in-memory store for development
        console.log("Redis URL not configured. Using in-memory store for OTP (development mode).");
        return memoryClient;
      }


export default connectRedis;