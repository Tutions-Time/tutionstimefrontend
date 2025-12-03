"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function KPIBarChart({ data, label, gradientId, color1, color2 }: any) {
  return (
    <div className="w-full bg-white border rounded-2xl p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-4">{label}</h3>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={40}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color1} stopOpacity={1} />
                <stop offset="100%" stopColor={color2} stopOpacity={0.5} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#4B5563" }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
            />

            <YAxis
              tick={{ fontSize: 12, fill: "#4B5563" }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #eee",
                background: "white",
                padding: "10px 14px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ fontWeight: 600 }}
            />

            <Legend height={30} />

            <Bar
              dataKey="value"
              fill={`url(#${gradientId})`}
              radius={[10, 10, 0, 0]}
              name={label}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
