'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { Droplet, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, isAuthenticated, loading } = useAuth();
  const mode = searchParams.get('mode') || 'login';

  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [role, setRole] = useState<'citizen' | 'authority'>('citizen');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password, role);
      } else {
        await register(formData.name, formData.email, formData.password, role);
      }
      router.push('/');
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navigation />

      <div className="max-w-md mx-auto px-4 py-20">
        <Card className="p-8 border border-border">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Droplet className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">CleanConnect </h1>
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-2 text-center">
            {isLogin ? 'Login to Your Account' : 'Create Your Account'}
          </h2>
          <p className="text-sm text-foreground/70 text-center mb-6">
            {isLogin
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-semibold"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-foreground mb-3 block">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['citizen', 'authority'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 rounded-lg border-2 transition-colors capitalize font-medium ${
                    role === r
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {errors.submit && (
            <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name}</p>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
              <Input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
            </Button>
          </form>

          <p className="text-xs text-foreground/60 text-center mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </Card>
      </div>
    </main>
  );
}
