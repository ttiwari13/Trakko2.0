"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import BottomBar from "@/components/BottomBar";
import SignupModal from "@/components/SignupModal";
import LoginModal from "@/components/LoginModal";
import ShowSavedRoute from "@/components/ShowSavedRoute";
import FavouriteRoutes from "@/components/FavouriteRoutes";
import { useLiveLocation } from "@/hooks/useLiveLocation";

const MapClient = dynamic(() => import("@/components/MapClient"), { ssr: false });

type ViewType = "map" | "saved" | "favourites";

export type PinData = {
  lat: number;
  lng: number;
  title: string;
  description: string;
  image?: string;
  pointIndex: number;
};

const NAV_ITEMS: { view: ViewType; label: string; icon: React.ReactNode }[] = [
  {
    view: "map",
    label: "Map",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    view: "saved",
    label: "Saved",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21l-5-3-5 3V5a2 2 0 012-2h6a2 2 0 012 2v16z" />
      </svg>
    ),
  },
  {
    view: "favourites",
    label: "Favourites",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
];

export default function Page() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("map");
  const [refreshSavedRoutes, setRefreshSavedRoutes] = useState(0);
  const [currentPins, setCurrentPins] = useState<PinData[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const engine = useLiveLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json();
        setUser(data.user || null);
      } catch {
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLoginSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);
    setShowLogin(false);
  };

  const handleRouteSaved = () => {
    setRefreshSavedRoutes((prev) => prev + 1);
  };

  return (
    <div className="h-[100dvh] w-screen flex flex-col md:flex-row bg-white text-black overflow-hidden">
      <div className="hidden md:flex">
        <Sidebar
          user={user}
          activeView={activeView}
          onChangeView={setActiveView}
          onRequireLogin={() => setShowLogin(true)}
          onLogout={() => setUser(null)}
        />
      </div>

      <main className="relative flex-1 min-h-0 overflow-hidden">

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

            {/* 
              Single BottomBar instance.
              BottomBar internally switches between:
              - desktop: horizontal pill (hidden sm:flex)
              - mobile: radial FAB (sm:hidden), fixed bottom-right
            */}
            <div className="fixed bottom-20 right-4 z-30 sm:static sm:absolute sm:bottom-6 sm:right-auto sm:left-0 sm:right-0 sm:flex sm:justify-center sm:z-10">
              <BottomBar
                isAuthenticated={!!user}
                onRequireAuth={() => setShowLogin(true)}
                onStart={() => engine.start()}
                onStop={() => engine.stop()}
                routePoints={engine.routePoints}
                pins={currentPins}
                onSaveRoute={handleRouteSaved}
              />
            </div>
          </>
        )}

        {activeView === "saved" && (
          <div className="h-full pb-16 md:pb-0 overflow-auto overscroll-contain">
            <ShowSavedRoute refreshTrigger={refreshSavedRoutes} />
          </div>
        )}

        {activeView === "favourites" && (
          <div className="h-full pb-16 md:pb-0 overflow-auto overscroll-contain">
            <FavouriteRoutes />
          </div>
        )}

        {showSignup && (
          <SignupModal
            onClose={() => setShowSignup(false)}
            onSuccess={() => { setShowSignup(false); setShowLogin(true); }}
            onLoginClick={() => { setShowSignup(false); setShowLogin(true); }}
          />
        )}
        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onSignupClick={() => { setShowLogin(false); setShowSignup(true); }}
            onSuccess={handleLoginSuccess}
          />
        )}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex items-stretch h-16 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.07)]">
        {NAV_ITEMS.map(({ view, label, icon }) => {
          const isActive = activeView === view;
          return (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-all duration-200"
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-black rounded-full" />
              )}
              <span className={`transition-all duration-200 ${isActive ? "text-black scale-110" : "text-gray-400"}`}>
                {icon}
              </span>
              <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-200 ${isActive ? "text-black" : "text-gray-400"}`}>
                {label}
              </span>
            </button>
          );
        })}

        {/* Auth tab */}
        <div className="flex-1 flex flex-col items-center justify-center relative" ref={userMenuRef}>
          {user ? (
            <>
              <button
                onClick={() => setShowUserMenu((o) => !o)}
                className="flex flex-col items-center justify-center gap-1 w-full h-full"
              >
                <div className={`w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold transition-all duration-200 ${showUserMenu ? "ring-2 ring-offset-1 ring-black scale-110" : ""}`}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] font-semibold text-black max-w-[56px] truncate">
                  {user.username}
                </span>
              </button>
              {showUserMenu && (
                <div className="absolute bottom-[calc(100%+8px)] right-1 w-44 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-30">
                  <div className="flex items-center gap-2.5 px-3.5 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 leading-none mb-0.5">Signed in as</p>
                      <p className="text-sm font-semibold truncate leading-none">{user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setUser(null); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-3.5 py-3 text-sm font-medium text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="flex flex-col items-center justify-center gap-1 w-full h-full"
            >
              <div className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-[10px] font-semibold text-gray-400">Login</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}