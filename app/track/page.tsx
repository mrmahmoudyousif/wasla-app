"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function TrackPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTheme, setActiveTheme] = useState("light");
  
  // حالة شريط الإعلانات
  const [marqueeText, setMarqueeText] = useState("مرحباً بكم في وصلة! شحن سريع وآمن إلى السودان ومصر.");
  const [marqueeStatus, setMarqueeStatus] = useState("off");

  // تطبيق الثيم والوضع الليلي
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    const fetchSettings = async () => {
      // جلب الثيم
      const { data: themeData } = await supabase.from("settings").select("value").eq("key", "active_theme").limit(1);
      if (themeData && themeData.length > 0) {
        const theme = themeData[0].value;
        setActiveTheme(theme);
        document.documentElement.classList.remove("theme-pink", "theme-emerald", "theme-royal");
        if (theme === "pink") document.documentElement.classList.add("theme-pink");
        else if (theme === "emerald") document.documentElement.classList.add("theme-emerald");
        else if (theme === "royal") document.documentElement.classList.add("theme-royal");
      }

      // جلب إعدادات الإعلان
      const { data: marqueeData } = await supabase.from("settings").select("value").eq("key", "marquee_text").limit(1);
      const { data: marqueeStatusData } = await supabase.from("settings").select("value").eq("key", "marquee_status").limit(1);
      if (marqueeData && marqueeData.length > 0) setMarqueeText(marqueeData[0].value);
      if (marqueeStatusData && marqueeStatusData.length > 0) setMarqueeStatus(marqueeStatusData[0].value);
    };
    fetchSettings();
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
      toast.success("تم تفعيل الوضع النهاري", { icon: '☀️' });
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
      toast.success("تم تفعيل الوضع الليلي", { icon: '🌙' });
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    
    const toastId = toast.loading("جاري البحث عن طلبك...");

    const searchQuery = query.trim();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .or(`order_number.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%`)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setOrder(data[0]);
      toast.success("تم العثور على الطلب!", { id: toastId });
    } else {
      setOrder(null);
      toast.error("عذراً، لم نجد أي طلب بهذا الرقم.", { id: toastId });
    }
    setLoading(false);
  };

  const statusMap: any = {
    pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800", step: 1 },
    purchased: { label: "تم الشراء", color: "bg-blue-100 text-blue-800", step: 2 },
    with_courier: { label: "وصلت للمندوب", color: "bg-purple-100 text-purple-800", step: 3 },
    shipped: { label: "تم الشحن", color: "bg-indigo-100 text-indigo-800", step: 4 },
    delivered: { label: "تم التوصيل", color: "bg-green-100 text-green-800", step: 5 },
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      
      {/* شريط الإعلانات المتحرك (يظهر فقط إذا كان مفعلاً) */}
      {marqueeStatus === "on" && (
        <div className="bg-theme text-white font-bold py-1.5 overflow-hidden whitespace-nowrap relative z-[60]">
          <div className="animate-marquee inline-block">
            <span className="mx-4">{marqueeText}</span>
            <span className="mx-4">{marqueeText}</span>
            <span className="mx-4">{marqueeText}</span>
          </div>
        </div>
      )}

      {/* شريط التنقل النظيف */}
      <nav className="bg-[var(--navbar-bg)] text-[var(--navbar-text)] shadow-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* الشعار فقط في اليمين */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
              <span className="text-2xl md:text-3xl font-black">وصلة</span>
              <span className="text-xl md:text-2xl font-bold opacity-90">Wasla</span>
            </div>
            
            {/* زر الوضع الليلي فقط في اليسار */}
            <div className="flex items-center">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 transition">
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-12 px-4 flex flex-col items-center">
        <div className="max-w-xl w-full">
          
          {/* زر العودة للرئيسية */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-sm font-semibold text-theme hover:opacity-80 hover:scale-105 transition-transform">
              &larr; العودة للرئيسية
            </Link>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[var(--text-main)] mb-2">تتبع طلبك</h1>
            <p className="opacity-70">أدخل رقم الطلب (مثال: WS-1234) أو رقم الواتساب للبحث.</p>
          </div>

          <form onSubmit={handleTrack} className="bg-[var(--card-bg)] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 transition-colors duration-300">
            <input 
              type="text" 
              placeholder="رقم الطلب أو رقم الواتساب" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none mb-4 text-center transition-all text-[var(--text-main)]" 
              required
            />
            <button type="submit" disabled={loading} className="w-full bg-theme text-white font-bold py-3 rounded-xl transition hover:scale-[1.02] hover:shadow-lg">
              {loading ? "جاري البحث..." : "بحث"}
            </button>
          </form>

          {searched && !order && !loading && (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center border border-red-100 animate-fade-in">
              عذراً، لم نجد أي طلب بهذا الرقم. تأكد من الرقم أو تواصل معنا.
            </div>
          )}

          {order && (
            <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in transition-colors duration-300">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-lg text-[var(--text-main)]">تفاصيل الطلب</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusMap[order.status]?.color}`}>
                    {statusMap[order.status]?.label || order.status}
                  </span>
                </div>
                <p className="opacity-70 text-sm">رقم الطلب: <span className="font-bold text-[var(--text-main)]">{order.order_number}</span></p>
                <p className="opacity-70 text-sm">تاريخ الطلب: {new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
              </div>
              
              <div className="p-6 bg-black/5 dark:bg-white/5">
                <p className="text-sm opacity-70 mb-2">تفاصيل المنتج:</p>
                <p className="font-bold text-[var(--text-main)]">{order.product_details}</p>
              </div>

              <div className="p-6">
                <div className="flex justify-between relative">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700 -z-10 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-0 h-1 bg-theme -z-10 -translate-y-1/2 transition-all duration-500" style={{ width: `${((statusMap[order.status]?.step || 1) - 1) * 25}%` }}></div>
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300 ${step <= (statusMap[order.status]?.step || 1) ? 'bg-theme border-theme text-white' : 'bg-[var(--card-bg)] border-slate-300 dark:border-slate-600 opacity-50'}`}>
                      {step}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] md:text-xs opacity-70 text-center">
                  <span className="w-1/5">قيد الانتظار</span>
                  <span className="w-1/5">تم الشراء</span>
                  <span className="w-1/5">وصلت للمندوب</span>
                  <span className="w-1/5">تم الشحن</span>
                  <span className="w-1/5">تم التوصيل</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* حركة الشريط الإعلاني */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
      `}</style>
    </div>
  );
}