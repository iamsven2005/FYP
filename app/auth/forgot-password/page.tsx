"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner'; // Importing toast for notifications
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [userId, setUserId] = useState(""); // Store userId after OTP is sent
  const router = useRouter();

  // Helper function to get Authorization header
  const getAuthHeader = () => {
    const token = localStorage.getItem("authToken"); // Updated to fetch 'authToken'
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  // Handle OTP request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/forgot-password", { email }, getAuthHeader()); // Add headers if needed
      const data = res.data; // Get the data from response directly

      toast.success("OTP sent successfully");
      setIsOtpSent(true);

      if (data.userId) {
        setUserId(data.userId); // Save the userId returned from the server
      } else {
        toast.error("Failed to retrieve user ID");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("User ID is missing");
      return;
    }

    try {
      const res = await axios.post("/api/verify-otp", { userId, otp }, getAuthHeader());
      const data = res.data;
    
      if (data.token) {
        localStorage.setItem("authToken", data.token); // Save the token with the correct key
        toast.success("OTP verified successfully");
        router.push("/auth/reset-password");
      } else {
        toast.error("No token received, unable to proceed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Invalid OTP or something went wrong");
    }    
  };

  return (
    <Card className="max-w-sm mx-auto mt-10 mb-10">
      <CardHeader>
        <h2 className="text-xl font-bold">Forgot Password</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={isOtpSent ? handleOtpSubmit : handleSubmit}>
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
