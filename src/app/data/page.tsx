"use client";
import React, { useEffect, useState } from "react";
import { GitGraphIcon, Clock8 } from "lucide-react";

interface SteamData {
  steam: {
    getPersonName: string;
    getAvatar: string;
    getStatus: string;
    getGames: string | false;
    getprofileUrl: string;
  };
}

export default function Page() {
  const [steamData, setSteamData] = useState<SteamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSteamData = async () => {
      try {
        const response = await fetch("/api/steam", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch Steam data");
        }

        const data = await response.json();
        setSteamData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchSteamData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!steamData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">No data available</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-mono">Data of me</h1>
      <p className="text-base mt-4 font-mono tracking-wide leading-loose">
        A data collection of what I'm currently playing, video games I'm playing
        and my github analytics.
      </p>
      <div className="flex flex-col mt-16">
        <h1 className="text-sm font-mono opacity-45">github activity</h1>
        <div className="border border-button-hover mt-2">
          <div className="bg-button">
            <div className="flex flex-col gap-y-3 p-3">
              <div className="flex items-center gap-x-2 opacity-75">
                <GitGraphIcon className="w-[14px] h-[14px]" />
                <p className="text-xs font-mono">github repository</p>
              </div>
              <div className="text-md font-mono">commit message</div>
              <div className="flex items-center gap-x-1 opacity-75">
                <Clock8 className="w-3 h-3" />
                <p className="text-xs font-mono">69 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-16">
        <h1 className="text-sm font-mono opacity-45">github contributions</h1>
        <div className="border border-button-hover mt-2">
          <div className="bg-button"></div>
        </div>
      </div>
    </div>
  );
}

{
  /* <div className="flex items-center space-x-6">
  <img
    src={steamData.steam.getAvatar}
    alt={steamData.steam.getPersonName}
    className="w-32 h-32 rounded-full"
  />
  <div>
    <h1 className="text-2xl font-bold">{steamData.steam.getPersonName}</h1>
    <div className="mt-2 text-gray-600">
      Status: <span className="font-medium">{steamData.steam.getStatus}</span>
    </div>
    {steamData.steam.getGames && (
      <div className="mt-2 text-gray-600">{steamData.steam.getGames}</div>
    )}
    <a
      href={steamData.steam.getprofileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-block text-blue-500 hover:text-blue-600 transition-colors"
    >
      View Steam Profile →
    </a>
  </div>
</div>; */
}
