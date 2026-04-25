interface SummaryItemProps {
  title: string;
  price: string;
  qty: number;
  originalPrice?: string;
}

export default function SummaryItem({ title, price, qty, originalPrice }: SummaryItemProps) {
  return (
    <div className="flex justify-between items-start gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-300 leading-tight truncate">{title}</p>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Qty: {qty}</p>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <span className="text-sm font-black text-white leading-none">{price}</span>
        {originalPrice && (
          <span className="text-[10px] text-slate-500 line-through mt-1">{originalPrice}</span>
        )}
      </div>
    </div>
  );
}
