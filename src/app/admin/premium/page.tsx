"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCw, Package, ShoppingBag, History, Wallet, CheckCircle, Settings, Save } from "lucide-react";
import { UploadInput } from "@/components/ui/UploadInput";

interface Product {
  name: string; imageapi: string; details: string;
  price: string; pricevip: string; stock: string;
  type_menu: string; type_id: string;
}
interface Order {
  _id: string; productName: string; productImage: string;
  price: number; typeMenu: string; accountDetail: string; createdAt: string;
  userId: { name: string; email: string; avatar: string } | null;
}
interface HistoryItem {
  id: string; name: string; image: string;
  details: string; price: string; date: string; type: string;
}

type Tab = "products" | "orders" | "history" | "settings";

export default function AdminPremiumPage() {
  const [tab, setTab] = useState<Tab>("products");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [balance, setBalance] = useState<{ balance: string; owner: string } | null>(null);

  // settings tab state
  const [heroImage, setHeroImage] = useState("");
  const [settingSaving, setSettingSaving] = useState(false);
  const [settingSaved, setSettingSaved] = useState(false);

  const load = async (t: Tab) => {
    if (t === "settings") { setLoading(false); return; }
    setLoading(true);
    const res = await fetch(`/api/admin/premium?tab=${t}`);
    const data = await res.json();
    if (t === "products") { setProducts(data.products || []); setBalance(data.balance); }
    if (t === "orders") setOrders(data.orders || []);
    if (t === "history") setHistory(data.history || []);
    setLoading(false);
  };

  useEffect(() => {
    // load hero image setting on mount
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data: { key: string; value: string }[]) => {
        const s = data.find((d) => d.key === "premium_hero_image");
        if (s) setHeroImage(String(s.value ?? ""));
      });
  }, []);

  useEffect(() => { load(tab); }, [tab]);

  const saveHeroImage = async () => {
    setSettingSaving(true);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "premium_hero_image", value: heroImage }),
    });
    setSettingSaving(false);
    setSettingSaved(true);
    setTimeout(() => setSettingSaved(false), 2500);
  };

  const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
    const key = p.type_menu || "อื่นๆ";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const TABS = [
    { key: "products" as Tab, label: "สินค้าทั้งหมด", icon: Package },
    { key: "orders" as Tab, label: "คำสั่งซื้อ", icon: ShoppingBag },
    { key: "history" as Tab, label: "ประวัติ Byshop", icon: History },
    { key: "settings" as Tab, label: "ตั้งค่าหน้า", icon: Settings },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800">แอพพรีเมี่ยม</h1>
          <p className="text-xs text-slate-400 mt-0.5">จัดการสินค้าและคำสั่งซื้อจาก Byshop API</p>
        </div>
        <div className="flex items-center gap-3">
          {balance && tab !== "settings" && (
            <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-4 py-2">
              <Wallet size={14} className="text-violet-600" />
              <span className="text-xs font-black text-violet-700">ยอดเงิน Byshop: {balance.balance}</span>
            </div>
          )}
          {tab !== "settings" && (
            <button onClick={() => load(tab)} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
              <RefreshCw size={13} /> รีเฟรช
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.key ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Settings Tab */}
      {tab === "settings" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-700">รูปพื้นหลัง Hero Banner</h2>
            <p className="text-xs text-slate-400 mt-0.5">รูปภาพ (หรือวิดีโอ) ที่แสดงเป็น hero section บนสุดของหน้า /premium — แนะนำขนาด 1200×400 px</p>
          </div>
          <div className="px-6 py-5 flex flex-col gap-4">
            <UploadInput
              label="อัพโหลดภาพพื้นหลัง"
              value={heroImage}
              onChange={setHeroImage}
              folder="premium"
              accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm"
              placeholder="อัพโหลดรูป หรือวางลิงก์ URL"
            />

            {heroImage && (
              <div className="rounded-xl overflow-hidden border border-slate-200">
                {/\.(mp4|webm|ogg)(\?.*)?$/i.test(heroImage) ? (
                  <video src={heroImage} autoPlay loop muted playsInline className="w-full h-40 object-cover" />
                ) : (
                  <img src={heroImage} alt="preview" className="w-full h-40 object-cover" />
                )}
              </div>
            )}

            <div>
              <button
                onClick={saveHeroImage}
                disabled={settingSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-colors"
              >
                {settingSaving ? <Loader2 size={13} className="animate-spin" /> : settingSaved ? <CheckCircle size={13} /> : <Save size={13} />}
                {settingSaved ? "บันทึกแล้ว!" : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Tabs */}
      {tab !== "settings" && (
        loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={26} className="animate-spin text-slate-300" />
          </div>
        ) : (
          <>
            {/* Products Tab */}
            {tab === "products" && (
              <div className="flex flex-col gap-6">
                {Object.entries(grouped).map(([menu, items]) => (
                  <div key={menu}>
                    <h2 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-violet-500 rounded-full inline-block" />
                      {menu}
                      <span className="text-xs font-medium text-slate-400">({items.length} รายการ)</span>
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                      {items.map((p) => {
                        const inStock = parseInt(p.stock) > 0;
                        return (
                          <div key={p.type_id} className={`bg-white rounded-2xl border overflow-hidden ${inStock ? "border-slate-200" : "border-slate-100 opacity-60"}`}>
                            <div className="relative">
                              {p.imageapi ? (
                                <img src={p.imageapi} alt={p.name} className="w-full h-28 object-cover" />
                              ) : (
                                <div className="w-full h-28 bg-slate-100 flex items-center justify-center">
                                  <Package size={28} className="text-slate-300" />
                                </div>
                              )}
                              <span className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full ${inStock ? "bg-emerald-500 text-white" : "bg-slate-400 text-white"}`}>
                                {inStock ? `✓ ${p.stock}` : "หมด"}
                              </span>
                            </div>
                            <div className="p-3">
                              <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">{p.name}</p>
                              <div className="flex items-center justify-between mt-2">
                                <div>
                                  <p className="text-sm font-black text-violet-600">{p.price} ฿</p>
                                  <p className="text-[10px] text-slate-400">ตัวแทน {p.pricevip} ฿</p>
                                </div>
                              </div>
                              <p className="text-[9px] text-slate-300 font-mono mt-1 truncate">{p.type_id}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Orders Tab */}
            {tab === "orders" && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">สินค้า</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">ผู้ซื้อ</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">ราคา</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">วันที่</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-xs">ยังไม่มีคำสั่งซื้อ</td></tr>
                    ) : orders.map((o) => (
                      <tr key={o._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {o.productImage && <img src={o.productImage} alt="" className="w-8 h-8 rounded-lg object-cover" />}
                            <div>
                              <p className="text-xs font-bold text-slate-800">{o.productName}</p>
                              <p className="text-[10px] text-slate-400">{o.typeMenu}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-slate-700">{o.userId?.name || "-"}</p>
                          <p className="text-[10px] text-slate-400">{o.userId?.email || ""}</p>
                        </td>
                        <td className="px-4 py-3"><span className="text-xs font-black text-violet-600">{o.price} ฿</span></td>
                        <td className="px-4 py-3"><p className="text-[11px] text-slate-500">{new Date(o.createdAt).toLocaleString("th-TH")}</p></td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            <CheckCircle size={10} /> สำเร็จ
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* History Tab */}
            {tab === "history" && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">#</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">สินค้า</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">ประเภท</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">ราคา</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">วันที่</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-xs">ไม่มีประวัติ</td></tr>
                    ) : history.map((h) => (
                      <tr key={h.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-xs text-slate-400 font-mono">#{h.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {h.image && <img src={h.image} alt="" className="w-7 h-7 rounded-lg object-cover" />}
                            <p className="text-xs font-medium text-slate-800">{h.name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{h.type}</span></td>
                        <td className="px-4 py-3"><span className="text-xs font-black text-violet-600">{h.price} ฿</span></td>
                        <td className="px-4 py-3"><p className="text-[11px] text-slate-500">{h.date}</p></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}
