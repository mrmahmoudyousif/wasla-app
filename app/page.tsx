"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // التحقق من الوضع المحفوظ عند فتح الموقع
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  // دالة تغيير الوضع الليلي
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

  return (
    <div className="min-h-screen flex flex-col font-sans">
      
      {/* 1. شريط التنقل العلوي */}
      <nav className="bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            
            {/* الشعار */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">وصلة</span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-500">Wasla</span>
            </div>

            {/* الروابط */}
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">الرئيسية</Link>
              <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">كيف نعمل</Link>
              <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">التصنيفات</Link>
              <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">تواصل معنا</Link>
            </div>

            {/* الأزرار */}
            <div className="flex items-center gap-4">
              {/* زر الوضع الليلي */}
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xl"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              
              <Link href="/order" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl transition text-sm">
                دخول / طلب
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. القسم الرئيسي */}
      <main className="flex-grow">
        <section className="py-24 px-6 text-center max-w-3xl mx-auto">
          {/* شارة صغيرة */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
            منصة شحن وتسوق موثوقة
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            نشتري لك من <span className="text-blue-600 dark:text-blue-500">العالم</span> <br />
            ونوصلها لباب <span className="text-blue-600 dark:text-blue-500">بيتك</span>
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium">
            بوابتك الموثوقة للتسوق من شي إن وأمازون. اطلب برابط، أو بصورة، أو حتى باسم المنتج. 
            نستلم، نفحص، ونشحن إلى السودان ومصر بكل أمان.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition">
              اطلب الآن
            </Link>
            <Link href="/track" className="bg-transparent border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-lg py-3 px-8 rounded-xl transition">
              تتبع طلبك
            </Link>
          </div>
        </section>

        {/* 3. التصنيفات */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">تسوق حسب التصنيف</h2>
              <p className="text-slate-500 dark:text-slate-400">اختر ما يناسبك من منتجاتنا الجاهزة</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'عطور', icon: '🧴' },
                { name: 'إكسسوارات', icon: '⌚' },
                { name: 'أزياء', icon: '👕' },
                { name: 'إلكترونيات', icon: '📱' }
              ].map((category, index) => (
                <Link href="/order" key={index} className="group bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center h-40 shadow-sm hover:shadow-md transition-all duration-300">
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</span>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 4. التذييل */}
      <footer className="bg-white dark:bg-[#0B1120] border-t border-slate-200 dark:border-slate-800 py-8 text-center mt-auto">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">وصلة | Wasla</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">تسوق من أي مكان... نوصلها لبابك.</p>
        </div>
      </footer>

    </div>
  );
}