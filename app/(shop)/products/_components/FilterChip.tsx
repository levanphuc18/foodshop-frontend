interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export default function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-[11px] font-bold rounded-lg">
      {label}
      <button type="button" onClick={onRemove} className="hover:text-red-500 transition-colors ml-0.5">
        <span className="material-symbols-outlined text-[12px]">close</span>
      </button>
    </span>
  );
}
