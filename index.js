import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const servers = [
  process.env.SERVER_1,
  process.env.SERVER_2,
  process.env.SERVER_3,
  process.env.SERVER_4,
  process.env.SERVER_5,
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Load balancer running on http://localhost:${PORT}`);
});
