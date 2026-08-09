interface CircularProgressProps {
  /** 0..1 fraction of total lesson remaining */
  progress: number;
  colorClass: string;
  strokeClass: string;
  pulse: boolean;
  children: React.ReactNode;
}

const SIZE = 280;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CircularProgress({
  progress,
  colorClass,
  strokeClass,
  pulse,
  children,
}: CircularProgressProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = CIRCUMFERENCE * (1 - clamped);

  return (
    <div className={`relative ${pulse ? 'animate-pulse' : ''}`}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="block -rotate-90"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-gray-200"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={`${strokeClass} transition-[stroke-dashoffset] duration-500 ease-linear`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-6xl font-bold tabular-nums ${colorClass}`}>{children}</span>
      </div>
    </div>
  );
}
