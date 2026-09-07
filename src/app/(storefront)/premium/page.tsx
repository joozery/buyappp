"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Loader2, Package, ShoppingCart, X, CheckCircle,
  Eye, EyeOff, Zap, Shield, Clock, Copy, Check,
  Sparkles, Search,
} from "lucide-react";
import { useBalance } from "@/contexts/BalanceContext";

interface Product {
  name: string; imageapi: string; details: string;
  price: string; pricevip: string; stock: string;
  type_menu: string; type_id: string;
}

interface OrderResult {
  name: string; image: string; detail: string; price: number; date: string;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/* ─── Product Card ─── */
function ProductCard({ product, onBuy }: { product: Product; onBuy: (p: Product) => void }) {
  const inStock = parseInt(product.stock) > 0;

  return (
    <div
      onClick={() => inStock && onBuy(product)}
      className={`group relative bg-white rounded-3xl overflow-hidden transition-all duration-300
        ${inStock
          ? "cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-2"
          : "opacity-50 cursor-not-allowed shadow-sm"
        }`}
    >
      {/* ── Image zone ── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        {product.imageapi ? (
          <img
            src={product.imageapi}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center">
            <Package size={36} className="text-red-200" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        {/* Category badge */}
        {product.type_menu && (
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-gray-600 shadow-sm">
            {product.type_menu}
          </span>
        )}

        {/* Stock / out-of-stock */}
        {inStock ? (
          <span className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-sm">
            เหลือ {product.stock}
          </span>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="text-sm font-black text-white bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full">
              สินค้าหมด
            </span>
          </div>
        )}

        {/* Price + cart button on image bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8 flex items-end justify-between">
          <div>
            <p className="text-2xl font-black text-white leading-none drop-shadow">฿{product.price}</p>
            {product.pricevip && product.pricevip !== product.price && (
              <p className="text-[11px] text-white/60 font-medium mt-0.5">ตัวแทน ฿{product.pricevip}</p>
            )}
          </div>
          {inStock && (
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg
              translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 shrink-0">
              <ShoppingCart size={16} className="text-white" />
            </div>
          )}
        </div>
      </div>

      {/* ── Name zone ── */}
      <div className="px-4 pt-3.5 pb-4">
        <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">
          {product.name}
        </p>
      </div>
    </div>
  );
}

/* ─── Buy Modal ─── */
function BuyModal({ product, onClose, onSuccess }: {
  product: Product;
  onClose: () => void;
  onSuccess: (r: OrderResult) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { refreshBalance } = useBalance();

  const handleBuy = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/premium/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        typeId: product.type_id,
        productName: product.name,
        productImage: product.imageapi,
        typeMenu: product.type_menu,
        price: parseFloat(product.price),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      refreshBalance();
      onSuccess(data.order);
    } else {
      setError(data.error || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Image */}
        <div className="relative">
          {product.imageapi ? (
            <img src={product.imageapi} alt={product.name} className="w-full h-44 object-cover" />
          ) : (
            <div className="w-full h-44 bg-gradient-to-br from-red-50 to-rose-100" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <h3 className="font-black text-gray-900 text-lg leading-snug">{product.name}</h3>
          <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{stripHtml(product.details)}</p>

          {/* Feature pills */}
          <div className="flex gap-2 mt-4">
            {[
              { icon: <Zap size={12} />, label: "ส่งทันที", color: "text-yellow-500", bg: "bg-yellow-50 border-yellow-200" },
              { icon: <Shield size={12} />, label: "ปลอดภัย", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
              { icon: <Clock size={12} />, label: "24/7", color: "text-blue-500", bg: "bg-blue-50 border-blue-200" },
            ].map((f) => (
              <div key={f.label} className={`flex-1 flex flex-col items-center gap-1 ${f.bg} rounded-xl py-2 border`}>
                <span className={f.color}>{f.icon}</span>
                <span className="text-[10px] text-gray-500 font-medium">{f.label}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mt-4 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            <span className="text-sm font-bold text-gray-500">ราคารวม</span>
            <span className="text-2xl font-black text-red-600">฿{product.price}</span>
          </div>

          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl px-3 py-2.5">
              {error}
            </div>
          )}

          <button
            onClick={handleBuy}
            disabled={loading}
            className="w-full mt-4 py-4 rounded-2xl font-black text-white text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> กำลังดำเนินการ...</>
            ) : (
              <><Zap size={18} /> ยืนยันซื้อ ฿{product.price}</>
            )}
          </button>
          <p className="text-center text-[10px] text-gray-400 mt-2">ข้อมูลบัญชีจะถูกส่งหลังชำระเงิน</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Result Modal ─── */
function ResultModal({ order, onClose }: { order: OrderResult; onClose: () => void }) {
  const [showDetail, setShowDetail] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(order.detail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Success header */}
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 px-6 pt-8 pb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle size={30} className="text-white" />
          </div>
          <h3 className="font-black text-white text-xl mb-1">ซื้อสำเร็จ!</h3>
          <p className="text-emerald-100 text-sm">{order.name}</p>
        </div>

        <div className="p-5">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black text-gray-700 flex items-center gap-1.5">
                <Shield size={11} className="text-red-500" />
                ข้อมูลบัญชี
              </p>
              <div className="flex gap-2">
                {showDetail && (
                  <button onClick={handleCopy} className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
                    {copied ? <><Check size={11} className="text-emerald-500" /> คัดลอกแล้ว</> : <><Copy size={11} /> คัดลอก</>}
                  </button>
                )}
                <button
                  onClick={() => setShowDetail((s) => !s)}
                  className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 transition-colors"
                >
                  {showDetail ? <><EyeOff size={11} /> ซ่อน</> : <><Eye size={11} /> แสดง</>}
                </button>
              </div>
            </div>
            {showDetail ? (
              <p className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all leading-relaxed bg-white rounded-xl p-3 border border-gray-200">
                {order.detail}
              </p>
            ) : (
              <div className="h-14 flex items-center justify-center">
                <p className="text-xs text-gray-400 italic">กด "แสดง" เพื่อดูข้อมูลบัญชี</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <span className="text-amber-500 text-sm shrink-0">⚠️</span>
            <p className="text-[11px] text-amber-700 font-medium">กรุณาบันทึกข้อมูลก่อนปิดหน้าต่างนี้</p>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-3 py-3.5 rounded-2xl font-black text-gray-700 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function PremiumPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState("ทั้งหมด");
  const [search, setSearch] = useState("");
  const [buying, setBuying] = useState<Product | null>(null);
  const [result, setResult] = useState<OrderResult | null>(null);
  const [heroImage, setHeroImage] = useState("");

  useEffect(() => {
    fetch("/api/public-settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setHeroImage(d.premium_hero_image || ""))
      .catch(() => {});
    fetch("/api/premium/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  const menus = ["ทั้งหมด", ...Array.from(new Set(products.map((p) => p.type_menu).filter(Boolean)))];
  const filtered = products
    .filter((p) => selectedMenu === "ทั้งหมด" || p.type_menu === selectedMenu)
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 max-w-7xl mx-auto flex flex-col gap-5">

      {/* ── Hero Image ── */}
      {heroImage ? (
        <div className="relative w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          {/\.(mp4|webm|ogg)(\?.*)?$/i.test(heroImage) ? (
            <video src={heroImage} autoPlay loop muted playsInline className="w-full h-48 md:h-72 object-cover" />
          ) : (
            <img src={heroImage} alt="premium banner" className="w-full h-48 md:h-72 object-cover" />
          )}
        </div>
      ) : null}

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
          <Sparkles size={22} className="text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">แอพพรีเมี่ยม</h1>
          <p className="text-sm text-gray-500 font-medium">Netflix, YouTube, Disney+ และอีกมากมาย — ส่งทันทีหลังซื้อ</p>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหาสินค้า..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all font-medium"
        />
      </div>

      {/* ── Category Filter ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1">
        {menus.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMenu(m)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
              ${selectedMenu === m
                ? "bg-red-600 text-white shadow-sm shadow-red-500/30"
                : "bg-white border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600"
              }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* ── Products Grid ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-52 gap-3">
          <Loader2 size={28} className="animate-spin text-red-500" />
          <p className="text-gray-400 text-sm">กำลังโหลดสินค้า...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-400 text-sm font-medium">ไม่มีสินค้าในหมวดนี้</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((p) => (
            <ProductCard key={p.type_id} product={p} onBuy={(prod) => { if (!session) return; setBuying(prod); }} />
          ))}
        </div>
      )}

      {/* Modals */}
      {buying && (
        <BuyModal
          product={buying}
          onClose={() => setBuying(null)}
          onSuccess={(r) => { setBuying(null); setResult(r); }}
        />
      )}
      {result && <ResultModal order={result} onClose={() => setResult(null)} />}
    </div>
  );
}
