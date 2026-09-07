import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Setting from "@/models/Setting";

export async function GET() {
  try {
    await connectToDatabase();
    const [keySetting, urlSetting] = await Promise.all([
      Setting.findOne({ key: "byshop_api_key" }).lean(),
      Setting.findOne({ key: "byshop_base_url" }).lean(),
    ]);
    const apiKey = (keySetting as any)?.value || "";
    const baseUrl = ((urlSetting as any)?.value || "https://gafiwshop.xyz/api").replace(/\/$/, "");

    if (!apiKey) {
      return NextResponse.json({ ok: false, data: [], debug: "ไม่มี API Key" });
    }

    const url = `${baseUrl}/api_product?keyapi=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = null; }

    if (!data || (!data.ok && data.status !== "success")) {
      return NextResponse.json({
        ok: false, data: [],
        debug: `HTTP ${res.status} | URL: ${url} | response: ${text.slice(0, 300)}`,
      });
    }

    const products = data.data ?? data.product ?? [];
    return NextResponse.json({ ok: true, data: products });
  } catch (e: any) {
    return NextResponse.json({ ok: false, data: [], debug: e.message });
  }
}
