"use client";

import React, { useState, useMemo } from "react";
import { PERFORMANCE_TIMEFRAMES, CURRENCY_RATES } from "../data/mockData";
import { CurrencyCode, ChartDataPoint } from "../types";

interface PerformanceChartProps {
  currency: CurrencyCode;
}

export default function PerformanceChart({ currency }: PerformanceChartProps) {
  const [timeframe, setTimeframe] = useState<string>("6M");
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const [hoveredCoords, setHoveredCoords] = useState<{ x: number; y: number } | null>(null);

  const rateInfo = CURRENCY_RATES[currency];
  const timeframes = ["1D", "1W", "1M", "6M", "1Y"];

  const rawData = useMemo(() => {
    return PERFORMANCE_TIMEFRAMES[timeframe] || PERFORMANCE_TIMEFRAMES["6M"];
  }, [timeframe]);

  // Chart layout dimensions
  const width = 1000;
  const height = 300;
  const padding = { top: 25, right: 30, bottom: 45, left: 55 };

  // Y-axis bounds
  const minVal = 0;
  const maxVal = 210000;

  // Coordinate mapper
  const points = useMemo(() => {
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    return rawData.map((d, index) => {
      const x = padding.left + (index / (rawData.length - 1)) * chartW;
      const normalizedY = (d.value - minVal) / (maxVal - minVal);
      const y = height - padding.bottom - normalizedY * chartH;
      return { ...d, x, y };
    });
  }, [rawData]);

  // Generate smooth cubic bezier SVG path
  const { pathD, areaD } = useMemo(() => {
    if (points.length === 0) return { pathD: "", areaD: "" };

    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      linePath += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = height - padding.bottom;

    const fillPath = `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

    return { pathD: linePath, areaD: fillPath };
  }, [points]);

  // Handle active tooltip
  const activeTooltip = useMemo(() => {
    if (hoveredPoint && hoveredCoords) {
      return {
        point: hoveredPoint,
        x: hoveredCoords.x,
        y: hoveredCoords.y,
      };
    }
    // Default prominent marker matching the mockup at 1st Mar 2024
    const defaultPoint = points.find((p) => p.displayDate === "1st Mar") || points[Math.floor(points.length / 2)];
    if (!defaultPoint) return null;
    return {
      point: defaultPoint,
      x: defaultPoint.x,
      y: defaultPoint.y,
    };
  }, [hoveredPoint, hoveredCoords, points]);

  const yTicks = [
    { label: "200k", val: 200000 },
    { label: "150k", val: 150000 },
    { label: "100k", val: 100000 },
    { label: "50k", val: 50000 },
    { label: "10k", val: 10000 },
  ];

  // Helper to format currency
  const formatValue = (valUSD: number) => {
    const converted = valUSD * rateInfo.rate;
    if (converted >= 1000000) {
      return `${rateInfo.symbol} ${(converted / 1000000).toFixed(2)}M`;
    }
    return `${rateInfo.symbol} ${converted.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="rounded-3xl bg-[#0c101b] border border-[#172033] p-6 shadow-card hover:border-[#202c47] transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Portfolio Performance
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time multi-asset growth curve & valuation history
          </p>
        </div>

        {/* Timeframe pill buttons */}
        <div className="flex items-center gap-1.5 bg-[#101524] p-1 rounded-full border border-[#1b233a]">
          {timeframes.map((tf) => {
            const isActive = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => {
                  setTimeframe(tf);
                  setHoveredPoint(null);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#1868fe] text-white shadow-md shadow-blue-600/40"
                    : "text-gray-400 hover:text-white hover:bg-[#151c2e]"
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          onMouseLeave={() => {
            setHoveredPoint(null);
            setHoveredCoords(null);
          }}
        >
          <defs>
            {/* Linear gradient for area fill */}
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1868fe" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#1868fe" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#1868fe" stopOpacity="0.00" />
            </linearGradient>

            {/* Glowing filter for line */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#1868fe" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Horizontal grid lines */}
          {yTicks.map((tick) => {
            const chartH = height - padding.top - padding.bottom;
            const y = height - padding.bottom - (tick.val / maxVal) * chartH;
            return (
              <g key={tick.label}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#161e30"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 12}
                  y={y + 4}
                  fill="#54627d"
                  fontSize="10"
                  textAnchor="end"
                  fontWeight="500"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Glowing Main Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#1d72fe"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Active Tooltip and Marker */}
          {activeTooltip && (
            <g>
              {/* Dotted vertical dropped guideline */}
              <line
                x1={activeTooltip.x}
                y1={activeTooltip.y}
                x2={activeTooltip.x}
                y2={height - padding.bottom}
                stroke="#1868fe"
                strokeDasharray="3 3"
                strokeWidth="1.5"
                opacity="0.8"
              />

              {/* Glowing Outer Dot */}
              <circle
                cx={activeTooltip.x}
                cy={activeTooltip.y}
                r="6"
                fill="#1868fe"
                stroke="#ffffff"
                strokeWidth="2"
                filter="url(#glow)"
              />

              {/* Tooltip Card (Styled matching mockup) */}
              <foreignObject
                x={Math.max(10, Math.min(width - 150, activeTooltip.x - 70))}
                y={Math.max(10, activeTooltip.y - 75)}
                width="140"
                height="65"
              >
                <div className="bg-[#101524]/95 border border-[#232f4c] rounded-xl p-2.5 shadow-2xl backdrop-blur-md text-center">
                  <div className="text-[10px] text-gray-400 font-medium">
                    {activeTooltip.point.displayDate} 2024
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5 flex items-center justify-center gap-1.5">
                    <span>{formatValue(activeTooltip.point.value)}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                      +0.8%
                    </span>
                  </div>
                </div>
              </foreignObject>
            </g>
          )}

          {/* Invisible hover interaction hit areas for points */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="14"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => {
                setHoveredPoint(pt);
                setHoveredCoords({ x: pt.x, y: pt.y });
              }}
            />
          ))}

          {/* X-axis date labels */}
          {points.map((pt, i) => {
            // Show every second date on dense views
            const shouldShow = points.length <= 10 || i % 2 === 0 || i === points.length - 1;
            if (!shouldShow) return null;
            return (
              <text
                key={i}
                x={pt.x}
                y={height - padding.bottom + 22}
                fill="#54627d"
                fontSize="10"
                textAnchor="middle"
                fontWeight="500"
              >
                {pt.displayDate}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
