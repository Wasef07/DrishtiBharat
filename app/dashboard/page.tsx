"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth, type Issue } from "@/contexts/auth-context";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  ArrowLeft,
  Filter,
  Check,
} from "lucide-react";

// Declare DashboardIssue type and MOCK_DASHBOARD_ISSUES variable
type DashboardIssue = Issue & {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  createdAt: Date;
  reportedBy: string;
  upvotes: number;
  status: "new" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
};

// Add more mock issues as needed

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, issues, updateIssueStatus } =
    useAuth();
  const [filterStatus, setFilterStatus] = useState<
    "all" | "new" | "in-progress" | "resolved"
  >("all");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth?mode=login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
      </main>
    );
  }

  if (!isAuthenticated || user?.role !== "authority") {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-foreground/70 mb-6">
            Only authorized officials can access the dashboard. Please log in as
            an authority.
          </p>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </main>
    );
  }

  const filteredIssues = issues.filter((issue) => {
    const statusMatch = filterStatus === "all" || issue.status === filterStatus;
    return statusMatch;
  });

  const stats = {
    total: issues.length,
    new: issues.filter((i) => i.status === "new").length,
    inProgress: issues.filter((i) => i.status === "in-progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
  };

  const awardPointsToReporter = (issue: Issue) => {
    // Award points to the reporter when issue is resolved
    const storedUsers = JSON.parse(
      localStorage.getItem("cleanconnect_users") || "[]",
    );
    const reporterIndex = storedUsers.findIndex(
      (u: any) => u.id === issue.userId,
    );

    if (reporterIndex >= 0) {
      const points = 10; // Award 10 points per resolved issue
      storedUsers[reporterIndex].rewardPoints =
        (storedUsers[reporterIndex].rewardPoints ?? 0) + points;
      localStorage.setItem("cleanconnect_users", JSON.stringify(storedUsers));
    }
  };

  const handleStatusChange = (
    id: string,
    newStatus: "new" | "in-progress" | "resolved",
  ) => {
    const issue = issues.find((i) => i.id === id);
    updateIssueStatus(id, newStatus);

    // Award points when issue transitions to resolved
    if (newStatus === "resolved" && issue) {
      awardPointsToReporter(issue);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-accent/20 text-accent border-accent/30";
      case "in-progress":
        return "bg-primary/20 text-primary border-primary/30";
      case "resolved":
        return "bg-green-500/20 text-green-700 border-green-500/30";
      default:
        return "bg-muted/50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-700 border-red-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
      case "low":
        return "bg-blue-500/20 text-blue-700 border-blue-500/30";
      default:
        return "bg-muted/50";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary hover:underline mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground">
            Authority Dashboard
          </h1>
          <p className="text-foreground/70 mt-2">
            Manage and track reported cleanliness issues
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="p-6 border border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/70 mb-1">Total Reports</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.total}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-accent opacity-50" />
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/70 mb-1">New Issues</p>
                <p className="text-3xl font-bold text-accent">{stats.new}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-accent opacity-50" />
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/70 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-primary">
                  {stats.inProgress}
                </p>
              </div>
              <Clock className="w-8 h-8 text-primary opacity-50" />
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/70 mb-1">Resolved</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.resolved}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </h3>
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {(["all", "new", "in-progress", "resolved"] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors text-sm font-medium capitalize ${
                      filterStatus === status
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {status === "in-progress" ? "In Progress" : status}
                  </button>
                ),
              )}
            </div>
          </div>
        </Card>

        {/* Issues List */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Issues ({filteredIssues.length})
          </h2>
          <div className="space-y-4">
            {filteredIssues.length === 0 ? (
              <Card className="p-12 text-center border border-border">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-foreground/70">No issues to display</p>
              </Card>
            ) : (
              filteredIssues.map((issue) => (
                <Card
                  key={issue.id}
                  className="p-6 border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    {issue.image && (
                      <div className="w-24 h-24 flex-shrink-0">
                        <img
                          src={issue.image || "/placeholder.svg"}
                          alt={issue.title}
                          className="w-full h-full object-cover rounded-lg border border-border"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {issue.title}
                      </h3>
                      <p className="text-foreground/70 mb-4">
                        {issue.description}
                      </p>
                      {issue.aiValidation && (
                        <p className="text-xs text-primary mb-3">
                          🧠 AI:{" "}
                          {issue.aiValidation.isGarbage
                            ? "Garbage Detected"
                            : "Not Garbage"}{" "}
                          ({issue.aiValidation.confidence}%)
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            issue.status,
                          )}`}
                        >
                          {issue.status === "in-progress"
                            ? "In Progress"
                            : issue.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {issue.status !== "resolved" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            const nextStatus =
                              issue.status === "new"
                                ? ("in-progress" as const)
                                : ("resolved" as const);
                            updateIssueStatus(issue.id, nextStatus);
                          }}
                          className="gap-1 whitespace-nowrap"
                        >
                          <Check className="w-4 h-4" />
                          {issue.status === "new" ? "Start" : "Resolve"}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-foreground/60 border-t border-border pt-4">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {issue.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {issue.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {issue.createdAt.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {issue.userName}
                    </span>
                    <span className="flex items-center gap-1 text-primary font-semibold">
                      👍 {issue.upvotes}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
