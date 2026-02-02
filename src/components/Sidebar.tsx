"use client";

import { useState } from "react";
import { Menu, Heart, Bookmark, LogOut, Plus, X } from "lucide-react";
import SignupModal from "@/components/SignupModal";

type Account = {
  email: string;
};

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // TEMP: replace later with real auth state
  const [accounts, setAccounts] = useState<Account[]>([
    { email: "demo@gmail.com" },
    { email: "test@neon.dev" },
  ]);

  const removeAccount = (email: string) => {
    setAccounts((prev) => prev.filter((a) => a.email !== email));
  };

  const logoutAll = () => {
    setAccounts([]);
    setOpen(false);
  };

  return (
    <>
      <aside className="w-16 bg-white border-r flex flex-col items-center py-4 gap-6 relative">
        {/* Profile Avatar */}
        <button
          onClick={() => setOpen((p) => !p)}
          className="h-10 w-10 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center hover:scale-105 transition"
        >
          T
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute left-16 top-4 w-64 rounded-xl bg-white shadow-xl border z-50 p-3">
            <p className="text-xs text-gray-500 mb-2">Accounts</p>

            <div className="space-y-2">
              {accounts.map((acc) => (
                <div
                  key={acc.email}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-100"
                >
                  <span className="text-sm truncate">{acc.email}</span>
                  <button
                    onClick={() => removeAccount(acc.email)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="my-3 h-px bg-gray-200" />

            {/* Add Account */}
            <button
              onClick={() => {
                setShowSignup(true);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
            >
              <Plus size={16} />
              Add account
            </button>

            {/* Logout all */}
            <button
              onClick={logoutAll}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} />
              Logout all
            </button>
          </div>
        )}

        {/* Rest Icons */}
        <Menu className="h-6 w-6 cursor-pointer" />
        <Bookmark className="h-6 w-6 cursor-pointer" />
        <Heart className="h-6 w-6 cursor-pointer" />
      </aside>

      {/* Signup Modal */}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSuccess={() => {
            setShowSignup(false);
            // later: refetch accounts from server
          }}
        />
      )}
    </>
  );
}
