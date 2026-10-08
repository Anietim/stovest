"use client";

import React, { useState } from "react";
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, RefreshCw, CheckCircle2 } from "lucide-react";
import { CurrencyCode } from "../../types";

interface WalletsViewProps {
  currentCurrency: CurrencyCode;
}

export default function WalletsView({ currentCurrency }: WalletsViewProps) {
  const [wallets, setWallets] = useState([
    { code: "USD", name: "US Dollar Balance", symbol: "$", balance: 4250.00, flag: "🇺🇸" },
    { code: "NGN", name: "Nigerian Naira Balance", symbol: "₦", balance: 2500000.00, flag: "🇳🇬" },
    { code: "ZAR", name: "South African Rand Balance", symbol: "R", balance: 18500.00, flag: "🇿🇦" },
    { code: "KES", name: "Kenyan Shilling Balance", symbol: "KSh", balance: 95000.00, flag: "🇰🇪" },
  ]);

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedWalletCode, setSelectedWalletCode] = useState<string>("USD");
  const [depositAmount, setDepositAmount] = useState<string>("500");
  const [depositMethod, setDepositMethod] = useState<string>("card");
  const [depositSuccess, setDepositSuccess] = useState(false);

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(depositAmount);
    if (isNaN(num) || num <= 0) return;

    setWallets((prev) =>
      prev.map((w) => (w.code === selectedWalletCode ? { ...w, balance: w.balance + num } : w))
    );

    setDepositSuccess(true);
    setTimeout(() => {
      setDepositSuccess(false);
      setDepositModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-500" />
            Multi-Currency Investment Wallets
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Hold and convert between African local currencies and US Dollars seamlessly
          </p>
        </div>

        <button
          onClick={() => setDepositModalOpen(true)}
          className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Funds / Deposit</span>
        </button>
      </div>

      {/* Grid of 4 Currency Wallets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {wallets.map((wallet) => (
          <div
            key={wallet.code}
            className="rounded-3xl bg-[#0c101b] border border-[#172033] p-5 shadow-card hover:border-blue-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{wallet.flag}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#141c2e] text-blue-400 border border-blue-500/20 font-mono">
                  {wallet.code}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-medium">{wallet.name}</span>
              <div className="text-2xl font-black text-white mt-1">
                {wallet.symbol} {wallet.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#161e30] flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedWalletCode(wallet.code);
                  setDepositModalOpen(true);
                }}
                className="flex-1 py-1.5 rounded-xl bg-[#141b2c] hover:bg-blue-600 hover:text-white text-gray-300 text-[11px] font-semibold transition-all flex items-center justify-center gap-1"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" /> Deposit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Rails / Partner Badge */}
      <div className="rounded-3xl bg-[#0c101b] border border-[#172033] p-6 text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-white block mb-0.5">Supported Payment & Funding Rails:</span>
          <span>Nigeria (NIBSS, Paystack, Flutterwave) · South Africa (Ozow, EFT) · Kenya (M-Pesa Express) · Global (Debit/Credit Cards, Swift Wire)</span>
        </div>
        <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-semibold shrink-0">
          Instant Settlement
        </span>
      </div>

      {/* Deposit Modal */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0e1320] border border-[#1e2840] rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Simulate Wallet Funding</h3>
            <p className="text-xs text-gray-400 mb-4">
              Add simulated paper funds to test buying African or US shares.
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1.5">Select Wallet</label>
                <select
                  value={selectedWalletCode}
                  onChange={(e) => setSelectedWalletCode(e.target.value)}
                  className="w-full bg-[#121828] border border-[#1d273f] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {wallets.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.flag} {w.code} - {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1.5">Funding Method</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: "card", label: "Debit Card" },
                    { id: "transfer", label: "Bank Transfer" },
                    { id: "mpesa", label: "M-Pesa Mobile" },
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setDepositMethod(m.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        depositMethod === m.id
                          ? "bg-blue-600/20 border-blue-500 text-white font-bold"
                          : "bg-[#121828] border-[#1d273f] text-gray-400 hover:text-white"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1.5">Deposit Amount</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-[#121828] border border-[#1d273f] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  min="1"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-[#141b2c] text-gray-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={depositSuccess}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    depositSuccess
                      ? "bg-emerald-600 text-white"
                      : "bg-[#1868fe] hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                  }`}
                >
                  {depositSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Deposit Success!
                    </>
                  ) : (
                    "Confirm Deposit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
