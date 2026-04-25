'use client';
export default function CheckoutForm() {
  return (
    <form className="space-y-6">
      <h2 className="text-2xl font-bold text-on-surface">Shipping Information</h2>
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="First Name" className="px-4 py-3 rounded-xl border border-outline-variant bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary/40" />
        <input placeholder="Last Name" className="px-4 py-3 rounded-xl border border-outline-variant bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary/40" />
      </div>
      <input placeholder="Email" type="email" className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary/40" />
      <input placeholder="Address" className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary/40" />
    </form>
  );
}
