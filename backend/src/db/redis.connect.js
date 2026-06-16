import redis from 'redis';

let redisClient;

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
            console.error("REDIS_URL is not defined in the environment variables.");
            return null;
        }
    }
    if (!redisClient.isOpen) {
        try {
            await redisClient.connect();
            console.log("Connected to Redis successfully!");
        } catch (e) {
            console.error("Connection to Redis failed with error:", e);
        }
    }
    return redisClient;
}

export { redisClient };
export default connectRedis;