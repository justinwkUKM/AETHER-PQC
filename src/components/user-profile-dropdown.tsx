"use client";

import React, { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Settings, Key, ShieldCheck, User } from "lucide-react";

type UserProfileDropdownProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export function UserProfileDropdown({ user }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const name = user.name || "Aether Operator";
  const email = user.email || "operator@aether.local";
  const avatarUrl = user.image;
  const avatarBackground = avatarUrl ? { backgroundImage: `url(${JSON.stringify(avatarUrl)})` } : undefined;

  // Get initials for fallback avatar
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Avatar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#05ffd1]/50 transition-all duration-200"
        aria-label="User menu"
      >
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#08111f] shadow-md transition-transform duration-200 hover:scale-105 active:scale-95 overflow-hidden">
          {avatarUrl ? (
            <div
              className="h-full w-full bg-cover bg-center"
              role="img"
              aria-label={name}
              style={avatarBackground}
            />
          ) : (
            <span className="font-mono text-xs font-semibold tracking-wider text-[#05ffd1]">
              {initials || "AO"}
            </span>
          )}
          {/* Subtle online badge */}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-[#050916] bg-emerald-400"></span>
        </div>
      </button>

      {/* Popover options panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-80 origin-top-right rounded-lg border border-white/10 bg-[#070d19]/95 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl z-50"
          >
            {/* Header / User Info */}
            <div className="flex items-center gap-3.5 px-3 py-3 border-b border-white/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#05ffd1]/20 bg-[#0b172a] overflow-hidden">
                {avatarUrl ? (
                  <div
                    className="h-full w-full bg-cover bg-center"
                    role="img"
                    aria-label={name}
                    style={avatarBackground}
                  />
                ) : (
                  <span className="font-mono text-sm font-semibold text-[#05ffd1]">{initials}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-100">{name}</p>
                <p className="truncate text-xs text-slate-400 font-mono mt-0.5">{email}</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <DropdownItem icon={<User className="h-4 w-4" />} label="Security profile" />
              <DropdownItem icon={<Settings className="h-4 w-4" />} label="Workspace preferences" />
              <DropdownItem icon={<Key className="h-4 w-4" />} label="API access keys" />
              <div className="flex items-center justify-between px-3 py-2 text-xs text-emerald-400 bg-emerald-500/5 rounded-md mx-1 my-1 border border-emerald-500/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Authenticated Session</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider bg-emerald-500/20 px-1.5 py-0.5 rounded font-mono">Active</span>
              </div>
            </div>

            {/* Footer / Sign Out */}
            <div className="border-t border-white/5 p-1">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors duration-150 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out of Aether</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type DropdownItemProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
};

function DropdownItem({ icon, label, onClick }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-slate-100 transition-colors duration-150 cursor-pointer"
    >
      <span className="text-slate-500">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
