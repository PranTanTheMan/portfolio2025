"use client";
import React, { useEffect, useState } from "react";
import { GitHubStats } from "@/components/gh-chart";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
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
  const [wsRetries, setWsRetries] = useState(0);
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 3000;

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let heartbeatInterval: NodeJS.Timeout;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      if (wsRetries >= MAX_RETRIES) {
        console.log("Max WebSocket reconnection attempts reached");
        return;
      }

      // Clear any existing connection
      if (ws) {
        ws.close();
        clearInterval(heartbeatInterval);
      }

      ws = new WebSocket("wss://api.lanyard.rest/socket");

      ws.onopen = () => {
        console.log("Connected to Lanyard WebSocket");
        setWsRetries(0); // Reset retry counter on successful connection
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.op) {
          case 1:
            const interval = data.d.heartbeat_interval;
            heartbeatInterval = setInterval(() => {
              if (ws?.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ op: 3 }));
              }
            }, interval);

            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  op: 2,
                  d: {
                    subscribe_to_id: process.env
                      .NEXT_PUBLIC_DISCORD_ID as string,
                  },
                })
              );
            }
            break;

          case 0:
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
        console.warn("WebSocket error:", error);
      };

      ws.onclose = (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason);
        clearInterval(heartbeatInterval);

        // Attempt to reconnect unless max retries reached
        if (wsRetries < MAX_RETRIES) {
          console.log(
            `Reconnecting in ${RETRY_DELAY}ms... (Attempt ${
              wsRetries + 1
            }/${MAX_RETRIES})`
          );
          reconnectTimeout = setTimeout(() => {
            setWsRetries((prev) => prev + 1);
            connectWebSocket();
          }, RETRY_DELAY);
        }
      };
    };

    // Initial data fetch
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
    connectWebSocket();

    // Cleanup function
    return () => {
      if (ws) {
        ws.close();
      }
      clearInterval(heartbeatInterval);
      clearTimeout(reconnectTimeout);
    };
  }, [wsRetries]); // Add wsRetries to dependencies

  return (
    <div className="max-w-xs lg:max-w-2xl mx-auto mt-20 ">
      <Nav />
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
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }`}
                        />
                        <p className="text-xs font-mono opacity-75">
                          {discordData?.data.discord_status === "dnd"
                            ? "online"
                            : discordData?.data.discord_status}
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
                              <div className="w-full bg-button-hover h-1 overflow-hidden">
                                <div
                                  className=" bg-zinc-500 h-full transition-all duration-1000 ease-linear"
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
              <GitHubStats />
            </div>
          </div>
        </div>
      </div>
      <Footer className="my-20" />
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
