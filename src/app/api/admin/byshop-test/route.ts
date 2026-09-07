import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "admin" && role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { keyapi, baseUrl } = await req.json();
  if (!keyapi) return NextResponse.json({ ok: false, error: "ไม่มี API Key" });

  const base = (baseUrl || "https://gafiwshop.xyz/api").replace(/\/$/, "");

  const url = `${base}/api_money`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ keyapi }),
    });
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (data.status === "success") {
      return NextResponse.json({ ok: true, balance: data.msg ?? data.balance ?? "-", owner: data.owner ?? "" });
    }
    return NextResponse.json({ ok: false, error: data.msg || data.message || `API ตอบกลับไม่สำเร็จ: ${text.slice(0, 200)}` });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: `เชื่อมต่อ ${url} ไม่ได้: ${e.message}`, url });
  }
}
