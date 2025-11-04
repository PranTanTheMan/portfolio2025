"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchGitHubStats } from "@/app/data/actions";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

type GitHubStatsData = Exclude<
  Awaited<ReturnType<typeof fetchGitHubStats>>,
  null
>;

export function GitHubStats() {
  const [stats, setStats] = useState<GitHubStatsData | null>(null);
  const [view, setView] = useState<"daily" | "monthly">("monthly");

  useEffect(() => {
    fetchGitHubStats().then((data) => {
      if (data) {
        setStats(data);
      }
    });
  }, []);

  const dailyData = useMemo(() => {
    if (!stats) return [];
    return stats.contributionDays.slice(-365).map((day) => ({
      date: new Date(`${day.date}T00:00:00Z`),
      contributions: day.contributionCount,
    }));
  }, [stats]);

  const monthlyData = useMemo(() => {
    if (!dailyData.length) return [];
    return dailyData.reduce<
      Array<{
        monthYear: string;
        date: Date;
        contributions: number;
      }>
    >((acc, curr) => {
      const monthYear = `${curr.date.getUTCFullYear()}-${String(
        curr.date.getUTCMonth() + 1,
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
  }, [dailyData]);

  if (!stats) return null;

  const totalContributions = stats.totalContributions.toLocaleString();
  const averageDaily = stats.averageDailyContributions.toFixed(1);
  const busiestDayDate = stats.bestDay
    ? new Date(`${stats.bestDay.date}T00:00:00Z`)
    : null;
  const lastContributionDate = stats.lastContributionDate
    ? new Date(`${stats.lastContributionDate}T00:00:00Z`)
    : null;
  const topLanguage = stats.topLanguage;
  const topLanguages = stats.topLanguages;
  const churnAdditions = stats.pullRequestAdditions;
  const churnDeletions = stats.pullRequestDeletions;
  const churnRatio =
    churnAdditions > 0 ? churnDeletions / churnAdditions : null;

  const formatNumber = (value: number) =>
    Intl.NumberFormat("en-US").format(Math.round(value));

  const churnMessage = (() => {
    if (churnAdditions === 0 && churnDeletions === 0) {
      return "No pull request diffs tracked yet this year.";
    }
    if (churnAdditions === 0) {
      return "Every tracked pull request removed code without adding new lines.";
    }
    if (churnDeletions === 0) {
      return "You only added code in tracked pull requests this year.";
    }
    if (churnRatio && churnRatio >= 1) {
      return `You deleted ${churnRatio.toFixed(1)}× more code than you wrote this year.`;
    }
    const inverse = churnRatio ? 1 / churnRatio : 0;
    return `You wrote ${inverse.toFixed(1)}× more code than you deleted this year.`;
  })();
  const churnValue = (() => {
    if (churnAdditions === 0 && churnDeletions === 0) {
      return "—";
    }
    if (churnAdditions === 0) {
      return "All deletions";
    }
    if (churnDeletions === 0) {
      return "All additions";
    }
    if (churnRatio && churnRatio >= 1) {
      return `${churnRatio.toFixed(1)}× deleted`;
    }
    const inverse = churnRatio ? 1 / churnRatio : 0;
    return `${inverse.toFixed(1)}× added`;
  })();

  const statCards = [
    {
      label: "Current streak",
      value: `${stats.currentStreak} ${
        stats.currentStreak === 1 ? "day" : "days"
      }`,
      helper:
        stats.currentStreak > 0
          ? "Consecutive days of commits"
          : "No commits yet today",
    },
    {
      label: "Longest streak",
      value: `${stats.longestStreak} ${
        stats.longestStreak === 1 ? "day" : "days"
      }`,
      helper: "Personal best over the past year",
    },
    {
      label: "Last 7 days",
      value: stats.contributionsLast7Days.toLocaleString(),
      helper: "Contributions this week",
    },
    {
      label: "Last 30 days",
      value: stats.contributionsLast30Days.toLocaleString(),
      helper: "Monthly total so far",
    },
    {
      label: "Busiest day",
      value: stats.bestDay
        ? `${stats.bestDay.contributionCount.toLocaleString()} contributions`
        : "—",
      helper: busiestDayDate
        ? busiestDayDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "No contributions yet",
    },
    {
      label: "Average per day",
      value: averageDaily,
      helper: "Rolling 12 month average",
    },
  ];

  return (
    <div className="p-3">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <p className="text-xl font-mono text-neutral-900 dark:text-neutral-100">
            {totalContributions}
          </p>
          <p className="text-sm font-mono text-neutral-600 dark:text-neutral-400">
            contributions in the last year
          </p>
          {lastContributionDate && (
            <p className="text-xs font-mono text-neutral-500 dark:text-neutral-500 mt-1">
              Last contribution{" "}
              {lastContributionDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="flex gap-1 self-start md:self-auto">
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="border border-button-hover bg-button px-4 py-3 flex flex-col gap-1"
          >
            <span className="text-xs uppercase tracking-wide font-mono opacity-60">
              {card.label}
            </span>
            <span className="text-lg font-mono text-neutral-900 dark:text-neutral-100">
              {card.value}
            </span>
            <span className="text-xs font-mono opacity-70">{card.helper}</span>
          </div>
        ))}
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
              tickFormatter={(value) => {
                if (view === "monthly") {
                  const monthDate = new Date(`${value}-01T00:00:00Z`);
                  return monthDate.toLocaleDateString("en-US", {
                    month: "short",
                  });
                }
                const d = value instanceof Date ? value : new Date(value);
                return d.getUTCDate() === 1
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

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
        <div className="border border-button-hover bg-button px-4 py-4 flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide font-mono opacity-60">
            Top language
          </span>
          <span className="text-lg font-mono text-neutral-900 dark:text-neutral-100">
            {topLanguage ? topLanguage.name : "Not enough data"}
          </span>
          <span className="text-xs font-mono opacity-70">
            {topLanguage
              ? `${formatNumber(topLanguage.commitCount)} commits this year`
              : "We need more commits with language metadata to rank this."}
          </span>
          {topLanguages.length > 0 && (
            <div className="mt-2 space-y-1 text-[10px] font-mono opacity-50">
              {topLanguages.map((language, index) => (
                <div
                  key={`${language.name}-${index}`}
                  className="flex justify-between gap-2"
                >
                  <span>
                    {index + 1}. {language.name}
                  </span>
                  <span>{formatNumber(language.commitCount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border border-button-hover bg-button px-4 py-4 flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide font-mono opacity-60">
            Code churn karma
          </span>
          <span className="text-lg font-mono text-neutral-900 dark:text-neutral-100">
            {churnValue}
          </span>
          <span className="text-xs font-mono opacity-70">{churnMessage}</span>
          <span className="text-[10px] font-mono opacity-50">
            {`${formatNumber(churnAdditions)} additions · ${formatNumber(
              churnDeletions,
            )} deletions tracked via pull requests`}
          </span>
        </div>
      </div>
    </div>
  );
}
