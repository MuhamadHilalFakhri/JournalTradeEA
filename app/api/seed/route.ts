import { NextResponse } from "next/server";
import { seedTrades, clearAllTrades } from "@/actions/trade-actions";

export async function POST() {
  try {
    const result = await seedTrades();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to seed data" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const result = await clearAllTrades();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to clear data" },
      { status: 500 }
    );
  }
}
