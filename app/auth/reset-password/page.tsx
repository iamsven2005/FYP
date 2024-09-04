"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState(""); // OTP to ensure user gets access
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Function to handle password reset
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, newPassword }), // Send OTP and new password to backend
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password reset successfully");
        router.push("/Login"); // Redirect to login page after successful password reset
      } else {
        setError(data.message);
        setMessage("");
      }
    } catch (error) {
      setError("Failed to reset password");
    }
  };

  return (
    <Card className="max-w-sm mx-auto mt-10">
      <CardHeader>
        <h2 className="text-xl font-bold">Reset Password</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {message && <p className="text-green-500 mb-4">{message}</p>}

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

          <div className="mb-4">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600">
            Reset Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
