import { connectToDatabase } from "./mongoose";
import Setting from "@/models/Setting";

export interface ByshopProduct {
  name: string;
  imageapi: string;
  details: string;
  price: string;
  pricevip: string;
  stock: string;
  type_menu: string;
  type_id: string;
}

export interface ByshopOrderResult {
  uid: number;
  name: string;
  imageapi: string;
  textdb: string;
  point: number;
  date: string;
}

async function getConfig(): Promise<{ apiKey: string; baseUrl: string }> {
  await connectToDatabase();
  const [keySetting, urlSetting] = await Promise.all([
    Setting.findOne({ key: "byshop_api_key" }).lean(),
    Setting.findOne({ key: "byshop_base_url" }).lean(),
  ]);
  return {
    apiKey: (keySetting as any)?.value || process.env.BYSHOP_API_KEY || "",
    baseUrl: (urlSetting as any)?.value || "https://gafiwshop.xyz/api",
  };
}

export async function fetchByshopProducts(): Promise<ByshopProduct[]> {
  const { apiKey, baseUrl } = await getConfig();
  const url = apiKey
    ? `${baseUrl}/api_product?keyapi=${encodeURIComponent(apiKey)}`
    : `${baseUrl}/api_product`;
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = {}; }
  console.log("[byshop] api_product status:", res.status, "response:", text.slice(0, 400));
  if (!data.ok && data.status !== "success") return [];
  return (data.data ?? data.product ?? []) as ByshopProduct[];
}

export async function buyByshopProduct(typeId: string, userRef: string): Promise<{ ok: boolean; data?: ByshopOrderResult; error?: string }> {
  const { apiKey, baseUrl } = await getConfig();
  if (!apiKey) return { ok: false, error: "ยังไม่ได้ตั้งค่า Byshop API Key" };

  const body = new URLSearchParams({ keyapi: apiKey, type_id: typeId, username_buy: userRef });
  const res = await fetch(`${baseUrl}/api_buy`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (data.status === "success") return { ok: true, data: data.data };
  return { ok: false, error: data.msg || data.message || "ซื้อสินค้าไม่สำเร็จ" };
}

export async function fetchByshopHistory(limit = 50): Promise<any[]> {
  const { apiKey, baseUrl } = await getConfig();
  if (!apiKey) return [];
  const res = await fetch(`${baseUrl}/api_history?keyapi=${apiKey}&limit=${limit}`);
  const data = await res.json();
  return data.status === "success" ? (data.data ?? []) : [];
}

export async function fetchByshopBalance(): Promise<{ balance: string; owner: string } | null> {
  const { apiKey, baseUrl } = await getConfig();
  if (!apiKey) return null;
  const res = await fetch(`${baseUrl}/api_money`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ keyapi: apiKey }),
  });
  const data = await res.json();
  if (data.status !== "success") return null;
  return { balance: data.msg ?? data.balance ?? "-", owner: data.owner ?? "" };
}
