"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Email:', email);
    console.log('Password:', password);

    if (!email || !password) {
      setError('Email and Password are required');
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Login successful, token:', data.token);
        router.push('/'); // Redirect to home page or dashboard
      } else {
        const data = await res.json();
        console.log('Login error:', data.message);
        setError(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Failed to login:', error);
      setError('Something went wrong');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
