import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import AccountPageShell from '@/components/shop/account/AccountPageShell';
import AccountSectionHeader from '@/components/shop/account/AccountSectionHeader';

const wishlistItems = [
  {
    id: 1,
    tag: 'Japan Harvest',
    name: 'Sun-Golden Scallops',
    price: formatPrice(124000),
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHmD6CP2zPGKjBC9ksnpC1V0ed45Lhi9hnonHvhjfoHZJ1hKJI2pAHFFRc9SwiKZthNzyjqcWzrMetas_u5Pr1FlGU6nJ5lfN2tfZo3IYRbBVgqd193e71mO0DQa70DRs-a_MlD3h2JOaht5jHcZBLn9QC3-aLXdUjQE2JP4W-EItcTlD3wT6xlPQIIeh6evD9OKOD2FzBDlP9MkaECv2cavRyF1Tu1pAEQw3GM_74eibc8sVwff3HWtVZguhNMCn0QR_UA0hrry4',
  },
  {
    id: 2,
    tag: 'Cured Batch',
    name: 'Aged Mullet Roe',
    price: formatPrice(89000),
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeSB50Xo-yeYS-GAZX7zWnFhyvIHi4z1CYc2olEUFxD8ao4DwC-TnfUvdXsU07M1vUR-YoMcFY2DpJp0XHQfQ8APn-FwaSpzEl8x44O_ZJnI4O--Fg2e3Zjw79jMvEryA4Y356UnbZ0ZDg940dXGlQlSm6aWto87SiR0ciTeK8tB2VFJPqz8Ts7oT-R1pq7pkH8vdZS1zxQ9ClGrcYQktawe-3fazZAgbYynfnuuOLmZx0ggX03OAqakasQ3DJTtg8kSMTVQHkucQ',
  },
  {
    id: 3,
    tag: 'Premium Reserve',
    name: 'Silver Pomfret Midnight',
    price: formatPrice(156000),
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvFZUTOSY_sJF3h8haHCqs8o6PAS0cv6veKexSZY3cGMuVjbFvqwHCuQXEWfFC5GGnGB8TF3HcxxdhiUHd64A-9VFzskhVotYJHGxvwgRXAcA5RWqolKcmwDLPQffHDisY5OB_yC7XEcvD9EiMKDmfPm4_Xfsmsy-CWOA2TeBmSUxsMszXNkHjO1jVXMz6vgX9Za-ZrLhCzbjf9VpIw-TKtyedaeHY1S0eFfHw2cgcxccq9PEO5OLZeYgGIgwvd37MEI82DFVaoew',
  },
];

export default function PageWishlist() {
  return (
    <AccountPageShell active="wishlist">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10">
        <AccountSectionHeader
          eyebrow="Collection"
          title="Saved Items"
          description="Your curated selection of saved maritime finds."
        />

        {wishlistItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl text-red-400">favorite</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">No saved items yet</p>
            <p className="text-xs text-slate-400 mb-6">Browse our collection and save the ones you love.</p>
            <Link href="/products" className="px-6 py-2.5 bg-sky-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20">
              Browse Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistItems.map((item) => (
              <WishlistCard key={item.id} {...item} />
            ))}
          </div>
        )}
      </div>
    </AccountPageShell>
  );
}

function WishlistCard({ tag, name, price, img }: { tag: string; name: string; price: string; img: string }) {
  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-sky-500/30 hover:shadow-md transition-all">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={img} alt={name} />
        <button type="button" className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur flex items-center justify-center text-red-500 shadow-md hover:scale-110 active:scale-90 transition-all">
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
        </button>
      </div>
      <div className="p-5">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-600 mb-1 block italic">{tag}</span>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-tight">{name}</h3>
          <span className="text-sm font-black text-slate-900 dark:text-white">{price}</span>
        </div>
        <button type="button" className="w-full py-2.5 bg-slate-900 dark:bg-sky-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
