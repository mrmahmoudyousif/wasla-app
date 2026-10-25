"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

function ProductContent() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTheme, setActiveTheme] = useState("light");

  // تطبيق الثيم والوضع الليلي
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    const fetchTheme = async () => {
      const { data } = await supabase.from("settings").select("value").eq("key", "active_theme").limit(1);
      if (data && data.length > 0) {
        const theme = data[0].value;
        setActiveTheme(theme);
        document.documentElement.classList.remove("theme-pink", "theme-emerald", "theme-royal");
        if (theme === "pink") document.documentElement.classList.add("theme-pink");
        else if (theme === "emerald") document.documentElement.classList.add("theme-emerald");
        else if (theme === "royal") document.documentElement.classList.add("theme-royal");
      }
    };
    fetchTheme();
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

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();

      if (data) setProduct(data);
      if (error) console.error("Error fetching product:", error);
      
      setLoading(false);
    };

    fetchProduct();
  }, [params.id]);

  if (loading) return <div className="text-center p-20 text-xl font-bold text-[var(--text-main)]">جاري تحميل المنتج...</div>;
  if (!product) return <div className="text-center p-20 text-xl font-bold text-[var(--text-main)]">المنتج غير موجود</div>;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      
      {/* شريط التنقل العلوي */}
      <nav className="bg-[var(--navbar-bg)] text-[var(--navbar-text)] shadow-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
              <span className="text-2xl md:text-3xl font-black">وصلة</span>
              <span className="text-xl md:text-2xl font-bold opacity-90">Wasla</span>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 transition">
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <Link href="/track" className="hidden sm:block text-sm font-bold opacity-90 hover:opacity-100 hover:scale-105 transition">
                تتبع طلبك
              </Link>
              <Link href="/order" className="bg-[var(--primary)] text-white font-bold py-2 px-4 md:py-2.5 md:px-6 rounded-xl transition text-xs md:text-sm hover:scale-105 hover:shadow-lg">اطلب الآن</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto py-8 md:py-12 px-4">
        <button onClick={() => router.back()} className="inline-flex items-center text-sm font-semibold text-theme hover:opacity-80 hover:scale-105 transition-transform mb-6 md:mb-8">
          &larr; العودة
        </button>

        <div className="bg-[var(--card-bg)] rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* صورة المنتج */}
            <div className="bg-black/5 dark:bg-white/5 p-4 md:p-8 flex items-center justify-center h-64 md:h-auto">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-contain max-h-[500px] rounded-2xl" />
            </div>
            
            {/* التفاصيل */}
            <div className="p-6 md:p-12 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 md:gap-3 mb-4">
                  <span className="bg-theme/10 text-theme text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full">{product.brand}</span>
                  <span className="bg-black/5 dark:bg-white/5 opacity-70 text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full">{product.category}</span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold mb-4 text-[var(--text-main)]">{product.name}</h1>
                <p className="text-xl md:text-2xl font-extrabold text-theme mb-6">{product.price}</p>
                
                <p className="text-sm md:text-base opacity-70 mb-8 leading-relaxed">{product.description}</p>
              </div>
              
              <div className="space-y-4">
                <Link 
                  href={`/order?productName=${encodeURIComponent(product.name)}&productLink=${encodeURIComponent(product.product_link || "")}`}
                  className="block w-full text-center bg-theme text-white font-bold py-3 md:py-4 rounded-xl text-sm md:text-base transition-all hover:scale-[1.02] hover:shadow-lg"
                >
                  اطلب هذا المنتج الآن
                </Link>
                
                {product.product_link && (
                  <a 
                    href={product.product_link} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="block w-full text-center border-2 border-slate-200 dark:border-slate-700 text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 py-3 rounded-xl font-bold text-sm md:text-base transition-all"
                  >
                    معاينة المنتج في {product.brand}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetails() {
  return (
    <Suspense fallback={<div className="text-center p-20 text-xl font-bold text-[var(--text-main)]">جاري التحميل...</div>}>
      <ProductContent />
    </Suspense>
  );
}