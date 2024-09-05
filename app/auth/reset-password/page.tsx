"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Add confirm password
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Ensure the user is authenticated to reset the password
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push("/auth/forgot-password");
    }
  }, [router]);

  // Function to handle password reset
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Validate that newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      console.error("Passwords do not match");
      return;
    }

    console.log("Submitting password reset request with newPassword:", newPassword);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('authToken')}`, // Pass auth token
        },
        body: JSON.stringify({ newPassword }), // Send new password to backend
      });
      
      const data = await res.json();
      console.log("Response from reset-password API:", data);

      if (res.ok) {
        setMessage("Password reset successfully");
        localStorage.removeItem('authToken'); // Clear auth token
        router.push("/Login"); // Redirect to login page after successful password reset
      } else {
        setError(data.message);
        setMessage("");
        console.error("Error from reset-password API:", data.message);
      }
    } catch (error) {
      setError("Failed to reset password");
      console.error("Password reset failed:", error);
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
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
