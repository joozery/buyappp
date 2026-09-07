import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import PremiumOrder from "@/models/PremiumOrder";
import { fetchByshopProducts, fetchByshopBalance, fetchByshopHistory } from "@/lib/byshop";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "admin" && role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") || "products";

  await connectToDatabase();

  if (tab === "products") {
    const [products, balance] = await Promise.all([
      fetchByshopProducts(),
      fetchByshopBalance(),
    ]);
    return NextResponse.json({ ok: true, products, balance });
  }

  if (tab === "orders") {
    const orders = await PremiumOrder.find()
      .populate("userId", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return NextResponse.json({ ok: true, orders });
  }

  if (tab === "history") {
    const history = await fetchByshopHistory(100);
    return NextResponse.json({ ok: true, history });
  }

  return NextResponse.json({ ok: false });
}
