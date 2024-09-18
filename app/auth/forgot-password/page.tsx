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

  // Handle OTP request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/forgot-password", {data:{ email },
      });
      const data = await res.data

      
        toast.success("OTP sent successfully");
        setIsOtpSent(true);

        if (data.userId) {
          setUserId(data.userId); // Save the userId returned from the server
        } else {
          toast.error("Failed to retrieve user ID");
        }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("FFFFID is missing");
      return;
    }

    try {
      const res = await axios.post("/api/verify-otp", {data:{ userId, otp }, // Pass userId along with OTP
      });
      const data = await res.data;

        localStorage.setItem('authToken', data.token);
        toast.success("OTP verified successfully");
        router.push("/auth/reset-password");
    } catch (error) {
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
