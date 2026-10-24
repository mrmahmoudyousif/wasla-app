"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [homeTitle, setHomeTitle] = useState("نشتري لك من العالم... ونوصلها لباب بيتك");
  const [homeDescription, setHomeDescription] = useState("تصفح منتجاتنا المختارة بعناية...");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
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
      
      if (titleData && titleData.length > 0) setHomeTitle(titleData[0].value);
      if (descData && descData.length > 0) setHomeDescription(descData[0].value);

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      <nav className="bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">وصلة</span>
              <span className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-500">Wasla</span>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <Link href="/order" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 md:py-2.5 md:px-6 rounded-xl transition text-xs md:text-sm">اطلب الآن</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        
        {/* الترويسة */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-slate-900 dark:text-white leading-tight">
            {homeTitle}
          </h1>
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {homeDescription}
          </p>
        </div>

        {/* التصنيفات */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10 md:mb-12">
          {categories.map((cat, index) => (
            <button 
              key={index} 
              onClick={() => handleCategoryClick(cat.value)}
              className={`py-2 px-4 md:py-3 md:px-6 rounded-xl md:rounded-2xl shadow-sm transition flex items-center gap-2 border text-xs md:text-sm ${
                selectedCategory === cat.value 
                ? "bg-blue-600 text-white border-blue-600" 
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md"
              }`}
            >
              <span className="text-lg md:text-xl">{cat.icon}</span>
              <span className="font-bold">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* البانر المنزلق (Slide) */}
        {featuredProducts.length > 0 && (
          <div className="relative rounded-3xl overflow-hidden mb-12 md:mb-16 shadow-xl h-[250px] sm:h-[300px] md:h-[400px]">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id}
                className={`absolute inset-0 transition-transform duration-700 ease-in-out ${index === currentSlide ? 'translate-x-0 z-10' : 'translate-x-full z-0'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent z-10"></div>
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 z-20 flex flex-col justify-center p-6 md:p-12 text-white max-w-lg">
                  <span className="bg-blue-600 text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full w-fit mb-2 md:mb-4">منتج مميز</span>
                  <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3">{product.name}</h2>
                  <p className="text-base md:text-xl font-bold text-blue-300 mb-4 md:mb-6">{product.price}</p>
                  <Link href={`/product/${product.id}`} className="bg-white text-slate-900 font-bold py-2 px-4 md:py-2.5 md:px-6 rounded-xl w-fit hover:bg-slate-100 transition text-xs md:text-sm">عرض التفاصيل</Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* شبكة المنتجات */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
            {selectedCategory === "all" ? "أحدث المنتجات" : `منتجات ${selectedCategory}`}
          </h2>
          {loading ? (
            <div className="text-center py-20 text-blue-600 font-bold text-lg md:text-xl animate-pulse">جاري تحميل المنتجات...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-slate-500">لا توجد منتجات في هذا التصنيف حالياً.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {filteredProducts.map((product) => (
                <Link href={`/product/${product.id}`} key={product.id} className="group bg-white dark:bg-[#111827] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="relative h-40 sm:h-56 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-md">{product.brand}</span>
                  </div>
                  <div className="p-2 md:p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-xs md:text-lg mb-1 truncate">{product.name}</h3>
                    <p className="text-blue-600 dark:text-blue-400 font-extrabold text-sm md:text-lg mt-auto">{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}