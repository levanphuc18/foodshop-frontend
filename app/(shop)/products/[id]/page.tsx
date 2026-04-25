'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useProduct } from '@/hooks/useProduct';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';

/* ── Mock data (sẽ thay bằng API call sau) ── */
const PRODUCT = {
  id: '6',
  name: 'Sun-Dried Squid',
  category: 'Dried Squid',
  origin: 'Vietnam · Coastal Harvest',
  sku: 'DS-SQ-006',
  price: 65,
  originalPrice: 78,
  rating: 4.5,
  reviews: 156,
  inStock: true,
  stockCount: 23,
  tag: 'Sale',
  description:
    'Carefully sun-dried along the southern Vietnamese coastline using traditional methods passed down through generations. Each piece is hand-selected for optimal thickness and salinity balance — delivering a rich, savory umami depth that is impossible to replicate industrially.',
  highlights: [
    { icon: 'eco', label: 'Hand-selected', sub: 'Grade A quality' },
    { icon: 'wb_sunny', label: 'Sun-dried', sub: '72-hour process' },
    { icon: 'local_shipping', label: 'Fast delivery', sub: '2–4 business days' },
    { icon: 'verified', label: 'Certified', sub: 'Food safety standard' },
  ],
  images: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDKsrvK9NUhmwxBjopNuXGkghCiY500BhFlmYvvu5qMFrlFUZ1O3yiMei2MHz-dz3BmPBewm29YrlUP-LsOlkUUhst8GOGiG74yUKRLIDezxAdPROViv6ULkWyA_EvqFDLMPbx5mG7nkgRCdY42GDsYfvgi1maiNmbipJVcNwELgxpTGtM3DRzKKyzXyQCd3fF0P_BcSTCKCAoXbkZIJJy2jLTUyUAS6oYQpv7dFHPV2JSntTe0LszN9RMzBfUxoJLG3NP9bApd0-E',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBHmD6CP2zPGKjBC9ksnpC1V0ed45Lhi9hnonHvhjfoHZJ1hKJI2pAHFFRc9SwiKZthNzyjqcWzrMetas_u5Pr1FlGU6nJ5lfN2tfZo3IYRbBVgqd193e71mO0DQa70DRs-a_MlD3h2JOaht5jHcZBLn9QC3-aLXdUjQE2JP4W-EItcTlD3wT6xlPQIIeh6evD9OKOD2FzBDlP9MkaECv2cavRyF1Tu1pAEQw3GM_74eibc8sVwff3HWtVZguhNMCn0QR_UA0hrry4',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDeSB50Xo-yeYS-GAZX7zWnFhyvIHi4z1CYc2olEUFxD8ao4DwC-TnfUvdXsU07M1vUR-YoMcFY2DpJp0XHQfQ8APn-FwaSpzEl8x44O_ZJnI4O--Fg2e3Zjw79jMvEryA4Y356UnbZ0ZDg940dXGlQlSm6aWto87SiR0ciTeK8tB2VFJPqz8Ts7oT-R1pq7pkH8vdZS1zxQ9ClGrcYQktawe-3fazZAgbYynfnuuOLmZx0ggX03OAqakasQ3DJTtg8kSMTVQHkucQ',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBvFZUTOSY_sJF3h8haHCqs8o6PAS0cv6veKexSZY3cGMuVjbFvqwHCuQXEWfFC5GGnGB8TF3HcxxdhiUHd64A-9VFzskhVotYJHGxvwgRXAcA5RWqolKcmwDLPQffHDisY5OB_yC7XEcvD9EiMKDmfPm4_Xfsmsy-CWOA2TeBmSUxsMszXNkHjO1jVXMz6vgX9Za-ZrLhCzbjf9VpIw-TKtyedaeHY1S0eFfHw2cgcxccq9PEO5OLZeYgGIgwvd37MEI82DFVaoew',
  ],
};

const RELATED = [
  { id: '7', name: 'Dried Tiger Shrimp', price: 98, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFX_6yDcJlaYUET1HPJFXwPCNIM1F4i7ppveyIN4uvCDfednbiXww25q18TR_T7vA7A5qv0lPlWcxpTO7FCWm-_kY-oaUghm-JLAN5J0fHierjjz6EUwZom1-ypcoh_-NOR77SYGZwIhwk3hRWLz7c9hqFtuUZ7JgHD4KrbIu19Rzwnp3XycLQBQ3B0U0-rE_hiwGA3umk8z4BZ1I1OL-5gpSkWTPuAcwM3Zvv0rdPidTdcaVKw_Vn70M8OfsO2_P-aGuJcuqYpok', rating: 4.7 },
  { id: '1', name: 'Sun-Golden Scallops', price: 124, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHmD6CP2zPGKjBC9ksnpC1V0ed45Lhi9hnonHvhjfoHZJ1hKJI2pAHFFRc9SwiKZthNzyjqcWzrMetas_u5Pr1FlGU6nJ5lfN2tfZo3IYRbBVgqd193e71mO0DQa70DRs-a_MlD3h2JOaht5jHcZBLn9QC3-aLXdUjQE2JP4W-EItcTlD3wT6xlPQIIeh6evD9OKOD2FzBDlP9MkaECv2cavRyF1Tu1pAEQw3GM_74eibc8sVwff3HWtVZguhNMCn0QR_UA0hrry4', rating: 4.8 },
  { id: '2', name: 'Aged Mullet Roe', price: 89, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeSB50Xo-yeYS-GAZX7zWnFhyvIHi4z1CYc2olEUFxD8ao4DwC-TnfUvdXsU07M1vUR-YoMcFY2DpJp0XHQfQ8APn-FwaSpzEl8x44O_ZJnI4O--Fg2e3Zjw79jMvEryA4Y356UnbZ0ZDg940dXGlQlSm6aWto87SiR0ciTeK8tB2VFJPqz8Ts7oT-R1pq7pkH8vdZS1zxQ9ClGrcYQktawe-3fazZAgbYynfnuuOLmZx0ggX03OAqakasQ3DJTtg8kSMTVQHkucQ', rating: 4.6 },
  { id: '8', name: 'Silver Pomfret Midnight', price: 156, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvFZUTOSY_sJF3h8haHCqs8o6PAS0cv6veKexSZY3cGMuVjbFvqwHCuQXEWfFC5GGnGB8TF3HcxxdhiUHd64A-9VFzskhVotYJHGxvwgRXAcA5RWqolKcmwDLPQffHDisY5OB_yC7XEcvD9EiMKDmfPm4_Xfsmsy-CWOA2TeBmSUxsMszXNkHjO1jVXMz6vgX9Za-ZrLhCzbjf9VpIw-TKtyedaeHY1S0eFfHw2cgcxccq9PEO5OLZeYgGIgwvd37MEI82DFVaoew', rating: 4.8 },
];

const REVIEWS = [
  { name: 'Nguyen Minh', rating: 5, date: 'Mar 12, 2025', verified: true, comment: 'Absolutely love this product. The texture is firm yet delicate, and the umami flavour is exceptional. Will definitely reorder.' },
  { name: 'Sarah K.', rating: 4, date: 'Feb 28, 2025', verified: true, comment: 'Great quality dried squid. Arrived well-packaged. Flavour is authentic and not overly salty. Knocked off one star only because the pieces varied in size.' },
  { name: 'Tran Van Long', rating: 5, date: 'Jan 15, 2025', verified: false, comment: 'Outstanding! Fried lightly with butter it melts on your tongue. A cut above anything from the supermarket.' },
];

const WEIGHT_OPTIONS = ['100g', '250g', '500g', '1kg'];
const TABS = ['Description', 'Specifications', 'Reviews'];

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { currentProduct: product, getProductById, isLoading } = useProduct();
  const { addToCart } = useCart();

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState('100g');
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('Description');
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (id) {
      getProductById(parseInt(id));
    }
  }, [id, getProductById]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Product Not Found</h2>
        <Link href="/products" className="text-sky-600 font-bold hover:underline">Back to Shop</Link>
      </div>
    );
  }

  const imageUrls = (product.imageUrls && product.imageUrls.length > 0)
    ? product.imageUrls
    : ['https://lh3.googleusercontent.com/aida-public/AB6AXuBvFZUTOSY_sJF3h8haHCqs8o6PAS0cv6veKexSZY3cGMuVjbFvqwHCuQXEWfLC5GGnGB8TF3HcxxdhiUHd64A-9VFzskhVotYJHGxvwgRXAcA5RWqolKcmwDLPQffHDisY5OB_yC7XEcvD9EiMKDmfPm4_Xfsmsy-CWOA2TeBmSUxsMszXNkHjO1jVXMz6vgX9Za-ZrLhCzbjf9VpIw-TKtyedaeHY1S0eFfHw2cgcxccq9PEO5OLZeYgGIgwvd37MEI82DFVaoew'];

  const hasDiscount = product.salePrice !== undefined && product.salePrice !== null && product.salePrice < product.price;
  const currentPrice = hasDiscount ? product.salePrice : product.price;
  const originalPrice = product.price;
  const discount = product.discountPercentage || 0;

  const handleAddToCart = async () => {
    if (qty > product.quantity) {
      toast.error(`Chỉ còn ${product.quantity} sản phẩm trong kho`);
      return;
    }
    const success = await addToCart(product.productId, qty, {
      productName: product.name,
      productPrice: currentPrice,
      productImageUrl: imageUrls[0]
    });
    if (success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link href="/" className="hover:text-sky-600 transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/products" className="hover:text-sky-600 transition-colors">Shop</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-slate-700 dark:text-slate-300">{product.name}</span>
        </nav>

        {/* ── Main Product Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 mb-20">

          {/* Left: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <img
                src={imageUrls[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500"
              />
              {/* Sale badge */}
              {hasDiscount && (
                <div className="absolute top-4 left-4 flex flex-col gap-1">
                  {(() => {
                    const isPercent = product.discountUnit === 'PERCENT';
                    const actualDiscount = originalPrice - currentPrice!;
                    const expectedDiscount = originalPrice * ((product.discountPercentage || 0) / 100);
                    const isCapped = isPercent && (expectedDiscount - actualDiscount > 0.1);
                    return (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="bg-red-500 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg w-fit">
                            Giảm {isPercent ? `${product.discountPercentage}%` : formatPrice(actualDiscount)}
                          </span>
                          {product.discountType === 'PRODUCT' && (
                            <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-sm">
                              Voucher
                            </span>
                          )}
                        </div>
                        {isPercent && product.maxDiscount && (
                          <span className="text-white text-[10px] font-black tracking-widest px-2 py-1 rounded-lg bg-black/30 backdrop-blur-sm w-fit mt-1">
                            Tối đa {formatPrice(product.maxDiscount)}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
              {/* Wishlist */}
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg ${wishlisted ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-slate-900/90 text-slate-400 hover:text-red-500'
                  }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: wishlisted ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
              </button>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {imageUrls.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === i
                    ? 'border-sky-500 ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-sky-300'
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            {/* Category + SKU */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-sky-600">
                Category ID: {product.categoryId} · Local Harvest
              </span>
              <span className="text-[10px] font-bold text-slate-400 font-mono">SKU: DS-PROD-{product.productId}</span>
            </div>

            {/* Name */}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-[16px] text-amber-400"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">4.5</span>
              <span className="text-sm text-slate-400">(0 reviews)</span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg">
                In Stock · {product.quantity} left
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <span className="text-4xl font-black text-sky-600">{formatPrice(currentPrice!)}</span>
              {hasDiscount && (
                <div className="flex items-center gap-3">
                  <span className="text-xl text-slate-400 line-through font-medium">{formatPrice(originalPrice)}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-wider border border-red-100 dark:border-red-900/30 rounded-lg">
                      {product.discountType === 'PRODUCT' ? 'Voucher' : 'Sale'}
                    </span>
                    <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-black rounded-lg shadow-sm">
                      Save {formatPrice(originalPrice - currentPrice!)}
                    </span>
                    {product.discountUnit === 'PERCENT' && product.maxDiscount && (
                      <span className="text-[11px] font-bold text-red-500 italic ml-1">
                        (Tối đa {formatPrice(product.maxDiscount)})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Weight selector */}
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                Weight: <span className="text-slate-900 dark:text-white">{selectedWeight}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {WEIGHT_OPTIONS.map((w) => (
                  <button
                    key={w}
                    onClick={() => setSelectedWeight(w)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${selectedWeight === w
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-sky-300'
                      }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + Add to Cart */}
            <div className="flex gap-3 mb-6">
              {/* Quantity stepper */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={product.quantity === 0}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-sky-600 hover:bg-white dark:hover:bg-slate-700 transition-all disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>
                <span className="w-12 text-center text-base font-black text-slate-900 dark:text-white">
                  {product.quantity === 0 ? 0 : qty}
                </span>
                <button
                  onClick={() => setQty(Math.min(product.quantity, qty + 1))}
                  disabled={product.quantity === 0 || qty >= product.quantity}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-sky-600 hover:bg-white dark:hover:bg-slate-700 transition-all disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
                className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${addedToCart
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : product.quantity === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {addedToCart ? 'check_circle' : 'shopping_cart'}
                </span>
                {product.quantity === 0 ? 'Out of Stock' : addedToCart ? 'Added!' : 'Add to Cart'}
              </button>

              {/* Buy Now */}
              <Link href={product.quantity === 0 ? '#' : "/checkout"} className="flex-1">
                <button
                  disabled={product.quantity === 0}
                  className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-widest border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: 'eco', label: 'Hand-selected', sub: 'Grade A quality' },
                { icon: 'wb_sunny', label: 'Sun-dried', sub: '72-hour process' },
                { icon: 'local_shipping', label: 'Fast delivery', sub: '2–4 business days' },
                { icon: 'verified', label: 'Certified', sub: 'Food safety standard' },
              ].map((h) => (
                <div key={h.label} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-sky-600">{h.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{h.label}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{h.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Share */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Share:</span>
              {['facebook', 'link'].map((icon) => (
                <button key={icon} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-900/20 transition-all">
                  <span className="material-symbols-outlined text-[16px]">{icon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs: Description / Specs / Reviews ── */}
        <div className="mb-20">
          {/* Tab header */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${activeTab === tab
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {tab}
                {tab === 'Reviews' && (
                  <span className="ml-2 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-black">
                    {REVIEWS.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'Description' && (
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="space-y-5">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{product.description}</p>
                <ul className="space-y-2">
                  {['100% natural, no preservatives', 'Traditional sun-drying process', 'Individually hand-inspected', 'Vacuum-sealed for freshness'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[12px] text-sky-600">check</span>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <img src={imageUrls[0]} alt="process" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {activeTab === 'Specifications' && (
            <div className="max-w-xl">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { label: 'Product Name', value: product.name },
                  { label: 'Category ID', value: product.categoryId },
                  { label: 'Origin', value: 'Local Vietnamese Coast' },
                  { label: 'SKU', value: `DS-PROD-${product.productId}` },
                  { label: 'Available Weights', value: WEIGHT_OPTIONS.join(', ') },
                  { label: 'Storage', value: 'Cool, dry place · Refrigerate after opening' },
                  { label: 'Shelf Life', value: '12 months (unopened)' },
                  { label: 'Certification', value: 'ISO 22000 · HACCP' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex px-5 py-3.5 text-sm">
                    <span className="w-44 font-bold text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
                    <span className="text-slate-900 dark:text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Reviews' && (
            <div className="space-y-6 max-w-3xl">
              {/* Summary */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-8">
                <div className="text-center shrink-0">
                  <p className="text-5xl font-black text-slate-900 dark:text-white">{PRODUCT.rating}</p>
                  <div className="flex justify-center gap-0.5 my-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="material-symbols-outlined text-[16px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold">0 reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = star === 5 ? 68 : star === 4 ? 22 : star === 3 ? 7 : star === 2 ? 2 : 1;
                    return (
                      <div key={star} className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                        <span className="w-3">{star}</span>
                        <span className="material-symbols-outlined text-[12px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review cards */}
              {REVIEWS.map((review, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                        {review.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-slate-900 dark:text-white">{review.name}</p>
                          {review.verified && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className={`material-symbols-outlined text-[14px] ${i <= review.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} style={{ fontVariationSettings: i <= review.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{review.comment}</p>
                </div>
              ))}

              <button className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:border-sky-400 hover:text-sky-500 transition-all">
                Load More Reviews
              </button>
            </div>
          )}
        </div>

        {/* ── Related Products ── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">You May Also Like</h2>
            <Link href="/products" className="text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-1">
              View all <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {RELATED.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`}>
                <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-sky-200 dark:hover:border-sky-800/50 transition-all">
                  <div className="aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-black text-slate-900 dark:text-white leading-snug mb-1 line-clamp-2">{p.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-sky-600">{formatPrice(p.price)}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className={`material-symbols-outlined text-[11px] ${i <= Math.round(p.rating) ? 'text-amber-400' : 'text-slate-200'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
