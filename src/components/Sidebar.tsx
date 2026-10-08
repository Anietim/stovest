"use client";

import React from "react";
import {
  LayoutDashboard,
  PieChart,
  LineChart,
  Store,
  Users,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName?: string;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  userName = "Naya",
}: SidebarProps) {
  const mainMenu = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "portfolio", label: "Portfolio", icon: PieChart },
    { id: "analysis", label: "Analysis", icon: LineChart },
    { id: "market", label: "Market", icon: Store },
  ];

  const supportMenu = [
    { id: "community", label: "Community", icon: Users },
    { id: "support", label: "Help & Support", icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-[#090d16] border-r border-[#151c2d] flex flex-col justify-between py-6 px-5 shrink-0 select-none">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 mb-8 cursor-pointer group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              Stovest
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse"></span>
            </span>
            <span className="text-[10px] text-gray-500 tracking-wider uppercase block font-medium">
              Africa & Global
            </span>
          </div>
        </div>

        {/* User Welcome Block */}
        <div className="px-2 mb-8">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Welcome, {userName}
          </h2>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Here&apos;s your stock portfolio overview
          </p>
        </div>

        {/* Main Menu */}
        <div className="space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Main Menu
            </p>
            <nav className="space-y-1.5">
              {mainMenu.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#1868fe] text-white shadow-lg shadow-blue-600/30 font-semibold"
                        : "text-gray-400 hover:text-gray-200 hover:bg-[#121827]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Support Section */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Support
            </p>
            <nav className="space-y-1.5">
              {supportMenu.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#1868fe] text-white shadow-lg shadow-blue-600/30"
                        : "text-gray-400 hover:text-gray-200 hover:bg-[#121827]"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Markets Mini Badge */}
      <div className="bg-[#101524] border border-[#1b2338] rounded-2xl p-3.5 mx-1">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-gray-400 font-medium">Market Feeds</span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Live
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-300">
          <span>NGX · JSE · NSE</span>
          <span className="text-blue-400 font-semibold">NYSE · NSDQ</span>
        </div>
      </div>
    </aside>
  );
}
