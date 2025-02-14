"use server";

interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface ContributionData {
  totalContributions: number;
  contributionDays: ContributionDay[];
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

export async function fetchGitHubStats(): Promise<ContributionData | null> {
  const query = `
    query {
      user(login: "prantantheman") {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (!data.data?.user) {
      return null;
    }

    const contributionCalendar =
      data.data.user.contributionsCollection.contributionCalendar;

    return {
      totalContributions: contributionCalendar.totalContributions,
      contributionDays: contributionCalendar.weeks.flatMap(
        (week: any) => week.contributionDays
      ),
    };
  } catch (error) {
    console.error("Error fetching GitHub stats:", error);
    return null;
  }
}
