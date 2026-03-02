import { db } from "@/lib/db";
import { borrowings, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (session?.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("id");

  if (!bookId) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const history = await db
    .select({
      userName: users.name,
      borrowedAt: borrowings.borrowedAt,
      returnedAt: borrowings.returnedAt,
    })
    .from(borrowings)
    .innerJoin(users, eq(borrowings.userId, users.id))
    .where(eq(borrowings.bookId, bookId))
    .orderBy(desc(borrowings.borrowedAt));

  return NextResponse.json(history);
}