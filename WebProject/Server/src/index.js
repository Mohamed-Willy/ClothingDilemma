import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 5000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// End after 10 added pages (not counting the start image 0)
const MAX_ADDED_PAGES = 10;

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: CLIENT_ORIGIN, credentials: true },
});

// In-memory state
const state = {
  pages: [0], // start image always there
  isEnd: false,
};

function broadcast() {
  io.emit("state:update", state);
}

io.on("connection", (socket) => {
  socket.emit("state:update", state);
});

// 1) ADD: accepts page 1..3 only, duplicates allowed
app.post("/api/add", (req, res) => {
  if (state.isEnd) return res.json({ ok: false, reason: "ended", state });

  const page = Number(req.body?.page);

  // only valid 1..3
  if (!Number.isInteger(page) || page < 1 || page > 3) {
    return res.status(400).json({
      ok: false,
      reason: "page must be an integer from 1 to 3",
      state,
    });
  }

  const addedCount = state.pages.length - 1; // exclude the 0
  if (addedCount >= MAX_ADDED_PAGES) {
    state.isEnd = true;
    broadcast();
    return res.json({ ok: true, state });
  }

  state.pages.push(page);

  const newAddedCount = state.pages.length - 1;
  if (newAddedCount >= MAX_ADDED_PAGES) state.isEnd = true;

  broadcast();
  return res.json({ ok: true, state });
});

// 2) RESET: clears list but keeps [0]
app.post("/api/reset", (_req, res) => {
  state.pages = [0];
  state.isEnd = false;
  broadcast();
  res.json({ ok: true, state });
});

server.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
  console.log(`CORS allowed origin: ${CLIENT_ORIGIN}`);
});
