"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import MapClient from "@/components/MapClient";
import BottomBar from "@/components/BottomBar";
import SignupModal from "@/components/SignupModal";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="h-screen w-screen flex">
      <Sidebar />

      <main className="relative flex-1 overflow-hidden">
        {/* Map */}
        <div className="absolute inset-0 z-0">
          <MapClient />
        </div>

        {/* Bottom Bar */}
        <BottomBar
          isAuthenticated={isAuthenticated}
          onRequireAuth={() => setShowSignup(true)}
        />

        {/* Signup Modal */}
        {showSignup && (
          <SignupModal
            onSuccess={() => {
              setIsAuthenticated(true); // 🔐 user logged in
              setShowSignup(false);
            }}
            onClose={() => setShowSignup(false)}
          />
        )}
      </main>
    </div>
  );
}
