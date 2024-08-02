import express from "express";
import cluster from "cluster";
import process from "process";
import os from "os";

const totalCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(cluster.isPrimary);
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork(); // Create a worker process.
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log(code, signal);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  const app = express();
  app.get("/", (req, res) => {
    res.json({ worker_id: process.pid });
  });
  app.listen(3000);

  console.log(`Worker ${process.pid} started`);
}
