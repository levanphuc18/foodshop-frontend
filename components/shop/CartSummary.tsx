export default function CartSummary({ subtotal }: { subtotal: number }) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-8 space-y-4">
      <h3 className="text-xl font-bold text-on-surface">Order Summary</h3>
      <div className="flex justify-between text-on-surface-variant">
        <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-on-surface-variant">
        <span>Shipping</span><span>Free</span>
      </div>
      <div className="border-t border-outline-variant pt-4 flex justify-between font-bold text-on-surface text-lg">
        <span>Total</span><span>${subtotal.toFixed(2)}</span>
      </div>
      <button className="w-full bg-primary text-white font-bold py-4 rounded-full hover:opacity-90 transition-all active:scale-95">
        Proceed to Checkout
      </button>
    </div>
  );
}
