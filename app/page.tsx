"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // حالات النصوص والإعلانات
  const [marqueeText, setMarqueeText] = useState("مرحباً بكم في وصلة! شحن سريع وآمن إلى السودان ومصر.");
  const [marqueeStatus, setMarqueeStatus] = useState("off");
  const [homeTitle, setHomeTitle] = useState("نشتري لك من العالم... ونوصلها لباب بيتك");
  const [homeDescription, setHomeDescription] = useState("تصفح منتجاتنا المختارة بعناية...");
  const [activeTheme, setActiveTheme] = useState("light");

  // تطبيق الثيم والوضع الليلي
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    
    document.documentElement.classList.remove("theme-pink", "theme-emerald", "theme-royal");
    if (activeTheme === "pink") document.documentElement.classList.add("theme-pink");
    else if (activeTheme === "emerald") document.documentElement.classList.add("theme-emerald");
    else if (activeTheme === "royal") document.documentElement.classList.add("theme-royal");
  }, [activeTheme]);

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
    const fetchData = async () => {
      const { data: featured } = await supabase.from("products").select("*").eq("is_featured", true);
      const { data: all } = await supabase.from("products").select("*").order("created_at", { ascending: false });

      if (featured) setFeaturedProducts(featured);
      if (all) {
        setAllProducts(all);
        setFilteredProducts(all);
      }

      const { data: titleData } = await supabase.from("settings").select("value").eq("key", "home_title").limit(1);
      const { data: descData } = await supabase.from("settings").select("value").eq("key", "home_description").limit(1);
      const { data: marqueeData } = await supabase.from("settings").select("value").eq("key", "marquee_text").limit(1);
      const { data: marqueeStatusData } = await supabase.from("settings").select("value").eq("key", "marquee_status").limit(1);
      const { data: themeData } = await supabase.from("settings").select("value").eq("key", "active_theme").limit(1);
      
      if (titleData && titleData.length > 0) setHomeTitle(titleData[0].value);
      if (descData && descData.length > 0) setHomeDescription(descData[0].value);
      if (marqueeData && marqueeData.length > 0) setMarqueeText(marqueeData[0].value);
      if (marqueeStatusData && marqueeStatusData.length > 0) setMarqueeStatus(marqueeStatusData[0].value);
      if (themeData && themeData.length > 0) setActiveTheme(themeData[0].value);

      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (featuredProducts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredProducts]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    if (category === "all") {
      setFilteredProducts(allProducts);
    } else {
      setFilteredProducts(allProducts.filter(p => p.category === category));
    }
  };

  const categories = [
    { name: 'الكل', value: 'all', icon: '🛍️' },
    { name: 'عطور', value: 'عطور', icon: '🧴' },
    { name: 'إكسسوارات', value: 'إكسسوارات', icon: '⌚' },
    { name: 'أزياء', value: 'أزياء', icon: '👕' },
    { name: 'إلكترونيات', value: 'إلكترونيات', icon: '📱' }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      
      {/* شريط الإعلانات المتحرك */}
      {marqueeStatus === "on" && (
        <div className="bg-theme text-white font-bold py-1.5 overflow-hidden whitespace-nowrap relative z-[60] text-xs md:text-sm">
          <div className="animate-marquee inline-block">
            <span className="mx-4">{marqueeText}</span>
            <span className="mx-4">{marqueeText}</span>
            <span className="mx-4">{marqueeText}</span>
          </div>
        </div>
      )}

      {/* شريط التنقل */}
      <nav className="bg-[var(--navbar-bg)] text-[var(--navbar-text)] shadow-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="flex justify-between items-center h-16 md:h-20">
            
            {/* الشعار: متناسق الحجم */}
            <div className="flex items-center gap-1.5">
              <span className="text-2xl md:text-3xl font-black">وصلة</span>
              <span className="text-lg md:text-2xl font-bold opacity-90">Wasla</span>
            </div>

            {/* الأزرار: مخفية جزئياً على الهاتف لتوفير المساحة */}
            <div className="flex items-center gap-1.5 md:gap-4">
              <button onClick={toggleTheme} className="p-1.5 md:p-2 rounded-full hover:bg-white/10 transition">
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              
              <Link href="/track" className="text-xs md:text-sm font-bold opacity-90 hover:opacity-100 hover:scale-105 transition px-2 py-1">
                تتبع طلبك
              </Link>
              
              <Link href="/order" className="bg-[var(--primary)] text-white font-bold py-1.5 px-3 md:py-2.5 md:px-6 rounded-lg md:rounded-xl transition text-xs md:text-sm hover:scale-105 hover:shadow-lg">اطلب الآن</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-12">
        
        {/* العنوان والوصف: متجاوب */}
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-2xl md:text-5xl font-extrabold mb-3 md:mb-4 text-[var(--text-main)] leading-tight">
            {homeTitle}
          </h1>
          <p className="text-sm md:text-lg opacity-70 max-w-2xl mx-auto leading-relaxed">
            {homeDescription}
          </p>
        </div>

        {/* التصنيفات */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 md:mb-12">
          {categories.map((cat, index) => (
            <button 
              key={index} 
              onClick={() => handleCategoryClick(cat.value)}
              className={`py-1.5 px-3 md:py-3 md:px-6 rounded-lg md:rounded-2xl shadow-sm transition-all duration-200 hover:scale-105 flex items-center gap-1.5 md:gap-2 border text-[10px] md:text-sm ${
                selectedCategory === cat.value 
                ? "bg-theme text-white border-theme shadow-lg" 
                : "bg-[var(--card-bg)] border-slate-200 dark:border-slate-700 hover:shadow-md text-[var(--text-main)]"
              }`}
            >
              <span className="text-sm md:text-xl">{cat.icon}</span>
              <span className="font-bold">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* البانر المتحرك */}
        {featuredProducts.length > 0 && (
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden mb-8 md:mb-16 shadow-xl h-[200px] sm:h-[300px] md:h-[400px]">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id}
                className={`absolute inset-0 transition-transform duration-700 ease-in-out ${index === currentSlide ? 'translate-x-0 z-10' : 'translate-x-full z-0'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent z-10"></div>
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 z-20 flex flex-col justify-center p-5 md:p-12 text-white max-w-lg">
                  <span className="bg-theme text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full w-fit mb-2">منتج مميز</span>
                  <h2 className="text-xl md:text-4xl font-bold mb-1 md:mb-3">{product.name}</h2>
                  <p className="text-sm md:text-xl font-bold mb-3 md:mb-6 text-white">{product.price}</p>
                  <Link href={`/product/${product.id}`} className="bg-white text-slate-900 font-bold py-1.5 px-3 md:py-2.5 md:px-6 rounded-lg md:rounded-xl w-fit hover:bg-slate-100 hover:scale-105 transition-all shadow-md text-xs md:text-sm">عرض التفاصيل</Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* شبكة المنتجات */}
        <div>
          <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-6">
            {selectedCategory === "all" ? "أحدث المنتجات" : `منتجات ${selectedCategory}`}
          </h2>
          {loading ? (
            <div className="text-center py-20 text-theme font-bold text-lg md:text-xl animate-pulse">جاري تحميل المنتجات...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 opacity-50 text-sm md:text-base">لا توجد منتجات في هذا التصنيف حالياً.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {filteredProducts.map((product) => (
                <Link href={`/product/${product.id}`} key={product.id} className="group bg-[var(--card-bg)] rounded-xl md:rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  {/* صورة أصغر وأكثر تناسقاً */}
                  <div className="relative h-36 sm:h-56 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <span className="absolute top-1.5 right-1.5 bg-white/90 dark:bg-slate-900/90 text-[9px] md:text-xs font-bold px-1.5 py-0.5 rounded-md">{product.brand}</span>
                  </div>
                  {/* تفاصيل البطاقة */}
                  <div className="p-2.5 md:p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-[11px] md:text-lg mb-1 truncate">{product.name}</h3>
                    <p className="text-theme font-extrabold text-xs md:text-lg mt-auto">{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

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