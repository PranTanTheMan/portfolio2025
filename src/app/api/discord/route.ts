import { NextResponse } from "next/server";

const DISCORD_ID = process.env.DISCORD_ID;

export async function GET() {
  try {
    if (!DISCORD_ID) {
      throw new Error("Discord ID not configured");
    }

    const response = await fetch(
      `https://api.lanyard.rest/v1/users/${DISCORD_ID}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Discord presence");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch Discord presence" },
      { status: 500 }
    );
  }
}
