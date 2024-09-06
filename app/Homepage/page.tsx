"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Company from "./companies";

function parseJwt(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

const Homepage = () => {
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseJwt(token);
      setUser({ username: decoded.username, email: decoded.email });
    } else {
      router.push("/login");
    }
  }, [router]);



  if (!user) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.username}</h1>
      <p className="text-xl mb-6">Email: {user.email}</p>
      <Company user={user.username}/>

    </div>
  );
};

export default Homepage;
