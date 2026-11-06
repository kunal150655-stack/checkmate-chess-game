import { useMemo, useState } from "react";
import { Chess } from "chess.js";
import { RotateCcw, Undo2, RefreshCw, Copy, Crown, Github, ArrowLeftRight } from "lucide-react";

const pieces = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" }
};
const files = "abcdefgh";
const initial = () => new Chess();

export default function App() {
  const [game, setGame] = useState(initial);
  const [selected, setSelected] = useState(null);
  const [orientation, setOrientation] = useState("w");
  const [history, setHistory] = useState([]);
  const [fenCopied, setFenCopied] = useState(false);

  const board = useMemo(() => {
    const rows = game.board();
    return orientation === "w" ? rows : [...rows].reverse().map(row => [...row].reverse());
  }, [game, orientation]);

  const legalTargets = selected
    ? game.moves({ square: selected, verbose: true }).map(move => move.to)
    : [];

  const turn = game.turn() === "w" ? "White" : "Black";
  const isGameOver = game.isGameOver();
  const status = game.isCheckmate()
    ? `Checkmate — ${turn === "White" ? "Black" : "White"} wins`
    : game.isStalemate() ? "Draw by stalemate"
    : game.isThreefoldRepetition() ? "Draw by repetition"
    : game.isInsufficientMaterial() ? "Draw — insufficient material"
    : game.isDraw() ? "Game drawn"
    : `${turn} to move${game.isCheck() ? " · Check!" : ""}`;

  function playMove(from, to) {
    try {
      const piece = game.get(from);
      const promotion = piece?.type === "p" && (to.endsWith("8") || to.endsWith("1")) ? "q" : undefined;
      const next = new Chess(game.fen());
      const move = next.move({ from, to, ...(promotion ? { promotion } : {}) });
      if (!move) return false;
      setHistory(h => [...h, game.fen()]);
      setGame(next);
      setSelected(null);
      return true;
    } catch {
      return false;
    }
  }

  function handleSquare(square) {
    if (isGameOver) return;
    const piece = game.get(square);
    if (selected) {
      if (square === selected) { setSelected(null); return; }
      if (legalTargets.includes(square)) { playMove(selected, square); return; }
    }
    if (piece && piece.color === game.turn()) setSelected(square);
    else setSelected(null);
  }

  function undo() {
    if (!history.length) return;
    const previous = history[history.length - 1];
    setGame(new Chess(previous));
    setHistory(h => h.slice(0, -1));
    setSelected(null);
  }

  function restart() {
    setGame(initial());
    setHistory([]);
    setSelected(null);
  }

  async function copyFen() {
    await navigator.clipboard.writeText(game.fen());
    setFenCopied(true);
    window.setTimeout(() => setFenCopied(false), 1400);
  }

  const moveHistory = game.history();
  const pairs = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    pairs.push({ number: i / 2 + 1, white: moveHistory[i], black: moveHistory[i + 1] || "" });
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark">♞</span><span>CHECKMATE<span className="brand-dot">.</span></span></a>
        <nav><a href="#play">Play</a><a href="#how-to">How to play</a><a href="https://github.com/" target="_blank" rel="noreferrer"><Github size={16}/> GitHub</a></nav>
      </header>

      <section className="hero">
        <div className="eyebrow"><span className="live-dot"/> YOUR NEXT MOVE STARTS HERE</div>
        <h1>Think ahead.<br/><em>Play boldly.</em></h1>
        <p>A calm space for sharp minds. Make your move, master the board, and enjoy the game.</p>
      </section>

      <section className="play-layout" id="play">
        <div className="board-column">
          <div className="player-strip">
            <div className="player-avatar black-avatar">♚</div>
            <div className="player-info"><strong>Black</strong><span>Opponent</span></div>
            <span className={`turn-indicator ${game.turn() === "b" && !isGameOver ? "active" : ""}`}>{game.turn() === "b" && !isGameOver ? "TO MOVE" : " "}</span>
          </div>

          <div className="board-frame">
            <div className="chessboard" role="grid" aria-label="Chess board">
              {board.flatMap((row, rowIndex) => row.map((piece, colIndex) => {
                const displayRow = rowIndex;
                const displayCol = colIndex;
                const square = orientation === "w"
                  ? `${files[displayCol]}${8 - displayRow}`
                  : `${files[7 - displayCol]}${displayRow + 1}`;
                const isLight = (displayRow + displayCol) % 2 === 0;
                const isSelected = selected === square;
                const isTarget = legalTargets.includes(square);
                const isLast = game.history({ verbose: true }).slice(-1)[0]?.from === square ||
                  game.history({ verbose: true }).slice(-1)[0]?.to === square;
                return (
                  <button
                    key={square}
                    className={`square ${isLight ? "light" : "dark"} ${isSelected ? "selected" : ""} ${isLast ? "last-move" : ""}`}
                    onClick={() => handleSquare(square)}
                    aria-label={`${square}${piece ? ` ${piece.color === "w" ? "white" : "black"} ${piece.type}` : ""}`}
                    role="gridcell"
                  >
                    {displayCol === 0 && <span className="coord rank">{orientation === "w" ? 8 - displayRow : displayRow + 1}</span>}
                    {displayRow === 7 && <span className="coord file">{files[orientation === "w" ? displayCol : 7 - displayCol]}</span>}
                    {piece && <span className={`piece ${piece.color === "w" ? "white-piece" : "black-piece"}`}>{pieces[piece.color][piece.type]}</span>}
                    {isTarget && <span className={`move-dot ${piece ? "capture-dot" : ""}`}/>}
                  </button>
                );
              }))}
            </div>
          </div>

          <div className="player-strip bottom-player">
            <div className="player-avatar white-avatar">♔</div>
            <div className="player-info"><strong>White</strong><span>You</span></div>
            <span className={`turn-indicator ${game.turn() === "w" && !isGameOver ? "active" : ""}`}>{game.turn() === "w" && !isGameOver ? "TO MOVE" : " "}</span>
          </div>
        </div>

        <aside className="game-panel">
          <div className="panel-heading"><div><span className="panel-kicker">LIVE MATCH</span><h2>Game room</h2></div><span className="round-icon"><Crown size={18}/></span></div>
          <div className={`status-card ${game.isCheck() ? "check-status" : ""}`}>
            <span className="status-label">GAME STATUS</span>
            <strong>{status}</strong>
            <span className="status-sub">{isGameOver ? "Start a new game to play again." : "Select a piece, then choose a highlighted square."}</span>
          </div>
          <div className="controls">
            <button className="control-primary" onClick={restart}><RefreshCw size={16}/> New game</button>
            <button className="control-secondary" onClick={undo} disabled={!history.length}><Undo2 size={16}/> Undo</button>
            <button className="control-secondary icon-only" onClick={() => setOrientation(o => o === "w" ? "b" : "w")} aria-label="Flip board"><ArrowLeftRight size={17}/></button>
          </div>
          <div className="moves-section">
            <div className="section-title"><h3>Move history</h3><span>{moveHistory.length} plies</span></div>
            <div className="move-list">
              {pairs.length ? pairs.map(pair => (
                <div className="move-row" key={pair.number}>
                  <span className="move-number">{pair.number}.</span>
                  <span className="move-white">{pair.white}</span>
                  <span className="move-black">{pair.black}</span>
                </div>
              )) : <div className="empty-moves"><span>♟</span><p>Your game begins with the first move.</p></div>}
            </div>
          </div>
          <button className="fen-button" onClick={copyFen}><Copy size={14}/>{fenCopied ? "FEN copied!" : "Copy position (FEN)"}</button>
          <div className="tip"><span>✦</span><p><strong>Quick tip</strong> Control the center with your pawns and develop your knights and bishops early.</p></div>
        </aside>
      </section>

      <section className="how-section" id="how-to">
        <span className="panel-kicker">THE BASICS</span><h2>Easy to start. <em>Endless to master.</em></h2>
        <div className="how-grid">
          <article><span>01</span><h3>Select a piece</h3><p>Click any of your pieces. Legal destinations appear as dots on the board.</p></article>
          <article><span>02</span><h3>Make your move</h3><p>Choose a highlighted square. The game checks every move against chess rules.</p></article>
          <article><span>03</span><h3>Play the position</h3><p>Take turns, use undo when needed, and aim for checkmate.</p></article>
        </div>
      </section>
      <footer><a className="brand footer-brand" href="#"><span className="brand-mark">♞</span> CHECKMATE<span className="brand-dot">.</span></a><span>Made for the love of the game.</span><span>© 2026 Checkmate</span></footer>
    </main>
  );
}