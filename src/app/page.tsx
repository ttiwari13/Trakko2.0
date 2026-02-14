"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import BottomBar from "@/components/BottomBar";
import SignupModal from "@/components/SignupModal";
import LoginModal from "@/components/LoginModal";
import SaveRoute from "@/components/SaveRoute";
import { useLiveLocation } from "@/hooks/useLiveLocation";

const MapClient = dynamic(
  () => import("@/components/MapClient"),
  { ssr: false }
);

type ViewType = "map" | "saved" | "favourites";

export default function Page() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("map");

  const engine = useLiveLocation();

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

  const startRoute = () => {
    engine.start();
  };

  const stopRoute = () => {
    engine.stop();
  };

  return (
    <div className="h-screen w-screen flex bg-white text-black overflow-hidden">
      <Sidebar
        user={user}
        activeView={activeView}
        onChangeView={setActiveView}
        onRequireLogin={() => setShowLogin(true)}
        onLogout={() => setUser(null)}
      />
      <main className="relative flex-1 h-full overflow-hidden">
        {activeView === "map" && (
          <>
            <div className="absolute inset-0">
              <MapClient
                currentLocation={engine.currentLocation}
                routePoints={engine.routePoints}
              />
            </div>

            <BottomBar
              isAuthenticated={isAuthenticated}
              onRequireAuth={() => setShowLogin(true)}
              onStart={startRoute}
              onStop={stopRoute}
            />
          </>
        )}

        {activeView === "saved" && (
          <div className="h-full overflow-auto">
            <SaveRoute routePoints={engine.routePoints} />
          </div>
        )}

        {activeView === "favourites" && (
          <div className="h-full overflow-auto p-10">
            <h2 className="text-2xl font-bold">Favourites</h2>
            <p className="text-gray-500 mt-4">
              Your favourite routes will appear here.
            </p>
          </div>
        )}

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
