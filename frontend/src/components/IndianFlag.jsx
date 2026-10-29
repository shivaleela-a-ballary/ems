
export default function IndianFlag() {
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <svg
      viewBox="0 0 90 60"
      role="img"
      aria-label="Indian national flag"
      style={{ width: 54, height: 36, display: "block" }}
    >
      <rect width="90" height="20" fill="#FF9933" />
      <rect y="20" width="90" height="20" fill="#FFFFFF" />
      <rect y="40" width="90" height="20" fill="#138808" />
      <circle cx="45" cy="30" r="8" fill="none" stroke="#000080" strokeWidth="1.5" />
      {spokes.map((angle) => (
        <line
          key={angle}
          x1="45"
          y1="30"
          x2={45 + 7 * Math.cos((angle * Math.PI) / 180)}
          y2={30 + 7 * Math.sin((angle * Math.PI) / 180)}
          stroke="#000080"
          strokeWidth="0.8"
        />
      ))}
      <circle cx="45" cy="30" r="1.2" fill="#000080" />
    </svg>
  );
}
