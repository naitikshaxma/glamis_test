import redis from 'redis';

let redisClient;

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
      }


export default connectRedis;