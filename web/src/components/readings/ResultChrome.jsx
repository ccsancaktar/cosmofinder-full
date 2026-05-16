export function ResultHero({ eyebrow, title, subtitle }) {
  return (
    <div className="text-center mb-8 md:mb-10">
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.34em] text-primary/80 mb-3">{eyebrow}</p>
      ) : null}
      <h1 className="text-4xl md:text-5xl font-black font-decorative gradient-text mb-4">{title}</h1>
      {subtitle ? <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-8">{subtitle}</p> : null}
    </div>
  );
}

export function ResultStatCard({ label, value, accent = "text-primary" }) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-gray-400 mb-3">{label}</p>
      <p className={`text-lg md:text-xl font-bold ${accent}`}>{value || "-"}</p>
    </div>
  );
}

export function ResultInfoPanel({ title, children }) {
  return (
    <div className="glass rounded-[1.75rem] border border-white/10 p-6 md:p-8">
      {title ? <h2 className="text-2xl font-bold text-white mb-5">{title}</h2> : null}
      {children}
    </div>
  );
}

export function ResultChipList({ items = [] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm text-gray-100"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
