import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="pt-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-[10000ms]"
            alt="cinematic wide shot of sunlight sparkling on deep blue ocean waves"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz36VG4o3r3gxuH7w5EPomKFFREhokoQALG3BCqAoSNgWhrx-Cej66Fss8zT8CL8RbkFL83zQyLuCrZTZm4d0351WlUpgFY6-bnGnYh2Oq0itBKmjfo1dSVDJXKattQnqTxUlqwc7IhaiHR5hYr-Dhd9sfHp-5KbmpqyfnaVA2hGriwDuaW115hDteC_VQJsZJRctegTK5mOyBEimysN102Bz1moPdMHPwek0axNzdoVVMS30T3fOica3j6WSxIb8besrHEuR9bYc"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent"></div>
        </div>
        <div className="container mx-auto px-10 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block px-5 py-2 mb-8 text-[10px] font-black tracking-[0.3em] uppercase bg-sky-600 text-white rounded-full">
              The DrySea Tradition
            </span>
            <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.9] mb-10">
              Elevated <br /> Maritime <br />
              <span className="text-sky-500 italic">Preservation.</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed mb-12 max-w-xl font-medium">
              Discover our collection of sun-cured, sustainably sourced seafood, perfected with techniques passed down through generations.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <Link href="/products">
                <button className="w-full sm:w-auto px-12 py-6 bg-white text-slate-950 font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:bg-sky-500 hover:text-white transition-all transform hover:-translate-y-1 active:scale-95">
                  Shop the Collection
                </button>
              </Link>
              <Link href="/products" className="group flex items-center text-white font-black text-xs uppercase tracking-[0.2em]">
                Discover Our Process
                <span className="material-symbols-outlined ml-4 group-hover:translate-x-4 transition-transform text-sky-500">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-32 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
            <div className="max-w-xl">
              <label className="text-[11px] font-black tracking-[0.3em] uppercase text-sky-600 mb-4 block">Oceanic Selection</label>
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">Curated Categories</h2>
            </div>
            <p className="text-slate-500 font-medium max-w-sm mb-2">Each piece is selected for optimal texture and flavor density by our master curators.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 h-[700px]">
            <div className="md:col-span-7 relative overflow-hidden bg-slate-100 dark:bg-slate-900 rounded-[3rem] group cursor-pointer shadow-2xl shadow-slate-900/5">
              <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwJQZbgFqgrXTXVtu9dQVmGFjKEeWDPK0Gv4UBr0oMdj1Fvc1lf6aX4f1to-PMhX8FKH__wkcjcQpzrhpfvzqQ9B1mzP0qsnok-kQr1_02k-GCnIUa9Fq9Pv1RmVn6lUxmJ43eR-unakvJw0O7-PSbtwzNS5UHvhz11hHJ9qNA1FoMF2lyNFiqaMUXW6-57xQ7_gQNexlpnOXAXRMplpfiFL0gz-01YMzETvx9LlKNTrT6j5UALxUC7JlC9WzJbLsxK0zWeg4Ibk0" alt="Dried Fish" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-12 left-12 text-white">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400 mb-2 block">Premium Reserve</span>
                <h3 className="text-5xl font-black tracking-tighter mb-6 underline decoration-sky-500 decoration-8 underline-offset-8">Aged Fish</h3>
                <Link href="/products" className="inline-block px-8 py-4 bg-white/10 backdrop-blur-xl rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 hover:bg-white hover:text-slate-950 transition-all">Explore Series</Link>
              </div>
            </div>
            <div className="md:col-span-5 grid grid-rows-2 gap-10">
              <CategoryCard title="Dried Squid" tag="Tender & Savory" img="https://lh3.googleusercontent.com/aida-public/AB6AXuDKsrvK9NUhmwxBjopNuXGkghCiY500BhFlmYvvu5qMFrlFUZ1O3yiMei2MHz-dz3BmPBewm29YrlUP-LsOlkUUhst8GOGiG74yUKRLIDezxAdPROViv6ULkWyA_EvqFDLMPbx5mG7nkgRCdY42GDsYfvgi1maiNmbipJVcNwELgxpTGtM3DRzKKyzXyQCd3fF0P_BcSTCKCAoXbkZIJJy2jLTUyUAS6oYQpv7dFHPV2JSntTe0LszN9RMzBfUxoJLG3NP9bApd0-E" />
              <CategoryCard title="Dried Shrimp" tag="Umami Glaze" img="https://lh3.googleusercontent.com/aida-public/AB6AXuDFX_6yDcJlaYUET1HPJFXwPCNIM1F4i7ppveyIN4uvCDfednbiXww25q18TR_T7vA7A5qv0lPlWcxpTO7FCWm-_kY-oaUghm-JLAN5J0fHierjjz6EUwZom1-ypcoh_-NOR77SYGZwIhwk3hRWLz7c9hqFtuUZ7JgHD4KrbIu19Rzwnp3XycLQBQ3B0U0-rE_hiwGA3umk8z4BZ1I1OL-5gpSkWTPuAcwM3Zvv0rdPidTdcaVKw_Vn70M8OfsO2_P-aGuJcuqYpok" />
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Banner */}
      <section className="container mx-auto px-10 mb-32">
        <div className="relative bg-slate-900 rounded-[4rem] p-20 overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-sky-950/20">
          <div className="absolute top-0 right-0 w-2/3 h-full bg-sky-600/10 -skew-x-12 translate-x-1/4"></div>
          <div className="max-w-xl relative z-10">
            <span className="text-sky-400 font-black tracking-[0.3em] text-[10px] uppercase mb-6 block">DrySea Journal</span>
            <h2 className="text-6xl font-black text-white tracking-tighter mb-8 leading-[0.9]">The Harvest <br /> Insider — <span className="text-sky-500">15% Off</span></h2>
            <p className="text-slate-400 mb-10 text-lg font-medium">Join our circle for early access to seasonal harvests and rare maritime finds down the coast.</p>
            <div className="flex">
              <input className="bg-white/5 border border-white/10 text-white text-xs p-6 w-full rounded-l-[1.5rem] focus:ring-2 focus:ring-sky-500 outline-none placeholder:text-slate-500" placeholder="Email Address" type="email" />
              <button className="bg-sky-600 text-white px-10 rounded-r-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-sky-500 transition-all shadow-xl">Join</button>
            </div>
          </div>
          <div className="hidden lg:block relative z-10 mr-12 transform rotate-6 hover:rotate-0 transition-transform duration-700">
             <div className="w-64 h-80 bg-slate-800 rounded-[2rem] border border-white/10 shadow-2xl p-6">
                <div className="w-full h-48 bg-slate-700 rounded-2xl mb-4 overflow-hidden">
                   <img className="w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvFZUTOSY_sJF3h8haHCqs8o6PAS0cv6veKexSZY3cGMuVjbFvqwHCuQXEWfLC5GGnGB8TF3HcxxdhiUHd64A-9VFzskhVotYJHGxvwgRXAcA5RWqolKcmwDLPQffHDisY5OB_yC7XEcvD9EiMKDmfPm4_Xfsmsy-CWOA2TeBmSUxsMszXNkHjO1jVXMz6vgX9Za-ZrLhCzbjf9VpIw-TKtyedaeHY1S0eFfHw2cgcxccq9PEO5OLZeYgGIgwvd37MEI82DFVaoew" alt="DrySea Premium" />
                </div>
                <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-1 italic">DrySea Reserve</p>
                <p className="text-lg font-bold text-white tracking-tight leading-tight">Silver Pomfret Midnight Cured</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoryCard({ title, tag, img }: any) {
  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] group cursor-pointer shadow-xl shadow-slate-900/5">
      <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-80" src={img} alt={title} />
      <div className="absolute inset-0 bg-slate-950/40 opacity-40 group-hover:opacity-60 transition-opacity"></div>
      <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6">
        <h3 className="text-4xl font-black tracking-tighter mb-2 group-hover:translate-y-[-4px] transition-transform">{title}</h3>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400 group-hover:translate-y-4 transition-transform opacity-80">{tag}</p>
      </div>
    </div>
  );
}
