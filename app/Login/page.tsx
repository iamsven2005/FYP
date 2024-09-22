"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from "sonner"; // Import toast
import { Eye, EyeOff } from 'lucide-react';
import Verify from '@/components/verify';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false); // State to track Terms acceptance
  const router = useRouter();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    if (!email) {
      toast.error('Email is required.');
      return false;
    }

    if (!emailRegex.test(email)) {
      toast.error('Invalid email format.');
      return false;
    }

    if (!password) {
      toast.error('Password is required.');
      return false;
    }

    if (!termsAccepted) {
      toast.error('You must accept the Terms of Service and Privacy Policy.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault(); // Only prevent default if the event is passed
    setLoading(true);
  
    if (!validateForm()) {
      setLoading(false);
      return;
    }
  
    try {
      // Use axios for the login request
      const res = await axios.post('/api/login', {
        email,
        password
      });
  
      const data = res.data;
  
      if (res.status === 200 && data.token) {
        toast.success("Login successful!");
        localStorage.setItem('token', data.token);  // Store token in localStorage
        window.dispatchEvent(new Event('storage'));
  
        // Redirect based on the role
        router.push(data.redirectTo);  // Redirect to the user-specific page based on their role
      } else if (data.userId) {
        setUserId(data.userId);
        setIsOtpSent(true);  // If OTP is required, switch to OTP input form
        toast.success("OTP sent to your email.");
      } else if (res.status === 404) {
        toast.error("User does not exist."); // Handle user not found case
      } else {
        toast.error(data.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again later.'); // Error handling
    } finally {
      setLoading(false);
    }
  };
  

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!otp) {
      toast.error('OTP is required');
      return;
    }
  
    try {
      const res = await axios.post('/api/verify-otp', { userId, otp });  // Correct the body format
  
      const data = res.data;
  
      if (res.status === 200) {
        toast.success("OTP verified successfully.");
        localStorage.setItem('token', data.token);  // Store token in localStorage
        window.dispatchEvent(new Event('storage'));
        const redirectTo = data.redirectTo || '/staffpage';
        router.push(redirectTo);
      } else {
        toast.error(data.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again later.'); // Error handling
    }
  };
  

  return (
    <Card className="max-w-sm mx-auto mt-10 mb-10">
      <CardHeader>
        <h2 className="text-xl font-bold">Login</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={isOtpSent ? handleOtpSubmit : handleSubmit}>
          {isOtpSent ? (
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
          ) : (
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
                    className="input input-bordered w-full pr-10"
                    placeholder="Enter your password"
                  />
                  <span
                    className="absolute inset-y-0 right-5 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <Label htmlFor="terms">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={() => setTermsAccepted(!termsAccepted)}
                    className="mr-2"
                  />
                  I accept the <a href="/terms" className="underline text-blue-600">Terms of Service</a> and <a href="/privacy" className="underline text-blue-600">Privacy Policy</a>.
                </Label>
              </div>
              <div className="mb-4">
                <Link href="/auth/forgot-password" className="text-blue-600 hover:underline text-sm">Forgot Password?</Link>
              </div>
              <Button type="submit" className="w-full bg-blue-600" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="mt-4 text-center">
                <p className="text-sm">
                  Don’t have an account?{" "}
                  <Link href="/register" className="text-blue-600 hover:underline">Sign up here</Link>.
                </p>
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginPage;
