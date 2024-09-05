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
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [userId, setUserId] = useState(""); // Store userId after OTP is sent
  const router = useRouter();

  // Handle OTP request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    console.log("Submitting forgot password request...");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      console.log("Response from forgot-password API:", data);
      if (res.ok) {
        setMessage("OTP sent successfully");
        setIsOtpSent(true);

        if (data.userId) {
          setUserId(data.userId); // Save the userId returned from the server
          console.log("OTP sent, User ID stored:", data.userId);
        } else {
          console.error("userId not returned from forgot-password API");
        }
      } else {
        setError(data.message);
        setMessage("");
        console.error("Error in forgot-password API:", data.message);
      }
    } catch (error) {
      setError("Something went wrong");
      console.error("Forgot password request failed:", error);
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!userId) {
      setError("User ID is missing");
      console.error("Error: userId is undefined before OTP verification");
      return;
    }

    console.log("Submitting OTP for verification... UserID:", userId, " OTP:", otp);

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }), // Pass userId along with OTP
      });
      const data = await res.json();
      console.log("Response from verify-otp API:", data);
      if (res.ok) {
        // Save user authentication token (or session) in localStorage or cookies
        localStorage.setItem('authToken', data.token);
        setMessage("OTP verified successfully");
        router.push("/auth/reset-password"); // Redirect to reset password page
      } else {
        setError(data.message);
        setMessage("");
        console.error("Error in verify-otp API:", data.message);
      }
    } catch (error) {
      setError("Invalid OTP or something went wrong");
      console.error("OTP verification failed:", error);
    }
  };

  return (
    <Card className="max-w-sm mx-auto mt-10 mb-10">
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

          {isOtpSent && (
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
          )}

          <Button type="submit" className="w-full bg-blue-600">
            {isOtpSent ? "Verify OTP" : "Send OTP"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
