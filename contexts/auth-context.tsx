'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'citizen' | 'authority';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  rewardPoints?: number;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  lat: number;
  lng: number;
   aiValidation?: {
    isGarbage: boolean;
    confidence: number;
  };

  image?: string;
  status: 'new' | 'in-progress' | 'resolved';
  userId: string;
  userName: string;
  createdAt: Date;
  upvotes: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  issues: Issue[];
  addIssue: (issue: Issue) => void;
  updateIssueStatus: (id: string, status: 'new' | 'in-progress' | 'resolved') => void;
  deleteIssue: (id: string) => void;
  addRewardPoints: (points: number) => void;
  redeemRewardPoints: (points: number) => boolean;
  getUserRewardPoints: () => number;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user and issues from localStorage on mount
    const storedUser = localStorage.getItem('cleanconnect_user');
    const storedIssues = localStorage.getItem('cleanconnect_issues');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }

    if (storedIssues) {
      try {
        const parsedIssues = JSON.parse(storedIssues);
        setIssues(parsedIssues.map((issue: any) => ({
          ...issue,
          createdAt: new Date(issue.createdAt)
        })));
      } catch (error) {
        console.error('Failed to parse stored issues:', error);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if user already exists in localStorage
      const storedUsers = JSON.parse(localStorage.getItem('cleanconnect_users') || '[]');
      const existingUser = storedUsers.find((u: User) => u.email === email);

      let mockUser: User;
      if (existingUser && existingUser.role === role) {
        // Use existing user data with their reward points
        mockUser = existingUser;
      } else {
        // Create new user
        mockUser = {
          id: Math.random().toString(36).substr(2, 9),
          name: email.split('@')[0],
          email,
          role,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          rewardPoints: 0,
        };
        storedUsers.push(mockUser);
        localStorage.setItem('cleanconnect_users', JSON.stringify(storedUsers));
      }

      setUser(mockUser);
      localStorage.setItem('cleanconnect_user', JSON.stringify(mockUser));
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        rewardPoints: 0,
      };

      const storedUsers = JSON.parse(localStorage.getItem('cleanconnect_users') || '[]');
      storedUsers.push(mockUser);
      localStorage.setItem('cleanconnect_users', JSON.stringify(storedUsers));

      setUser(mockUser);
      localStorage.setItem('cleanconnect_user', JSON.stringify(mockUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cleanconnect_user');
  };

  const addIssue = (issue: Issue) => {
    const updatedIssues = [issue, ...issues];
    setIssues(updatedIssues);
    localStorage.setItem('cleanconnect_issues', JSON.stringify(updatedIssues));
  };

  const updateIssueStatus = (id: string, status: 'new' | 'in-progress' | 'resolved') => {
    const updatedIssues = issues.map((issue) =>
      issue.id === id ? { ...issue, status } : issue
    );
    setIssues(updatedIssues);
    localStorage.setItem('cleanconnect_issues', JSON.stringify(updatedIssues));
  };

  const deleteIssue = (id: string) => {
    const updatedIssues = issues.filter((issue) => issue.id !== id);
    setIssues(updatedIssues);
    localStorage.setItem('cleanconnect_issues', JSON.stringify(updatedIssues));
  };

  const getUserRewardPoints = (): number => {
    return user?.rewardPoints ?? 0;
  };

  const addRewardPoints = (points: number) => {
    if (user) {
      const updatedUser = { ...user, rewardPoints: (user.rewardPoints ?? 0) + points };
      setUser(updatedUser);
      localStorage.setItem('cleanconnect_user', JSON.stringify(updatedUser));

      // Update stored users list
      const storedUsers = JSON.parse(localStorage.getItem('cleanconnect_users') || '[]');
      const userIndex = storedUsers.findIndex((u: User) => u.id === user.id);
      if (userIndex >= 0) {
        storedUsers[userIndex] = updatedUser;
        localStorage.setItem('cleanconnect_users', JSON.stringify(storedUsers));
      }
    }
  };

  const redeemRewardPoints = (points: number): boolean => {
    const currentPoints = getUserRewardPoints();
    if (currentPoints >= points) {
      if (user) {
        const updatedUser = { ...user, rewardPoints: (user.rewardPoints ?? 0) - points };
        setUser(updatedUser);
        localStorage.setItem('cleanconnect_user', JSON.stringify(updatedUser));

        // Update stored users list
        const storedUsers = JSON.parse(localStorage.getItem('cleanconnect_users') || '[]');
        const userIndex = storedUsers.findIndex((u: User) => u.id === user.id);
        if (userIndex >= 0) {
          storedUsers[userIndex] = updatedUser;
          localStorage.setItem('cleanconnect_users', JSON.stringify(storedUsers));
        }
      }
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        issues,
        addIssue,
        updateIssueStatus,
        deleteIssue,
        addRewardPoints,
        redeemRewardPoints,
        getUserRewardPoints,
        loading,
        login,
        register,
        logout,
        isAuthenticated: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
