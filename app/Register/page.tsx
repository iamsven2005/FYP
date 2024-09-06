"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from "framer-motion";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Import eye icons

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordHints, setShowPasswordHints] = useState(false); // For showing password hints
  const [showConfirmPasswordMessage, setShowConfirmPasswordMessage] = useState(false); // For showing password match
  const router = useRouter();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Username validation regex (letters, numbers, underscores only)
  const usernameRegex = /^[a-zA-Z0-9_]+$/;

  // Password validation criteria
  const minLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[\W_]/.test(password);

  // Real-time password validation messages
  const passwordRequirements = [
    { valid: minLength, message: 'At least 6 characters' },
    { valid: hasUppercase, message: 'One uppercase letter' },
    { valid: hasLowercase, message: 'One lowercase letter' },
    { valid: hasNumber, message: 'One number' },
    { valid: hasSpecialChar, message: 'One special character' },
  ];

  const validateForm = () => {
    if (!usernameRegex.test(username)) {
      setError('Username can only contain letters, numbers, and underscores.');
      return false;
    }

    if (!emailRegex.test(email)) {
      setError('Invalid email format.');
      return false;
    }

    if (!minLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      setError('Please meet all password requirements.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    setError(''); // Clear error if validation passes
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.ok) {
        router.push('/Login');
      } else {
        const data = await res.json();
        setError(data.message || 'Something went wrong.');
      }
    } catch {
      setError('Failed to register. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-10 p-6">
      <CardHeader>
        <h2 className="text-2xl font-bold">Create an Account</h2>
        <p className="text-sm text-gray-600">Please fill in the form to register.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4">
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input input-bordered w-full"
              placeholder="Enter your username"
            />
          </div>
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
                onFocus={() => setShowPasswordHints(true)} // Show hints on focus
                onBlur={() => setShowPasswordHints(false)} // Hide hints on blur
                required
                className="input input-bordered w-full pr-10" // Add padding to the right for the icon
                placeholder="Enter your password"
              />
              <span
                className="absolute inset-y-0 right-5 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
              </span>
            </div>
            {/* Password validation bullets */}
            {showPasswordHints && (
              <ul className="mt-2">
                <AnimatePresence>
                  {passwordRequirements.map(
                    (req) =>
                      !req.valid && (
                        <motion.li
                          key={req.message}
                          className="text-sm text-red-500"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                        >
                          {req.message}
                        </motion.li>
                      )
                  )}
                </AnimatePresence>
              </ul>
            )}
          </div>
          <div className="mb-4">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative w-full">
              <Input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setShowConfirmPasswordMessage(true)} // Show message when user focuses
                required
                className="input input-bordered w-full"
                placeholder="Confirm your password"
              />
              {showConfirmPasswordMessage && confirmPassword && (
                <p className={`mt-2 text-sm ${password === confirmPassword ? 'text-green-500' : 'text-red-500'}`}>
                  {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full bg-blue-600" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterPage;
