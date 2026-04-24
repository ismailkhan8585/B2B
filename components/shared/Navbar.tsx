"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu, User, LogOut, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if user is logged in (simplified - in real app this would come from auth context)
  const isLoggedIn = false; // This should be replaced with actual auth check
  const userName = "John Doe"; // This should come from user data
  const userAvatar = "/placeholder-avtar.jpg"; // This should come from user data

  const handleSortChange = (sort: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("sort", sort);
    sp.delete("page"); // Reset page when sort changes
    router.push(`/products?${sp.toString()}`);
  };

  const handleCityChange = (city: string | null) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (city) {
      sp.set("city", city);
    } else {
      sp.delete("city");
    }
    sp.delete("page"); // Reset page when city changes
    router.push(`/products?${sp.toString()}`);
  };

  const handleCategoryChange = (category: string | null) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (category) {
      sp.set("category", category);
    } else {
      sp.delete("category");
    }
    sp.delete("page"); // Reset page when category changes
    router.push(`/products?${sp.toString()}`);
  };

  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-[1280px] px-4 py-3">
        {/* Left - Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="grid h-8 w-8 place-items-center rounded-md bg-primary text-white font-bold"
              aria-hidden
            >
              B2
            </span>
            <span className="text-xl font-semibold tracking-tight" style={{ color: "var(--primary)" }}>
              TradeHub
            </span>
          </Link>
        </div>

        {/* Center - Search bar */}
        <div className="flex-1 mx-4">
          <div className="relative">
            <Input
              placeholder="Search products, suppliers..."
              className="w-full h-10 pl-10 pr-3 rounded-full border-input focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right - Navigation links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          {/* Products link */}
          <Link
            href="/products"
            className={cn(
              "hover:text-primary transition-colors",
              pathname === "/products" && "text-primary font-semibold"
            )}
          >
            Products
          </Link>

          {/* Sellers link */}
          <Link
            href="/suppliers"
            className={cn(
              "hover:text-primary transition-colors",
              pathname === "/suppliers" && "text-primary font-semibold"
            )}
          >
            Sellers
          </Link>

          {/* Buyer Requests link */}
          <Link
            href="/rfq"
            className={cn(
              "hover:text-primary transition-colors",
              pathname === "/rfq" && "text-primary font-semibold"
            )}
          >
            Buyer Requests
          </Link>

          {/* Machines & Tools link */}
          <Link
            href="/categories/machines-tools"
            className={cn(
              "hover:text-primary transition-colors",
              pathname?.startsWith("/categories/machines-tools") && "text-primary font-semibold"
            )}
          >
            Machines & Tools
          </Link>

          {/* Seller Signup button */}
          <Button
            asChild
            variant="outline"
            className="h-9 px-4"
          >
            <Link href="/register?role=seller">Seller Signup</Link>
          </Button>

          {/* Account dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-9">
              {isLoggedIn ? (
                <>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </>
              ) : (
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {isLoggedIn ? (
                <>
                  <DropdownMenuItem>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { /* handle logout */ }}>
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem>
                    <Link href="/login">Sign In</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/register">Join Free</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}