"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import MapClient from "@/components/MapClient";
import BottomBar from "@/components/BottomBar";
import SignupModal from "@/components/SignupModal";
import LoginModal from "@/components/LoginModal";

export default function Page() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
  const checkAuth = async () => {
    const res = await fetch("/api/me");
    const data = await res.json();

    if (data.user) {
      setUser(data.user);
    }
  };

  checkAuth();
}, []);


  return (
    <div className="h-screen w-screen flex">
      <Sidebar
  user={user}
  onRequireLogin={() => setShowLogin(true)}
  onLogout={() => setUser(null)}
/>


<main className="relative flex-1 overflow-hidden">

  {/* MAP — always lowest */}
  <div className="absolute inset-0 z-0">
    <MapClient />
  </div>

  {/* UI layer */}
  <BottomBar
    isAuthenticated={isAuthenticated}
    onRequireAuth={() => setShowLogin(true)}
  />

  {showSignup && (
    <SignupModal
      onClose={() => setShowSignup(false)}
      onSuccess={() => {
        setShowSignup(false);
        setShowLogin(true);
      }}
      onLoginClick={() => {
        setShowSignup(false);
        setShowLogin(true);
      }}
    />
  )}

  {showLogin && (
    <LoginModal
      onClose={() => setShowLogin(false)}
      onSignupClick={() => {
        setShowLogin(false);
        setShowSignup(true);
      }}
      onSuccess={() => {
        setIsAuthenticated(true);
        setShowLogin(false);
      }}
    />
  )}

</main>
</div>
  );
}
