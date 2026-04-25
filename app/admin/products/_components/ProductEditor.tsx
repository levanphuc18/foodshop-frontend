'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import Panel from '@/components/admin/Panel';
import * as productApi from '@/lib/api/product';
import * as categoryApi from '@/lib/api/category';
import { CategoryResponse } from '@/types/category';
import { useProduct } from '@/hooks/useProduct';
import { toast } from 'react-hot-toast';

interface ProductEditorProps {
  mode: 'create' | 'edit';
  id?: number;
}

export default function ProductEditor({ mode, id }: ProductEditorProps) {
  const router = useRouter();
  const { getProductByIdAdmin } = useProduct();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  
  // Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('0');
  const [quantity, setQuantity] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  // Images State (Max 4)
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([null, null, null, null]);
  
  const [tags, setTags] = useState<string[]>(['Smoked', 'Artisanal']);
  const [tagInput, setTagInput] = useState('');

  const isCreate = mode === 'create';
  const title = isCreate ? 'Add New Product' : 'Edit Product';
  const subtitle = isCreate
    ? 'Add artisanal dried seafood to the coastal reserve collection.'
    : 'Update product data, logistics, and publishing controls.';
  
  // Load Initial Data
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      // Don't do anything if we don't have an ID in edit mode
      if (mode === 'edit' && !id) {
        console.log('[ProductEditor] Waiting for ID...');
        return;
      }
      
      setIsLoading(true);
      try {
        // 1. Load Categories (Independent)
        const catRes = await categoryApi.getAllCategories();
        if (isMounted && catRes.code === 0) {
          setCategories(catRes.data);
        }

        // 2. Load Product Details (If Edit Mode)
        if (mode === 'edit' && id && !isNaN(id)) {
          console.log(`[ProductEditor] Initializing load for ID: ${id}`);
          const p = await getProductByIdAdmin(id);
          
          if (isMounted && p) {
            console.log('[ProductEditor] Data successfully applied to form:', p);
            setName(p.name || '');
            setDescription(p.description || '');
            setPrice(p.price !== undefined ? String(p.price) : '0');
            setQuantity(p.quantity || 0);
            setCategoryId(p.categoryId || 0);
            setIsActive(p.isActive ?? true);
            
            if (p.imageUrls && p.imageUrls.length > 0) {
              const urls: (string | null)[] = [null, null, null, null];
              p.imageUrls.forEach((url, i) => { 
                if (i < 4) urls[i] = url; 
              });
              setPreviewUrls(urls);
            }
          } else if (isMounted) {
            console.warn('[ProductEditor] getProductByIdAdmin returned no data');
          }
        }
      } catch (error: any) {
        console.error('[ProductEditor] Fatal load error:', error);
        if (isMounted) {
          toast.error('Không thể tải dữ liệu sản phẩm');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    init();
    return () => { isMounted = false; };
  }, [mode, id, getProductByIdAdmin]); // getProductByIdAdmin is stable because of useCallback in hook

  const handlePriceChange = (value: string) => {
    // Remove dots to get raw number
    const rawValue = value.replace(/\./g, '');
    if (!isNaN(Number(rawValue))) {
      setPrice(rawValue);
    }
  };

  const formatDisplayPrice = (val: string) => {
    if (!val) return '0';
    return new Intl.NumberFormat('vi-VN').format(Number(val));
  };

  const handleSave = async () => {
    const numericPrice = Number(price);
    
    // Validation
    if (!name || name.length < 3) {
      toast.error('Tên sản phẩm phải có ít nhất 3 ký tự');
      return;
    }
    if (categoryId === 0) {
      toast.error('Vui lòng chọn một danh mục sản phẩm');
      return;
    }
    if (numericPrice <= 0 || numericPrice > 1000000000) {
      toast.error('Giá tiền không hợp lệ (phải từ 1đ đến 1 tỷ VNĐ)');
      return;
    }
    if (quantity < 0) {
      toast.error('Số lượng tồn kho không được âm');
      return;
    }

    setIsLoading(true);
    try {
      // Collect valid files
      const validFiles = imageFiles.filter((f): f is File => f !== null);

      const requestData = {
        name,
        description,
        price: numericPrice,
        quantity,
        categoryId,
        isActive,
        imageFiles: validFiles.length > 0 ? validFiles : undefined
      };

      let response;
      if (isCreate) {
        response = await productApi.createProduct(requestData);
      } else {
        response = await productApi.updateProduct(id!, requestData);
      }

      if (response.code === 0) {
        toast.success(isCreate ? 'Thêm sản phẩm thành công' : 'Cập nhật sản phẩm thành công');
        router.push('/admin/products');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error('Lỗi hệ thống: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const newFiles = [...imageFiles];
      newFiles[index] = file;
      setImageFiles(newFiles);
      
      const newUrls = [...previewUrls];
      newUrls[index] = URL.createObjectURL(file);
      setPreviewUrls(newUrls);
    }
  };

  const removeTag = (tag: string) => setTags((current) => current.filter((item) => item !== tag));
  const addTag = () => {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) {
      setTags((current) => [...current, value]);
    }
    setTagInput('');
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      <PageHeader
        eyebrow="Catalog"
        title={title}
        description={subtitle}
        action={
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/admin/products" className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              Cancel
            </Link>
            <button 
              onClick={handleSave}
              disabled={isLoading}
              type="button" 
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-sky-600/20"
            >
              <span className={`material-symbols-outlined text-lg ${isLoading ? 'animate-spin' : ''}`}>
                {isLoading ? 'progress_activity' : 'save'}
              </span>
              {isCreate ? 'Save Product' : 'Update Product'}
            </button>
          </div>
        }
      />

      <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-black mb-6">
        <Link href="/admin/products" className="hover:text-sky-500 transition-colors">
          Inventory
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-sky-600">{isCreate ? 'New Product' : 'Product Details'}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Panel className="overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-600 text-xl">edit_note</span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">General Details</h2>
            </div>
            <div className="p-6 space-y-5">
              <Field label="Product Name">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sun-Dried Atlantic Mullet Roe" 
                  className={inputClassName} 
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Category">
                  <select 
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className={`${inputClassName} appearance-none text-slate-900 dark:text-slate-100 font-bold`}
                  >
                    <option value={0}>Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Listing Price (VNĐ)">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">VNĐ</span>
                    <input 
                      type="text" 
                      value={formatDisplayPrice(price)}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder="0" 
                      className={`${inputClassName} pl-12`} 
                    />
                  </div>
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the preservation process, origin, and tasting notes..."
                  rows={5}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all resize-none"
                />
              </Field>
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-600 text-xl">inventory</span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Inventory Logistics</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label="Stock Quantity">
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    placeholder="0" 
                    className={inputClassName} 
                  />
                </Field>
                <Field label="SKU Reference">
                  <input type="text" placeholder="DS-XX-000" className={inputClassName} disabled />
                </Field>
                <Field label="Unit Weight (g)">
                  <input type="number" placeholder="100" className={inputClassName} disabled />
                </Field>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-600 text-xl">photo_camera</span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Media Gallery (Max 4)</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Main Image */}
              <label className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-900/10 transition-all group overflow-hidden relative">
                {previewUrls[0] ? (
                  <img src={previewUrls[0]} alt="Main" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30 flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-sky-500 transition-colors">add_photo_alternate</span>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-sky-600 transition-colors">Upload Main Image</p>
                    </div>
                  </>
                )}
                <input type="file" className="hidden" onChange={(e) => handleImageChange(0, e)} accept="image/*" />
              </label>

              {/* Gallery Images */}
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((index) => (
                  <label key={index} className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-900/10 transition-all group overflow-hidden relative">
                    {previewUrls[index] ? (
                      <img src={previewUrls[index]!} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-xl text-slate-300 group-hover:text-sky-400 transition-colors">add</span>
                    )}
                    <input type="file" className="hidden" onChange={(e) => handleImageChange(index, e)} accept="image/*" />
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-bold">Support JPG, PNG (Max 10MB per image)</p>
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-600 text-xl">visibility</span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Publishing</h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-3">
                <div 
                  onClick={() => setIsActive(true)}
                  className={`group p-4 rounded-xl border-2 cursor-pointer transition-all ${isActive ? 'bg-emerald-50 border-emerald-500/50 shadow-sm shadow-emerald-500/10' : 'bg-slate-50 border-transparent hover:border-slate-200 opacity-60 hover:opacity-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400 group-hover:bg-slate-300'}`}>
                      <span className="material-symbols-outlined">public</span>
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>Public</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Visible to customers instantly</p>
                    </div>
                    {isActive && (
                      <span className="material-symbols-outlined text-emerald-500 animate-in zoom-in duration-300">check_circle</span>
                    )}
                  </div>
                </div>

                <div 
                  onClick={() => setIsActive(false)}
                  className={`group p-4 rounded-xl border-2 cursor-pointer transition-all ${!isActive ? 'bg-amber-50 border-amber-500/50 shadow-sm shadow-amber-500/10' : 'bg-slate-50 border-transparent hover:border-slate-200 opacity-60 hover:opacity-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${!isActive ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400 group-hover:bg-slate-300'}`}>
                      <span className="material-symbols-outlined">visibility_off</span>
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-black uppercase tracking-widest ${!isActive ? 'text-amber-700' : 'text-slate-500'}`}>Hidden</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Kept in vault (Admin only)</p>
                    </div>
                    {!isActive && (
                      <span className="material-symbols-outlined text-amber-500 animate-in zoom-in duration-300">check_circle</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Search Tags</label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[52px]">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-[10px] font-black uppercase tracking-widest rounded-lg">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-[12px]">close</span>
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                    className="flex-1 min-w-[80px] bg-transparent text-[11px] font-bold text-slate-600 dark:text-slate-400 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{label}</label>
      {children}
    </div>
  );
}

const inputClassName =
  'w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all';
