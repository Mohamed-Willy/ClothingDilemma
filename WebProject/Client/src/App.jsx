import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:5000";
const MAX_PAGES = 10;

export default function App() {
  const [pages, setPages] = useState([]); // pages are numbers: [1,2,3...]
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isEnd, setIsEnd] = useState(false);
  const [connected, setConnected] = useState(false);

  const selectedPage = useMemo(() => {
    if (pages.length === 0) return null;
    return pages[Math.min(selectedIndex, pages.length - 1)];
  }, [pages, selectedIndex]);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ["websocket"],
      timeout: 3000
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));

    socket.on("state:update", (payload) => {
      const incoming = Array.isArray(payload?.pages) ? payload.pages : [];
      const trimmed = incoming.slice(0, MAX_PAGES);

      setPages(trimmed);
      setSelectedIndex((i) => Math.min(i, Math.max(0, trimmed.length - 1)));
      setIsEnd(Boolean(payload?.isEnd) || trimmed.length >= MAX_PAGES);
    });

    return () => socket.disconnect();
  }, []);

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
              {pages.length}/{MAX_PAGES}
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

            {connected && selectedPage && (
              <img
                className="centerImg"
                src={`/${selectedPage}.png`}
                alt={`Page ${selectedPage}`}
              />
            )}

            {connected && pages.length === 0 && (
              <div className="placeholder">Connected. Waiting for story…</div>
            )}

            {isEnd && (
              <div className="endOverlay">
                <div className="endText">THE END</div>
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
