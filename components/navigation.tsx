'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut, Droplet } from 'lucide-react';

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-base sm:text-xl text-primary"
        >
          <Droplet className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="truncate">CleanConnect </span>
        </Link>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {isAuthenticated && user ? (
            <>
              {/* Hide welcome text on mobile */}
              <span className="hidden sm:block text-sm text-foreground">
                Welcome, {user.name}
              </span>

              {user.role === 'citizen' ? (
                <>
                  <Link href="/report">
                    <Button variant="outline" size="sm">
                      Report
                    </Button>
                  </Link>
                  <Link href="/rewards">
                    <Button variant="outline" size="sm">
                      Rewards
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth?mode=login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth?mode=register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
