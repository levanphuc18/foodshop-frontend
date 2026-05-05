'use client';

import { ProductResponse } from '@/schemas/product';
import { formatPrice } from '@/lib/utils';
import { CategoryResponse } from '@/schemas/category';

interface ProductDetailModalProps {
  product: ProductResponse | null;
  onClose: () => void;
  categories: CategoryResponse[];
}

export default function ProductDetailModal({ product, onClose, categories }: ProductDetailModalProps) {
  if (!product) return null;

  const getCategoryName = (id: number) => {
    return categories.find(c => c.categoryId === id)?.name || 'Chưa phân loại';
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${product.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                {product.isActive ? 'Đang bán' : 'Đang ẩn'}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mã SP: {product.productId}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Chi tiết sản phẩm</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-800">
                <img 
                  src={product.imageUrls?.[0] || 'https://placehold.co/400'} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="aspect-square rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-800">
                    {product.imageUrls?.[idx] ? (
                      <img src={product.imageUrls[idx]} alt="Gallery" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <span className="material-symbols-outlined">image</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Info */}
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-600 mb-1 block">Thông tin chung</label>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{product.name}</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{getCategoryName(product.categoryId)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Giá bán</span>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{formatPrice(product.price)}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tồn kho</span>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{product.quantity} Sản phẩm</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-600 mb-1 block">Mô tả</label>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {product.description || 'Chưa có mô tả cho sản phẩm này.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors">
            Đóng
          </button>
          <a 
            href={`/admin/products/${product.productId}`} 
            className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white text-sm font-bold rounded-xl hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            Sửa chi tiết
          </a>
        </div>
      </div>
    </div>
  );
}
