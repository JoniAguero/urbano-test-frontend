'use client';

export function Skeleton({
  width,
  height,
  borderRadius,
  style,
}: {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="skeleton"
      style={{
        width: width || '100%',
        height: height || 20,
        borderRadius: borderRadius || 'var(--radius-sm)',
        ...style,
      }}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <Skeleton width={80} height={12} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <Skeleton width={c === 0 ? 120 : 80} height={16} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <Skeleton width={40} height={40} borderRadius="var(--radius-md)" style={{ marginBottom: 14 }} />
      <Skeleton width={100} height={12} style={{ marginBottom: 8 }} />
      <Skeleton width={60} height={32} />
    </div>
  );
}
