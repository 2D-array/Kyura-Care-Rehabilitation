"use client"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: 'W1', progress: 20 },
  { name: 'W2', progress: 35 },
  { name: 'W3', progress: 45 },
  { name: 'W4', progress: 65 },
  { name: 'W5', progress: 80 },
  { name: 'W6', progress: 95 },
]

export function RecoveryChart() {
  return (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs font-semibold fill-slate-500" />
          <YAxis axisLine={false} tickLine={false} className="text-xs font-semibold fill-slate-500" />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }} 
            itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
          />
          <Area type="monotone" dataKey="progress" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorProgress)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
