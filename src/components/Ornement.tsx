export default function Ornement({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-sable" />
      <span className="h-2 w-2 rotate-45 bg-or-500" />
      <span className="h-px flex-1 bg-sable" />
    </div>
  );
}