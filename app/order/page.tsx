"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

function OrderFormContent() {
  const searchParams = useSearchParams();
  const initialProduct = searchParams.get("productName") || "";
  const initialLink = searchParams.get("productLink") || "";

  const [orderType, setOrderType] = useState<"link" | "image">("link");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  
  const [productDetails, setProductDetails] = useState(initialLink || initialProduct);
  const [quantity, setQuantity] = useState("1");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const destination = formData.get("destination") as string;

    const generatedOrderNumber = `WS-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalDetails = `الكمية: ${quantity} | التفاصيل: ${productDetails}`;

    const { error } = await supabase.from("orders").insert([
      {
        customer_name: name,
        phone_number: phone,
        order_type: orderType,
        product_details: finalDetails,
        destination: destination,
        order_number: generatedOrderNumber,
      },
    ]);

    if (error) {
      alert("حدث خطأ أثناء إرسال الطلب.");
      console.error(error);
    } else {
      setOrderNumber(generatedOrderNumber);
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#111827] p-6 md:p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="text-4xl md:text-6xl mb-4 md:mb-6">✅</div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">تم استلام طلبك بنجاح!</h1>
          <p className="text-sm md:text-base text-slate-500 mb-6">رقم طلبك هو:</p>
          <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-2xl md:text-3xl font-bold py-3 md:py-4 rounded-xl mb-6 md:mb-8">
            {orderNumber}
          </div>
          <Link href="/" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm md:text-base">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-8 md:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-blue-600 mb-6">&larr; العودة للرئيسية</Link>
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3">اطلب الآن</h1>
          <p className="text-sm md:text-base text-slate-500">أرسل لنا تفاصيل طلبك، وسنتواصل معك على الواتساب.</p>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-8">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 md:mb-8">
            <button type="button" onClick={() => setOrderType("link")} className={`flex-1 py-2 md:py-3 text-center font-bold rounded-lg transition-all text-sm md:text-base ${orderType === "link" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500"}`}>لدي رابط المنتج</button>
            <button type="button" onClick={() => setOrderType("image")} className={`flex-1 py-2 md:py-3 text-center font-bold rounded-lg transition-all text-sm md:text-base ${orderType === "image" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500"}`}>لدي صورة أو وصف</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {orderType === "link" ? (
              <div>
                <label className="block text-sm font-bold mb-2">رابط المنتج أو تفاصيله</label>
                <input type="text" value={productDetails} onChange={(e) => setProductDetails(e.target.value)} required placeholder="https://..." className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-sm md:text-base" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">اسم المنتج ووصفه</label>
                  <textarea value={productDetails} onChange={(e) => setProductDetails(e.target.value)} required rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-sm md:text-base"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">إرفاق صورة (اختياري)</label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 md:p-6 text-center"><span className="text-xl md:text-2xl mb-2 block">📸</span><span className="text-xs md:text-sm font-semibold text-blue-600">اضغط لاختيار صورة</span></div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold mb-2">الكمية المطلوبة</label>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-sm md:text-base" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">اسم مقدم الطلب</label>
                <input type="text" name="name" required placeholder="اكتب اسمك هنا" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-sm md:text-base" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">رقم الواتساب (مع رمز الدولة)</label>
                <input type="tel" name="phone" required placeholder="+249xxxxxxxxx" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-sm md:text-base" dir="ltr" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">دولة التوصيل</label>
              <select name="destination" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] focus:ring-2 focus:ring-blue-500 outline-none text-sm md:text-base">
                <option value="sudan">السودان</option>
                <option value="egypt">مصر</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-base md:text-lg py-3 md:py-4 rounded-xl shadow-lg transition-all">
              {loading ? "جاري الإرسال..." : "إرسال الطلب"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="text-center p-20 text-xl font-bold">جاري التحميل...</div>}>
      <OrderFormContent />
    </Suspense>
  );
}