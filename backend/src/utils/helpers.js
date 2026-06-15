import sanitizeHtml from 'sanitize-html';

const createOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

// Sanitize text to prevent XSS attacks
const sanitizeText = (text) => {
    if (typeof text !== 'string') {
        return text;
    }
    // Remove any HTML tags and encode special characters
    return sanitizeHtml(text, {
        allowedTags: [],
        allowedAttributes: {},
        disallowedTagsMode: 'discard'
    });
};

// Recursively sanitize all string fields in an object
const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
        return sanitizeText(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    if (obj !== null && typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }
    return obj;
};

export { createOtp, sanitizeText, sanitizeObject };