"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LiveTickerTape from "../components/LiveTickerTape";
import TotalHoldingCard from "../components/TotalHoldingCard";
import PortfolioHoldingsScroll from "../components/PortfolioHoldingsScroll";
import PerformanceChart from "../components/PerformanceChart";
import PortfolioOverviewTable from "../components/PortfolioOverviewTable";
import WatchlistPanel from "../components/WatchlistPanel";
import NewsSection from "../components/NewsSection";
import StockDetailModal from "../components/StockDetailModal";
import AiSearchModal from "../components/AiSearchModal";
import SettingsModal from "../components/SettingsModal";

// Views
import PortfolioView from "../components/views/PortfolioView";
import MarketView from "../components/views/MarketView";
import WalletsView from "../components/views/WalletsView";
import { CURRENCY_RATES } from "../data/mockData";
import { useAuth } from "../lib/useAuth";
import AnalysisView from "../components/views/AnalysisView";
import CommunityView from "../components/views/CommunityView";
import SupportView from "../components/views/SupportView";

import {
  INITIAL_HOLDINGS,
  PORTFOLIO_OVERVIEW_STOCKS,
  WATCHLIST_ITEMS,
} from "../data/mockData";
import { CurrencyCode, StockHolding, MarketStock, WatchlistStock } from "../types";

export default function DashboardPage() {
  const { user: authUser, profile: authProfile } = useAuth();
  const welcomeName = authProfile?.full_name?.trim().split(/\s+/)[0] || authUser?.email?.split("@")[0] || "Guest";
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [activeTopPill, setActiveTopPill] = useState<string>("Market");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [selectedHoldingRange, setSelectedHoldingRange] = useState("6M");
  const [holdings, setHoldings] = useState<StockHolding[]>(INITIAL_HOLDINGS);
  const [marketStocks, setMarketStocks] = useState<MarketStock[]>(PORTFOLIO_OVERVIEW_STOCKS);
  const [selectedStock, setSelectedStock] = useState<any | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [loadingRealData, setLoadingRealData] = useState(false);
  const [liveCount, setLiveCount] = useState(0);
  const [lastSynced, setLastSynced] = useState<string>("");

  // Fetch real live quotes and FX rates from our Next.js /api/stocks endpoint
  const fetchRealMarketData = async () => {
    try {
      setLoadingRealData(true);
      const headers: Record<string, string> = {};
      try {
        const fk = localStorage.getItem("STOVEST_FINNHUB_KEY");
        const ek = localStorage.getItem("STOVEST_EODHD_KEY");
        if (fk) headers["x-finnhub-key"] = fk;
        if (ek) headers["x-eodhd-key"] = ek;
        const nk = localStorage.getItem("STOVEST_NGN_KEY");
        if (nk) headers["x-ngnmarket-key"] = nk;
      } catch {}
      const res = await fetch("/api/stocks", { headers, cache: "no-store" });
      if (!res.ok) throw new Error("API response error");
      const json = await res.json();

      const liveQuotes = Array.isArray(json.data) ? json.data.filter((q: any) => q.live) : [];
      setLiveCount(liveQuotes.length);
      // Use live FX instead of the hard-coded table
      if (json.rates) {
        (["NGN", "ZAR", "KES"] as const).forEach((c) => {
          if (json.rates[c] > 0) CURRENCY_RATES[c].rate = json.rates[c];
        });
      }
      if (liveQuotes.length > 0) {
        setIsLiveConnected(true);
        setLastSynced(new Date().toLocaleTimeString());
        json.data = liveQuotes;

        // Map live quotes into marketStocks table
        const liveMarketList: MarketStock[] = json.data.map((q: any) => ({
          ticker: q.symbol,
          name: q.name,
          exchange: q.exchange,
          country: q.country,
          flag: q.flag,
          priceUSD: q.price,
          changePercent: q.changePercent,
          marketCap: q.marketCap || "$ 45.0 B",
          volume: q.volume || "$ 150 M",
          sparkline: q.sparkline || [q.price * 0.98, q.price * 0.99, q.price],
          category: q.changePercent >= 0 ? "gainers" : "losers",
          sector: q.region === "Africa" ? "Pan-African Equities" : "US Megacap Tech",
          description: `${q.name} actively traded on ${q.exchange}.`,
        }));

        setMarketStocks(liveMarketList);

        // Update holdings with real live prices for matching tickers
        setHoldings((prevHoldings) =>
          prevHoldings.map((h) => {
            const liveMatch = json.data.find(
              (q: any) => q.symbol.toUpperCase() === h.ticker.toUpperCase()
            );
            if (liveMatch) {
              return {
                ...h,
                priceUSD: liveMatch.price,
                changePercent: liveMatch.changePercent,
                changeValue: liveMatch.change,
              };
            }
            return h;
          })
        );
      }
    } catch (err) {
      setIsLiveConnected(false);
      console.warn("Using baseline data with live tickers:", err);
    } finally {
      setLoadingRealData(false);
    }
  };

  useEffect(() => {
    fetchRealMarketData();
    // auto-refresh every 60s (matches server cache TTL)
    const id = setInterval(fetchRealMarketData, 60000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cmd/Ctrl+K opens AI search, Esc closes overlays
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAiInitialQuery("");
        setAiModalOpen(true);
      } else if (e.key === "Escape") {
        setAiModalOpen(false);
        setSettingsOpen(false);
        setSelectedStock(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Synchronize top pills with sidebar navigation where relevant
  const handleTopPillChange = (pill: string) => {
    setActiveTopPill(pill);
    if (pill === "Market") setActiveTab("market");
    if (pill === "Wallets") setActiveTab("wallets");
    if (pill === "Tools") setActiveTab("analysis");
  };

  const handleSidebarTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "market") setActiveTopPill("Market");
    else if (tab === "analysis") setActiveTopPill("Tools");
    else if (activeTopPill === "Wallets" && tab !== "wallets") setActiveTopPill("");
  };

  const handleOpenAiSearch = (query?: string) => {
    setAiInitialQuery(query || "");
    setAiModalOpen(true);
  };

  const handleStockClick = (stock: StockHolding | MarketStock | WatchlistStock) => {
    setSelectedStock(stock);
  };

  const handleAddToPortfolio = (stock: any, units: number) => {
    setHoldings((prev) => {
      const existing = prev.find((h) => h.ticker === stock.ticker);
      if (existing) {
        return prev.map((h) =>
          h.ticker === stock.ticker ? { ...h, units: h.units + units } : h
        );
      }
      return [
        {
          ticker: stock.ticker,
          name: stock.name || stock.ticker,
          exchange: (stock.exchange as any) || "GLOBAL",
          country: stock.country || "Global",
          priceUSD: stock.priceUSD || 100,
          changePercent: stock.changePercent || 1.2,
          changeValue: 1.5,
          units: units,
          region: ["NGX", "JSE", "NSE"].includes(stock.exchange) ? "Africa" : "US",
        },
        ...prev,
      ];
    });
  };

  const handleSellUnits = (ticker: string, unitsToSell: number) => {
    setHoldings((prev) =>
      prev
        .map((h) => {
          if (h.ticker === ticker) {
            const remaining = h.units - unitsToSell;
            return remaining > 0 ? { ...h, units: remaining } : null;
          }
          return h;
        })
        .filter(Boolean) as StockHolding[]
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#05070c] p-2 sm:p-4">
      {/* Outer Dashboard Frame matching reference mockup */}
      <div className="flex-1 flex overflow-hidden rounded-3xl dashboard-frame bg-[#090d16] border border-[#141d30]">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleSidebarTabChange}
          userName={welcomeName}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#070a12]">
          {/* Live Ticker Tape Header */}
          <LiveTickerTape />

          {/* Top Bar Header */}
          <Header
            onOpenAiSearchAction={handleOpenAiSearch}
            currency={currency}
            setCurrencyAction={setCurrency}
            activeTopPill={activeTopPill}
            setActiveTopPillAction={handleTopPillChange}
            onOpenSettingsAction={() => setSettingsOpen(true)}
          />

          {/* Live Data Connection Banner (reflects real connection state) */}
          <div className="bg-[#0b101c] border-b border-[#141d30] px-7 py-1.5 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                {isLiveConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveConnected ? "bg-emerald-500" : "bg-amber-500"}`}></span>
              </span>
              <span className="text-gray-300 font-medium">
                Live Data Pipeline:{" "}
                <strong className={isLiveConnected ? "text-emerald-400" : "text-amber-400"}>
                  {loadingRealData && !isLiveConnected ? "Connecting…" : isLiveConnected ? "Connected" : "Offline – showing sample data"}
                </strong>
              </span>
              <span className="text-gray-500 hidden sm:inline">
                {isLiveConnected
                  ? `(${liveCount} live quotes${lastSynced ? ` · synced ${lastSynced}` : ""})`
                  : "(Yahoo Finance & Open FX unreachable)"}
              </span>
            </div>

            <button
              onClick={fetchRealMarketData}
              disabled={loadingRealData}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors disabled:opacity-60"
            >
              <span className={loadingRealData ? "animate-spin" : ""}>↻</span>
              <span>{loadingRealData ? "Syncing..." : "Sync Live Quotes"}</span>
            </button>
          </div>

          {/* Scrollable Dashboard Body */}
          <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Conditional Views */}
            {activeTopPill === "Wallets" ? (
              <WalletsView currentCurrency={currency} />
            ) : activeTab === "portfolio" ? (
              <PortfolioView
                holdings={holdings}
                currency={currency}
                onSelectStock={handleStockClick}
                onSellUnits={handleSellUnits}
                onBuyMore={(stock) => setSelectedStock(stock)}
              />
            ) : activeTab === "market" ? (
              <MarketView
                stocks={marketStocks}
                currency={currency}
                onSelectStock={handleStockClick}
                onQuickAdd={(stock) => handleAddToPortfolio(stock, 10)}
              />
            ) : activeTab === "analysis" ? (
              <AnalysisView currency={currency} />
            ) : activeTab === "community" ? (
              <CommunityView onSelectTickerAction={(t) => { const f = marketStocks.find((m) => m.ticker === t); if (f) setSelectedStock(f); }} />
            ) : activeTab === "support" ? (
              <SupportView onOpenSettingsAction={() => setSettingsOpen(true)} />
            ) : (
              /* Default Main Dashboard (Exact Reference Mockup Layout) */
              <>
                {/* Top Row: Total Holding + My Portfolio Horizontal Scroll */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                  <div className="xl:col-span-4">
                    <TotalHoldingCard
                      currency={currency}
                      selectedRange={selectedHoldingRange}
                      setSelectedRange={setSelectedHoldingRange}
                      baseAmountUSD={12304.11}
                    />
                  </div>
                  <div className="xl:col-span-8 flex">
                    <PortfolioHoldingsScroll
                      holdings={holdings}
                      currency={currency}
                      onSelectStock={handleStockClick}
                      onSeeAll={() => setActiveTab("portfolio")}
                    />
                  </div>
                </div>

                {/* Middle Row: Portfolio Performance Curved Area Chart */}
                <div>
                  <PerformanceChart currency={currency} />
                </div>

                {/* Bottom Row: Portfolio Overview Table + Watchlist Panel */}
                <div className="flex flex-col lg:flex-row gap-5">
                  <PortfolioOverviewTable
                    stocks={marketStocks}
                    currency={currency}
                    onSelectStock={handleStockClick}
                  />
                  <WatchlistPanel
                    initialItems={WATCHLIST_ITEMS}
                    currency={currency}
                    onSelectStock={handleStockClick}
                    onAddToPortfolio={(ticker) => {
                      const found = marketStocks.find((s) => s.ticker === ticker);
                      if (found) handleAddToPortfolio(found, 10);
                    }}
                  />
                </div>

                {/* Pan-African & Global Market News Feed */}
                <div className="pt-2">
                  <NewsSection />
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Interactive Modals */}
      <StockDetailModal
        stock={selectedStock}
        currency={currency}
        onClose={() => setSelectedStock(null)}
        onAddToPortfolio={handleAddToPortfolio}
      />

      <AiSearchModal
        isOpen={aiModalOpen}
        initialQuery={aiInitialQuery}
        onClose={() => setAiModalOpen(false)}
        onSelectTicker={(ticker) => {
          setAiModalOpen(false);
          const found = marketStocks.find((s) => s.ticker === ticker);
          if (found) setSelectedStock(found);
        }}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onCloseAction={() => setSettingsOpen(false)}
        onRefreshDataAction={fetchRealMarketData}
      />
    </div>
  );
}