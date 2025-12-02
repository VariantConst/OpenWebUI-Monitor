import { NextRequest, NextResponse } from "next/server";
import { verifyApiToken } from "@/lib/auth";
import { resetUserBalanceToDefault } from "@/lib/db/users";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = verifyApiToken(req);
  if (authError) {
    return authError;
  }

  try {
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await resetUserBalanceToDefault(userId);
    
    if (!result) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Balance reset to default value",
      user: result
    });
  } catch (error) {
    console.error("Failed to reset user balance:", error);
    return NextResponse.json(
      { error: "Failed to reset user balance" },
      { status: 500 }
    );
  }
}
