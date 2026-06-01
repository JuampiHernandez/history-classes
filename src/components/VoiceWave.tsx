export function VoiceWave({
  active,
  color,
  bars = 5,
}: {
  active: boolean;
  color: string;
  bars?: number;
}) {
  return (
    <div
      className="flex h-6 items-end justify-center gap-0.5"
      aria-hidden={!active}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={`w-1 rounded-full ${active ? "voice-bar-animated" : "h-1 opacity-40"}`}
          style={{
            backgroundColor: color,
            animationDelay: active ? `${i * 0.12}s` : undefined,
          }}
        />
      ))}
    </div>
  );
}
