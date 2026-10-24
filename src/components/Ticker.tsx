const ITEMS = ["Entrepreneurship", "AI & Tech", "Self-Development", "Fitness", "Building in Public", "LifeQuest"];

/** Laufband mit den Themen (dekorativ, die Themen stehen auch im Text der Seite). */
export function Ticker() {
  const row = (
    <ul className="ticker__row">
      {ITEMS.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {row}
        {row}
      </div>
    </div>
  );
}
