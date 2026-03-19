type AdSlotProps = {
  title: string;
  copy: string;
  label: string;
};

export function AdSlot({ title, copy, label }: AdSlotProps) {
  return (
    <aside className="ad-slot" aria-label={label}>
      <span className="ad-slot__label">{label}</span>
      <strong>{title}</strong>
      <p className="muted">{copy}</p>
    </aside>
  );
}
