import AccountPageShell from '@/components/shop/account/AccountPageShell';
import AccountSectionHeader from '@/components/shop/account/AccountSectionHeader';

const paymentMethods = [
  { id: 1, type: 'Visa', number: '•••• •••• •••• 8829', expiry: '12/26', isDefault: true },
  { id: 2, type: 'Mastercard', number: '•••• •••• •••• 1042', expiry: '08/25', isDefault: false },
];

export default function PagePayment() {
  return (
    <AccountPageShell active="payment">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10">
        <AccountSectionHeader
          eyebrow="Financials"
          title="Payment Methods"
          description="Manage your saved cards and billing preferences."
          action={
            <button type="button" className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-sky-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <span className="material-symbols-outlined text-[16px]">add_card</span>
              Add Card
            </button>
          }
        />

        <div className="space-y-3 mb-6">
          {paymentMethods.map((method) => (
            <PaymentCard key={method.id} {...method} />
          ))}

          <button type="button" className="w-full bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 flex items-center justify-center gap-3 text-slate-400 hover:border-sky-400 hover:text-sky-500 transition-all group">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-50 dark:group-hover:bg-sky-900/20 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-[18px]">add_card</span>
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Add New Payment Method</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl text-emerald-600">verified_user</span>
          </div>
          <div>
            <p className="text-xs font-black text-slate-900 dark:text-white mb-0.5">AES-256 Encrypted</p>
            <p className="text-xs text-slate-400 leading-relaxed">Your payment information is protected by military-grade encryption. We never store raw card data.</p>
          </div>
        </div>
      </div>
    </AccountPageShell>
  );
}

function PaymentCard({ type, number, expiry, isDefault }: { type: string; number: string; expiry: string; isDefault: boolean }) {
  const isVisa = type === 'Visa';
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden transition-all shadow-sm hover:shadow-md ${isDefault ? 'border-sky-200 dark:border-sky-800/50' : 'border-slate-200 dark:border-slate-800'}`}>
      {isDefault ? <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-700" /> : null}
      <div className="p-5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-10 rounded-lg flex items-center justify-center font-black text-[11px] italic shadow shrink-0 ${isVisa ? 'bg-blue-600 text-white' : 'bg-gradient-to-br from-orange-500 to-red-500 text-white'}`}>
            {type}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-black text-slate-900 dark:text-white tracking-widest">{number}</p>
              {isDefault ? (
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-md">
                  Default
                </span>
              ) : null}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Expires {expiry}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button type="button" className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            Edit
          </button>
          {!isDefault ? (
            <button type="button" className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
