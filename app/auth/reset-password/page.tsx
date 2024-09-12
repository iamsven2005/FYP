"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('No token found, redirecting to forgot-password page');
      router.push("/auth/forgot-password");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    console.log('New password:', newPassword);
    console.log('Confirm password:', confirmPassword);

    if (newPassword !== confirmPassword) {
      console.log('Passwords do not match');
      setError("Passwords do not match");
      return;
    }

    try {
      console.log('Sending password reset request...');
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      console.log('Response status:', res.status);
      console.log('Response data:', data);

      if (res.status === 400) {
        console.log('New password cannot be the same as the old password');
        toast.error("New password cannot be the same as the old password");
      } else if (res.ok) {
        console.log('Password reset successful');
        setMessage("Password reset successfully");
        localStorage.removeItem('authToken');
        router.push("/login");
      } else {
        console.log('Error from API:', data.message);
        setError(data.message);
        setMessage("");
      }
    } catch (error) {
      console.log('Failed to reset password:', error);
      setError("Failed to reset password");
    }
  };

  return (
    <Card className="max-w-sm mx-auto mt-10 mb-10">
      <CardHeader>
        <h2 className="text-xl font-bold">Reset Password</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {message && <p className="text-green-500 mb-4">{message}</p>}

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
