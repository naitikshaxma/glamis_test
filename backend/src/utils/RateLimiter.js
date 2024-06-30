import rateLimit from "express-rate-limit";

const RateLimiter15mins = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "You have exceeded the 100 requests in 15 minutes limit!",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,
});

export {
    RateLimiter15mins
};