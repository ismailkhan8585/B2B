import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X, Menu, User, FileText, Tool, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { 
  Drawer, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle 
} from "@/components/ui/drawer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function MobileNavDrawer() {
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
    <Drawer>
      <DrawerContent side="left" className="w-[256px] sm:w-[280px]">
        <DrawerHeader className="pb-4">
          <DrawerTitle className="text-lg font-semibold">Menu</DrawerTitle>
          <DrawerDescription>
            Navigate through TradeHub
          </DrawerDescription>
        </DrawerContent>
        
        <div className="space-y-4 p-4">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products, suppliers..."
              className="w-full h-10 pl-10 pr-3 rounded-full border-input focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
          
          {/* Navigation links */}
          <nav className="space-y-2">
            <Link
              href="/products"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/5 hover:text-primary",
                pathname === "/products" && "bg-primary/10 text-primary"
              )}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Products</span>
            </Link>
            
            <Link
              href="/suppliers"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/5 hover:text-primary",
                pathname === "/suppliers" && "bg-primary/10 text-primary"
              )}
            >
              <User className="h-4 w-4" />
              <span>Sellers</span>
            </Link>
            
            <Link
              href="/rfq"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/5 hover:text-primary",
                pathname === "/rfq" && "bg-primary/10 text-primary"
              )}
            >
              <FileText className="h-4 w-4" />
              <span>Buyer Requests</span>
            </Link>
            
            <Link
              href="/categories/machines-tools"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/5 hover:text-primary",
                pathname?.startsWith("/categories/machines-tools") && "bg-primary/10 text-primary"
              )}
            >
              <Tool className="h-4 w-4" />
              <span>Machines & Tools</span>
            </Link>
          </nav>
          
          {/* Seller Signup button */}
          <Button
            className="w-full"
          >
            <Link href="/register?role=seller" className="w-full flex items-center justify-center">
              Seller Signup
            </Link>
          </Button>
          
          {/* Account section */}
          <div className="space-y-2">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/5 hover:text-primary">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium">{userName}</span>
                    <span className="text-xs text-muted-foreground">Account</span>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm">
                  <Link href="/dashboard" className="block px-3 py-2 rounded-md hover:bg-primary/5 hover:text-primary">
                    Dashboard
                  </Link>
                  <Link href="/profile" className="block px-3 py-2 rounded-md hover:bg-primary/5 hover:text-primary">
                    Profile
                  </Link>
                  <button onClick={() => { /* handle logout */ }} className="block w-full text-left px-3 py-2 rounded-md hover:bg-primary/5 hover:text-primary">
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/5 hover:text-primary"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
                
                <Link
                  href="/register"
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/5 hover:text-primary"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Join Free</span>
                </Link>
              </>
            )}
          </div>
        </div>
        
        <DrawerFooter className="pt-4">
          <button onClick={() => {/* close drawer */ }} className="w-full text-sm text-muted-foreground">
            Close Menu
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}