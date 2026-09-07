"use client";

import { useState, useEffect } from "react";
import {
  Save, Loader2, CheckCircle2, Eye, EyeOff, Link2,
  Wallet, ScanLine, ChevronDown, ChevronUp, ExternalLink,
  CircleCheck, CircleAlert, Info, Zap, RefreshCw, Package,
  BadgeCheck, X,
} from "lucide-react";

function DiscordIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

interface Field {
  key: string;
  label: string;
  hint: string;
  placeholder?: string;
  secret?: boolean;
}

interface Step {
  title: string;
  detail: string;
}

interface Group {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  fields: Field[];
  steps: Step[];
  docsUrl?: string;
  docsLabel?: string;
  requiredKeys: string[];
}

const GROUPS: Group[] = [
  {
    id: "truemoney",
    title: "TrueMoney Wallet",
    subtitle: "ระบบเติมเงินผ่านลิงก์ TrueMoney",
    icon: <Wallet size={18} />,
    color: "orange",
    requiredKeys: ["truemoney_link_token", "truemoney_receive_token"],
    fields: [
      {
        key: "truemoney_link_token",
        label: "Link Token",
        hint: "ใช้สร้างลิงก์ขอรับเงิน — ได้จากพอร์ทัล TrueMoney Developer",
        placeholder: "6582a29a2b3788eae09749...",
        secret: true,
      },
      {
        key: "truemoney_receive_token",
        label: "Receive Token",
        hint: "ใช้ตรวจสอบยอดเงินที่รับเข้ามาแบบ real-time",
        placeholder: "40ecd06f0083688f0994...",
        secret: true,
      },
    ],
    steps: [
      { title: "ขอ API Token", detail: "ติดต่อทีม TrueMoney Developer เพื่อขอ Link Token และ Receive Token สำหรับบัญชีธุรกิจของคุณ" },
      { title: "ใส่ Token ด้านบน", detail: "กรอก Link Token และ Receive Token แล้วกด \"บันทึก\" ทีละตัว" },
      { title: "ตั้งค่าเบอร์โทรศัพท์", detail: "ไปที่ ตั้งค่าเว็บไซต์ → กระเป๋าเงิน → ตั้งค่า \"เบอร์ TrueMoney ของร้าน\" ให้ตรงกับบัญชีที่ขอ Token" },
      { title: "ทดสอบ", detail: "ให้ผู้ใช้ลองเติมเงินผ่านหน้า /exchange แล้วตรวจสอบใน Admin → เติมเงิน TrueMoney" },
    ],
  },
  {
    id: "discord",
    title: "Discord Bot & Webhooks",
    subtitle: "แจ้งเตือนทีมงาน และระบบ Ticket รับงาน",
    icon: <DiscordIcon size={18} />,
    color: "indigo",
    requiredKeys: ["discord_bot_token", "discord_guild_id", "discord_ticket_channel_id", "discord_chat_webhook_url"],
    docsUrl: "https://discord.com/developers/applications",
    docsLabel: "Discord Developer Portal",
    fields: [
      {
        key: "discord_bot_token",
        label: "Bot Token",
        hint: "Token ของ Discord Bot — ได้จาก Bot → Reset Token ใน Developer Portal",
        placeholder: "MTUxNzI0Mzc3...",
        secret: true,
      },
      {
        key: "discord_guild_id",
        label: "Guild ID (Server ID)",
        hint: "คลิกขวาที่ชื่อ Server → Copy Server ID (ต้องเปิด Developer Mode ก่อน)",
        placeholder: "1425476965510414338",
      },
      {
        key: "discord_ticket_channel_id",
        label: "Ticket Channel ID",
        hint: "คลิกขวาที่ Channel ที่ต้องการให้ Bot สร้าง Thread Ticket → Copy Channel ID",
        placeholder: "1517242108665397390",
      },
      {
        key: "discord_chat_webhook_url",
        label: "Webhook URL (แจ้งเตือนแชท)",
        hint: "Channel Settings → Integrations → Webhooks → New Webhook → Copy Webhook URL",
        placeholder: "https://discord.com/api/webhooks/...",
        secret: true,
      },
    ],
    steps: [
      { title: "สร้าง Application & Bot", detail: "เข้า Discord Developer Portal → New Application → ตั้งชื่อ → ไปแท็บ Bot → Add Bot → Reset Token แล้วคัดลอก" },
      { title: "เชิญ Bot เข้า Server", detail: "ไปแท็บ OAuth2 → URL Generator → เลือก bot scope + permissions: Send Messages, Create Public Threads, Read Message History → คัดลอก URL แล้วเปิดใน Browser เพื่อ Invite" },
      { title: "เปิด Developer Mode", detail: "ใน Discord → User Settings → Advanced → เปิด Developer Mode เพื่อให้คลิกขวา Copy ID ได้" },
      { title: "กรอก ID และ Token", detail: "คัดลอก Server ID, Channel ID, Bot Token มาใส่ด้านบนแล้วกด \"บันทึก\" ทีละตัว" },
      { title: "สร้าง Webhook แจ้งเตือนแชท", detail: "คลิกขวาที่ Channel ที่ต้องการรับแจ้งเตือน → Edit Channel → Integrations → Webhooks → New Webhook → Copy URL" },
      { title: "รีสตาร์ท Server", detail: "Bot จะเชื่อมต่ออัตโนมัติตอน Server เริ่มต้น ไม่ต้องทำอะไรเพิ่ม" },
    ],
  },
  {
    id: "slip2go",
    title: "Slip2Go",
    subtitle: "ยืนยันสลิปโอนเงิน PromptPay อัตโนมัติ",
    icon: <ScanLine size={18} />,
    color: "emerald",
    requiredKeys: ["slip2go_api_key"],
    docsUrl: "https://slip2go.com",
    docsLabel: "slip2go.com",
    fields: [
      {
        key: "slip2go_api_key",
        label: "API Key",
        hint: "ได้จากหน้า Dashboard ของ Slip2Go หลังสมัครและยืนยันบัญชีแล้ว",
        placeholder: "slip2go_live_xxxxxxxxxxxx",
        secret: true,
      },
    ],
    steps: [
      { title: "สมัครบัญชี Slip2Go", detail: "เข้าเว็บ slip2go.com → สมัครสมาชิก → ยืนยันอีเมลและข้อมูลธุรกิจ" },
      { title: "คัดลอก API Key", detail: "หลังยืนยันบัญชีแล้ว เข้า Dashboard → API Key → คัดลอก Key มาใส่ด้านบน" },
      { title: "ตั้งค่าบัญชีรับเงิน", detail: "ไปที่ ตั้งค่าเว็บไซต์ → ช่องทางรับเงิน → ตั้งค่าเลขพร้อมเพย์ / เลขบัญชีธนาคารที่ต้องการให้ตรวจสอบ" },
      { title: "ทดสอบการยืนยัน", detail: "ให้ผู้ใช้ลองเติมเงินผ่าน PromptPay Slip แล้วดูผลใน Admin → กระเป๋าเงิน" },
    ],
  },
  {
    id: "byshop",
    title: "แอพพรีเมี่ยม (gafiwshop.xyz)",
    subtitle: "ซื้อ Netflix, YouTube, Disney+ และแอพอื่นๆ อัตโนมัติ",
    icon: <Zap size={18} />,
    color: "violet",
    requiredKeys: ["byshop_api_key"],
    docsUrl: "https://byshop.me",
    docsLabel: "gafiwshop.xyz",
    fields: [
      {
        key: "byshop_api_key",
        label: "API Key",
        hint: "ได้จากหน้า \"เชื่อม API\" ใน byshop.me หลังล็อกอิน — ห้ามเปิดเผยให้ผู้อื่น",
        placeholder: "rDxjbBVU64xCIken9bbC",
        secret: true,
      },
      {
        key: "byshop_base_url",
        label: "Base URL",
        hint: "URL หลักของ API — ปกติไม่ต้องเปลี่ยน",
        placeholder: "https://gafiwshop.xyz/api",
      },
    ],
    steps: [
      { title: "สมัครและล็อกอิน", detail: "เข้า byshop.me → สมัครสมาชิก → ล็อกอิน → ไปที่หน้า \"เชื่อม API\"" },
      { title: "คัดลอก API Key", detail: "คัดลอก API Key ส่วนตัว (ห้ามเปิดเผย) มาใส่ในช่องด้านบน แล้วกด \"บันทึก\"" },
      { title: "กด \"ทดสอบการเชื่อมต่อ\"", detail: "กดปุ่ม Test ด้านล่างเพื่อตรวจสอบว่า API Key ถูกต้องและดูยอดเงินคงเหลือ" },
      { title: "ดูรายการสินค้า", detail: "ไปที่ Admin → แอพพรีเมี่ยม เพื่อดูสินค้าทั้งหมดและเปิดขายในเว็บไซต์" },
      { title: "เติมเงินในบัญชี Byshop", detail: "เมื่อลูกค้าสั่งซื้อ ระบบจะตัดเงินจากบัญชี Byshop อัตโนมัติ ต้องมียอดเงินพอ" },
    ],
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; badge: string; badgeText: string; step: string }> = {
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
    badge: "bg-orange-100",
    badgeText: "text-orange-700",
    step: "bg-orange-500",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-200",
    badge: "bg-indigo-100",
    badgeText: "text-indigo-700",
    step: "bg-indigo-500",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-200",
    badge: "bg-violet-100",
    badgeText: "text-violet-700",
    step: "bg-violet-500",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    badge: "bg-emerald-100",
    badgeText: "text-emerald-700",
    step: "bg-emerald-500",
  },
};

function SecretInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-11 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 font-mono text-slate-800 transition-all placeholder:font-sans placeholder:text-slate-400"
      />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function ByshopTestConnection({ apiKey, baseUrl }: { apiKey: string; baseUrl: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [result, setResult] = useState<{ balance?: string; owner?: string; error?: string } | null>(null);

  const test = async () => {
    if (!apiKey) return;
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch("/api/admin/byshop-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyapi: apiKey,
          baseUrl: baseUrl || "https://gafiwshop.xyz/api",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("ok");
        setResult({ balance: data.balance, owner: data.owner });
      } else {
        setStatus("error");
        setResult({ error: data.error || "เชื่อมต่อไม่สำเร็จ" });
      }
    } catch {
      setStatus("error");
      setResult({ error: "ไม่สามารถเชื่อมต่อได้" });
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={test}
        disabled={!apiKey || status === "loading"}
        className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-40"
      >
        {status === "loading" ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
        ทดสอบการเชื่อมต่อ
      </button>
      {result && (
        <div className={`mt-2 rounded-xl px-4 py-3 text-xs font-medium flex items-start gap-2 ${status === "ok" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
          {status === "ok" ? (
            <>
              <BadgeCheck size={14} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-black">เชื่อมต่อสำเร็จ</p>
                <p>เจ้าของบัญชี: <span className="font-bold">{result.owner}</span> · ยอดเงิน: <span className="font-bold">{result.balance} ฿</span></p>
              </div>
            </>
          ) : (
            <>
              <X size={14} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-black">เชื่อมต่อไม่สำเร็จ</p>
                <p>{result.error}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ configured }: { configured: boolean }) {
  return configured ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
      <CircleCheck size={11} /> เชื่อมต่อแล้ว
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
      <CircleAlert size={11} /> ยังไม่ได้ตั้งค่า
    </span>
  );
}

export default function IntegrationsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [openGuide, setOpenGuide] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data: { key: string; value: string }[]) => {
        const map: Record<string, string> = {};
        data.forEach((s) => { map[s.key] = String(s.value ?? ""); });
        setValues(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (key: string) => {
    setSaving((s) => ({ ...s, [key]: true }));
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: values[key] ?? "" }),
    });
    setSaving((s) => ({ ...s, [key]: false }));
    setSaved((s) => ({ ...s, [key]: true }));
    setTimeout(() => setSaved((s) => ({ ...s, [key]: false })), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
          <Link2 size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800 leading-tight">การเชื่อมต่อ</h1>
          <p className="text-xs text-slate-400 font-medium">API Keys และ Tokens สำหรับบริการภายนอก</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {GROUPS.map((group) => {
        const c = colorMap[group.color];
        const isConfigured = group.requiredKeys.every((k) => !!values[k]);
        const isGuideOpen = openGuide[group.id];

        return (
          <div key={group.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className={`px-6 py-4 flex items-center justify-between border-b border-slate-100 ${c.bg}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center ${c.text}`}>
                  {group.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-slate-800 text-sm">{group.title}</h2>
                    <StatusBadge configured={isConfigured} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{group.subtitle}</p>
                </div>
              </div>
              {group.docsUrl && (
                <a href={group.docsUrl} target="_blank" rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                  <ExternalLink size={12} />
                  {group.docsLabel}
                </a>
              )}
            </div>

            {/* Fields */}
            <div className="p-6 flex flex-col gap-5">
              {group.fields.map((field) => {
                const isFilled = !!values[field.key];
                return (
                  <div key={field.key}>
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <label className="text-sm font-bold text-slate-700">{field.label}</label>
                          {isFilled && <CircleCheck size={13} className="text-emerald-500" />}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{field.hint}</p>
                      </div>
                      <button
                        onClick={() => handleSave(field.key)}
                        disabled={saving[field.key]}
                        className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all disabled:opacity-50 ${
                          saved[field.key]
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-800 hover:bg-slate-700 text-white"
                        }`}
                      >
                        {saving[field.key] ? <Loader2 size={12} className="animate-spin" /> :
                          saved[field.key] ? <CheckCircle2 size={12} /> : <Save size={12} />}
                        {saved[field.key] ? "บันทึกแล้ว" : "บันทึก"}
                      </button>
                    </div>
                    {field.secret ? (
                      <SecretInput
                        value={values[field.key] ?? ""}
                        onChange={(v) => setValues((prev) => ({ ...prev, [field.key]: v }))}
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <input
                        type="text"
                        value={values[field.key] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 font-mono text-slate-800 transition-all placeholder:font-sans placeholder:text-slate-400"
                      />
                    )}
                  </div>
                );
              })}

              {/* Byshop test connection */}
              {group.id === "byshop" && (
                <ByshopTestConnection
                  apiKey={values["byshop_api_key"] ?? ""}
                  baseUrl={values["byshop_base_url"] ?? ""}
                />
              )}
            </div>

            {/* Guide Section */}
            <div className="border-t border-slate-100">
              <button
                onClick={() => setOpenGuide((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <Info size={14} className="text-slate-400" />
                  วิธีตั้งค่าทีละขั้นตอน
                </div>
                {isGuideOpen ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
              </button>

              {isGuideOpen && (
                <div className="px-6 pb-6">
                  <div className="flex flex-col gap-3">
                    {group.steps.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className={`w-6 h-6 rounded-full ${c.step} text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5`}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{step.title}</p>
                          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{step.detail}</p>
                        </div>
                      </div>
                    ))}
                    {group.docsUrl && (
                      <a href={group.docsUrl} target="_blank" rel="noopener noreferrer"
                        className={`mt-1 self-start flex items-center gap-1.5 text-xs font-bold ${c.text} hover:underline`}>
                        <ExternalLink size={12} />
                        ไปที่ {group.docsLabel}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        );
      })}
      </div>
    </div>
  );
}
