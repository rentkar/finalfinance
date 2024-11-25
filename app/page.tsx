"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PurchaseForm } from "@/components/purchase-form";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLogin } from "@/components/admin-login";
import { LogIn, Shield } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Home() {
  const { isAuthenticated, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"user" | "admin">("user");

  const handleLoginSuccess = () => {
    setActiveTab("admin");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Purchase Portal</h1>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("admin")}
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Admin Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Login
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Admin Login</DialogTitle>
                  </DialogHeader>
                  <AdminLogin onSuccess={handleLoginSuccess} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAuthenticated && activeTab === "admin" ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
            <AdminDashboard />
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Submit Purchase</h2>
            <PurchaseForm />
          </div>
        )}
      </main>
    </div>
  );
}