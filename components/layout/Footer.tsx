import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white w-full font-['Inter']">
      <div className="max-w-[1600px] mx-auto px-10 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          <div className="space-y-8 lg:col-span-1">
            <Link href="/" className="text-2xl font-black tracking-tighter italic">
              <span className="text-sky-500">Dry</span>Sea
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Artisanal seafood preservation, rooted in coastal heritage and sustainable practices. Delivering the ocean&apos;s finest to your table.
            </p>
            <div className="flex space-x-4">
               {/* Social placeholders could go here */}
            </div>
          </div>

          <FooterColumn title="Shop" links={[
            { label: 'All Products', href: '/products' },
            { label: 'New Arrivals', href: '/' },
            { label: 'Bulk Orders', href: '/' },
            { label: 'Gift Cards', href: '/' },
          ]} />

          <FooterColumn title="Information" links={[
            { label: 'Our Story', href: '/' },
            { label: 'The Process', href: '/' },
            { label: 'Sustainability', href: '/' },
            { label: 'Journal', href: '/' },
          ]} />

          <FooterColumn title="Support" links={[
            { label: 'Contact Us', href: '/' },
            { label: 'Shipping Policy', href: '/' },
            { label: 'Returns & FAQ', href: '/' },
            { label: 'Privacy Policy', href: '/' },
          ]} />
        </div>

        <div className="mt-24 pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">
            © 2024 DrySea. All rights reserved.
          </p>
          <div className="flex space-x-8 text-[10px] uppercase font-bold tracking-[0.2em] text-slate-600">
            <Link href="/" className="hover:text-sky-500">Terms</Link>
            <Link href="/" className="hover:text-sky-500">Privacy</Link>
            <Link href="/" className="hover:text-sky-500">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="space-y-6">
      <h4 className="text-[11px] uppercase font-black tracking-[0.25em] text-sky-500">{title}</h4>
      <ul className="space-y-4">
        {links.map((link, i) => (
          <li key={i}>
            <Link href={link.href} className="text-[13px] text-slate-400 hover:text-white transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
