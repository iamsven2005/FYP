"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";

const Navbar = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkLoginStatus(); // Call initially to set login status

    // Listen for custom "storage" event to check token updates
    window.addEventListener('storage', checkLoginStatus);

    // Handle theme from localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkTheme(savedTheme === "dark");
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      setIsDarkTheme(false);
      document.documentElement.setAttribute("data-theme", "light");
    }

    // Cleanup event listener when the component unmounts
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/");
  };

  const handleThemeSwitch = () => {
    const newTheme = isDarkTheme ? "light" : "dark";
    setIsDarkTheme(!isDarkTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <header className="bg-secondary shadow">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
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

            <div className="ml-auto">
              <label className="swap swap-rotate">
                <input
                  type="checkbox"
                  className="theme-controller"
                  checked={isDarkTheme}
                  onChange={handleThemeSwitch}
                />
                <svg
                  className="swap-off h-6 w-6 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 3a1 1 0 011-1h0a1 1 0 011 1v2a1 1 0 01-2 0V3zM4.22 5.64a1 1 0 
                  010-1.41l0-.01a1 1 0 011.42 0l1.42 1.42a1 1 0 01-1.41 1.42L4.22 5.64zM12 17a5 
                  5 0 100-10 5 5 0 000 10zm0-8a3 3 0 110 6 3 3 0 010-6zm9-1h-2a1 1 0 010-2h2a1 1 
                  0 010 2zM4.22 18.36a1 1 0 01-1.42-1.42l1.42-1.42a1 1 0 111.41 1.42L4.22 
                  18.36zM19.78 5.64a1 1 0 011.42 0l.01.01a1 1 0 01-.01 1.41l-1.42 1.42a1 1 
                  11-1.42-1.41L19.78 5.64zM12 21a1 1 0 011 1v2a1 1 0 01-2 0v-2a1 1 0 
                  011-1zm6.36-5.64l-1.42-1.42a1 1 0 011.42-1.41l1.42 1.42a1 1 0 01-1.42 1.41z" />
                </svg>

                <svg
                  className="swap-on h-6 w-6 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,
                    5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,
                    21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,
                    15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"
                  />
                </svg>
              </label>
            </div>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
    </header>
  );
};

export default Navbar;
