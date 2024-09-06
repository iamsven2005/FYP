"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Import eye icons
import Link from 'next/link';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Error validation for email and password
  const validateForm = () => {
    if (!email) {
      setError('Email is required.');
      return false;
    }

    if (!emailRegex.test(email)) {
      setError('Invalid email format.');
      return false;
    }

    if (!password) {
      setError('Password is required.');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate the form before making API request
    if (!validateForm()) {
      setLoading(false);
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
        // If user is Admin or assigned a role that bypasses OTP, redirect based on role
        localStorage.setItem('token', data.token);
        router.push(data.redirectTo); // Dynamically redirect based on role
      } else if (data.userId) {
        // Non-admin users, proceed with OTP flow
        setUserId(data.userId);
        setIsOtpSent(true);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
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
        // Successful OTP verification, redirect based on role
        localStorage.setItem('token', data.token);
        const redirectTo = data.redirectTo || '/Homepage'; // Ensure there's always a fallback
        router.push(redirectTo);  // Dynamically redirect based on role
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch {
      setError('Something went wrong. Please try again later.');
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
                  className="input input-bordered w-full"
                  placeholder="Enter your email"
                />
              </div>
              <div className="mb-4 relative">
                <Label htmlFor="password">Password</Label>
                <div className="relative w-full">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input input-bordered w-full pr-10" // Add padding for icon
                    placeholder="Enter your password"
                  />
                  <span
                    className="absolute inset-y-0 right-5 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <Link href="/auth/forgot-password" className="text-blue-600 hover:underline text-sm">
                  Forgot Password?
                </Link>
              </div>

              <Button type="submit" className="w-full bg-blue-600" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
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
                  className="input input-bordered w-full"
                  placeholder="Enter OTP sent to your email"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600" disabled={loading}>
                {loading ? 'Verifying OTP...' : 'Verify OTP'}
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginPage;
