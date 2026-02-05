"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import MapClient from "@/components/MapClient";
import BottomBar from "@/components/BottomBar";
import SignupModal from "@/components/SignupModal";
import LoginModal from "@/components/LoginModal";

export default function Page() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [showSignup, setShowSignup] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
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
  const handleStart = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
         
      },
      () => {
         
        alert("Please allow location access");
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="h-screen w-screen flex">
      <Sidebar
        user={user}
        onRequireLogin={() => setShowLogin(true)}
        onLogout={() => setUser(null)}
      />

      <main className="relative flex-1 overflow-hidden">
        {/* MAP — lowest layer */}
        <div className="absolute inset-0 z-0">
          <MapClient userLocation={userLocation} />
        </div>

        {/* UI layer */}
        <BottomBar
          isAuthenticated={!!user}
          onRequireAuth={() => setShowLogin(true)}
          onStart={handleStart}
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
            onSuccess={(loggedInUser) => {
              setUser(loggedInUser);
              setShowLogin(false);
            }}
          />
        )}
      </main>
    </div>
  );
}
