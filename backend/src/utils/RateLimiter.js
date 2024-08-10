import rateLimit from "express-rate-limit";

const RateLimiter15mins = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 8,
    message: "You have exceeded the 8 requests in 15 minutes limit!",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,
});

const RateLimiter1min = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    message: "You have exceeded the 10 requests in 1 minute limit!",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,
});

export {
    RateLimiter15mins, RateLimiter1min
};