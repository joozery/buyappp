import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import PremiumOrder from "@/models/PremiumOrder";
import { buyByshopProduct } from "@/lib/byshop";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });

  const { typeId, productName, productImage, typeMenu, price } = await req.json();
  if (!typeId || !price) return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });

  await connectToDatabase();

  // ตัดเงินแบบ atomic
  const user = await User.findOneAndUpdate(
    { _id: userId, coins: { $gte: price } },
    { $inc: { coins: -price } },
    { new: true }
  );
  if (!user) return NextResponse.json({ error: "ยอดเงินไม่เพียงพอ" }, { status: 400 });

  // ซื้อจาก Byshop API
  const result = await buyByshopProduct(typeId, user.name || userId);
  if (!result.ok || !result.data) {
    // คืนเงิน
    await User.findByIdAndUpdate(userId, { $inc: { coins: price } });
    return NextResponse.json({ error: result.error || "ซื้อสินค้าไม่สำเร็จ กรุณาลองใหม่" }, { status: 502 });
  }

  const order = result.data;

  // บันทึก order
  const premiumOrder = await PremiumOrder.create({
    userId,
    byshopOrderId: String(order.uid),
    productName: order.name || productName,
    productImage: order.imageapi || productImage,
    typeId,
    typeMenu,
    price,
    accountDetail: order.textdb,
  });

  // บันทึก transaction
  await Transaction.create({
    userId,
    type: "shop_buy",
    amount: -price,
    balanceAfter: user.coins,
    description: `ซื้อ ${order.name || productName}`,
    referenceId: premiumOrder._id,
  });

  return NextResponse.json({
    ok: true,
    order: {
      id: premiumOrder._id,
      name: order.name,
      image: order.imageapi,
      detail: order.textdb,
      price,
      date: order.date,
    },
  });
}
