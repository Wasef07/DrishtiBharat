'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import {
  AlertCircle,
  Award,
  Star,
  Trophy,
  ArrowLeft,
  Check,
  Lock,
  Zap,
  Heart,
} from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requirement: string;
  unlocked: boolean;
  progress?: number;
  progressMax?: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  redeemable: boolean;
  icon: React.ReactNode;
}

const BADGES: Badge[] = [
  {
    id: '1',
    name: 'First Report',
    description: 'File your first cleanliness issue',
    icon: <AlertCircle className="w-6 h-6" />,
    requirement: 'Report 1 issue',
    unlocked: true,
    progress: 1,
    progressMax: 1,
  },
  {
    id: '2',
    name: 'Community Helper',
    description: 'File 5 cleanliness issues',
    icon: <Heart className="w-6 h-6" />,
    requirement: 'Report 5 issues',
    unlocked: true,
    progress: 5,
    progressMax: 5,
  },
  {
    id: '3',
    name: 'Civic Champion',
    description: 'File 25 cleanliness issues',
    icon: <Trophy className="w-6 h-6" />,
    requirement: 'Report 25 issues',
    unlocked: false,
    progress: 5,
    progressMax: 25,
  },
  {
    id: '4',
    name: 'Popular Reporter',
    description: 'Get 50 upvotes on your reports',
    icon: <Star className="w-6 h-6" />,
    requirement: 'Reach 50 upvotes',
    unlocked: true,
    progress: 50,
    progressMax: 50,
  },
  {
    id: '5',
    name: 'Problem Solver',
    description: 'Help resolve 10 issues',
    icon: <Zap className="w-6 h-6" />,
    requirement: 'Help resolve 10 issues',
    unlocked: false,
    progress: 3,
    progressMax: 10,
  },
  {
    id: '6',
    name: 'Environmental Hero',
    description: 'Reach 100 total points',
    icon: <Award className="w-6 h-6" />,
    requirement: 'Earn 100 points',
    unlocked: false,
    progress: 65,
    progressMax: 100,
  },
];

const REWARDS: Reward[] = [
  {
    id: '1',
    name: 'Community Certificate',
    description: 'Digital certificate recognizing your contributions',
    points: 50,
    redeemable: true,
    icon: <Award className="w-6 h-6" />,
  },
  {
    id: '2',
    name: 'Featured Reporter Badge',
    description: 'Display a special badge on your profile',
    points: 100,
    redeemable: true,
    icon: <Star className="w-6 h-6" />,
  },
  {
    id: '3',
    name: 'City Recognition',
    description: 'Feature in monthly community highlights',
    points: 200,
    redeemable: true,
    icon: <Trophy className="w-6 h-6" />,
  },
  {
    id: '4',
    name: 'Green Points Bundle',
    description: 'Bonus points to accelerate your progress',
    points: 75,
    redeemable: true,
    icon: <Zap className="w-6 h-6" />,
  },
];

export default function RewardsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, getUserRewardPoints, redeemRewardPoints } = useAuth();
  const [userPoints, setUserPoints] = useState(0);
  const [rewardNotification, setRewardNotification] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth?mode=login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setUserPoints(getUserRewardPoints());
    }
  }, [isAuthenticated, user, getUserRewardPoints]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
      </main>
    );
  }

  if (!isAuthenticated || user?.role !== 'citizen') {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-foreground/70 mb-6">
            Only registered citizens can access the rewards page. Please log in as a citizen.
          </p>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </main>
    );
  }

  const handleRedeemReward = (reward: Reward) => {
    if (redeemRewardPoints(reward.points)) {
      setUserPoints(getUserRewardPoints());
      setRewardNotification(`Successfully redeemed ${reward.name}!`);
      setTimeout(() => setRewardNotification(null), 3000);
    } else {
      setRewardNotification('Insufficient points to redeem this reward.');
      setTimeout(() => setRewardNotification(null), 3000);
    }
  };

  const totalUnlockedBadges = BADGES.filter((b) => b.unlocked).length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-primary hover:underline mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground">Rewards & Achievements</h1>
          <p className="text-foreground/70 mt-2">
            Earn badges and points for your contributions
          </p>
        </div>

        {rewardNotification && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-700 font-medium flex items-center gap-2">
              <Check className="w-4 h-4" />
              {rewardNotification}
            </p>
          </div>
        )}

        {/* Points Summary */}
        <Card className="p-8 mb-12 border border-border bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-foreground/70 mb-2">Your Total Points</p>
              <p className="text-5xl font-bold text-primary">{userPoints}</p>
              <p className="text-foreground/60 mt-2">{totalUnlockedBadges} badges unlocked</p>
            </div>
            <Zap className="w-16 h-16 text-primary opacity-30" />
          </div>
          <p className="text-sm text-foreground/70">
            Keep contributing to earn more points and unlock exclusive rewards!
          </p>
        </Card>

        {/* Badges Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BADGES.map((badge) => (
              <Card
                key={badge.id}
                className={`p-6 border transition-all ${
                  badge.unlocked
                    ? 'border-primary/50 bg-card hover:shadow-lg'
                    : 'border-border/30 bg-muted/30 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      badge.unlocked
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {badge.icon}
                  </div>
                  {!badge.unlocked && (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{badge.name}</h3>
                <p className="text-sm text-foreground/70 mb-4">{badge.description}</p>
                <div className="space-y-2">
                  <p className="text-xs text-foreground/60">{badge.requirement}</p>
                  {badge.progress !== undefined && badge.progressMax !== undefined && (
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          badge.unlocked ? 'bg-primary' : 'bg-muted-foreground/50'
                        }`}
                        style={{
                          width: `${(badge.progress / badge.progressMax) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                  {badge.progress !== undefined && badge.progressMax !== undefined && (
                    <p className="text-xs text-foreground/60 text-right">
                      {badge.progress} / {badge.progressMax}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Rewards Section */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6">Redeem Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {REWARDS.map((reward) => {
              const canRedeem = userPoints >= reward.points;
              return (
                <Card
                  key={reward.id}
                  className={`p-6 border flex flex-col ${
                    canRedeem
                      ? 'border-primary/50 hover:shadow-lg transition-all'
                      : 'border-border/30 opacity-75'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                      canRedeem
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {reward.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{reward.name}</h3>
                  <p className="text-sm text-foreground/70 mb-4 flex-1">{reward.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-primary">{reward.points} points</span>
                    </div>
                    <Button
                      onClick={() => handleRedeemReward(reward)}
                      disabled={!canRedeem}
                      className="w-full"
                      variant={canRedeem ? 'default' : 'outline'}
                    >
                      {canRedeem ? 'Redeem' : 'Locked'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Top Contributors</h2>
          <Card className="p-6 border border-border overflow-hidden">
            <div className="space-y-4">
              {[
                { rank: 1, name: 'Alex Johnson', points: 520, badge: '👑' },
                { rank: 2, name: 'Emma Williams', points: 485, badge: '🥈' },
                { rank: 3, name: 'Michael Brown', points: 450, badge: '🥉' },
                {
                  rank: 4,
                  name: user?.name || 'You',
                  points: userPoints,
                  badge: '⭐',
                  highlight: true,
                },
              ].map((contributor, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    contributor.highlight
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{contributor.badge}</span>
                    <div>
                      <p className="font-semibold text-foreground">{contributor.name}</p>
                      <p className="text-xs text-foreground/60">Rank #{contributor.rank}</p>
                    </div>
                  </div>
                  <p className="font-bold text-primary text-lg">{contributor.points} pts</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
