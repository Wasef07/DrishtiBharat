"use client";

import { useRef } from "react";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth, type Issue } from "@/contexts/auth-context";
import {
  AlertCircle,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  ArrowLeft,
  Camera,
  X,
} from "lucide-react";
import { validateGarbageImage } from "@/lib/ai-image-validator";

const CATEGORIES = [
  "Litter & Debris",
  "Graffiti",
  "Broken Infrastructure",
  "Overgrown Vegetation",
  "Water Pollution",
  "Other",
];

export default function ReportPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, issues, addIssue, deleteIssue } =
    useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    location: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiResult, setAiResult] = useState<{
    isGarbage: boolean;
    confidence: number;
  } | null>(null);

  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const timer = setTimeout(() => {
        router.push("/auth?mode=login&redirect=/report");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
      </main>
    );
  }

  if (!isAuthenticated || user?.role !== "citizen") {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-foreground/70 mb-6">
            Only citizens can report issues. Please log in as a citizen.
          </p>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </main>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // existing preview logic (UNCHANGED)
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 🧠 AI LOGIC (NEW, invisible to UI)
    setAiLoading(true);

    const img = new Image();
    img.src = URL.createObjectURL(file);

    try {
      await img.decode(); // important: prevents "stuck analyzing"
      const result = await validateGarbageImage(img);
      setAiResult(result);
    } catch (err) {
      console.error("AI validation failed", err);
      setAiResult(null);
    } finally {
      setAiLoading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          }));
        },
        () => {
          setErrors((prev) => ({
            ...prev,
            location: "Unable to get your location",
          }));
        },
      );
    } else {
      setErrors((prev) => ({
        ...prev,
        location: "Geolocation is not supported",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const [lat, lng] = formData.location.includes(",")
        ? formData.location.split(",").map((v) => parseFloat(v.trim()))
        : [
            40.7128 + (Math.random() - 0.5) * 0.1,
            -74.006 + (Math.random() - 0.5) * 0.1,
          ];

      const newIssue: Issue = {
        id: Math.random().toString(36).substr(2, 9),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        lat,
        lng,
        image: imagePreview || undefined,
        aiValidation: aiResult
          ? {
              isGarbage: aiResult.isGarbage,
              confidence: aiResult.confidence,
            }
          : undefined,
        status: "new",
        userId: user!.id,
        userName: user!.name,
        createdAt: new Date(),
        upvotes: 1,
      };
      addIssue(newIssue);

      // Award 5 points for creating a report
      const storedUsers = JSON.parse(
        localStorage.getItem("cleanconnect_users") || "[]",
      );
      const userIndex = storedUsers.findIndex((u: any) => u.id === user!.id);
      if (userIndex >= 0) {
        storedUsers[userIndex].rewardPoints =
          (storedUsers[userIndex].rewardPoints ?? 0) + 5;
        localStorage.setItem("cleanconnect_users", JSON.stringify(storedUsers));
      }

      setFormData({
        title: "",
        description: "",
        category: CATEGORIES[0],
        location: "",
      });
      setImagePreview(null);
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle className="w-4 h-4" />;
      case "in-progress":
        return <Clock className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:underline mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-foreground">
              Report an Issue
            </h1>
            <p className="text-foreground/70 mt-2">
              Help keep your city clean by reporting problems
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
            size="lg"
          >
            {showForm ? "Cancel" : "+ New Report"}
          </Button>
        </div>

        {showForm && (
          <Card className="p-8 mb-12 border border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Create New Report
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Title
                  </label>
                  <Input
                    type="text"
                    name="title"
                    placeholder="Brief summary of the issue"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Location
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      name="location"
                      placeholder="e.g., Park Street, Downtown"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`flex-1 ${errors.location ? "border-destructive" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={useCurrentLocation}
                      className="gap-1 whitespace-nowrap bg-transparent"
                    >
                      <MapPin className="w-4 h-4" />
                      Use Current Location
                    </Button>
                  </div>
                  {errors.location && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Provide details about the issue..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-3 py-2 rounded-md border bg-card text-foreground text-sm resize-none ${
                      errors.description
                        ? "border-destructive"
                        : "border-border"
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Add Photo
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Capture Live Photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Please capture a real-time photo of the issue for accurate
                      validation.
                    </p>
                  </div>
                  {imagePreview && (
                    <div className="relative mt-4">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-border"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {aiLoading && (
                    <p className="text-xs text-muted-foreground mt-2">
                      🧠 AI analyzing image…
                    </p>
                  )}

                  {aiResult && (
                    <p className="text-xs text-primary mt-2">
                      🧠 AI Validation:{" "}
                      {aiResult.isGarbage ? "Garbage Detected" : "Not Garbage"}{" "}
                      ({aiResult.confidence}%)
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </form>
          </Card>
        )}

        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Recent Reports
          </h2>
          <div className="space-y-4">
            {issues.length === 0 ? (
              <Card className="p-12 text-center border border-border">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground/70">
                  No issues reported yet. Be the first!
                </p>
              </Card>
            ) : (
              issues.map((issue) => (
                <Card
                  key={issue.id}
                  className="p-6 border border-border hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    {issue.image && (
                      <div className="w-32 h-32 flex-shrink-0">
                        <img
                          src={issue.image || "/placeholder.svg"}
                          alt={issue.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {issue.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
                            issue.status,
                          )}`}
                        >
                          {getStatusIcon(issue.status)}
                          {issue.status.charAt(0).toUpperCase() +
                            issue.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-foreground/70 mb-3">
                        {issue.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-foreground/60">
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
                        <span className="flex items-center gap-1 text-primary font-semibold">
                          👍 {issue.upvotes} upvotes
                        </span>
                      </div>
                      <p className="text-xs text-foreground/50 mt-2">
                        Reported by {issue.userName}
                      </p>
                    </div>
                    {user!.id === issue.userId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteIssue(issue.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
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
