"use client"

import React, { useState } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const dummyData = {
  week: [
    { name: "Sun", revenue: 15000 },
    { name: "Mon", revenue: 28000 },
    { name: "Tue", revenue: 40000 }, 
    { name: "Wed", revenue: 22000 },
    { name: "Thu", revenue: 32000 },
    { name: "Fri", revenue: 22000 },
    { name: "Sat", revenue: 38000 },
  ],
  month: [
    { name: "Week 1", revenue: 45000 },
    { name: "Week 2", revenue: 28000 },
    { name: "Week 3", revenue: 55000 },
    { name: "Week 4", revenue: 38000 },
  ],
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="flex flex-col items-center justify-center mb-1">
        <div className="bg-[#f95d2c] text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-md text-center border border-orange-400">
          <p className="opacity-90 text-[10px]">Thursday</p>
          <p className="font-bold">{(payload[0].value / 1000).toFixed(0)}k</p>
        </div>
        <div className="w-2.5 h-2.5 bg-white border-2 border-[#f95d2c] rounded-full mt-1 shadow-sm" />
      </div>
    )
  }
  return null
}

export default function RevenueChart() {
  const [timeframe, setTimeframe] = useState<"week" | "month">("week")

  return (
    <div className="w-full bg-white rounded-xl py-8 px-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] ">
      
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-slate-800 text-lg tracking-tight">Revenue</h3>
        
        <div className="bg-orange-50/60 p-1 rounded-xl flex items-center gap-1 border border-orange-100/50">
          <button
            onClick={() => setTimeframe("week")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
              timeframe === "week"
                ? "bg-white text-[#f95d2c] shadow-[0_2px_4px_rgba(0,0,0,0.05)]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeframe("month")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
              timeframe === "month"
                ? "bg-white text-[#f95d2c] shadow-[0_2px_4px_rgba(0,0,0,0.05)]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      <div className="h-[240px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={dummyData[timeframe]}
            margin={{ top: 35, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
          
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f95d2c" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f95d2c" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 400 }}
              dy={15}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              domain={[0, 50000]}
              ticks={[0, 10000, 20000, 30000, 40000, 50000]}
              tickFormatter={(value) => (value === 0 ? "0k" : `${value / 1000}k`)}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#f95d2c",
                strokeDasharray: "3 3",
                strokeWidth: 1.5,
              }}
              offset={-20}
            />

            <Area
              type="monotone" 
              dataKey="revenue"
              stroke="#f95d2c"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}