"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
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
  
      const data = await res.json();
  
      if (res.ok && data.token) {
        // If user is Admin or assigned a role that bypasses OTP, redirect to /admin
        localStorage.setItem('token', data.token);
        if (data.role === 'Admin') {
          router.push('/admin');  // Redirect admins to the admin page
        } else {
          router.push(data.redirectTo || '/Homepage');  // Redirect non-admin users to the homepage
        }
      } else if (data.userId) {
        // Non-admin users, proceed with OTP flow
        setUserId(data.userId);
        setIsOtpSent(true);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch {
      setError('Something went wrong');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      setError('OTP is required');
      return;
    }

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await res.json();
      
      if (res.ok) {        
        // Successful OTP verification, redirect
        localStorage.setItem('token', data.token);
        if (data.role === 'Admin') {
          router.push('/admin');  // Redirect admins to the admin page
        } else {
          router.push('/Homepage');  // Redirect non-admin users to the homepage
        }
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch {
      setError('Something went wrong');
    }
  };

  return (
    <Card className="max-w-sm mx-auto mt-10 mb-10">
      <CardHeader>
        <h2 className="text-xl font-bold">Login</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={isOtpSent ? handleOtpSubmit : handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {!isOtpSent && (
            <>
              <div className="mb-4">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="password">Password</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    checked={showPassword}
                    onCheckedChange={() => setShowPassword(!showPassword)}
                    id="show-password"
                  />
                  <label
                    htmlFor="show-password"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show Password
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <Link href="/auth/forgot-password" className="text-blue-600 hover:underline text-sm">
                  Forgot Password?
                </Link>
              </div>

              <Button type="submit" className="w-full bg-blue-600">Login</Button>
            </>
          )}
          {isOtpSent && (
            <>
              <div className="mb-4">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600">Verify OTP</Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginPage;
