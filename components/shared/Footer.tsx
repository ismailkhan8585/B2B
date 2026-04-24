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
    <footer className="border-t border-border bg-primary">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 md:grid-cols-4">
        {/* Column 1 - Brand */}
        <div className="text-white">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-white/20 text-white font-bold">
              B2
            </span>
            <span className="text-xl font-semibold tracking-tight">
              TradeHub
            </span>
          </div>
          <p className="mb-4 text-white/80">
            Global B2B Marketplace
          </p>
          <p className="mb-6 text-sm text-white/60">
            Connecting verified manufacturers, exporters and suppliers worldwide<br/>
            Secure trade workflows and bulk sourcing made simple
          </p>
          <div className="flex items-center gap-4">
            <Link aria-label="Twitter" href="#" className="text-white/60 hover:text-white">
              <IconTwitter />
            </Link>
            <Link aria-label="LinkedIn" href="#" className="text-white/60 hover:text-white">
              <IconLinkedIn />
            </Link>
            <Link aria-label="YouTube" href="#" className="text-white/60 hover:text-white">
              <IconYouTube />
            </Link>
          </div>
        </div>

        {/* Column 2 - Platform */}
        <div className="text-white">
          <div className="mb-4 text-sm font-semibold">
            Platform
          </div>
          <ul className="space-y-2 text-sm text-white/60">
            <li>
              <Link href="/about" className="hover:text-white">
                How it Works
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-white">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/features" className="hover:text-white">
                Features
              </Link>
            </li>
            <li>
              <Link href="/security" className="hover:text-white">
                Security
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3 - For Buyers / Sellers */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="mb-4 text-sm font-semibold text-white">
              For Buyers
            </div>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <Link href="/products" className="hover:text-white">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href="/suppliers" className="hover:text-white">
                  Find Suppliers
                </Link>
              </li>
              <li>
                <Link href="/rfq" className="hover:text-white">
                  Post RFQ
                </Link>
              </li>
              <li>
                <Link href="/buyer-protection" className="hover:text-white">
                  Buyer Protection
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-4 text-sm font-semibold text-white">
              For Sellers
            </div>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <Link href="/seller/dashboard/products" className="hover:text-white">
                  List Products
                </Link>
              </li>
              <li>
                <Link href="/seller/dashboard" className="hover:text-white">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link href="/seller/verification" className="hover:text-white">
                  Verification
                </Link>
              </li>
              <li>
                <Link href="/seller/plans" className="hover:text-white">
                  Plans
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Column 4 - Support */}
        <div className="text-white">
          <div className="mb-4 text-sm font-semibold">
            Support
          </div>
          <ul className="space-y-2 text-sm text-white/60">
            <li>
              <Link href="/help" className="hover:text-white">
                Help Center
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/20">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between text-sm">
          <div className="text-white/60">
            © 2026 TradeHub · All rights reserved
          </div>
          <div className="flex items-center gap-4 text-white/60 hover:text-white">
            <a href="mailto:support@tradehub.com" className="hover:text-white">
              support@tradehub.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}