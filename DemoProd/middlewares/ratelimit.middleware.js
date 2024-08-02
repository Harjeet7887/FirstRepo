import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
    
  keyGenerator: (req, res) => {
    return req.ip; 
  },
  handler: (req, res) => {
    res
      .status(429)
      .json({ message: "Too many requests, please try again later." });
  },
  windowMs: 10000, // 10 seconds
  max: 10,

});

export default limiter;
