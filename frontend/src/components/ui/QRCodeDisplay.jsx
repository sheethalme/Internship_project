// Simple visual QR code generator using SVG patterns based on order ID
export default function QRCodeDisplay({ value, size = 120 }) {
  const hash = (str) => {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
    return Math.abs(h);
  };

  const gridSize = 21;
  const cellSize = size / gridSize;
  const seed = hash(value || 'GG');

  const cells = Array.from({ length: gridSize }, (_, row) =>
    Array.from({ length: gridSize }, (_, col) => {
      // Always fill corners (finder patterns)
      if ((row < 7 && col < 7) || (row < 7 && col >= gridSize - 7) || (row >= gridSize - 7 && col < 7)) {
        const r = row % 7, c = col % 7;
        if (r === 0 || r === 6 || c === 0 || c === 6) return true;
        if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
        return false;
      }
      // Timing patterns
      if (row === 6 || col === 6) return (row + col) % 2 === 0;
      // Data modules - pseudorandom based on seed
      return ((seed * (row * gridSize + col + 1) * 2654435761) >>> 0) % 3 !== 0;
    })
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="white" rx="4" />
      {cells.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0f172a"
            />
          ) : null
        )
      )}
    </svg>
  );
}
