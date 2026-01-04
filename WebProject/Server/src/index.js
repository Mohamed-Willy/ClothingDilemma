import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 5000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const MAX_PAGES = Number(process.env.MAX_PAGES || 10);

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: CLIENT_ORIGIN, credentials: true }
});

// In-memory state
const state = {
  pages: [],   // [1..10]
  isEnd: false
};

function broadcast() {
  io.emit("state:update", state);
}

io.on("connection", (socket) => {
  socket.emit("state:update", state);
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, state });
});

// Add a page (auto next if body has no page)
app.post("/api/add", (req, res) => {
  if (state.isEnd) return res.json({ ok: false, reason: "ended", state });

  if (state.pages.length >= MAX_PAGES) {
    state.isEnd = true;
    broadcast();
    return res.json({ ok: true, state });
  }

  let page = Number(req.body?.page);

  if (!Number.isFinite(page) || page < 1) {
    page = state.pages.length + 1; // auto next
  }

  if (page > MAX_PAGES) page = MAX_PAGES;

  // If you want STRICT sequential pages only, uncomment:
  // page = state.pages.length + 1;

  state.pages.push(page);

  if (state.pages.length >= MAX_PAGES) state.isEnd = true;

  broadcast();
  res.json({ ok: true, state });
});

// End story immediately
app.post("/api/end", (_req, res) => {
  state.isEnd = true;
  broadcast();
  res.json({ ok: true, state });
});

// Reset story
app.post("/api/reset", (_req, res) => {
  state.pages = [];
  state.isEnd = false;
  broadcast();
  res.json({ ok: true, state });
});

server.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
  console.log(`CORS allowed origin: ${CLIENT_ORIGIN}`);
});
