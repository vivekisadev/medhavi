"use client";

import React from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  submitted: "#3b82f6",
  ai_verified: "#f59e0b",
  official_review: "#8b5cf6",
  approved: "#10b981",
  official_approved: "#10b981",
  rejected: "#ef4444",
  disbursed: "#059669",
  deficiency: "#f97316",
  deficiency_flagged: "#f97316",
};

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  ai_verified: "AI Verified",
  official_review: "Official Review",
  approved: "Approved",
  official_approved: "Approved",
  rejected: "Rejected",
  disbursed: "Disbursed",
  deficiency: "Deficiency",
  deficiency_flagged: "Flagged",
};

interface Props {
  data: Record<string, number>;
}

export function StatusPieChart({ data }: Props) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: STATUS_LABELS[key] || key,
    value,
    color: STATUS_COLORS[key] || "#a1a1aa",
  }));

  if (chartData.length === 0) return <p className="text-xs text-muted-foreground text-center py-8">No data</p>;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: "0.5rem", fontSize: "12px", border: "1px solid #e4e4e7" }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "11px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MeritBarChart({ data }: { data: { name: string; score: number }[] }) {
  if (data.length === 0) return <p className="text-xs text-muted-foreground text-center py-8">No data</p>;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
        <Tooltip
          contentStyle={{ borderRadius: "0.5rem", fontSize: "12px", border: "1px solid #e4e4e7" }}
        />
        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
          {data.map((entry, idx) => (
            <Cell
              key={idx}
              fill={entry.score >= 70 ? "#10b981" : entry.score >= 50 ? "#f59e0b" : "#ef4444"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SchemeComparisonChart({ nosCount, nfstCount }: { nosCount: number; nfstCount: number }) {
  const data = [
    { name: "NOS", applications: nosCount, fill: "#3b82f6" },
    { name: "NFST", applications: nfstCount, fill: "#8b5cf6" },
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ borderRadius: "0.5rem", fontSize: "12px", border: "1px solid #e4e4e7" }}
        />
        <Bar dataKey="applications" radius={[4, 4, 0, 0]}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TimelineChart({ data }: { data: { date: string; count: number }[] }) {
  if (data.length === 0) return <p className="text-xs text-muted-foreground text-center py-8">No data</p>;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ borderRadius: "0.5rem", fontSize: "12px", border: "1px solid #e4e4e7" }}
        />
        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
