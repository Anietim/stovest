"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

// Dark / Light switch. The choice is remembered in the browser (applied before paint by a script in layout.tsx).
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    const c = document.documentElement.classList;
    c.remove("dark", "light");
    c.add(next);
    try { localStorage.setItem("stovest-theme", next); } catch {}
    setTheme(next);
  };

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      aria-label="Toggle theme"
      className="p-2.5 rounded-full bg-[#101524] border border-[#1b243b] text-gray-400 hover:text-white transition-colors"
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}