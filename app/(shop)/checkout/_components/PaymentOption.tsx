interface PaymentOptionProps {
  icon: string;
  title: string;
  sub: string;
  value: string;
  name: string;
  checked: boolean;
  onChange: (value: string) => void;
}

export default function PaymentOption({ icon, title, sub, value, name, checked, onChange }: PaymentOptionProps) {
  return (
    <label className="cursor-pointer group">
      <input 
        type="radio" 
        name={name} 
        value={value} 
        className="sr-only peer" 
        checked={checked} 
        onChange={() => onChange(value)} 
      />
      <div className={`p-6 rounded-xl border transition-all flex flex-col gap-4 ${
        checked 
          ? 'border-sky-500 bg-sky-50/50 dark:border-sky-500 dark:bg-sky-900/20' 
          : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-sky-200 dark:hover:border-sky-800'
      }`}>
        <span className={`material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform ${
          checked ? 'text-sky-600' : 'text-slate-400'
        }`}>
          {icon}
        </span>
        <div>
          <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight mb-0.5">{title}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
        </div>
      </div>
    </label>
  );
}
