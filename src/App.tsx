const App = () => {
  return (
    <main className="grid min-h-svh place-items-center bg-bg p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="grid size-14 place-items-center rounded-[18px] bg-primary text-2xl font-extrabold text-white shadow-fab">
          $
        </div>
        <h1 className="text-[32px] font-extrabold tracking-tight text-ink">Monetra</h1>
        <p className="text-[15px] text-muted-foreground">Every expense, sorted by what it was for.</p>
        <div className="mt-2 flex gap-2">
          {CATEGORY_PREVIEW.map((c) => (
            <span
              key={c.emoji}
              className="grid size-11 place-items-center rounded-[14px] text-xl"
              style={{ background: c.soft }}
            >
              {c.emoji}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
};

const CATEGORY_PREVIEW = [
  { emoji: "🍔", soft: "#FFE1D6" },
  { emoji: "🛒", soft: "#DFF5E1" },
  { emoji: "🏠", soft: "#E3E9FF" },
  { emoji: "🚌", soft: "#FFF1C9" },
  { emoji: "🎬", soft: "#F5DFFF" },
];

export default App;
