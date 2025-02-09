"use client";
import React, { useEffect, useState } from "react";
import { GitGraphIcon, Clock8, DiscIcon } from "lucide-react";

interface DiscordData {
  data: {
    discord_user: {
      username: string;
      discriminator: string;
      avatar: string;
      global_name?: string;
      display_name?: string;
      id: string;
    };
    discord_status: string;
    activities: Array<{
      name: string;
      type: number;
      state?: string;
      details?: string;
      application_id?: string;
      timestamps?: {
        start?: number;
        end?: number;
      };
      assets?: {
        large_image?: string;
        large_text?: string;
        small_image?: string;
        small_text?: string;
      };
    }>;
  };
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [discordData, setDiscordData] = useState<DiscordData | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [discordResponse] = await Promise.all([fetch("/api/discord")]);

        if (!discordResponse.ok) {
          throw new Error("Failed to fetch Discord data");
        }

        const discord = await discordResponse.json();
        setDiscordData(discord);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket("wss://api.lanyard.rest/socket");
    let heartbeatInterval: NodeJS.Timeout;

    ws.onopen = () => {
      console.log("Connected to Lanyard WebSocket");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.op) {
        case 1:
          const interval = data.d.heartbeat_interval;
          heartbeatInterval = setInterval(() => {
            ws.send(JSON.stringify({ op: 3 }));
          }, interval);

          ws.send(
            JSON.stringify({
              op: 2,
              d: {
                subscribe_to_id: process.env.NEXT_PUBLIC_DISCORD_ID as string,
              },
            })
          );
          break;

        case 0: // Events
          if (data.t === "INIT_STATE") {
            console.log("Discord Activities:", data.d.activities);
            setDiscordData({ data: data.d });
          } else if (data.t === "PRESENCE_UPDATE") {
            console.log("Discord Activities Update:", data.d.activities);
            setDiscordData({ data: data.d });
          }
          break;
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Failed to connect to Discord presence updates");
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
    };

    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      ws.close();
    };
  }, []);

  // Add real-time updates for the progress bar
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-mono">Data of me</h1>
      <p className="text-base mt-4 font-mono tracking-wide leading-loose">
        A data collection of various things I've been up to.
      </p>
      <div className="flex flex-col mt-16">
        <h1 className="text-sm font-mono opacity-45">current activity</h1>
        <div className="border border-button-hover mt-2">
          <div className="bg-button">
            {loading ? (
              <p className="p-3 text-sm font-mono">Loading...</p>
            ) : error ? (
              <p className="p-3 text-sm font-mono text-red-500">{error}</p>
            ) : (
              <div className="flex flex-col gap-y-3 p-3">
                <div className="flex items-center gap-x-3 opacity-75">
                  <div className="flex flex-col">
                    <p className="text-sm font-mono">
                      {discordData?.data.discord_user.display_name ||
                        discordData?.data.discord_user.global_name ||
                        discordData?.data.discord_user.username}
                    </p>
                    <div className="flex items-center gap-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          discordData?.data.discord_status === "online"
                            ? "bg-green-500"
                            : discordData?.data.discord_status === "idle"
                            ? "bg-yellow-500"
                            : discordData?.data.discord_status === "dnd"
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                      />
                      <p className="text-xs font-mono opacity-75">
                        {discordData?.data.discord_status}
                      </p>
                    </div>
                  </div>
                </div>
                {discordData?.data.activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-x-3 mt-2">
                    {activity.assets?.large_image && (
                      <img
                        src={
                          activity.name === "Spotify"
                            ? activity.assets.large_image.replace(
                                "spotify:",
                                "https://i.scdn.co/image/"
                              )
                            : activity.assets.large_image.startsWith(
                                "mp:external"
                              )
                            ? activity.assets.large_image.replace(
                                "mp:external",
                                "https://media.discordapp.net/external"
                              )
                            : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}`
                        }
                        alt={activity.assets.large_text || activity.name}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                    )}
                    <div className="flex flex-col gap-y-1 flex-1">
                      <div className="text-md font-mono">{activity.name}</div>
                      {activity.details && (
                        <p className="text-sm font-mono opacity-75">
                          {activity.details}
                        </p>
                      )}
                      {activity.state && (
                        <p className="text-sm font-mono opacity-75">
                          {activity.state}
                        </p>
                      )}
                      {activity.name === "Spotify" &&
                        activity.timestamps?.start &&
                        activity.timestamps?.end && (
                          <div className="mt-1">
                            <div className="w-full bg-zinc-500 h-1 overflow-hidden">
                              <div
                                className="bg-button-hover h-full transition-all duration-1000 ease-linear"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    ((now - activity.timestamps.start) /
                                      (activity.timestamps.end -
                                        activity.timestamps.start)) *
                                      100
                                  )}%`,
                                }}
                              />
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-xs font-mono opacity-50">
                                {formatTime(now - activity.timestamps.start)}
                              </span>
                              <span className="text-xs font-mono opacity-50">
                                {formatTime(
                                  activity.timestamps.end -
                                    activity.timestamps.start
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      {!activity.timestamps?.end &&
                        activity.timestamps?.start && (
                          <p className="text-xs font-mono opacity-50">
                            {formatElapsedTime(activity.timestamps.start)}
                          </p>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
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

function formatElapsedTime(startTimestamp: number): string {
  const now = Date.now();
  const elapsed = now - startTimestamp;
  const hours = Math.floor(elapsed / (1000 * 60 * 60));
  const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m elapsed`;
  }
  return `${minutes}m elapsed`;
}
