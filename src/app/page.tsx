"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import BottomBar from "@/components/BottomBar";
import SignupModal from "@/components/SignupModal";
import LoginModal from "@/components/LoginModal";
import SaveRoute from "@/components/SaveRoute";
import ShowSavedRoute from "@/components/ShowSavedRoute";
import FavouriteRoutes from "@/components/FavouriteRoutes";
import { useLiveLocation } from "@/hooks/useLiveLocation";

const MapClient = dynamic(
  () => import("@/components/MapClient"),
  { ssr: false }
);

type ViewType = "map" | "saved" | "favourites";

export type PinData = {
  lat: number;
  lng: number;
  title: string;
  description: string;
  image?: string;
  pointIndex: number;
};

export default function Page() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("map");
  const [refreshSavedRoutes, setRefreshSavedRoutes] = useState(0);
  const [refreshFavourites, setRefreshFavourites] = useState(0);
  const [currentPins, setCurrentPins] = useState<PinData[]>([]);

  const engine = useLiveLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      }
    };
    checkAuth();
  }, []); 

  const isAuthenticated = !!user;

  const startRoute = () => {
    engine.start();
    setCurrentPins([]); 
  };

  const stopRoute = () => {
    engine.stop();
  };

  const handleLoginSuccess = async (loggedInUser: any) => {
    setUser(loggedInUser);
    setShowLogin(false);
  };
  const handleRouteSaved = () => {
    console.log("Route saved! Switching to saved view...");
    setActiveView("saved");
    setRefreshSavedRoutes(prev => prev + 1);
    setCurrentPins([]); 
  };
  const handleRouteFavourited = () => {
    console.log("Route favourited! Switching to favourites view...");
    setActiveView("favourites");
    setRefreshFavourites(prev => prev + 1);
    setCurrentPins([]); 
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
                pins={currentPins}
                onPinsChange={setCurrentPins}
              />
            </div>

            {/* Save Route Component - shows on map when tracking */}
            {engine.routePoints.length > 0 && (
              <div className="absolute top-6 left-6 right-6 z-[500] max-w-4xl mx-auto">
                <SaveRoute 
                  routePoints={engine.routePoints}
                  pins={currentPins}
                  onSaveSuccess={handleRouteSaved}
                />
              </div>
            )}

            <BottomBar
              isAuthenticated={isAuthenticated}
              onRequireAuth={() => setShowLogin(true)}
              onStart={startRoute}
              onStop={stopRoute}
              routePoints={engine.routePoints}
              pins={currentPins}
              onSaveRoute={handleRouteSaved}
              onFavouriteRoute={handleRouteFavourited}
            />
          </>
        )}

        {activeView === "saved" && (
          <div className="h-full overflow-auto">
            <ShowSavedRoute 
              refreshTrigger={refreshSavedRoutes} 
            />
          </div>
        )}

        {activeView === "favourites" && (
          <div className="h-full overflow-auto">
            <FavouriteRoutes 
              refreshTrigger={refreshFavourites}
            />
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
            onSuccess={handleLoginSuccess}
          />
        )}
      </main>
    </div>
  );
}