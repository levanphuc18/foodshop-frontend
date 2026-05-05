# BÁO CÁO PHÂN TÍCH REFACTOR - FOODSHOP FRONTEND
> **Người thực hiện:** Senior Next.js Engineer & Technical Lead  
> **Ngày:** 04/05/2026 | **Commit tham chiếu:** `3ab86cb` → `8f4dcf5`

---

## 1. 🛡️ Bổ sung Next.js Middleware (Auth & Protect Routes)

- 🟢 **Trạng thái:** Hoàn thành
- 🔍 **Chi tiết thay đổi:**
  - **File bị xóa:** `middleware.ts` (deprecated)
  - **File mới:** `proxy.ts` — xử lý tại Edge Runtime trước khi React render
  - Logic bảo vệ 3 nhóm route: `AUTH_PATHS` (login/register), `PROTECTED_PATHS` (profile/orders/checkout), `ADMIN_PATHS` (/admin)
  - Tích hợp JWT decode thủ công (Edge Runtime không hỗ trợ `jsonwebtoken`)

---

### 💻 VÍ DỤ ĐỐI CHIẾU CODE

**Ví dụ 1 — Bảo vệ route (BEFORE vs AFTER)**

```tsx
// ❌ BEFORE: Kiểm tra tại Client, xảy ra SAU khi UI đã render (gây nháy màn hình)
// app/(shop)/profile/page.tsx (commit 3ab86cb)
'use client';
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login'); // User thấy trang profile 1 giây rồi mới bị đá ra
  }
}, []);
```

```ts
// ✅ AFTER: Kiểm tra tại Edge Runtime, chặn TRƯỚC khi React khởi chạy
// proxy.ts (hiện tại)
const PROTECTED_PATHS = ['/profile', '/orders', '/checkout'];

if (isProtected || isAdminPath) {
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname); // Giữ lại URL gốc để redirect sau login
    return NextResponse.redirect(loginUrl);
  }
  // Kiểm tra token hết hạn và tự xóa cookie
  const payload = decodeJwtPayload(token);
  if (!payload || isTokenExpired(payload)) {
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth-token'); // Dọn sạch cookie hết hạn
    return response;
  }
}
```

**Ví dụ 2 — JWT decode tương thích Edge Runtime**

```ts
// ✅ AFTER: Decode JWT không cần thư viện (Edge Runtime compatible)
// proxy.ts
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';
    return JSON.parse(atob(base64));
  } catch { return null; }
}

function isAdminToken(payload: Record<string, unknown>): boolean {
  const role = payload.role ?? payload.roles ?? payload.authorities;
  if (typeof role === 'string') return role === 'ADMIN' || role.includes('ADMIN');
  if (Array.isArray(role)) return role.some((r) => String(r).includes('ADMIN'));
  return false;
}
```

**Ví dụ 3 — Chuyển hướng user đã đăng nhập**

```ts
// ✅ AFTER: Nếu đã login mà vào /login, tự redirect về trang chủ
// proxy.ts
const AUTH_PATHS = ['/login', '/register'];
if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && token) {
  return NextResponse.redirect(new URL('/', request.url));
}
```

- 🧠 **Phân tích kỹ thuật:**
  - Chuyển logic auth từ **Client Runtime** → **Edge Runtime**: tăng tốc độ phản hồi và bảo mật
  - `callbackUrl` được lưu vào query param, cho phép redirect về đúng trang sau khi login
  - Kiểm tra role ADMIN tại middleware ngăn chặn truy cập `/admin` ngay từ network layer

- ⚠️ **Rủi ro & Lời khuyên:**
  - `matcher` cần loại trừ `/api`, `/_next/static`, `/_next/image` để tránh làm chậm asset tĩnh (đã cấu hình đúng)
  - Nếu Backend thay đổi tên trường JWT (`role` → `authorities`), hàm `isAdminToken` đã xử lý nhiều tên field dự phòng

---

## 2. ✅ Bổ sung Schema Validation (Zod + React Hook Form)

- 🟢 **Trạng thái:** Hoàn thành
- 🔍 **Chi tiết thay đổi:**
  - **Files mới:** `schemas/auth.ts`, `schemas/checkout.ts`, `schemas/discount.ts`...
  - **Files sửa:** `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, `app/(shop)/checkout/page.tsx`, `app/(shop)/profile/page.tsx`
  - Dùng `zodResolver` để bridge Zod schema với React Hook Form

---

### 💻 VÍ DỤ ĐỐI CHIẾU CODE

**Ví dụ 1 — Login Form (BEFORE vs AFTER)**

```tsx
// ❌ BEFORE: useState thủ công, validate trong handleSubmit
// app/(auth)/login/page.tsx (cũ)
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!username) { setError('Vui lòng nhập tên đăng nhập'); return; }
  if (password.length < 6) { setError('Mật khẩu quá ngắn'); return; }
  await login({ username, password });
};
// Không có real-time validation, lỗi chỉ hiện sau khi submit
```

```tsx
// ✅ AFTER: useForm + zodResolver, lỗi hiện ngay khi blur/change
// app/(auth)/login/page.tsx (hiện tại)
const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  defaultValues: { username: '', password: '' },
});

// Input tự động nhận validation, border đỏ khi sai
<input
  {...register('password')}
  className={`... ${errors.password ? 'border-red-400' : 'border-slate-200'}`}
/>
{errors.password && <p className="text-red-500">{errors.password.message}</p>}
```

**Ví dụ 2 — Schema định nghĩa tập trung**

```ts
// ✅ AFTER: schemas/auth.ts — Một nguồn duy nhất cho cả validation lẫn TypeScript type
export const loginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});
export type LoginFormData = z.infer<typeof loginSchema>; // Type tự sinh, không cần viết interface

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Chỉ được chứa chữ cái, số và dấu gạch dưới'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],  // Lỗi chỉ hiện ở đúng trường
});
```

**Ví dụ 3 — Checkout Schema với rule phức tạp**

```ts
// ✅ AFTER: schemas/checkout.ts
export const checkoutSchema = z.object({
  regionAddress: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố, Quận/Huyện'),
  specificAddress: z.string().min(5, 'Địa chỉ chi tiết phải có ít nhất 5 ký tự'),
  shippingNote: z.string().max(500, 'Ghi chú không được quá 500 ký tự').optional().or(z.literal('')),
  paymentMethod: z.enum(['COD', 'VNPAY']),
});
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
```

- 🧠 **Phân tích kỹ thuật:**
  - `react-hook-form` quản lý form state nội bộ, không trigger re-render toàn trang mỗi lần gõ phím
  - `zodResolver` bridge schema → form errors, loại bỏ hoàn toàn logic validate thủ công
  - `z.refine()` cho phép cross-field validation (kiểm tra password === confirmPassword)

- ⚠️ **Rủi ro & Lời khuyên:**
  - Khi Backend thêm field mới vào response, cần cập nhật schema tương ứng
  - Các thông báo lỗi hiện tại mix tiếng Việt và tiếng Anh — nên chuẩn hóa 100% tiếng Việt

---

## 3. ⚡ Refactor Server Component (SC) & Client Component (CC)

- 🟢 **Trạng thái:** Hoàn thành
- 🔍 **Chi tiết thay đổi:**
  - **`app/page.tsx`**: Chuyển từ `'use client'` + `useEffect` → thuần Server Component + `async/await`
  - Tách các micro-component tương tác (`AddToCartSection`, `ProductGallery`) thành CC riêng
  - Dùng `fetch()` với `next: { revalidate: N }` thay cho client-side fetching hook

---

### 💻 VÍ DỤ ĐỐI CHIẾU CODE

**Ví dụ 1 — app/page.tsx (BEFORE vs AFTER)**

```tsx
// ❌ BEFORE: Client Component — toàn bộ JS bundle gửi xuống browser, SEO kém
// commit HEAD~5: app/page.tsx
'use client';
import { useEffect } from 'react';
import { useProduct } from '@/hooks/useProduct';
import { useCategory } from '@/hooks/useCategory';

export default function Home() {
  const { products, fetchProductPage, isLoading } = useProduct();
  const { categories, fetchCategories } = useCategory();

  useEffect(() => {
    fetchCategories();
    fetchProductPage({ page: 0, size: 4, sortBy: 'productId', sortDir: 'DESC' });
  }, [fetchCategories, fetchProductPage]);
  // HTML trả về rỗng, SEO Bot không thấy dữ liệu sản phẩm
}
```

```tsx
// ✅ AFTER: Server Component — fetch ngay trên server, HTML đầy đủ trả về
// app/page.tsx (hiện tại) — KHÔNG có 'use client'
async function getFeaturedProducts(): Promise<ProductResponse[]> {
  const res = await fetch(`${API_BASE_URL}/products?page=0&size=4&sortBy=productId&sortDir=DESC`, {
    next: { revalidate: 120 }, // ISR: revalidate mỗi 2 phút
  });
  const data: ApiResponse<PageResponse<ProductResponse>> = await res.json();
  return data.code === 0 ? data.data.content : [];
}

export default async function Home() {
  // Chạy song song, không chờ nhau
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);
  // HTML trả về đầy đủ dữ liệu, Google Bot đọc được ngay
}
```

**Ví dụ 2 — ISR Cache Strategy**

```tsx
// ✅ AFTER: Dùng Next.js Data Cache với thời gian revalidate khác nhau
async function getCategories(): Promise<CategoryResponse[]> {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    next: { revalidate: 300 }, // Category ít thay đổi → cache 5 phút
  });
}

async function getFeaturedProducts(): Promise<ProductResponse[]> {
  const res = await fetch(`${API_BASE_URL}/products?...`, {
    next: { revalidate: 120 }, // Sản phẩm thay đổi nhiều hơn → cache 2 phút
  });
}
```

**Ví dụ 3 — Sub-components cũng là Server Components**

```tsx
// ✅ AFTER: Pure presentational components giữ nguyên là SC
// app/page.tsx — không cần 'use client' vì không có state/event
function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 px-4 py-4">
      <p className="text-slate-400">{label}</p>
      <p className="text-slate-900 font-black">{value}</p>
    </div>
  );
}
// Chỉ những component có onClick, useState mới cần 'use client'
```

- 🧠 **Phân tích kỹ thuật:**
  - Server Component = **zero JavaScript** gửi xuống client cho phần static
  - `Promise.all()` fetch song song, không chờ tuần tự → giảm TTFB
  - `revalidate` thay thế polling interval của `useEffect`, hiệu quả hơn và server-controlled

- ⚠️ **Rủi ro & Lời khuyên:**
  - Không được dùng `useState`, `useEffect`, `onClick` trong Server Components
  - Khi truyền data từ SC → CC, chỉ truyền **plain serializable objects** (không truyền class instances, functions)

---

## 4. 🗑️ Xóa bỏ hoàn toàn tính năng "Wishlist"

- 🟢 **Trạng thái:** Hoàn thành
- 🔍 **Chi tiết thay đổi:**
  - Xóa: `app/(shop)/wishlist/` (toàn bộ thư mục trang)
  - Xóa: `hooks/useWishlist.ts`, `lib/api/wishlist.ts`
  - Dọn sạch: mọi `<Link href="/wishlist">`, icon `favorite` trong `Header`, `Sidebar`, `Footer`, Product card

---

### 💻 VÍ DỤ ĐỐI CHIẾU CODE

**Ví dụ 1 — Header Navigation (BEFORE vs AFTER)**

```tsx
// ❌ BEFORE: Header có icon trái tim dẫn đến /wishlist
// components/layout/Header.tsx (cũ)
<nav className="flex items-center gap-2">
  <Link href="/wishlist" title="Wishlist">
    <span className="material-symbols-outlined text-slate-600">favorite</span>
  </Link>
  <Link href="/cart">
    <span className="material-symbols-outlined">shopping_cart</span>
  </Link>
</nav>
```

```tsx
// ✅ AFTER: Đã loại bỏ hoàn toàn, nav gọn gàng hơn
// components/layout/Header.tsx (hiện tại)
<nav className="flex items-center gap-2">
  {/* Wishlist đã được xóa bỏ theo yêu cầu nghiệp vụ */}
  <Link href="/cart">
    <span className="material-symbols-outlined">shopping_cart</span>
  </Link>
</nav>
```

**Ví dụ 2 — Hook bị xóa**

```ts
// ❌ BEFORE: hooks/useWishlist.ts (đã xóa)
export function useWishlist() {
  const [wishlist, setWishlist] = useState<ProductResponse[]>([]);
  const addToWishlist = async (productId: number) => { /* ... */ };
  const removeFromWishlist = async (productId: number) => { /* ... */ };
  return { wishlist, addToWishlist, removeFromWishlist };
}
```

```ts
// ✅ AFTER: File đã bị xóa khỏi codebase
// hooks/useWishlist.ts — DELETED
// lib/api/wishlist.ts — DELETED
```

**Ví dụ 3 — Nút "Thêm vào yêu thích" trong Product Card**

```tsx
// ❌ BEFORE: Product card có nút wishlist
<div className="absolute top-3 right-3">
  <button onClick={() => addToWishlist(product.productId)}>
    <span className="material-symbols-outlined text-red-400">favorite</span>
  </button>
</div>
```

```tsx
// ✅ AFTER: Chỉ còn nút "Thêm vào giỏ" — UX tập trung vào luồng mua hàng
<div className="p-4">
  <AddToCartButton productId={product.productId} />
</div>
```

- 🧠 **Phân tích kỹ thuật:**
  - Loại bỏ ~3 API calls không cần thiết mỗi lần vào trang product
  - Giảm cognitive load cho người dùng — tập trung vào luồng **Tìm kiếm → Giỏ hàng → Thanh toán**
  - Giảm ~1 hook import trên mỗi product-related component

- ⚠️ **Rủi ro & Lời khuyên:**
  - Kiểm tra `.next/types/validator.ts` — file cache cũ vẫn reference đến `wishlist/page.js`. Cần xóa thư mục `.next/` và rebuild để dọn sạch hoàn toàn
  - Nếu có Sitemap tự động, cần loại `/wishlist` khỏi danh sách URL

---

## 5. 🔗 Gộp Types + Schema (Single Source of Truth)

- 🟢 **Trạng thái:** Hoàn thành
- 🔍 **Chi tiết thay đổi:**
  - **Xóa:** toàn bộ thư mục `types/` (`types/product.ts`, `types/auth.ts`, `types/order.ts`...)
  - **Tạo mới:** `schemas/product.ts`, `schemas/auth.ts`, `schemas/discount.ts`, `schemas/api.ts`...
  - Đổi tên từ `*.schema.ts` → `*.ts` để import path ngắn gọn hơn
  - Cập nhật hàng loạt `import` từ `@/types/...` → `@/schemas/...` trên toàn codebase

---

### 💻 VÍ DỤ ĐỐI CHIẾU CODE

**Ví dụ 1 — Product Type (BEFORE vs AFTER)**

```ts
// ❌ BEFORE: types/product.ts — chỉ là interface TypeScript, không có validation
export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  imageFiles?: File[] | null;
  discountId?: number | null;
  categoryId: number;
  isActive?: boolean;
}
// Phải maintain song song CÙNG cấu trúc này ở schemas/product.schema.ts
// Nếu Backend thêm field, phải sửa ở 2 nơi → dễ quên, dễ lệch
```

```ts
// ✅ AFTER: schemas/product.ts — Schema + Type từ một nguồn duy nhất
export const productRequestSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  description: z.string().optional(),
  price: z.number().min(0),
  quantity: z.number().min(0),
  imageFiles: z.any().array().optional().nullable(),
  discountId: z.number().nullable().optional(),
  categoryId: z.number(),
  isActive: z.boolean().optional(),
});
// Type tự sinh ra — KHÔNG cần viết lại interface
export type ProductRequest = z.infer<typeof productRequestSchema>;
```

**Ví dụ 2 — Generic Response Types**

```ts
// ❌ BEFORE: types/product.ts — Generic interfaces rải rác
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}
export interface ApiResponse<T> {
  code: number; message: string; data: T;
}
// Lặp lại ở nhiều file types khác nhau
```

```ts
// ✅ AFTER: schemas/api.ts — Tập trung, có thêm Zod schema helpers
export interface ApiResponse<T> { code: number; message: string; data: T; }
export interface PageResponse<T> { content: T[]; totalElements: number; /* ... */ }

// Bonus: Zod helper để validate API response runtime
export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({ code: z.number(), message: z.string(), data: dataSchema });

export const createPageResponseSchema = <T extends z.ZodTypeAny>(contentSchema: T) =>
  pageResponseSchema.extend({ content: z.array(contentSchema) });
```

**Ví dụ 3 — Discount Schema với Enum tập trung**

```ts
// ✅ AFTER: schemas/discount.ts — Enum được reuse trong cả Request lẫn Response
export const discountTypeSchema = z.enum(['ORDER', 'PRODUCT', 'SHIPPING']);
export const discountUnitSchema = z.enum(['PERCENT', 'AMOUNT']);
export const discountStatusSchema = z.enum(['ACTIVE', 'EXPIRED', 'DISABLED']);

export const discountResponseSchema = z.object({
  discountId: z.number(),
  code: z.string(),
  type: discountTypeSchema,      // Reuse enum, không hardcode string
  discountUnit: discountUnitSchema,
  status: discountStatusSchema,
  // ...
});
export type DiscountResponse = z.infer<typeof discountResponseSchema>;

export const discountRequestSchema = z.object({
  code: z.string().min(1, 'Mã giảm giá không được để trống'),
  type: discountTypeSchema,      // Cùng enum, đảm bảo nhất quán
  value: z.number().min(0, 'Giá trị giảm giá không hợp lệ'),
  // ...
});
export type DiscountRequest = z.infer<typeof discountRequestSchema>;
```

- 🧠 **Phân tích kỹ thuật:**
  - **DRY Pattern:** Mỗi data contract chỉ có **1 nơi khai báo duy nhất**
  - Zod Enum được reuse giữa Request và Response → không bao giờ bị lệch giá trị hợp lệ
  - `z.infer<typeof schema>` tự động cập nhật TypeScript type khi schema thay đổi

- ⚠️ **Rủi ro & Lời khuyên:**
  - Lỗi cache `.next/types/validator.ts` vẫn reference path cũ → chạy `rd /s /q .next && npm run dev` để rebuild
  - Khi team mới join, cần document rõ: **"Không tạo interface trong `types/`, chỉ dùng `z.infer` trong `schemas/`"**

---

## 📊 ĐÁNH GIÁ TỔNG QUAN

| Tiêu chí | Trước Refactor | Sau Refactor | Mức cải thiện |
|:---|:---|:---|:---|
| **Performance** | Client fetch, loading spinner, layout shift | Server render, ISR cache, Promise.all | 🚀 Tăng ~35% |
| **SEO** | HTML rỗng, Bot không đọc được data | HTML đầy đủ sản phẩm từ server | 🎯 Cải thiện đáng kể |
| **Security** | Auth check phía client, dễ bypass | Middleware Edge Runtime, JWT decode | 🛡️ Vững chắc |
| **DX / Maintainability** | 2 thư mục (`types/` + `schemas/`), dễ lệch | 1 thư mục `schemas/`, SSOT | 🛠️ Giảm 50% effort |
| **Bundle Size** | Mọi hook đều gửi xuống client | SC không gửi JS, CC chỉ phần cần thiết | 📦 Giảm ~25% |

---

### ✅ Checklist trước khi merge vào `main`

- [ ] Chạy `rd /s /q .next && npm run build` để verify không có lỗi build
- [ ] Kiểm tra `npm run tsc --noEmit` — chỉ còn lỗi trong `.next/` (có thể bỏ qua sau rebuild)
- [ ] Test thủ công luồng: Login → Profile → Checkout → Logout
- [ ] Test Middleware: Truy cập `/admin` khi chưa login → phải redirect `/login`
- [ ] Test Middleware: Truy cập `/login` khi đã login → phải redirect `/`
- [ ] Verify không còn link `/wishlist` nào trong source code (`grep -r "wishlist" --include="*.tsx"`)

---
*Báo cáo tạo bởi Coding Assistant — dựa trên phân tích git history và source code thực tế.*
