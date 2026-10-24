"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // كلمة المرور السرية (يمكنك تغييرها لاحقاً)
  const ADMIN_PASSWORD = "wasla2026";

  // دالة جلب الطلبات من قاعدة البيانات
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setOrders(data);
    if (error) console.error(error);
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
    }
  }, [isLoggedIn]);

  // دالة تغيير حالة الطلب
  const updateStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      // تحديث الواجهة بدون إعادة تحميل الصفحة
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    }
  };

  // شاشة تسجيل الدخول
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-6">لوحة تحكم وصلة</h1>
          <input
            type="password"
            placeholder="أدخل كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none mb-4 text-center"
          />
          <button
            onClick={() => {
              if (password === ADMIN_PASSWORD) setIsLoggedIn(true);
              else alert("كلمة المرور غير صحيحة");
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
          >
            دخول
          </button>
          <Link href="/" className="block text-center mt-4 text-sm text-slate-500 hover:underline">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  // لوحة التحكم بعد تسجيل الدخول
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-6 font-sans text-slate-800 dark:text-slate-200">
      <div className="max-w-6xl mx-auto">
        
        {/* رأس الصفحة */}
        <div className="flex justify-between items-center mb-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm">
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">إدارة طلبات وصلة</h1>
          <div className="flex gap-4">
            <button onClick={fetchOrders} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
              تحديث الطلبات
            </button>
            <Link href="/" className="bg-slate-200 dark:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition">
              خروج
            </Link>
          </div>
        </div>

        {/* جدول الطلبات */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4 text-sm font-bold">رقم الطلب</th>
                <th className="p-4 text-sm font-bold">الاسم</th>
                <th className="p-4 text-sm font-bold">الواتساب</th>
                <th className="p-4 text-sm font-bold">الدولة</th>
                <th className="p-4 text-sm font-bold">التفاصيل</th>
                <th className="p-4 text-sm font-bold">الحالة</th>
                <th className="p-4 text-sm font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center p-10">جاري التحميل...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center p-10 text-slate-500">لا توجد طلبات حتى الآن.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="p-4 font-bold text-blue-600 dark:text-blue-400">{order.order_number}</td>
                    <td className="p-4">{order.customer_name}</td>
                    <td className="p-4" dir="ltr">{order.phone_number}</td>
                    <td className="p-4">{order.destination === 'sudan' ? 'السودان' : 'مصر'}</td>
                    <td className="p-4 max-w-xs truncate">{order.product_details}</td>
                    <td className="p-4">
                      <select 
                        value={order.status} 
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-bold outline-none ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'purchased' ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="purchased">تم الشراء</option>
                        <option value="received_ksa">وصل السعودية</option>
                        <option value="shipped">تم الشحن</option>
                        <option value="delivered">تم التوصيل</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <a href={`https://wa.me/${order.phone_number.replace(/\+/g, '')}`} target="_blank" rel="noreferrer" className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-block">
                        واتساب
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}