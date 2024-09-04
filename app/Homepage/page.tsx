"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Function to manually decode the JWT token
function parseJwt(token: string) {
  const base64Url = token.split('.')[1]; // Get the payload part of the token
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Replace URL-safe characters
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('') // Convert the payload to a JSON string
  );

  return JSON.parse(jsonPayload); // Parse the JSON string to an object
}

const Homepage = () => {
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode the token to extract username and email
      const decoded = parseJwt(token);
      setUser({ username: decoded.username, email: decoded.email });
    } else {
      router.push('/Login'); // Redirect to login if no token is found
    }
  }, [router]);

  if (!user) {
    return <p>Loading...</p>; // Display a loading message while user data is being fetched
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.username}</h1>
      <p className="text-xl">Email: {user.email}</p>
    </div>
  );
};

export default Homepage;
