"use client"; // Ensures this component is treated as a client component

import * as React from "react";
import { useRouter } from "next/navigation"; // Updated import
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";

const Navbar = () => {
  const router = useRouter(); // useRouter from next/navigation
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true); // User is logged in
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token from localStorage
    setIsLoggedIn(false);
    router.push("/"); // Redirect to main page
  };

  return (
    <header className="bg-secondary shadow">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" passHref>
          <img src="/NTUC-Fairprice-Logo.png" alt="NTUC Logo" width={50} height={50} className="cursor-pointer" />
        </Link>

        <NavigationMenu className="flex items-center space-x-4">
          <NavigationMenuList className="flex items-center space-x-4">
            <NavigationMenuItem>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors duration-300">
                About Us
              </Link>
            </NavigationMenuItem>
            {isLoggedIn ? (
              <NavigationMenuItem>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
                >
                  Logout
                </button>
              </NavigationMenuItem>
            ) : (
              <>
                <NavigationMenuItem>
                  <Link href="/Login" className="text-gray-700 hover:text-blue-600 transition-colors duration-300">
                    Login
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/Register" className="text-gray-700 hover:text-blue-600 transition-colors duration-300">
                    Register
                  </Link>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
    </header>
  );
};

export default Navbar;
