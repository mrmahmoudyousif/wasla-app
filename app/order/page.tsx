"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function OrderPage() {
  const [orderType, setOrderType] = useState<"link" | "image">("link");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // دالة إرسال الطلب
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const details = formData.get("details") as string;
    const destination = formData.get("destination") as string;

    // توليد رقم طلب عشوائي (مثال: WS-1234)
    const generatedOrderNumber = `WS-${Math.floor(1000 + Math.random() * 9000)}`;

    // إرسال البيانات إلى Supabase
    const { error } = await supabase.from("orders").insert([
      {
        customer_name: name,
        phone_number: phone,
        order_type: orderType,
        product_details: details,
        destination: destination,
        order_number: generatedOrderNumber,
      },
    ]);

    if (error) {
      alert("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
      console.error(error);
    } else {
      setOrderNumber(generatedOrderNumber);
      setSuccess(true);
    }
    setLoading(false);
  };

  // شاشة النجاح التي تظهر بعد الإرسال
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#111827] p-10 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200 dark:border-slate-800">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">تم استلام طلبك بنجاح!</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">رقم طلبك هو:</p>
          <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-3xl font-bold py-4 rounded-xl mb-8 border border-blue-100 dark:border-blue-800">
            {orderNumber}
          </div>
          <p className="text-sm text-slate-500 mb-8">يرجى الاحتفاظ بهذا الرقم لتتبع طلبك. سنتواصل معك على الواتساب لتأكيد السعر.</p>
          <Link href="/" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  // الاستمارة
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 py-12 px-4 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-6">
          &larr; العودة للرئيسية
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">اطلب الآن</h1>
          <p className="text-slate-500 dark:text-slate-400">أرسل لنا تفاصيل طلبك، وسنتواصل معك على الواتساب لتأكيد السعر.</p>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setOrderType("link")}
              className={`flex-1 py-3 text-center font-bold rounded-lg transition-all ${
                orderType === "link" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              لدي رابط المنتج
            </button>
            <button
              type="button"
              onClick={() => setOrderType("image")}
              className={`flex-1 py-3 text-center font-bold rounded-lg transition-all ${
                orderType === "image" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              لدي صورة أو وصف
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {orderType === "link" ? (
              <div>
                <label className="block text-sm font-bold mb-2">رابط المنتج (من شي إن، أمازون، إلخ)</label>
                <input type="url" name="details" required placeholder="https://..." className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">اسم المنتج ووصفه</label>
                  <textarea name="details" required placeholder="مثال: عطر رجالي ماركة فلان..." rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">إرفاق صورة (اختياري)</label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
                    <span className="text-2xl mb-2 block">📸</span>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">اضغط لاختيار صورة</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">اسم مقدم الطلب</label>
                <input type="text" name="name" required placeholder="اكتب اسمك هنا" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">رقم الواتساب (مع رمز الدولة)</label>
                <input type="tel" name="phone" required placeholder="+249xxxxxxxxx" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none" dir="ltr" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">دولة التوصيل</label>
              <select name="destination" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="sudan">السودان</option>
                <option value="egypt">مصر</option>
              </select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                💡 <strong>ملاحظة:</strong> بعد إرسال الطلب، سنقوم بحساب السعر النهائي وإرساله لك. لا نبدأ الشراء إلا بعد استلام الدفعة الأولى.
              </p>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all">
              {loading ? "جاري الإرسال..." : "إرسال الطلب"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}