"use client";

import { useEffect, useState } from "react";
import { fetchGitHubStats } from "@/app/data/actions";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

export function GitHubStats() {
  const [stats, setStats] = useState<any>(null);
  const [view, setView] = useState<"daily" | "monthly">("monthly");

  useEffect(() => {
    fetchGitHubStats().then((data) => {
      if (data) {
        setStats(data);
      }
    });
  }, []);

  if (!stats) return null;

  const dailyData = stats.contributionDays
    .slice(-365)
    .map((day: { date: string; contributionCount: number }) => ({
      date: new Date(day.date),
      contributions: day.contributionCount,
    }));

  const monthlyData = dailyData.reduce((acc: any[], curr: any) => {
    const monthYear = `${curr.date.getFullYear()}-${String(
      curr.date.getMonth() + 1
    ).padStart(2, "0")}`;
    const existing = acc.find((item) => item.monthYear === monthYear);
    if (existing) {
      existing.contributions += curr.contributions;
    } else {
      acc.push({
        monthYear,
        date: curr.date,
        contributions: curr.contributions,
      });
    }
    return acc;
  }, []);

  const totalContributions = stats.contributionDays.reduce(
    (acc: number, curr: any) => acc + curr.contributionCount,
    0
  );

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xl font-mono text-neutral-900 dark:text-neutral-100">
            {totalContributions.toLocaleString()}
          </p>
          <p className="text-sm font-mono text-neutral-600 dark:text-neutral-400">
            contributions in the last year
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setView("daily")}
            className={`px-3 py-1.5 text-sm transition-colors font-mono ${
              view === "daily"
                ? "bg-button-hover text-neutral-900 "
                : "text-neutral-600  hover:text-neutral-900 "
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setView("monthly")}
            className={`px-3 py-1.5 text-sm transition-colors font-mono ${
              view === "monthly"
                ? "bg-button-hover  text-neutral-900 "
                : "text-neutral-600  hover:text-neutral-900 "
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={view === "daily" ? dailyData : monthlyData}
            margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorLight" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="rgb(92, 83, 66)"
                  stopOpacity={0.25}
                />
                <stop
                  offset="95%"
                  stopColor="rgb(92, 83, 66)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey={view === "daily" ? "date" : "monthYear"}
              tickFormatter={(date) => {
                if (view === "monthly") {
                  return new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                  });
                }
                const d = new Date(date);
                return d.getDate() === 1
                  ? d.toLocaleDateString("en-US", { month: "short" })
                  : "";
              }}
              interval={view === "monthly" ? 0 : "preserveStartEnd"}
              tick={{ fontSize: 12 }}
              stroke="rgb(163, 163, 163)"
              axisLine={false}
              tickLine={false}
              dy={10}
              dx={-20}
            />
            <YAxis hide />
            <Area
              type="monotone"
              dataKey="contributions"
              stroke="rgb(92, 83, 66)"
              strokeWidth={1.5}
              fill="url(#colorLight)"
              className="dark:stroke-neutral-300 dark:fill-[url(#colorDark)]"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
