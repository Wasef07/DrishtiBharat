'use client';

import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  MapPin,
  TrendingUp,
  Users,
  Award,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: MapPin,
      title: 'Report Issues',
      description: 'Spot a dirty street or damaged public area? Report it with photos and location.',
    },
    {
      icon: TrendingUp,
      title: 'Track Impact',
      description: 'See real-time progress on reported issues as authorities respond.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join thousands of citizens making their city cleaner together.',
    },
    {
      icon: Award,
      title: 'Earn Rewards',
      description: 'Get badges and points for active participation in community improvements.',
    },
  ];

  const stats = [
    { value: '5,234', label: 'Issues Reported' },
    { value: '2,891', label: 'Issues Resolved' },
    { value: '3,156', label: 'Active Contributors' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navigation />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 md:py-32">
  <div className="relative rounded-lg overflow-hidden border border-border shadow-lg">
    
    {/* Background image */}
    <div
      className="absolute inset-0 bg-cover bg-center opacity-60"
      style={{ backgroundImage: "url('https://travelogyindia.b-cdn.net/blog/wp-content/uploads/2019/07/CHANDIGARH-places-tovisit-1024x679.jpg')" }}
    />

    {/* Optional dark overlay for readability */}
    <div className="absolute inset-0 bg-black/70" />

    {/* Content */}
    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center p-8 md:p-16">
      <div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight text-balance">
          Keep Your City{" "}
          <span className="text-primary">Clean and Green</span>
        </h1>

        <p className="text-lg text-white/90 mb-8 leading-relaxed text-pretty">
          CleanConnect  empowers citizens to report cleanliness issues and track
          community impact. Together, we can make our cities cleaner, healthier,
          and more vibrant.
        </p>

        <div className="flex gap-4 flex-wrap">
          <Link href="/report">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="#features">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </div>

  </div>
</section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-lg text-foreground/70">
            Simple steps to make a difference in your community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={idx}
                className="p-6 hover:shadow-lg transition-shadow border border-border"
              >
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-foreground/70 text-sm">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Make Your City Cleaner?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of citizens working together to improve their community.
          </p>
          <Link href="/report">
            <Button size="lg" variant="secondary">
              Start Contributing Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-foreground/70 text-sm">
          <p>© 2026 CleanConnect . Making cities cleaner, one report at a time.</p>
        </div>
      </footer>
    </main>
  );
}
