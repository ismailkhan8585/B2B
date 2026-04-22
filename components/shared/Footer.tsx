import Link from "next/link";

function IconTwitter(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.5 2.5h2.6l-5.7 6.6 6.7 8.9h-5.2l-4.1-5.3-4.6 5.3H5.6l6.1-7.0-6.4-8.5h5.3l3.7 4.9 4.2-4.9Zm-.9 14h1.4L9.7 4.4H8.2l9.4 12.1Z" />
    </svg>
  );
}

function IconLinkedIn(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.4 20.4h-3.6v-5.6c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8v5.7H9.4V9h3.5v1.6h.1c.5-.9 1.7-1.8 3.4-1.8 3.7 0 4.4 2.4 4.4 5.6v6Z" />
      <path d="M5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2ZM3.5 20.4h3.6V9H3.5v11.4Z" />
    </svg>
  );
}

function IconYouTube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.6 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.4-1C14.9 3.6 12 3.6 12 3.6h0s-2.9 0-6.3.3c-.5.1-1.5.1-2.4 1-.7.7-.9 2.3-.9 2.3S2 9.1 2 11v2c0 1.9.4 3.8.4 3.8s.2 1.6.9 2.3c.9.9 2.1.9 2.6 1 1.9.2 6.1.3 6.1.3s2.9 0 6.3-.3c.5-.1 1.5-.1 2.4-1 .7-.7.9-2.3.9-2.3s.4-1.9.4-3.8v-2c0-1.9-.4-3.8-.4-3.8ZM10 14.6V9.4L15.5 12 10 14.6Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
            TradeHub
          </div>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Bulk sourcing marketplace for verified suppliers, RFQs, and secure trade workflows.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <Link aria-label="Twitter" href="#" className="text-muted-foreground hover:text-foreground">
              <IconTwitter />
            </Link>
            <Link aria-label="LinkedIn" href="#" className="text-muted-foreground hover:text-foreground">
              <IconLinkedIn />
            </Link>
            <Link aria-label="YouTube" href="#" className="text-muted-foreground hover:text-foreground">
              <IconYouTube />
            </Link>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold">Platform</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-foreground">
                Products
              </Link>
            </li>
            <li>
              <Link href="/suppliers" className="hover:text-foreground">
                Suppliers
              </Link>
            </li>
            <li>
              <Link href="/rfq" className="hover:text-foreground">
                RFQ Board
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold">For Buyers</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/buyer/dashboard" className="hover:text-foreground">
                Buyer Portal
              </Link>
            </li>
            <li>
              <Link href="/buyer/dashboard/rfqs/new" className="hover:text-foreground">
                Post RFQ
              </Link>
            </li>
            <li>
              <Link href="/buyer/dashboard/saved" className="hover:text-foreground">
                Saved Suppliers
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold">For Sellers</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/seller/dashboard" className="hover:text-foreground">
                Seller Portal
              </Link>
            </li>
            <li>
              <Link href="/seller/dashboard/products" className="hover:text-foreground">
                Products
              </Link>
            </li>
            <li>
              <Link href="/seller/dashboard/company" className="hover:text-foreground">
                Company Profile
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>© 2026 TradeHub · Privacy · Terms · support@tradehub.com</div>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground">
              Terms
            </Link>
            <a className="hover:text-foreground" href="mailto:support@tradehub.com">
              support@tradehub.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

