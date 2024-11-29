import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();
app.use(morgan("dev"));

const servers = [
  process.env.SERVER_1,
  process.env.SERVER_2,
  process.env.SERVER_3,
  process.env.SERVER_4,
  process.env.SERVER_5,
];

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL_1,
  process.env.FRONTEND_URL_2,
  process.env.FRONTEND_URL_3,
  process.env.FRONTEND_URL_4,
  process.env.FRONTEND_URL_5,
  process.env.FRONTEND_URL_6,
  process.env.FRONTEND_URL_7,
  process.env.FRONTEND_URL_8,
  process.env.FRONTEND_URL_9,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin as Proxy Server.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

let currentIndex = 0;

function getNextServer() {
  const server = servers[currentIndex];
  currentIndex = (currentIndex + 1) % servers.length;
  return server;
}

app.use((req, res, next) => {
  const target = getNextServer();
  console.log(`Forwarding request to: ${target}`);

  createProxyMiddleware({
    target,
    changeOrigin: true,
    onProxyReq: (proxyReq, req) => {
      proxyReq.setHeader("Origin", process.env.PROXY_URL);
    },
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
