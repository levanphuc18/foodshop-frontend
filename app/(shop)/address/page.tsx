import AccountPageShell from '@/components/shop/account/AccountPageShell';
import AccountSectionHeader from '@/components/shop/account/AccountSectionHeader';

const addresses = [
  {
    id: 1,
    label: 'Primary Vessel',
    name: 'Alex Thompson',
    address: '1242 Coastal Highway, Suite 400',
    city: 'Monterey, CA 93940',
    isPrimary: true,
  },
  {
    id: 2,
    label: 'Summer Retreat',
    name: 'Alex Thompson',
    address: '88 Ocean View Terrace',
    city: 'Nantucket, MA 02554',
    isPrimary: false,
  },
];

export default function PageAddress() {
  return (
    <AccountPageShell active="address">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10">
        <AccountSectionHeader
          eyebrow="Logistics"
          title="Addresses"
          description="Manage your saved delivery locations."
          action={
            <button type="button" className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-sky-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Address
            </button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <AddressCard key={addr.id} {...addr} />
          ))}

          <button type="button" className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-sky-400 hover:text-sky-500 transition-all group min-h-[180px]">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-50 dark:group-hover:bg-sky-900/20 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-xl">add_location_alt</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">Add New Address</span>
          </button>
        </div>
      </div>
    </AccountPageShell>
  );
}

function AddressCard({ label, name, address, city, isPrimary }: { label: string; name: string; address: string; city: string; isPrimary: boolean }) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden transition-all shadow-sm hover:shadow-md ${isPrimary ? 'border-sky-200 dark:border-sky-800/50' : 'border-slate-200 dark:border-slate-800'}`}>
      {isPrimary ? <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-700" /> : null}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${isPrimary ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            {isPrimary ? <span className="material-symbols-outlined text-[12px]">star</span> : null}
            {label}
          </span>
          <div className="flex gap-1">
            <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all">
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
            {!isPrimary ? (
              <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px] text-slate-500">location_on</span>
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{name}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{address}<br />{city}</p>
          </div>
        </div>

        {!isPrimary ? (
          <button type="button" className="mt-4 w-full py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-sky-300 hover:text-sky-600 transition-all">
            Set as Default
          </button>
        ) : null}
      </div>
    </div>
  );
}
