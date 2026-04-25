# DrySea Food Frontend

Frontend cho he thong ban hai san kho `DrySea`, duoc xay dung bang `Next.js` voi App Router. Du an gom hai nhom giao dien chinh:

- `shop`: giao dien mua hang cho khach
- `admin`: giao dien quan tri san pham, don hang va ma giam gia

## Tinh nang chinh

- Trang chu gioi thieu thuong hieu va bo suu tap san pham noi bat
- Danh sach san pham voi tim kiem, loc danh muc, loc gia, sap xep va chuyen doi grid/list
- Trang chi tiet san pham
- Gio hang cho khach va nguoi dung da dang nhap
- Quy trinh checkout, payment, theo doi don hang
- Dang nhap, dang ky, luu trang thai xac thuc phia client
- Trang tai khoan, wishlist, thong tin don hang
- Khu vuc admin gom dashboard, quan ly san pham, don hang, discount va khach hang

## Cong nghe su dung

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint
- Zustand cho client state

## Cau truc thu muc

```text
app/
  (auth)/       Login, register
  (shop)/       Giao dien nguoi dung
  admin/        Giao dien quan tri

components/
  admin/
  auth/
  layout/
  shop/
  ui/

hooks/          Hooks cho auth, cart, product, order, discount...
lib/
  api/          Lop goi API
  constants.ts
  fetcher.ts
  utils.ts

store/          Zustand stores
types/          TypeScript models va response types
public/         Static assets
```

## Yeu cau moi truong

- Node.js 20+
- npm 10+
- Backend API san sang de frontend ket noi

## Bien moi truong

Tao file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

Neu khong khai bao, du an hien dang mac dinh dung:

```text
http://localhost:8080/api/v1
```

## Cach chay du an

1. Cai dependency:

```bash
npm install
```

2. Chay development server:

```bash
npm run dev
```

3. Mo trinh duyet tai:

```text
http://localhost:3000
```

## Build production

```bash
npm run build
npm run start
```

## Luu y

- Mot so tinh nang phu thuoc vao backend API, dac biet la auth, cart, checkout, order va admin pages.
- Token hien dang duoc luu phia client thong qua cookie.
- Trong repo khong nen dua len `node_modules`, `.next`, `.npm-cache`, file log va `*.tsbuildinfo`.
- Truoc khi push len GitHub, nen kiem tra lai `package.json` de bao dam cac dependency runtime dang duoc khai bao day du.
