"use client";

import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import dynamic from "next/dynamic";

const MapClient = dynamic(
  () => import("@/components/MapClient"),
  { ssr: false }
);

import BottomBar from "@/components/BottomBar";
import SignupModal from "@/components/SignupModal";
import LoginModal from "@/components/LoginModal";

import { useRouteEngine } from "@/hooks/useRouteEngine";
import { generateFakeRoute } from "@/lib/fakeRoute";

export default function Page() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

 const fakeRoute = useMemo(() => 
  generateFakeRoute(
    { lat: 28.6139, lng: 77.2090 },
    120,
    200
  ), []
);



  const engine = useRouteEngine({
    route: fakeRoute,
    interval: 1000,
  });


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
const isAuthenticated = !!user;
const handleAuth = () => {
  setShowLogin(true);
};

const startRoute = () => {
  engine.start?.(); 
};

const stopRoute = () => {
  engine.stop?.();   
};

  return (
    <div className="h-screen w-screen flex">
      <Sidebar
        user={user}
        onRequireLogin={() => setShowLogin(true)}
        onLogout={() => setUser(null)}
      />

      <main className="relative flex-1 overflow-hidden">
       
        <div className="absolute inset-0 z-0">
          <MapClient
            currentLocation={engine.currentLocation}
            routePoints={engine.routePoints}
          />
        </div>

       
        <BottomBar
  isAuthenticated={isAuthenticated}
  onRequireAuth={handleAuth}
  onStart={startRoute}
  onStop={stopRoute}   
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
