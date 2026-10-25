"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast"; // استيراد الإشعارات

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "deleted" | "settings" | "products">("orders");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // إعدادات
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [homeTitle, setHomeTitle] = useState("");
  const [homeDescription, setHomeDescription] = useState("");
  const [marqueeText, setMarqueeText] = useState("");
  const [marqueeStatus, setMarqueeStatus] = useState("off");
  const [activeTheme, setActiveTheme] = useState("light"); // الثيم الافتراضي

  // إضافة/تعديل منتج
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "", price: "", description: "", image_url: "", product_link: "", brand: "", category: "", is_featured: false
  });

  // تطبيق الثيم عند الدخول
  useEffect(() => {
    document.documentElement.classList.remove("theme-pink", "theme-emerald", "theme-royal");
    if (activeTheme === "pink") document.documentElement.classList.add("theme-pink");
    else if (activeTheme === "emerald") document.documentElement.classList.add("theme-emerald");
    else if (activeTheme === "royal") document.documentElement.classList.add("theme-royal");
  }, [activeTheme]);

  const getAdminPassword = async () => {
    const { data } = await supabase.from("settings").select("value").eq("key", "admin_password").single();
    return data ? data.value : "wasla2026";
  };

  const getHomeSettings = async () => {
    const { data: titleData } = await supabase.from("settings").select("value").eq("key", "home_title").single();
    const { data: descData } = await supabase.from("settings").select("value").eq("key", "home_description").single();
    const { data: marqueeData } = await supabase.from("settings").select("value").eq("key", "marquee_text").single();
    const { data: marqueeStatusData } = await supabase.from("settings").select("value").eq("key", "marquee_status").single();
    const { data: themeData } = await supabase.from("settings").select("value").eq("key", "active_theme").single();

    if (titleData) setHomeTitle(titleData.value);
    if (descData) setHomeDescription(descData.value);
    if (marqueeData) setMarqueeText(marqueeData.value);
    if (marqueeStatusData) setMarqueeStatus(marqueeStatusData.value);
    if (themeData) setActiveTheme(themeData.value);
  };

  const fetchOrders = async (showToast = false) => {
    if (showToast) toast.loading("جاري تحديث الطلبات...", { id: "refresh" });
    
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (activeTab === "deleted") {
      query = query.eq("is_deleted", true);
    } else {
      query = query.eq("is_deleted", false);
    }
    const { data } = await query;
    if (data) setOrders(data);
    
    if (showToast) toast.success("تم تحديث الطلبات بنجاح!", { id: "refresh" });
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data);
  };

  useEffect(() => {
    const savedLogin = localStorage.getItem("admin_logged_in");
    if (savedLogin === "true") {
      setIsLoggedIn(true);
      getHomeSettings(); fetchOrders(); fetchProducts();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      if (activeTab === "orders" || activeTab === "deleted") {
        fetchOrders();
      }
    }
  }, [activeTab, isLoggedIn]);

  const handleLogin = async () => {
    const realPassword = await getAdminPassword();
    if (password === realPassword) {
      setIsLoggedIn(true);
      localStorage.setItem("admin_logged_in", "true");
      toast.success("مرحباً بك في لوحة التحكم");
      getHomeSettings(); fetchOrders(); fetchProducts();
    } else { 
      toast.error("كلمة المرور غير صحيحة"); 
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("admin_logged_in");
    toast.success("تم تسجيل الخروج");
  };

  const updateStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === id) setSelectedOrder({ ...selectedOrder, status: newStatus });
      toast.success("تم تحديث الحالة");
    } else {
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const softDeleteOrder = async (id: number) => {
    if (window.confirm("هل أنت متأكد من إلغاء وحذف هذا الطلب؟ (سيتم نقله إلى سلة المحذوفات)")) {
      const toastId = toast.loading("جاري الحذف...");
      const { error } = await supabase.from("orders").update({ is_deleted: true }).eq("id", id);
      if (!error) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === id) setSelectedOrder(null);
        toast.success("تم نقل الطلب لسلة المحذوفات", { id: toastId });
      } else {
        toast.error("حدث خطأ أثناء الحذف", { id: toastId });
      }
    }
  };

  const restoreOrder = async (id: number) => {
    const toastId = toast.loading("جاري الاستعادة...");
    const { error } = await supabase.from("orders").update({ is_deleted: false }).eq("id", id);
    if (!error) {
      fetchOrders();
      if (selectedOrder && selectedOrder.id === id) setSelectedOrder(null);
      toast.success("تم استعادة الطلب بنجاح", { id: toastId });
    } else {
      toast.error("حدث خطأ أثناء الاستعادة", { id: toastId });
    }
  };

  const handleChangePassword = async () => {
    const realPassword = await getAdminPassword();
    if (currentPassword !== realPassword) return toast.error("كلمة المرور الحالية غير صحيحة");
    if (newPassword.length < 6) return toast.error("كلمة المرور الجديدة قصيرة (6 أحرف على الأقل)");
    
    const { data: existing } = await supabase.from("settings").select("id").eq("key", "admin_password").limit(1);
    let error;
    if (existing && existing.length > 0) {
      const { error: updateError } = await supabase.from("settings").update({ value: newPassword }).eq("key", "admin_password");
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("settings").insert([{ key: "admin_password", value: newPassword }]);
      error = insertError;
    }
    if (!error) { 
      toast.success("تم تغيير كلمة المرور بنجاح!"); 
      setCurrentPassword(""); setNewPassword(""); 
    } else {
      toast.error("حدث خطأ أثناء تغيير كلمة المرور");
    }
  };

  const saveHomeSettings = async () => {
    const toastId = toast.loading("جاري حفظ الإعدادات...");
    const updates = [
      { key: "home_title", value: homeTitle },
      { key: "home_description", value: homeDescription },
      { key: "marquee_text", value: marqueeText },
      { key: "marquee_status", value: marqueeStatus },
      { key: "active_theme", value: activeTheme }
    ];

    for (const item of updates) {
      const { data: existing } = await supabase.from("settings").select("id").eq("key", item.key).limit(1);
      if (existing && existing.length > 0) {
        await supabase.from("settings").update({ value: item.value }).eq("key", item.key);
      } else {
        await supabase.from("settings").insert([{ key: item.key, value: item.value }]);
      }
    }
    toast.success("تم حفظ جميع الإعدادات بنجاح!", { id: toastId });
  };

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image_url) {
      return toast.error("يرجى تعبئة الاسم والسعر ورابط الصورة.");
    }

    const toastId = toast.loading(editingProductId ? "جاري تعديل المنتج..." : "جاري إضافة المنتج...");

    if (editingProductId) {
      const { error } = await supabase.from("products").update(newProduct).eq("id", editingProductId);
      if (!error) {
        toast.success("تم تعديل المنتج بنجاح!", { id: toastId });
        setEditingProductId(null);
        setNewProduct({ name: "", price: "", description: "", image_url: "", product_link: "", brand: "", category: "", is_featured: false });
        fetchProducts();
      } else {
        toast.error("حدث خطأ أثناء التعديل.", { id: toastId });
      }
    } else {
      const { error } = await supabase.from("products").insert([newProduct]);
      if (!error) {
        toast.success("تمت إضافة المنتج بنجاح!", { id: toastId });
        setNewProduct({ name: "", price: "", description: "", image_url: "", product_link: "", brand: "", category: "", is_featured: false });
        fetchProducts();
      } else {
        toast.error("حدث خطأ أثناء الإضافة.", { id: toastId });
      }
    }
  };

  const startEdit = (product: any) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name || "", price: product.price || "", description: product.description || "",
      image_url: product.image_url || "", product_link: product.product_link || "",
      brand: product.brand || "", category: product.category || "", is_featured: product.is_featured || false
    });
    window.scrollTo(0, 0); 
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج نهائياً؟")) {
      const toastId = toast.loading("جاري الحذف...");
      await supabase.from("products").delete().eq("id", id);
      fetchProducts();
      toast.success("تم حذف المنتج", { id: toastId });
    }
  };

  const statusOptions = [
    { value: "pending", label: "قيد الانتظار" },
    { value: "purchased", label: "تم الشراء" },
    { value: "with_courier", label: "وصلت للمندوب" },
    { value: "shipped", label: "تم الشحن" },
    { value: "delivered", label: "تم التوصيل" },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-4 transition-colors duration-300">
        <div className="bg-[var(--card-bg)] p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-center text-[var(--text-main)] mb-6">لوحة تحكم وصلة</h1>
          <input type="password" placeholder="أدخل كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none mb-4 text-center transition-all" />
          <button onClick={handleLogin} className="w-full bg-theme text-white font-bold py-3 rounded-xl transition hover:scale-[1.02] hover:shadow-lg">دخول</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] p-6 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-[var(--card-bg)] p-4 rounded-2xl shadow-sm gap-4 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap gap-2 md:gap-4">
            <button onClick={() => setActiveTab("orders")} className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 hover:scale-105 ${activeTab === "orders" ? "bg-theme text-white shadow-lg" : "bg-black/5 dark:bg-white/5 hover:bg-black/10"}`}>الطلبات</button>
            <button onClick={() => setActiveTab("deleted")} className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 hover:scale-105 ${activeTab === "deleted" ? "bg-red-600 text-white shadow-lg" : "bg-black/5 dark:bg-white/5 hover:bg-black/10"}`}>سلة المحذوفات</button>
            <button onClick={() => setActiveTab("products")} className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 hover:scale-105 ${activeTab === "products" ? "bg-theme text-white shadow-lg" : "bg-black/5 dark:bg-white/5 hover:bg-black/10"}`}>المنتجات</button>
            <button onClick={() => setActiveTab("settings")} className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 hover:scale-105 ${activeTab === "settings" ? "bg-theme text-white shadow-lg" : "bg-black/5 dark:bg-white/5 hover:bg-black/10"}`}>الإعدادات</button>
          </div>
          <div className="flex gap-4">
            {(activeTab === "orders" || activeTab === "deleted") && (
              <button onClick={() => fetchOrders(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:scale-105 shadow-md">تحديث</button>
            )}
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:scale-105 shadow-md">خروج</button>
          </div>
        </div>

        {(activeTab === "orders" || activeTab === "deleted") && (
          <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm overflow-hidden overflow-x-auto border border-slate-200 dark:border-slate-800">
            <table className="w-full text-right border-collapse">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-4 text-sm font-bold">رقم الطلب</th>
                  <th className="p-4 text-sm font-bold">الاسم</th>
                  <th className="p-4 text-sm font-bold">الواتساب</th>
                  <th className="p-4 text-sm font-bold">الحالة</th>
                  <th className="p-4 text-sm font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-theme">{order.order_number}</td>
                    <td className="p-4">{order.customer_name}</td>
                    <td className="p-4" dir="ltr">{order.phone_number}</td>
                    <td className="p-4">
                      {activeTab === "orders" ? (
                        <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className="px-3 py-1 rounded-full text-xs font-bold bg-theme/10 text-theme outline-none cursor-pointer hover:bg-theme/20 transition-colors">
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">ملغي</span>
                      )}
                    </td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => setSelectedOrder(order)} className="bg-slate-200 text-slate-800 hover:bg-slate-300 hover:scale-105 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">عرض</button>
                      {activeTab === "orders" ? (
                        <button onClick={() => softDeleteOrder(order.id)} className="bg-red-500 text-white hover:bg-red-600 hover:scale-105 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">حذف</button>
                      ) : (
                        <button onClick={() => restoreOrder(order.id)} className="bg-green-500 text-white hover:bg-green-600 hover:scale-105 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">استعادة</button>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={5} className="text-center p-10 opacity-50">لا توجد طلبات هنا.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[var(--card-bg)] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-black/5 dark:bg-white/5">
                <h3 className="font-bold text-lg text-theme">تفاصيل الطلب: {selectedOrder.order_number}</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-red-500 font-bold text-xl hover:scale-125 transition-transform">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <p><strong>الاسم:</strong> {selectedOrder.customer_name}</p>
                <p><strong>الواتساب:</strong> {selectedOrder.phone_number}</p>
                <p><strong>الدولة:</strong> {selectedOrder.destination === 'sudan' ? 'السودان' : 'مصر'}</p>
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl">
                  <p className="text-sm opacity-70 mb-2">تفاصيل المنتج:</p>
                  <p className="font-bold break-words">{selectedOrder.product_details}</p>
                  {selectedOrder.product_details?.includes('http') && (
                    <button onClick={() => { navigator.clipboard.writeText(selectedOrder.product_details); toast.success('تم نسخ الرابط!'); }} className="mt-2 text-xs text-theme underline hover:opacity-80 transition-colors">نسخ الرابط</button>
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                <button onClick={() => setSelectedOrder(null)} className="bg-slate-300 hover:bg-slate-400 px-4 py-2 rounded-xl font-bold transition-colors">إغلاق</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-8">
            <div className="bg-[var(--card-bg)] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold mb-4 text-theme">{editingProductId ? "تعديل منتج" : "إضافة منتج"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="اسم المنتج" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all" />
                <input type="text" placeholder="السعر" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all" />
                <input type="text" placeholder="رابط الصورة" value={newProduct.image_url} onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all" dir="ltr" />
                <input type="text" placeholder="رابط المنتج الأصلي" value={newProduct.product_link} onChange={(e) => setNewProduct({...newProduct, product_link: e.target.value})} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all" dir="ltr" />
                <input type="text" placeholder="البراند" value={newProduct.brand} onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all" />
                
                <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-[var(--card-bg)] outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all cursor-pointer">
                  <option value="">اختر التصنيف...</option>
                  <option value="عطور">عطور</option>
                  <option value="إكسسوارات">إكسسوارات</option>
                  <option value="أزياء">أزياء</option>
                  <option value="إلكترونيات">إلكترونيات</option>
                </select>
                
                <textarea placeholder="الوصف" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all md:col-span-2" rows={2} />
                
                <label className="flex items-center gap-2 md:col-span-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <input type="checkbox" checked={newProduct.is_featured} onChange={(e) => setNewProduct({...newProduct, is_featured: e.target.checked})} className="w-5 h-5 cursor-pointer accent-[var(--primary)]" />
                  <span className="font-bold text-sm">هل هذا المنتج مميز (يظهر في البانر)؟</span>
                </label>
              </div>
              <div className="flex gap-4 mt-4">
                <button onClick={handleSaveProduct} className="bg-theme text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 hover:scale-105 transition-all shadow-md">{editingProductId ? "تحديث" : "حفظ"}</button>
                {editingProductId && <button onClick={() => { setEditingProductId(null); setNewProduct({ name: "", price: "", description: "", image_url: "", product_link: "", brand: "", category: "", is_featured: false }); }} className="bg-slate-300 text-slate-800 hover:bg-slate-400 hover:scale-105 font-bold py-3 px-6 rounded-xl transition-all">إلغاء</button>}
              </div>
            </div>

            <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm overflow-hidden overflow-x-auto border border-slate-200 dark:border-slate-800">
              <table className="w-full text-right border-collapse">
                <thead className="bg-black/5 dark:bg-white/5 border-b border-slate-200 dark:border-slate-700">
                  <tr><th className="p-4">الصورة</th><th className="p-4">الاسم</th><th className="p-4">السعر</th><th className="p-4">مميز؟</th><th className="p-4">إجراءات</th></tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4"><img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover shadow-sm" /></td>
                      <td className="p-4 font-bold">{p.name}</td>
                      <td className="p-4">{p.price}</td>
                      <td className="p-4">{p.is_featured ? "✅" : "❌"}</td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => startEdit(p)} className="text-theme hover:opacity-70 hover:scale-110 font-bold text-sm transition-all">تعديل</button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:text-red-700 hover:scale-110 font-bold text-sm transition-all">حذف</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-[var(--card-bg)] p-6 rounded-2xl shadow-sm space-y-8 border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold mb-4 text-theme">تغيير كلمة المرور</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <input type="password" placeholder="كلمة المرور الحالية" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all" />
                <input type="password" placeholder="كلمة المرور الجديدة" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all" />
                <button onClick={handleChangePassword} className="bg-theme text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 hover:scale-105 transition-all shadow-md">حفظ</button>
              </div>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h2 className="text-xl font-bold mb-4 text-theme">نصوص الصفحة الرئيسية والإعلانات</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">العنوان الرئيسي</label>
                  <input type="text" value={homeTitle} onChange={(e) => setHomeTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">الوصف</label>
                  <textarea rows={3} value={homeDescription} onChange={(e) => setHomeDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all" />
                </div>
                
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold mb-3 text-theme">الشريط الإعلاني (Marquee)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">نص الإعلان</label>
                      <input type="text" value={marqueeText} onChange={(e) => setMarqueeText(e.target.value)} placeholder="مثال: شحن مجاني للطلبات فوق 500 ريال!" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">حالة الشريط</label>
                      <select value={marqueeStatus} onChange={(e) => setMarqueeStatus(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-[var(--card-bg)] outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all cursor-pointer">
                        <option value="on">مفعل (يظهر في الموقع)</option>
                        <option value="off">متوقف (مخفي)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold mb-3 text-theme">لون الموقع (الثيم)</h3>
                  <select value={activeTheme} onChange={(e) => setActiveTheme(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-[var(--card-bg)] outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all cursor-pointer">
                    <option value="light">النهاري (الافتراضي)</option>
                    <option value="pink">الوردي (Pink)</option>
                    <option value="emerald">الزمردي (Emerald)</option>
                    <option value="royal">الملكي (Royal)</option>
                  </select>
                </div>

                <button onClick={saveHomeSettings} className="w-full bg-theme text-white font-bold py-4 rounded-xl transition-all shadow-md hover:scale-[1.01]">
                  حفظ جميع الإعدادات
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}