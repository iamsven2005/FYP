"use client"
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No token found, redirecting to forgot-password page');
      router.push("/auth/forgot-password");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem('authToken'); // Get the token from localStorage

      const res = await axios.post(
        "/api/reset-password",
        { newPassword }, // Request body
        {
          headers: {
            Authorization: `Bearer ${token}` // Send token in Authorization header
          }
        }
      );

      if (res.status === 400) {
        toast.error("New password cannot be the same as the old password");
      } else if (res.status === 200 ) {
        toast.success("Password reset successfully");
        localStorage.removeItem('authToken');
        router.push("/Login");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Failed to reset password");
    }
  };

  return (
    <Card className="max-w-sm mx-auto mt-10 mb-10">
      <CardHeader>
        <h2 className="text-xl font-bold">Reset Password</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative w-full">
              <Input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="input input-bordered w-full pr-10"
              />
              <span
                className="absolute inset-y-0 right-5 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
          </div>

          <div className="mb-4 relative">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative w-full">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input input-bordered w-full pr-10"
              />
              <span
                className="absolute inset-y-0 right-5 flex items-center cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600">
            Reset Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
