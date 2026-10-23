export default function Ornement({ className = "" }: { className?: string }) {
  return <hr className={`border-sable ${className}`} />;
}