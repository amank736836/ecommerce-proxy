import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const servers = [
  "http://localhost:5001",
  "http://localhost:5002",
  "http://localhost:5003",
];

let currentIndex = 0;

function getNextServer() {
  const server = servers[currentIndex];
  currentIndex = (currentIndex + 1) % servers.length;
  return server;
}

const app = express();

app.use((req, res, next) => {
  const target = getNextServer();
  console.log(`Forwarding request to: ${target}`);

  createProxyMiddleware({
    target,
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
      res.status(502).send("Bad Gateway");
    },
  })(req, res, next);
});

app.listen(3000, () => {
  console.log("Load balancer running on http://localhost:3000");
});
