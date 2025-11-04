"use server";

interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface ContributionData {
  totalContributions: number;
  contributionDays: ContributionDay[];
}

type LanguageStat = {
  name: string;
  commitCount: number;
};

interface ContributionSummary extends ContributionData {
  currentStreak: number;
  longestStreak: number;
  bestDay: ContributionDay | null;
  contributionsLast7Days: number;
  contributionsLast30Days: number;
  averageDailyContributions: number;
  lastContributionDate: string | null;
  topLanguage: LanguageStat | null;
  topLanguages: LanguageStat[];
  pullRequestAdditions: number;
  pullRequestDeletions: number;
  privateContributionsIncluded: boolean;
}

interface LatestCommit {
  repository: {
    name: string;
    owner: string;
    url: string;
  };
  committedDate: string;
  message: string;
  additions: number;
  deletions: number;
}

export async function fetchGitHubStats(): Promise<ContributionSummary | null> {
  const buildQuery = (includePrivate: boolean) => `
    query {
      viewer {
        contributionsCollection${
          includePrivate ? "(includePrivateContributions: true)" : ""
        } {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
          commitContributionsByRepository(maxRepositories: 50) {
            repository {
              primaryLanguage {
                name
              }
            }
            contributions {
              totalCount
            }
          }
          pullRequestContributions(last: 100) {
            nodes {
              pullRequest {
                additions
                deletions
              }
            }
          }
        }
      }
    }
  `;

  async function requestStats(
    includePrivate: boolean,
  ): Promise<{ data: any; insufficientScope: boolean }> {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: buildQuery(includePrivate),
      }),
    });

    const json = await response.json();

    if (json.errors) {
      const insufficientScope = json.errors.some((error: any) => {
        const code = error?.type || error?.extensions?.code;
        const message =
          typeof error?.message === "string" ? error.message.toLowerCase() : "";
        return (
          code === "INSUFFICIENT_SCOPES" ||
          code === "FORBIDDEN" ||
          message.includes("insufficient scopes") ||
          message.includes("includeprivatecontributions") ||
          message.includes(
            "doesn't accept argument 'includeprivatecontributions'",
          )
        );
      });

      if (insufficientScope) {
        return { data: null, insufficientScope: true };
      }

      console.error("GitHub GraphQL errors:", json.errors);
      throw new Error("Failed to fetch GitHub stats");
    }

    return { data: json.data, insufficientScope: false };
  }

  try {
    let privateIncluded = true;
    let result = await requestStats(true);

    if (result.insufficientScope || !result.data?.viewer) {
      privateIncluded = false;
      console.warn(
        "Retrying GitHub stats request without private contributions.",
      );
      result = await requestStats(false);
    }

    if (!result.data?.viewer) {
      return null;
    }

    const contributionCalendar =
      result.data.viewer.contributionsCollection.contributionCalendar;

    const contributionDays: ContributionDay[] =
      contributionCalendar.weeks.flatMap((week: any) => week.contributionDays);

    const sortedDays = contributionDays
      .map((day) => ({
        ...day,
        parsedDate: new Date(`${day.date}T00:00:00Z`),
      }))
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    if (sortedDays.length === 0) {
      return {
        totalContributions: 0,
        contributionDays: [],
        currentStreak: 0,
        longestStreak: 0,
        bestDay: null,
        contributionsLast7Days: 0,
        contributionsLast30Days: 0,
        averageDailyContributions: 0,
        lastContributionDate: null,
        topLanguage: null,
        topLanguages: [],
        pullRequestAdditions: 0,
        pullRequestDeletions: 0,
        privateContributionsIncluded: privateIncluded,
      };
    }

    const totalContributions =
      contributionCalendar.totalContributions ??
      sortedDays.reduce((acc, day) => acc + day.contributionCount, 0);

    let longestStreak = 0;
    let tempStreak = 0;
    const msPerDay = 24 * 60 * 60 * 1000;

    for (const day of sortedDays) {
      if (day.contributionCount > 0) {
        tempStreak += 1;
      } else {
        tempStreak = 0;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    let currentStreak = 0;
    for (let i = sortedDays.length - 1; i >= 0; i -= 1) {
      if (sortedDays[i].contributionCount > 0) {
        currentStreak += 1;
      } else {
        break;
      }
    }

    const bestDay = sortedDays.reduce<ContributionDay | null>((max, day) => {
      if (!max || day.contributionCount > max.contributionCount) {
        return {
          date: day.date,
          contributionCount: day.contributionCount,
        };
      }
      return max;
    }, null);

    const datasetEndDate = sortedDays[sortedDays.length - 1].parsedDate;
    const lastContributionEntry = [...sortedDays]
      .reverse()
      .find((day) => day.contributionCount > 0);

    const contributionsLast7Days = sortedDays.reduce((acc, day) => {
      const diff =
        (datasetEndDate.getTime() - day.parsedDate.getTime()) / msPerDay;
      if (diff >= 0 && diff <= 6) {
        return acc + day.contributionCount;
      }
      return acc;
    }, 0);

    const contributionsLast30Days = sortedDays.reduce((acc, day) => {
      const diff =
        (datasetEndDate.getTime() - day.parsedDate.getTime()) / msPerDay;
      if (diff >= 0 && diff <= 29) {
        return acc + day.contributionCount;
      }
      return acc;
    }, 0);

    const commitRepos =
      result.data.viewer.contributionsCollection
        .commitContributionsByRepository ?? [];

    const languageTotals = new Map<string, number>();
    for (const entry of commitRepos) {
      const languageName = entry?.repository?.primaryLanguage?.name ?? "Other";
      const commitTotal = entry?.contributions?.totalCount ?? 0;
      if (commitTotal === 0) continue;
      languageTotals.set(
        languageName,
        (languageTotals.get(languageName) ?? 0) + commitTotal,
      );
    }

    const topLanguages: LanguageStat[] = Array.from(languageTotals.entries())
      .sort(([, aCount], [, bCount]) => bCount - aCount)
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        commitCount: count,
      }));

    const topLanguage: LanguageStat | null = topLanguages[0] ?? null;

    const pullRequestNodes =
      result.data.viewer.contributionsCollection.pullRequestContributions
        ?.nodes ?? [];

    const pullRequestAdditions = pullRequestNodes.reduce(
      (acc: number, node: any) => {
        const additions = node?.pullRequest?.additions ?? 0;
        return acc + additions;
      },
      0,
    );

    const pullRequestDeletions = pullRequestNodes.reduce(
      (acc: number, node: any) => {
        const deletions = node?.pullRequest?.deletions ?? 0;
        return acc + deletions;
      },
      0,
    );

    const summary: ContributionSummary = {
      totalContributions,
      contributionDays,
      currentStreak,
      longestStreak,
      bestDay,
      contributionsLast7Days,
      contributionsLast30Days,
      averageDailyContributions: totalContributions / sortedDays.length,
      lastContributionDate: lastContributionEntry
        ? lastContributionEntry.date
        : null,
      topLanguage,
      topLanguages,
      pullRequestAdditions,
      pullRequestDeletions,
      privateContributionsIncluded: privateIncluded,
    };

    return summary;
  } catch (error) {
    console.error("Error fetching GitHub stats:", error);
    return null;
  }
}
