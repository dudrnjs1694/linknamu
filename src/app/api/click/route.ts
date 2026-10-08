import { NextResponse } from "next/server";
import { profile } from "@/data/profile";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { id?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!profile.links.some((link) => link.id === id)) {
    return NextResponse.json({ error: "알 수 없는 링크입니다." }, { status: 400 });
  }

  try {
    const db = await getDb();
    await db.collection<{ _id: string; count: number; updatedAt: Date }>("link_clicks").updateOne(
      { _id: id },
      { $inc: { count: 1 }, $set: { updatedAt: new Date() } },
      { upsert: true },
    );
  } catch (error) {
    console.error("클릭 수 기록 실패:", error);
    return NextResponse.json({ error: "클릭 수를 기록하지 못했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
