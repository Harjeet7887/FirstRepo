import express from "express";
import cors from "cors";
import rateLimit from "./middlewares/ratelimit.middleware.js";
import responseTime from "response-time";
import data from "./controllers/debounce.controller.js";
import client from "prom-client";


const app = express();
app.use(cors({ origin: "*" }));

app.use(express.json());
app.use(responseTime((req, res, time) => {
  
  // res.setHeader("X-Response-Time", time); 
  console.log(time);
}
));

const reqCounter = new client.Counter({
  name: 'requests_total',
  help: 'Total requests',
  labelNames: ["method", "route", "status_code"]
});

app.use(express.urlencoded({ extended: true }));
const PORT = 8081;
const apiKey = "123456789";

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({register: client.register}); // Register the metrics with the Prometheus registry (default registry by prom-client)


function increaseCPUUtilization(durationInSeconds) {
  const end = Date.now() + durationInSeconds * 1000;
  while (Date.now() < end) {
    // Perform a CPU-intensive task
    let result = 0;
    for (let i = 0; i < 1e6; i++) {
      result += Math.sqrt(i);
    }
  }
  console.log('CPU utilization increased for', durationInSeconds, 'seconds.');
}

// Example usage: Increase CPU utilization for 30 seconds
// increaseCPUUtilization(30);


app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello Wooorld!" });
});

app.get("/test", rateLimit, (req, res) => {
  if (req.query.apiKey === apiKey) {
    return res.json({ message: "Getting data from API Endpoint!" });
  }
  res.status(401).json({ message: "Invalid API Key!" });
});

app.get("/slow", (req, res) => {
  setTimeout(() => {
    res.json({ message: "Slow response!" });
  }, 1000);
});

app.get("/metrics", async(req, res) => {
  res.setHeader("Content-Type", client.register.contentType);
  const metrics = await client.register.metrics();
  res.send(metrics);
});

app.get("/data", rateLimit, (req, res) => {
  res.status(200).json(data);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});
