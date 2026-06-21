/* Static interview question banks by type and difficulty.
   Each array holds at least 8 questions so any selected count (3/5/8) is honored.
   Used as the reliable default; AI generation (when enabled) can override these. */

export const QUESTION_BANK = {
    behavioral: {
        easy: [
            "Tell me a little about yourself and what drew you to this field.",
            "What's a recent accomplishment you're genuinely proud of?",
            "Why are you interested in this role?",
            "How would a close friend describe the way you work?",
            "What does a good day at work look like for you?",
            "What are your biggest strengths, and how have you used them?",
            "What kind of work environment helps you do your best?",
            "Why should we consider you for this position?",
        ],
        medium: [
            "Tell me about a time you disagreed with a teammate. How did you handle it?",
            "Describe a goal you set for yourself and how you achieved it.",
            "Walk me through a mistake you made and what you learned from it.",
            "Tell me about a time you had to learn something difficult quickly.",
            "Give an example of when you took initiative without being asked.",
            "Describe a time you received tough feedback. What did you do with it?",
            "Tell me about a time you had to work with someone difficult.",
            "Describe a time you had to juggle several priorities at once.",
        ],
        hard: [
            "Tell me about the most difficult decision you've made in a team setting and the trade-offs you weighed.",
            "Describe a time you failed to meet a commitment. How did you recover and rebuild trust?",
            "Walk me through a conflict where you had to influence someone with more authority than you.",
            "Tell me about a time you had to deliver under an unrealistic deadline with limited resources.",
            "Describe a situation where your values were challenged at work. What did you do?",
            "Tell me about a time you had to give someone difficult feedback.",
            "Describe a decision you had to make without all the information you wanted.",
            "Tell me about a time you advocated for an unpopular idea and saw it through.",
        ],
    },
    technical: {
        easy: [
            "In your own words, what's the difference between a stack and a queue?",
            "What happens, step by step, when you type a URL into a browser and hit enter?",
            "Explain what an API is to someone non-technical.",
            "What's the difference between client-side and server-side rendering?",
            "What does it mean for code to be 'idempotent'?",
            "What is the difference between a compiler and an interpreter?",
            "What does REST mean for a web API?",
            "What is version control, and why does it matter on a team?",
        ],
        medium: [
            "Explain the difference between SQL and NoSQL databases and when you'd choose each.",
            "What is a race condition, and how would you prevent one?",
            "Walk me through how HTTPS keeps a connection secure.",
            "What's the difference between processes and threads?",
            "How does caching improve performance, and what can go wrong with it?",
            "Explain the difference between authentication and authorization.",
            "What is the difference between synchronous and asynchronous code?",
            "What does a database index do, and what's the trade-off of adding one?",
        ],
        hard: [
            "How would you design rate limiting for a public API serving millions of requests?",
            "Explain eventual consistency and a real scenario where you'd accept it over strong consistency.",
            "Walk me through how you'd debug a memory leak in a production service.",
            "Describe how you'd safely roll out a breaking database schema change with zero downtime.",
            "How does a deadlock occur, and what strategies detect or prevent it?",
            "How would you approach scaling a service that suddenly gets ten times the traffic?",
            "Explain the CAP theorem and a practical consequence of it.",
            "How would you design a retry strategy that doesn't make an outage worse?",
        ],
    },
    dsa: {
        easy: [
            "How would you check if a string is a palindrome? Talk through your approach.",
            "Explain how you'd find the largest number in an unsorted array.",
            "What is the time complexity of searching in a sorted array, and why?",
            "How does a hash map let you look things up so fast?",
            "Describe how you'd reverse a linked list.",
            "What is the difference between an array and a linked list?",
            "How would you remove duplicates from a list?",
            "What does Big-O notation actually describe?",
        ],
        medium: [
            "Given an array, how would you find two numbers that add up to a target? Optimize it.",
            "Explain how you'd detect a cycle in a linked list.",
            "How would you find the first non-repeating character in a string efficiently?",
            "Describe binary search and a subtle bug people often introduce in it.",
            "How would you merge two sorted arrays in place?",
            "Explain how a breadth-first search works and when you'd use it over depth-first.",
            "How would you check whether two strings are anagrams?",
            "How can a stack be used to validate balanced parentheses?",
        ],
        hard: [
            "How would you find the median of two sorted arrays in logarithmic time?",
            "Describe an approach to the longest increasing subsequence and its complexity.",
            "Explain how you'd serialize and deserialize a binary tree.",
            "How would you detect whether a directed graph has a cycle?",
            "Walk me through solving the word-ladder shortest-transformation problem.",
            "How would you find the kth largest element in an array efficiently?",
            "How does dynamic programming differ from plain recursion? Give an example.",
            "How would you detect and return the node where a linked-list cycle begins?",
        ],
    },
    "system-design": {
        easy: [
            "How would you design a URL shortener like bit.ly at a high level?",
            "What components would you need to build a basic to-do app that syncs across devices?",
            "Explain the role of a load balancer in a web application.",
            "What is a CDN and why would you use one?",
            "How would you store and serve user profile pictures at scale?",
            "What is caching, and where would you place a cache in a web app?",
            "What is the difference between vertical and horizontal scaling?",
            "Explain the role of a read replica in a database setup.",
        ],
        medium: [
            "Design a news feed like the one on a social network. Where do you start?",
            "How would you design a system to handle file uploads up to several gigabytes?",
            "Design the backend for a ride-hailing app's driver-matching feature.",
            "How would you design a notification system that sends email, SMS, and push?",
            "Walk me through designing a basic rate-limited API gateway.",
            "How would you design a commenting system for a blog?",
            "Design a click-tracking / link-analytics system.",
            "Why might you put a message queue between two services? Walk me through a case.",
        ],
        hard: [
            "Design a globally distributed chat system like WhatsApp. Walk me through the trade-offs.",
            "How would you design a system to count unique daily active users across billions of events?",
            "Design a video streaming platform's storage and delivery pipeline.",
            "How would you design a distributed job scheduler that guarantees each job runs once?",
            "Design a real-time collaborative document editor. How do you handle concurrent edits?",
            "Design a system to deliver breaking-news alerts to millions of users within seconds.",
            "How would you design rate limiting across a fleet of API servers?",
            "Design storage for a system ingesting millions of IoT sensor readings per minute.",
        ],
    },
    verbal: {
        easy: [
            "Describe your hometown to someone who has never been there.",
            "What's a book, film, or talk that changed how you think? Tell me about it.",
            "If you could master one new skill instantly, what would it be and why?",
            "Talk me through your typical morning routine.",
            "Describe a place where you feel most productive.",
            "Describe a hobby you enjoy and why it appeals to you.",
            "Tell me about a meal or dish that means something to you.",
            "If you could travel anywhere next month, where would you go and why?",
        ],
        medium: [
            "Do you think remote work is better or worse for early-career professionals? Make your case.",
            "Explain a complex topic you know well to a complete beginner.",
            "Tell me about a trend in your field and where you think it's heading.",
            "Persuade me to visit your favorite city.",
            "What's an opinion you hold that many people disagree with, and why?",
            "Should students be taught coding from primary school? Make your case.",
            "Describe a piece of technology you couldn't live without, and why.",
            "Tell me about someone who influenced you and how.",
        ],
        hard: [
            "Argue both sides of whether AI will create more jobs than it destroys.",
            "You have two minutes to convince a skeptical investor to fund your idea. Go.",
            "Summarize the biggest challenge facing your generation and propose one solution.",
            "Defend a decision you disagree with as if you had to implement it.",
            "Explain the ethics of a technology you use daily, considering multiple perspectives.",
            "Is social media a net positive or negative for society? Argue your position.",
            "Convince me that failure can be more valuable than success.",
            "Should companies be responsible for employees' well-being outside work? Defend your view.",
        ],
    },
};

/* Pick `count` distinct questions for a type+difficulty, shuffled. */
export function pickQuestions(type, difficulty, count) {
    const bank = (QUESTION_BANK[type] && QUESTION_BANK[type][difficulty]) || [];
    const pool = [...bank];
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, Math.min(count, pool.length));
}
