"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams } from "next/navigation";

function ProductContent() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();

      if (data) setProduct(data);
      if (error) console.error(error);
      
      setLoading(false);
    };

    fetchProduct();
  }, [params.id]);

  if (loading) return <div className="text-center p-20 text-xl font-bold">جاري تحميل المنتج...</div>;
  if (!product) return <div className="text-center p-20 text-xl font-bold">المنتج غير موجود</div>;

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* صورة المنتج متجاوبة */}
        <div className="bg-slate-100 dark:bg-slate-800 p-4 md:p-8 flex items-center justify-center h-64 md:h-auto">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-contain max-h-[500px] rounded-2xl" />
        </div>
        
        {/* التفاصيل */}
        <div className="p-6 md:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 md:gap-3 mb-4">
              <span className="bg-blue-100 text-blue-600 text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full">{product.brand}</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full">{product.category}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-xl md:text-2xl font-extrabold text-blue-600 mb-6">{product.price}</p>
            <p className="text-sm md:text-base text-slate-600 mb-8">{product.description}</p>
          </div>
          
          <div className="space-y-4">
            {/* إصلاح رابط الطلب (تمرير اسم المنتج ورابطه الصحيح) */}
            <Link 
              href={`/order?productName=${encodeURIComponent(product.name)}&productLink=${encodeURIComponent(product.product_link || product.image_url || "")}`}
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 md:py-4 rounded-xl text-sm md:text-base"
            >
              اطلب هذا المنتج الآن
            </Link>
            
            {/* إصلاح رابط المعاينة (فتح صفحة المنتج في شي إن) */}
            {product.product_link && (
              <a 
                href={product.product_link} 
                target="_blank" 
                rel="noreferrer" 
                className="block w-full text-center border-2 border-slate-200 py-3 rounded-xl font-bold text-sm md:text-base"
              >
                معاينة المنتج في {product.brand}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetails() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:underline mb-6 md:mb-8">
          &larr; العودة للتسوق
        </Link>
        <Suspense fallback={<div className="text-center p-20 text-xl font-bold">جاري التحميل...</div>}>
          <ProductContent />
        </Suspense>
      </div>
    </div>
  );
}