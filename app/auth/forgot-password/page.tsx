"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false); // Track if OTP is sent
  const [userId, setUserId] = useState(""); // Store userId once OTP is sent
  const router = useRouter();

  // Handle OTP request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("OTP sent successfully");
        setIsOtpSent(true); // Enable OTP input after success
        setUserId(data.userId); // Store the userId from the response
      } else {
        setError(data.message);
        setMessage("");
      }
    } catch (error) {
      setError("Something went wrong");
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }), // Include the userId here
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("OTP verified successfully");
        router.push("/auth/reset-password"); // Redirect to reset password page
      } else {
        setError(data.message);
        setMessage("");
      }
    } catch (error) {
      setError("Invalid OTP or something went wrong");
    }
  };

  return (
    <Card className="max-w-sm mx-auto mt-10">
      <CardHeader>
        <h2 className="text-xl font-bold">Forgot Password</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={isOtpSent ? handleOtpSubmit : handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {message && <p className="text-green-500 mb-4">{message}</p>}

          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isOtpSent} // Disable email input after OTP is sent
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={!isOtpSent} // Disable OTP input until OTP is sent
              required
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600">
            {isOtpSent ? "Verify OTP" : "Send OTP"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
