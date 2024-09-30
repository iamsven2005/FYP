"use client"

import * as React from "react"
import { redirect, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu"
import { ModeToggle } from "../switch"
import { Button } from "@/components/ui/button"
import { Menu, Send, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Navbar() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isChatOpen, setIsChatOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.setItem("isLoggedIn", "false")
    setIsLoggedIn(false)
    setIsMobileMenuOpen(false)
    window.location.reload()
    redirect("/")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputText.trim()) return

    const userMessage: Message = { role: 'user', content: inputText }
    setMessages(prevMessages => [...prevMessages, userMessage])
    setInputText('')

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: inputText }),
      });

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.message.content }
      setMessages(prevMessages => [...prevMessages, assistantMessage])
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage: Message = { role: 'assistant', content: 'Sorry, an error occurred. Please try again.' }
      setMessages(prevMessages => [...prevMessages, errorMessage])
    }
  }

  const NavItems = () => (
    <>
      <NavigationMenuItem>
        <Link href="/about" className="text-foreground hover:text-primary transition-colors duration-300">
          About Us
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <Link href="/messages" className="text-foreground hover:text-primary transition-colors duration-300">
          Messages
        </Link>
      </NavigationMenuItem>
      {isLoggedIn ? (
        <>
          <NavigationMenuItem>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="text-foreground hover:text-primary transition-colors duration-300"
            >
              {isChatOpen ? 'Close Chat' : 'Open Chat'}
            </button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <button
              onClick={handleLogout}
              className="text-foreground hover:text-primary transition-colors duration-300"
            >
              Logout
            </button>
          </NavigationMenuItem>
        </>
      ) : (
        <>
          <NavigationMenuItem>
            <Link href="/Login" className="text-foreground hover:text-primary transition-colors duration-300">
              Login
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/Register" className="text-foreground hover:text-primary transition-colors duration-300">
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
        <Link href="/page" passHref>
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

      {isLoggedIn && isChatOpen && (
        <div className="fixed bottom-0 right-0 w-full md:w-96 bg-background p-4 shadow-lg rounded-t-lg border border-border">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Chat with AI</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-64 mb-4" ref={scrollAreaRef}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded ${
                  message.role === 'user' ? 'bg-primary text-primary-foreground ml-4' : 'bg-muted text-foreground mr-4'
                }`}
              >
                <p>{message.content}</p>
              </div>
            ))}
          </ScrollArea>
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask ChatGPT..."
              className="flex-grow"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </header>
  )
}