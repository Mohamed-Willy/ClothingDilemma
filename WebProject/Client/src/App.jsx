import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:5000";
const MAX_ADDED_PAGES = 10; // does NOT include the start image 0

const CAPTIONS = {
  0: "Our story starts both heros looking at each other and you need to hurry and hit the wachingmachine before its too late",
  1: "You landed a great punch on the machine great job keep it up",
  2: "You landed a great Kick on the machine great job keep it up",
  3: "Why are you standing in place you weak player",
};

export default function App() {
  const [pages, setPages] = useState([0]); // always starts with 0
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isEnd, setIsEnd] = useState(false);
  const [connected, setConnected] = useState(false);

  const selectedPage = useMemo(() => {
    if (!pages || pages.length === 0) return null;
    return pages[Math.min(selectedIndex, pages.length - 1)];
  }, [pages, selectedIndex]);

  const captionText = useMemo(() => {
    return selectedPage != null ? (CAPTIONS[selectedPage] || "") : "";
  }, [selectedPage]);

  // Win/Lose:
  // WIN if (count(1)+count(2)) > count(3), else LOSE
  const outcomeText = useMemo(() => {
    const c1 = pages.filter((p) => p === 1).length;
    const c2 = pages.filter((p) => p === 2).length;
    const c3 = pages.filter((p) => p === 3).length;
    return c1 + c2 > c3 ? "YOU WIN" : "YOU LOSE";
  }, [pages]);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ["websocket"],
      timeout: 3000,
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));

    socket.on("state:update", (payload) => {
      const incoming = Array.isArray(payload?.pages) ? payload.pages : [0];

      // Keep everything server sends, but make sure 0 exists
      const safe = incoming.length ? incoming : [0];
      const hasZero = safe[0] === 0 ? safe : [0, ...safe.filter((p) => p !== 0)];

      setPages(hasZero);
      setSelectedIndex((i) => Math.min(i, Math.max(0, hasZero.length - 1)));
      setIsEnd(Boolean(payload?.isEnd));
    });

    return () => socket.disconnect();
  }, []);

  // Display count should show added pages out of 10 (excluding 0)
  const addedCount = Math.max(0, pages.length - 1);

  const statusText = !connected ? "OFFLINE" : isEnd ? "THE END" : "LIVE";

  return (
    <div className="page">
      <header className="masthead">
        <div className="titleBlock">
          <div className="kicker">SPECIAL EDITION</div>
          <h1 className="title">Clothing Dilemma</h1>
          <div className="deck">A magazine-style live story!</div>
        </div>

        <div className="metaBox">
          <div className="metaRow">
            <span className="label">PAGES</span>
            <span className="value">
              {addedCount}/{MAX_ADDED_PAGES}
            </span>
          </div>
          <div className="metaRow">
            <span className="label">STATUS</span>
            <span className="value">{statusText}</span>
          </div>
        </div>
      </header>

      <main className="spread">
        {/* LEFT */}
        <section className="panel">
          <img className="hero" src="/player.png" alt="Player" />
        </section>

        {/* CENTER */}
        <section className="panel">
          <div className="frame">
            {!connected && <div className="placeholder">Waiting for server…</div>}

            {connected && selectedPage != null && (
              <>
                <img
                  className="centerImg"
                  src={`/${selectedPage}.png`}
                  alt={`Page ${selectedPage}`}
                />
                <div className="caption">{captionText}</div>
              </>
            )}

            {connected && pages.length === 0 && (
              <div className="placeholder">Connected. Waiting for story…</div>
            )}

            {isEnd && (
              <div className="endOverlay">
                <div className="endText">{outcomeText}</div>
                <div className="endSub">THE END</div>
              </div>
            )}
          </div>

          <div className="thumbRow">
            {pages.map((p, i) => (
              <button
                key={`${p}-${i}`}
                className={`thumb ${i === selectedIndex ? "active" : ""}`}
                onClick={() => setSelectedIndex(i)}
                title={`Page ${p}`}
              >
                <img src={`/${p}.png`} alt={`Thumb ${p}`} />
              </button>
            ))}
          </div>
        </section>

        {/* RIGHT */}
        <section className="panel">
          <img className="hero flipX" src="/washingmachine.png" alt="Washing Machine" />
        </section>
      </main>
    </div>
  );
}
