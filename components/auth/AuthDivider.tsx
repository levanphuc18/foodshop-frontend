interface AuthDividerProps {
  label: string;
}

export default function AuthDivider({ label }: AuthDividerProps) {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-100 dark:border-slate-800" />
      </div>
      <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
        <span className="bg-white dark:bg-slate-900 px-4 text-slate-400">{label}</span>
      </div>
    </div>
  );
}
