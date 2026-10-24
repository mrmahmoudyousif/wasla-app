"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  
  // حالة الطلبات
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // حالة المنتجات
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // التحكم في العرض
  const [activeTab, setActiveTab] = useState<"orders" | "settings" | "products">("orders");

  // إعدادات
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [homeTitle, setHomeTitle] = useState("");
  const [homeDescription, setHomeDescription] = useState("");

  // إضافة/تعديل منتج
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "", price: "", description: "", image_url: "", product_link: "", brand: "", category: "عطور", is_featured: false
  });

  // --- دوال الجلب والحفظ ---
  const getAdminPassword = async () => {
    const { data } = await supabase.from("settings").select("value").eq("key", "admin_password").single();
    return data ? data.value : "wasla2026";
  };

  const getHomeSettings = async () => {
    const { data: titleData } = await supabase.from("settings").select("value").eq("key", "home_title").single();
    const { data: descData } = await supabase.from("settings").select("value").eq("key", "home_description").single();
    if (titleData) setHomeTitle(titleData.value);
    if (descData) setHomeDescription(descData.value);
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data);
    setLoadingOrders(false);
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data);
    setLoadingProducts(false);
  };

  useEffect(() => {
    const savedLogin = localStorage.getItem("admin_logged_in");
    if (savedLogin === "true") {
      setIsLoggedIn(true);
      getHomeSettings();
      fetchOrders();
      fetchProducts();
    }
  }, [isLoggedIn]);

  // --- دوال التحكم ---
  const handleLogin = async () => {
    const realPassword = await getAdminPassword();
    if (password === realPassword) {
      setIsLoggedIn(true);
      localStorage.setItem("admin_logged_in", "true");
      getHomeSettings();
      fetchOrders();
      fetchProducts();
    } else {
      alert("كلمة المرور غير صحيحة");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("admin_logged_in");
  };

  const updateStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    if (!error) setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleChangePassword = async () => {
    const realPassword = await getAdminPassword();
    if (currentPassword !== realPassword) return alert("كلمة المرور الحالية غير صحيحة");
    if (newPassword.length < 6) return alert("كلمة المرور الجديدة قصيرة");
    
    // بحث ثم تحديث أو إنشاء
    const { data: existing } = await supabase.from("settings").select("id").eq("key", "admin_password").limit(1);
    let error;
    if (existing && existing.length > 0) {
      const { error: updateError } = await supabase.from("settings").update({ value: newPassword }).eq("key", "admin_password");
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("settings").insert([{ key: "admin_password", value: newPassword }]);
      error = insertError;
    }
    
    if (!error) { alert("تم تغيير كلمة المرور!"); setCurrentPassword(""); setNewPassword(""); }
    else { alert("حدث خطأ أثناء تغيير كلمة المرور."); }
  };

  // حفظ العنوان (بحث ثم تحديث أو إنشاء)
  const saveTitle = async () => {
    const { data: existing } = await supabase.from("settings").select("id").eq("key", "home_title").limit(1);
    
    let error;
    if (existing && existing.length > 0) {
      const { error: updateError } = await supabase.from("settings").update({ value: homeTitle }).eq("key", "home_title");
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("settings").insert([{ key: "home_title", value: homeTitle }]);
      error = insertError;
    }
    
    if (!error) alert("تم حفظ العنوان!"); 
    else alert("حدث خطأ أثناء الحفظ.");
  };

  // حفظ الوصف (بحث ثم تحديث أو إنشاء)
  const saveDescription = async () => {
    const { data: existing } = await supabase.from("settings").select("id").eq("key", "home_description").limit(1);
    
    let error;
    if (existing && existing.length > 0) {
      const { error: updateError } = await supabase.from("settings").update({ value: homeDescription }).eq("key", "home_description");
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("settings").insert([{ key: "home_description", value: homeDescription }]);
      error = insertError;
    }
    
    if (!error) alert("تم حفظ الوصف!"); 
    else alert("حدث خطأ أثناء الحفظ.");
  };

  // حفظ منتج (إضافة أو تعديل)
  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image_url) {
      return alert("يرجى تعبئة الاسم والسعر ورابط الصورة على الأقل.");
    }

    if (editingProductId) {
      const { error } = await supabase.from("products").update(newProduct).eq("id", editingProductId);
      if (!error) {
        alert("تم تعديل المنتج بنجاح!");
        setEditingProductId(null);
        setNewProduct({ name: "", price: "", description: "", image_url: "", product_link: "", brand: "", category: "عطور", is_featured: false });
        fetchProducts();
      } else {
        alert("حدث خطأ أثناء التعديل. تأكد من إضافة سياسة UPDATE لجدول المنتجات.");
      }
    } else {
      const { error } = await supabase.from("products").insert([newProduct]);
      if (!error) {
        alert("تمت إضافة المنتج!");
        setNewProduct({ name: "", price: "", description: "", image_url: "", product_link: "", brand: "", category: "عطور", is_featured: false });
        fetchProducts();
      } else {
        alert("حدث خطأ أثناء الإضافة.");
      }
    }
  };

  // تفعيل وضع التعديل
  const startEdit = (product: any) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name || "",
      price: product.price || "",
      description: product.description || "",
      image_url: product.image_url || "",
      product_link: product.product_link || "",
      brand: product.brand || "",
      category: product.category || "عطور",
      is_featured: product.is_featured || false
    });
    window.scrollTo(0, 0); 
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      await supabase.from("products").delete().eq("id", id);
      fetchProducts();
    }
  };

  // --- الواجهات ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-6">لوحة تحكم وصلة</h1>
          <input type="password" placeholder="أدخل كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none mb-4 text-center" />
          <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition">دخول</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-6 font-sans text-slate-800 dark:text-slate-200">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm gap-4">
          <div className="flex gap-4">
            <button onClick={() => setActiveTab("orders")} className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === "orders" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200"}`}>الطلبات</button>
            <button onClick={() => setActiveTab("products")} className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === "products" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200"}`}>المنتجات</button>
            <button onClick={() => setActiveTab("settings")} className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === "settings" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200"}`}>الإعدادات</button>
          </div>

          <div className="flex gap-4">
            {activeTab === "orders" && (
              <button onClick={fetchOrders} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition">تحديث</button>
            )}
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition">خروج</button>
          </div>
        </div>

        {activeTab === "orders" && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-4 text-sm font-bold">رقم الطلب</th>
                  <th className="p-4 text-sm font-bold">الاسم</th>
                  <th className="p-4 text-sm font-bold">الواتساب</th>
                  <th className="p-4 text-sm font-bold">الدولة</th>
                  <th className="p-4 text-sm font-bold">تفاصيل المنتج</th>
                  <th className="p-4 text-sm font-bold">الحالة</th>
                  <th className="p-4 text-sm font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loadingOrders ? <tr><td colSpan={7} className="text-center p-10">جاري التحميل...</td></tr> : 
                 orders.length === 0 ? <tr><td colSpan={7} className="text-center p-10 text-slate-500">لا توجد طلبات.</td></tr> : 
                 orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="p-4 font-bold text-blue-600">{order.order_number}</td>
                    <td className="p-4">{order.customer_name}</td>
                    <td className="p-4" dir="ltr">{order.phone_number}</td>
                    <td className="p-4">{order.destination === 'sudan' ? 'السودان' : 'مصر'}</td>
                    <td className="p-4 max-w-xs"><span className="truncate block">{order.product_details}</span></td>
                    <td className="p-4">
                      <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 outline-none">
                        <option value="pending">قيد الانتظار</option>
                        <option value="purchased">تم الشراء</option>
                        <option value="received_ksa">وصل السعودية</option>
                        <option value="shipped">تم الشحن</option>
                        <option value="delivered">تم التوصيل</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <a href={`https://wa.me/${order.phone_number.replace(/\+/g, '')}`} target="_blank" className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-block">واتساب</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-8">
            <button onClick={() => setActiveTab("orders")} className="text-sm font-bold text-blue-600 hover:underline">&larr; العودة للطلبات</button>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
              <h2 className="text-xl font-bold mb-4">{editingProductId ? "تعديل منتج" : "إضافة منتج جديد"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="اسم المنتج" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none" />
                <input type="text" placeholder="السعر (مثال: 250 ريال)" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none" />
                <input type="text" placeholder="رابط الصورة (URL)" value={newProduct.image_url} onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none" dir="ltr" />
                <input type="text" placeholder="رابط المنتج الأصلي" value={newProduct.product_link} onChange={(e) => setNewProduct({...newProduct, product_link: e.target.value})} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none" dir="ltr" />
                <input type="text" placeholder="البراند" value={newProduct.brand} onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none" />
                <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 outline-none">
                  <option value="عطور">عطور</option>
                  <option value="إكسسوارات">إكسسوارات</option>
                  <option value="أزياء">أزياء</option>
                  <option value="إلكترونيات">إلكترونيات</option>
                </select>
                <textarea placeholder="وصف المنتج" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none md:col-span-2" rows={2} />
                <label className="flex items-center gap-2 md:col-span-2">
                  <input type="checkbox" checked={newProduct.is_featured} onChange={(e) => setNewProduct({...newProduct, is_featured: e.target.checked})} className="w-5 h-5" />
                  <span className="font-bold text-sm">هل هذا المنتج مميز (يظهر في البانر)؟</span>
                </label>
              </div>
              <div className="flex gap-4 mt-4">
                <button onClick={handleSaveProduct} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition">
                  {editingProductId ? "تحديث المنتج" : "حفظ المنتج"}
                </button>
                {editingProductId && (
                  <button onClick={() => { setEditingProductId(null); setNewProduct({ name: "", price: "", description: "", image_url: "", product_link: "", brand: "", category: "عطور", is_featured: false }); }} className="bg-slate-300 text-slate-800 hover:bg-slate-400 font-bold py-3 px-6 rounded-xl transition">
                    إلغاء التعديل
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-4 text-sm font-bold">الصورة</th>
                    <th className="p-4 text-sm font-bold">الاسم</th>
                    <th className="p-4 text-sm font-bold">السعر</th>
                    <th className="p-4 text-sm font-bold">التصنيف</th>
                    <th className="p-4 text-sm font-bold">مميز؟</th>
                    <th className="p-4 text-sm font-bold">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700">
                      <td className="p-4"><img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover" /></td>
                      <td className="p-4 font-bold">{p.name}</td>
                      <td className="p-4">{p.price}</td>
                      <td className="p-4">{p.category}</td>
                      <td className="p-4">{p.is_featured ? "✅" : "❌"}</td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => startEdit(p)} className="text-blue-600 hover:underline font-bold text-sm">تعديل</button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:underline font-bold text-sm">حذف</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm space-y-8">
            <button onClick={() => setActiveTab("orders")} className="text-sm font-bold text-blue-600 hover:underline mb-4 inline-block">&larr; العودة للطلبات</button>
            
            <div>
              <h2 className="text-xl font-bold mb-4">تغيير كلمة المرور</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <input type="password" placeholder="كلمة المرور الحالية" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none" />
                <input type="password" placeholder="كلمة المرور الجديدة" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none" />
                <button onClick={handleChangePassword} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition">حفظ</button>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h2 className="text-xl font-bold mb-4">نصوص الصفحة الرئيسية</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">العنوان الرئيسي</label>
                  <div className="flex gap-4">
                    <input type="text" value={homeTitle} onChange={(e) => setHomeTitle(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none" />
                    <button onClick={saveTitle} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition">حفظ</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">الوصف</label>
                  <div className="flex flex-col gap-4">
                    <textarea rows={3} value={homeDescription} onChange={(e) => setHomeDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent outline-none" />
                    <button onClick={saveDescription} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition self-start">حفظ</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}