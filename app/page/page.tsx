"use client"
import Verify from "@/components/verify";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
interface User {
    username: string;
    email: string;
    id: string;
  }
  
const Page = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter()
    function parseJwt(token: string) {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        return JSON.parse(jsonPayload);
      }
    
      useEffect(() => {
        const token = req.headers.get("token")?.split(" ")[1];
        if (token) {
          const decoded = parseJwt(token);
          setUser({ id: decoded.userId, username: decoded.username, email: decoded.email });
        } else {
          window.location.reload();
          redirect("/login");
        }
        setLoading(false);
      }, [router]);
    return (     <>
    {user && (<Verify id={user.id}/>)}</>
    );
}
 
export default Page;