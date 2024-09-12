"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent } from "@/components/ui/navigation-menu"
import { ModeToggle } from "../switch"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const Navbar = () => {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const checkLoginStatus = () => {
    const storedToken = localStorage.getItem("token")
    if (storedToken && storedToken !== "null") {
      setIsLoggedIn(true)
    } else {
      setIsLoggedIn(false)
    }
  }

  useEffect(() => {
    checkLoginStatus()
    window.addEventListener("storage", checkLoginStatus)

    return () => {
      window.removeEventListener("storage", checkLoginStatus)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.setItem("isLoggedIn", "false")
    setIsLoggedIn(false)
    router.push("/")
    setIsMobileMenuOpen(false)
  }

  const NavItems = () => (
    <>
      <NavigationMenuItem>
        <Link href="/about" className="text-foreground hover:text-primary transition-colors duration-300">
          About Us
        </Link>
      </NavigationMenuItem>

      {isLoggedIn ? (
        <NavigationMenuItem>
          <button
            onClick={handleLogout}
            className="text-foreground hover:text-primary transition-colors duration-300"
          >
            Logout
          </button>
        </NavigationMenuItem>
      ) : (
        <>
          <NavigationMenuItem>
            <Link href="/login" className="text-foreground hover:text-primary transition-colors duration-300">
              Login
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/register" className="text-foreground hover:text-primary transition-colors duration-300">
              Register
            </Link>
          </NavigationMenuItem>
        </>
      )}
    </>
  )

  return (
    <header className="bg-background shadow">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" passHref>
          <img src="/NTUC-Fairprice-Logo.png" alt="NTUC Logo" width={50} height={50} className="cursor-pointer" />
        </Link>

        <div className="hidden md:flex items-center space-x-4">
          <NavigationMenu>
            <NavigationMenuList className="flex items-center space-x-4">
              <NavItems />
            </NavigationMenuList>
          </NavigationMenu>
          <ModeToggle />
        </div>

        <div className="md:hidden flex items-center">
          <ModeToggle />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col space-y-4 mt-4">
                <NavItems />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}

export default Navbar