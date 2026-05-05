'use client';

import { useState } from 'react';

export default function WishlistButton() {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <button
      onClick={() => setWishlisted(!wishlisted)}
      className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg ${
        wishlisted
          ? 'bg-red-500 text-white'
          : 'bg-white/90 dark:bg-slate-900/90 text-slate-400 hover:text-red-500'
      }`}
    >
      <span
        className="material-symbols-outlined text-[20px]"
        style={{ fontVariationSettings: wishlisted ? "'FILL' 1" : "'FILL' 0" }}
      >
        favorite
      </span>
    </button>
  );
}
