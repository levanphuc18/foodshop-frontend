interface StarRatingProps {
  rating: number;
}

export default function StarRating({ rating }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[13px] ${i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
          style={{ fontVariationSettings: i <= Math.round(rating) ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  );
}
