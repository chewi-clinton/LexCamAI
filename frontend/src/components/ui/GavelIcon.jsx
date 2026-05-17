export default function GavelIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="2" width="14" height="7" rx="1.5" transform="rotate(45 10 2)" fill="#1B4D3E" />
      <line x1="6" y1="16" x2="13" y2="9" stroke="#1B4D3E" strokeWidth="3" strokeLinecap="round" />
      <line x1="4" y1="22" x2="16" y2="22" stroke="#1B4D3E" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="6" y1="26" x2="14" y2="26" stroke="#1B4D3E" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
