import { NextResponse } from "next/server";
import { verifyApiToken } from "@/lib/auth";
import { updateUserDefaultBalance } from "@/lib/db/users";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const authError = verifyApiToken(req);
  if (authError) {
    return authError;
  }

  try {
    const { default_balance } = await req.json();
    const userId = params.id;

    console.log(`Updating default_balance for user ${userId} to ${default_balance}`);

    if (typeof default_balance !== "number") {
      return NextResponse.json(
        { error: "Default balance must be a number" },
        { status: 400 }
      );
    }

    const newDefaultBalance = await updateUserDefaultBalance(userId, default_balance);

    return NextResponse.json({
      success: true,
      default_balance: newDefaultBalance,
    });
  } catch (error) {
    console.error("Error updating default balance:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update default balance",
      },
      { status: 500 }
    );
  }
}
