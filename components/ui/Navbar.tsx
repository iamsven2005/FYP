import * as React from "react";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo on the left */}
        <Link href="/" passHref>
          <Image
            src="/NTUC-Fairprice-Logo.png"
            alt="NTUC Logo"
            width={50}  // Adjust the size here
            height={50}  // Adjust the size here
            className="cursor-pointer"
          />
        </Link>

        {/* Navigation Menu */}
        <NavigationMenu className="flex space-x-4">
          <NavigationMenuList className="flex items-center space-x-4">
            <NavigationMenuItem>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors duration-300">
                About Us
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/api/auth/signin" className="text-gray-700 hover:text-blue-600 transition-colors duration-300">
                Login
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/Register" className="text-gray-700 hover:text-blue-600 transition-colors duration-300">
                Register
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
    </header>
  );
};

export default Navbar;
