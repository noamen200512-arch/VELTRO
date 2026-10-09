
import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

const KEYS = {
  products: "veltro_products",
  sales: "veltro_sales",
  purchases: "veltro_purchases",
  suppliers: "veltro_suppliers",
  customers: "veltro_customers",
  expenses: "veltro_expenses",
  movements: "veltro_cash_movements",
  offers: "veltro_offers",
  language: "veltro_language",
};

const read = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const money = (value) =>
  `${Number(value || 0).toLocaleString("fr-DZ", {
    maximumFractionDigits: 2,
  })} DA`;

const emptyProduct = () => ({
  id: uid(),
  name: "",
  barcode: "",
  reference: "",
  category: "",
  quantity: 0,
  purchasePrice: 0,
  salePrice1: 0,
  salePrice2: 0,
  salePrice3: 0,
  unit: "piece",
  minStock: 5,
  expiryDate: "",
  image: "",
  createdAt: new Date().toISOString(),
});

const normalizeProduct = (p) => ({
  ...emptyProduct(),
  ...p,
  id: p.id || uid(),
  name: p.name || "",
  barcode: p.barcode || "",
  reference: p.reference || "",
  category: p.category || "",
  quantity: Number(p.quantity || 0),
  purchasePrice: Number(p.purchasePrice || 0),
  salePrice1: Number(p.salePrice1 ?? p.salePrice ?? 0),
  salePrice2: Number(p.salePrice2 || 0),
  salePrice3: Number(p.salePrice3 || 0),
  minStock: Number(p.minStock ?? 5),
});

const LANG = {
  ar: {
    dashboard: "لوحة التحكم", pos: "نقطة البيع", products: "المنتجات",
    purchases: "المشتريات", suppliers: "الموردون", customers: "العملاء",
    stock: "المخزون", expenses: "المصروفات", cash: "الصندوق",
    reports: "التقارير", offers: "العروض", settings: "الإعدادات",
    search: "ابحث هنا...", name: "الاسم", barcode: "الباركود",
    quantity: "الكمية", purchasePrice: "سعر الشراء", salePrice: "سعر البيع",
    category: "الفئة", save: "حفظ", cancel: "إلغاء", edit: "تعديل",
    delete: "حذف", add: "إضافة", actions: "الإجراءات", total: "الإجمالي",
    date: "التاريخ", price: "السعر", dashboardTitle: "ملخص نشاطك التجاري",
    productsCount: "عدد المنتجات", salesToday: "مبيعات اليوم",
    stockValue: "قيمة المخزون", lowStock: "منتجات قاربت على النفاد",
    noData: "لا توجد بيانات بعد", checkout: "إتمام البيع",
    cart: "سلة المبيعات", clear: "تفريغ السلة", payment: "طريقة الدفع",
    cashPayment: "نقدًا", cardPayment: "بطاقة", creditPayment: "دين",
    customer: "العميل", supplier: "المورد", description: "الوصف",
    amount: "المبلغ", addProduct: "منتج جديد", productName: "اسم المنتج",
    stockIn: "إدخال مخزون", stockOut: "إخراج مخزون", confirm: "تأكيد",
    language: "اللغة", localStorage: "التخزين المحلي",
    cloudLater: "المزامنة السحابية ستضاف لاحقًا",
    offerProduct: "المنتج", buyQty: "الكمية المطلوبة",
    freeQty: "الكمية المجانية",
    offersNote: "تُحسب القطع المجانية تلقائيًا عند البيع وتُخصم من المخزون.",
    receipt: "طباعة الفاتورة", profit: "الربح التقريبي", units: "الوحدات",
    unit: "الوحدة", minStock: "حد التنبيه", reference: "المرجع",
    expiryDate: "تاريخ الصلاحية", all: "الكل", today: "اليوم",
    paid: "مدفوع", unpaid: "غير مدفوع", phone: "الهاتف",
    type: "النوع", reason: "السبب",
    stockValueNote: "القيمة محسوبة بسعر الشراء",
    deleteConfirm: "هل تريد حذف هذا العنصر؟", saved: "تم الحفظ بنجاح",
  },
  fr: {
    dashboard: "Tableau de bord", pos: "Point de vente", products: "Produits",
    purchases: "Achats", suppliers: "Fournisseurs", customers: "Clients",
    stock: "Stock", expenses: "Dépenses", cash: "Caisse",
    reports: "Rapports", offers: "Promotions", settings: "Paramètres",
    search: "Rechercher...", name: "Nom", barcode: "Code-barres",
    quantity: "Quantité", purchasePrice: "Prix d'achat",
    salePrice: "Prix de vente", category: "Catégorie",
    save: "Enregistrer", cancel: "Annuler", edit: "Modifier",
    delete: "Supprimer", add: "Ajouter", actions: "Actions", total: "Total",
    date: "Date", price: "Prix", dashboardTitle: "Résumé de votre activité",
    productsCount: "Produits", salesToday: "Ventes du jour",
    stockValue: "Valeur du stock", lowStock: "Stock faible",
    noData: "Aucune donnée", checkout: "Valider la vente", cart: "Panier",
    clear: "Vider", payment: "Paiement", cashPayment: "Espèces",
    cardPayment: "Carte", creditPayment: "Crédit", customer: "Client",
    supplier: "Fournisseur", description: "Description", amount: "Montant",
    addProduct: "Nouveau produit", productName: "Nom du produit",
    stockIn: "Entrée de stock", stockOut: "Sortie de stock",
    confirm: "Confirmer", language: "Langue", localStorage: "Stockage local",
    cloudLater: "Synchronisation cloud ultérieure", offerProduct: "Produit",
    buyQty: "Quantité requise", freeQty: "Quantité gratuite",
    offersNote: "Les articles gratuits sont calculés et déduits du stock.",
    receipt: "Imprimer le reçu", profit: "Bénéfice estimé", units: "Unités",
    unit: "Unité", minStock: "Seuil d'alerte", reference: "Référence",
    expiryDate: "Expiration", all: "Tous", today: "Aujourd'hui",
    paid: "Payé", unpaid: "Impayé", phone: "Téléphone", type: "Type",
    reason: "Motif", stockValueNote: "Calcul au prix d'achat",
    deleteConfirm: "Supprimer cet élément ?", saved: "Enregistré",
  },
  en: {
    dashboard: "Dashboard", pos: "Point of Sale", products: "Products",
    purchases: "Purchases", suppliers: "Suppliers", customers: "Customers",
    stock: "Inventory", expenses: "Expenses", cash: "Cash Register",
    reports: "Reports", offers: "Offers", settings: "Settings",
    search: "Search...", name: "Name", barcode: "Barcode",
    quantity: "Quantity", purchasePrice: "Purchase price",
    salePrice: "Sale price", category: "Category", save: "Save",
    cancel: "Cancel", edit: "Edit", delete: "Delete", add: "Add",
    actions: "Actions", total: "Total", date: "Date", price: "Price",
    dashboardTitle: "Business overview", productsCount: "Products",
    salesToday: "Today's sales", stockValue: "Stock value",
    lowStock: "Low stock", noData: "No data yet",
    checkout: "Complete sale", cart: "Cart", clear: "Clear cart",
    payment: "Payment method", cashPayment: "Cash", cardPayment: "Card",
    creditPayment: "Credit", customer: "Customer", supplier: "Supplier",
    description: "Description", amount: "Amount", addProduct: "New product",
    productName: "Product name", stockIn: "Stock in", stockOut: "Stock out",
    confirm: "Confirm", language: "Language", localStorage: "Local storage",
    cloudLater: "Cloud sync will be added later", offerProduct: "Product",
    buyQty: "Required quantity", freeQty: "Free quantity",
    offersNote: "Free items are calculated and deducted from stock.",
    receipt: "Print receipt", profit: "Estimated profit", units: "Units",
    unit: "Unit", minStock: "Alert threshold", reference: "Reference",
    expiryDate: "Expiry date", all: "All", today: "Today", paid: "Paid",
    unpaid: "Unpaid", phone: "Phone", type: "Type", reason: "Reason",
    stockValueNote: "Calculated at purchase price",
    deleteConfirm: "Delete this item?", saved: "Saved successfully",
  },
};

const NAV = [
  ["dashboard", "⌂"], ["pos", "▣"], ["products", "▤"],
  ["purchases", "⇧"], ["suppliers", "♧"], ["customers", "♙"],
  ["stock", "▦"], ["offers", "✦"], ["expenses", "−"],
  ["cash", "◉"], ["reports", "▥"], ["settings", "⚙"],
];

function App() {
  const [lang, setLang] = useState(() => read(KEYS.language, "ar"));
  const t = LANG[lang] || LANG.ar;
  const rtl = lang === "ar";

  const [products, setProducts] = useState(() =>
    read(KEYS.products, []).map(normalizeProduct)
  );
  const [sales, setSales] = useState(() => read(KEYS.sales, []));
  const [purchases, setPurchases] = useState(() => read(KEYS.purchases, []));
  const [suppliers, setSuppliers] = useState(() => read(KEYS.suppliers, []));
  const [customers, setCustomers] = useState(() => read(KEYS.customers, []));
  const [expenses, setExpenses] = useState(() => read(KEYS.expenses, []));
  const [movements, setMovements] = useState(() => read(KEYS.movements, []));
  const [offers, setOffers] = useState(() => read(KEYS.offers, []));

  const [page, setPage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [form, setForm] = useState(emptyProduct());
  const [cart, setCart] = useState([]);
  const [scan, setScan] = useState("");
  const [payment, setPayment] = useState("cash");
  const [saleCustomer, setSaleCustomer] = useState("");
  const [recordName, setRecordName] = useState("");
  const [recordPhone, setRecordPhone] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [buyQty, setBuyQty] = useState("10");
  const [freeQty, setFreeQty] = useState("1");
  const [stockQty, setStockQty] = useState("");
  const [stockReason, setStockReason] = useState("");
  const [stockDirection, setStockDirection] = useState("in");
  const [purchaseProduct, setPurchaseProduct] = useState("");
  const [purchaseQty, setPurchaseQty] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseSupplier, setPurchaseSupplier] = useState("");
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  useEffect(() => localStorage.setItem(KEYS.products, JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem(KEYS.sales, JSON.stringify(sales)), [sales]);
  useEffect(() => localStorage.setItem(KEYS.purchases, JSON.stringify(purchases)), [purchases]);
  useEffect(() => localStorage.setItem(KEYS.suppliers, JSON.stringify(suppliers)), [suppliers]);
  useEffect(() => localStorage.setItem(KEYS.customers, JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem(KEYS.expenses, JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem(KEYS.movements, JSON.stringify(movements)), [movements]);
  useEffect(() => localStorage.setItem(KEYS.offers, JSON.stringify(offers)), [offers]);
  useEffect(() => localStorage.setItem(KEYS.language, JSON.stringify(lang)), [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }, [lang, rtl]);

  const today = new Date().toLocaleDateString("en-CA");
  const todaySales = sales.filter((s) => s.date?.slice(0, 10) === today);
  const salesTodayTotal = todaySales.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const stockValue = products.reduce((sum, p) => sum + p.quantity * p.purchasePrice, 0);
  const lowStock = products.filter((p) => p.quantity <= p.minStock);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) =>
      [p.name, p.barcode, p.reference, p.category]
        .some((v) => String(v || "").toLowerCase().includes(q))
    );
  }, [products, search]);

  const notify = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 3000);
  };

  const changeProduct = (key, value) =>
    setForm((old) => ({ ...old, [key]: value }));

  const openNewProduct = () => {
    setEditing(null);
    setForm(emptyProduct());
    setShowProductForm(true);
  };

  const openEditProduct = (product) => {
    setEditing(product.id);
    setForm({ ...emptyProduct(), ...product });
    setShowProductForm(true);
  };

  const closeProductForm = () => {
    setEditing(null);
    setForm(emptyProduct());
    setShowProductForm(false);
  };

  const saveProduct = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return notify(t.productName);

    const barcode = String(form.barcode || "").trim();
    if (barcode && products.some((p) => p.barcode === barcode && p.id !== editing)) {
      return notify(`${t.barcode}: موجود مسبقًا`);
    }

    const clean = normalizeProduct({
      ...form,
      name: form.name.trim(),
      barcode,
      quantity: Number(form.quantity || 0),
      purchasePrice: Number(form.purchasePrice || 0),
      salePrice1: Number(form.salePrice1 || 0),
      salePrice2: Number(form.salePrice2 || 0),
      salePrice3: Number(form.salePrice3 || 0),
      minStock: Number(form.minStock || 0),
      updatedAt: new Date().toISOString(),
    });

    setProducts((old) =>
      editing
        ? old.map((p) => p.id === editing ? clean : p)
        : [clean, ...old]
    );

    closeProductForm();
    notify(t.saved);
  };

  const deleteProduct = (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    setProducts((old) => old.filter((p) => p.id !== id));
    setCart((old) => old.filter((item) => item.productId !== id));
  };

  const addToCart = (product) => {
    if (!product) return;
    const found = cart.find((item) => item.productId === product.id);
    if ((found?.qty || 0) + 1 > product.quantity) {
      return notify("الكمية المتوفرة في المخزون غير كافية");
    }

    setCart((old) => {
      const item = old.find((x) => x.productId === product.id);
      if (item) {
        return old.map((x) =>
          x.productId === product.id ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [...old, {
        productId: product.id,
        name: product.name,
        price: product.salePrice1,
        qty: 1,
      }];
    });
  };

  const scanProduct = (event) => {
    event.preventDefault();
    const p = products.find((item) =>
      item.barcode === scan.trim() || item.reference === scan.trim()
    );
    if (!p) notify("لم يتم العثور على المنتج");
    else addToCart(p);
    setScan("");
  };

  const updateCartQty = (productId, qty) => {
    const product = products.find((p) => p.id === productId);
    const n = Math.max(0, Number(qty || 0));
    if (product && n > product.quantity) return notify("المخزون غير كافٍ");
    setCart((old) => old
      .map((item) => item.productId === productId ? { ...item, qty: n } : item)
      .filter((item) => item.qty > 0)
    );
  };

  const checkout = () => {
    if (!cart.length) return notify("السلة فارغة");

    const lines = [];
    for (const item of cart) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.quantity < item.qty) {
        return notify(`المخزون غير كافٍ: ${item.name}`);
      }
      lines.push({ ...item, cost: product.purchasePrice });
    }

    const freeLines = [];
    for (const line of lines) {
      const offer = offers.find((o) => o.productId === line.productId && o.active);
      if (offer && Number(offer.buyQty) > 0) {
        const free = Math.floor(line.qty / Number(offer.buyQty)) * Number(offer.freeQty);
        if (free > 0) freeLines.push({ ...line, qty: free, price: 0, free: true });
      }
    }

    for (const free of freeLines) {
      const p = products.find((x) => x.id === free.productId);
      const bought = lines.find((x) => x.productId === free.productId)?.qty || 0;
      if (p.quantity < bought + free.qty) {
        return notify(`المخزون لا يكفي للقطع المجانية: ${p.name}`);
      }
    }

    const allLines = [...lines, ...freeLines];
    const total = lines.reduce((sum, item) => sum + item.price * item.qty, 0);
    const cost = allLines.reduce((sum, item) => sum + item.cost * item.qty, 0);
    const sale = {
      id: uid(),
      date: new Date().toISOString(),
      items: allLines,
      total,
      cost,
      profit: total - cost,
      payment,
      customer: saleCustomer,
    };

    setProducts((old) => old.map((p) => {
      const sold = allLines
        .filter((item) => item.productId === p.id)
        .reduce((sum, item) => sum + item.qty, 0);
      return sold ? { ...p, quantity: p.quantity - sold } : p;
    }));

    setSales((old) => [sale, ...old]);

    if (payment === "cash") {
      setMovements((old) => [{
        id: uid(), date: sale.date, type: "in", amount: total,
        note: "مبيعات", sourceId: sale.id,
      }, ...old]);
    }

    setCart([]);
    setSaleCustomer("");
    notify("تم تسجيل البيع");
  };

  const addPurchase = (event) => {
    event.preventDefault();
    const product = products.find((p) => p.id === purchaseProduct);
    const qty = Number(purchaseQty);
    const price = Number(purchasePrice);

    if (!product || qty <= 0 || price < 0) {
      return notify("تحقق من بيانات الشراء");
    }

    const purchase = {
      id: uid(),
      date: new Date().toISOString(),
      productId: product.id,
      productName: product.name,
      qty,
      price,
      supplier: purchaseSupplier,
      total: qty * price,
    };

    setProducts((old) => old.map((p) => p.id === product.id
      ? { ...p, quantity: p.quantity + qty, purchasePrice: price }
      : p
    ));

    setPurchases((old) => [purchase, ...old]);
    setMovements((old) => [{
      id: uid(), date: purchase.date, type: "out",
      amount: purchase.total, note: `مشتريات: ${product.name}`,
    }, ...old]);

    setPurchaseQty("");
    setPurchasePrice("");
    notify("تم تسجيل المشتريات وإضافة الكمية للمخزون");
  };

  const saveSimpleRecord = (type) => {
    if (!recordName.trim()) return notify("أدخل الاسم");
    const row = {
      id: uid(),
      name: recordName.trim(),
      phone: recordPhone.trim(),
      createdAt: new Date().toISOString(),
    };

    if (type === "suppliers") setSuppliers((old) => [row, ...old]);
    else setCustomers((old) => [row, ...old]);

    setRecordName("");
    setRecordPhone("");
    notify(t.saved);
  };

  const addExpense = (event) => {
    event.preventDefault();
    const amount = Number(expenseAmount);
    if (!expenseName.trim() || amount <= 0) {
      return notify("أدخل وصفًا ومبلغًا صحيحًا");
    }

    const row = {
      id: uid(),
      name: expenseName.trim(),
      amount,
      date: new Date().toISOString(),
    };

    setExpenses((old) => [row, ...old]);
    setMovements((old) => [{
      id: uid(), date: row.date, type: "out", amount, note: row.name,
    }, ...old]);

    setExpenseName("");
    setExpenseAmount("");
    notify(t.saved);
  };

  const adjustStock = (event) => {
    event.preventDefault();
    const qty = Number(stockQty);
    const product = products.find((p) => p.id === selectedProduct);

    if (!product || qty <= 0) return notify("اختر منتجًا وأدخل كمية صحيحة");
    if (stockDirection === "out" && product.quantity < qty) {
      return notify("الكمية أكبر من المخزون");
    }

    setProducts((old) => old.map((p) => p.id === product.id
      ? { ...p, quantity: p.quantity + (stockDirection === "in" ? qty : -qty) }
      : p
    ));

    setMovements((old) => [{
      id: uid(),
      date: new Date().toISOString(),
      type: stockDirection,
      amount: 0,
      note: `${stockDirection === "in" ? "إدخال" : "إخراج"} ${qty} × ${product.name}: ${stockReason}`,
    }, ...old]);

    setStockQty("");
    setStockReason("");
    notify(t.saved);
  };

  const saveOffer = (event) => {
    event.preventDefault();
    const product = products.find((p) => p.id === selectedProduct);
    const buy = Number(buyQty);
    const free = Number(freeQty);

    if (!product || buy < 1 || free < 1) return notify("أدخل بيانات العرض");

    setOffers((old) => [
      {
        id: uid(), productId: product.id, productName: product.name,
        buyQty: buy, freeQty: free, active: true,
      },
      ...old.filter((o) => o.productId !== product.id),
    ]);

    notify("تم حفظ العرض");
  };

  const removeOffer = (id) => setOffers((old) => old.filter((o) => o.id !== id));

  const removeRecord = (setter, id) => {
    if (window.confirm(t.deleteConfirm)) {
      setter((old) => old.filter((x) => x.id !== id));
    }
  };

  const field = (label, value, onChange, type = "text", required = false) => (
    <label className="v-field">
      <span>{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );

  const selectField = (label, value, onChange, options) => (
    <label className="v-field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );

  const card = (label, value, sub = "") => (
    <div className="v-card">
      <div className="v-muted">{label}</div>
      <div className="v-metric">{value}</div>
      {sub && <small className="v-muted">{sub}</small>}
    </div>
  );

  const table = (headers, rows) => (
    <div className="v-table-wrap">
      <table className="v-table">
        <thead>
          <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length ? rows : (
            <tr><td colSpan={headers.length} className="v-empty">{t.noData}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const productOptions = products.map((p) => ({ value: p.id, label: p.name }));
  const salesTotalAll = sales.reduce((s, x) => s + Number(x.total || 0), 0);
  const profitAll = sales.reduce((s, x) => s + Number(x.profit || 0), 0);
  const expensesAll = expenses.reduce((s, x) => s + Number(x.amount || 0), 0);
  const cashBalance = movements.reduce(
    (sum, m) => sum + (m.type === "in" ? Number(m.amount || 0) : -Number(m.amount || 0)),
    0
  );

  return (
    <div className="veltro" dir={rtl ? "rtl" : "ltr"}>
      <style>{`
        *{box-sizing:border-box}
        .veltro{min-height:100vh;background:#0b1020;color:#edf2ff;font-family:Arial,sans-serif}
        .v-shell{display:grid;grid-template-columns:230px minmax(0,1fr);min-height:100vh}
        .v-side{background:#11182b;border-inline-end:1px solid #26314a;padding:20px 12px}
        .v-brand{font-size:25px;font-weight:900;letter-spacing:2px;padding:8px 12px}
        .v-tag{font-size:11px;color:#8e9bb8;padding:0 12px 22px}
        .v-nav{display:flex;flex-direction:column;gap:5px}
        .v-nav button{border:0;border-radius:10px;background:transparent;color:#b9c5df;text-align:start;padding:12px;cursor:pointer;font-size:14px}
        .v-nav button.active,.v-nav button:hover{background:#253353;color:white}
        .v-nav span{display:inline-block;width:28px;color:#65d5c4}
        .v-main{min-width:0;padding:22px}
        .v-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:22px}
        .v-title{font-size:24px;font-weight:800;margin:0 0 6px}
        .v-muted{color:#98a7c5;font-size:13px}
        .v-button{border:0;border-radius:9px;background:#55d6c2;color:#09201e;font-weight:700;padding:10px 14px;cursor:pointer}
        .v-button.secondary{background:#253353;color:#edf2ff}
        .v-button.danger{background:#8d3548;color:white}
        .v-button:disabled{opacity:.5}
        .v-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:13px;margin-bottom:20px}
        .v-card,.v-panel{background:#131c30;border:1px solid #26314a;border-radius:15px;padding:17px;min-width:0}
        .v-metric{font-size:25px;font-weight:800;margin:12px 0 5px;overflow-wrap:anywhere}
        .v-panel{margin-bottom:18px}
        .v-panel h3{margin:0 0 16px;font-size:17px}
        .v-row{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
        .v-form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
        .v-field{display:flex;flex-direction:column;gap:7px;font-size:13px;color:#b8c5df;min-width:0}
        .v-field input,.v-field select,.v-search{width:100%;min-width:0;background:#0b1223;color:#f2f5ff;border:1px solid #34415d;border-radius:9px;padding:11px;font-size:14px}
        .v-field input:focus,.v-field select:focus,.v-search:focus{outline:1px solid #55d6c2;border-color:#55d6c2}
        .v-table-wrap{width:100%;overflow:auto}
        .v-table{border-collapse:collapse;width:100%;min-width:650px;font-size:13px}
        .v-table th,.v-table td{padding:12px 10px;border-bottom:1px solid #28344d;text-align:start;white-space:nowrap}
        .v-table th{color:#93a4c5;font-weight:600}
        .v-empty{text-align:center!important;color:#93a4c5;padding:25px!important}
        .v-pill{display:inline-block;background:#253353;color:#bfeee6;border-radius:99px;padding:4px 8px;font-size:12px}
        .v-notice{position:fixed;bottom:18px;inset-inline-start:18px;z-index:10;background:#55d6c2;color:#09201e;border-radius:10px;padding:12px 18px;font-weight:bold;box-shadow:0 6px 25px #0006}
        .v-actions{display:flex;gap:6px}
        .v-small{font-size:12px;padding:7px 9px}
        .v-total{font-size:26px;font-weight:900;color:#66dfca}
        .v-logo{display:flex;align-items:center;gap:10px}
        .v-logo-mark{display:grid;place-items:center;width:36px;height:36px;border-radius:10px;background:#55d6c2;color:#0b1020;font-weight:900}
        .v-product-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:15px}
        .v-product-head h3{margin:0}
        .v-product-details{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
        .v-stat{background:#0b1223;border:1px solid #26314a;border-radius:10px;padding:12px}
        .v-stat strong{display:block;margin-top:7px;font-size:16px;overflow-wrap:anywhere}
        .v-section-label{color:#65d5c4;font-size:13px;font-weight:bold;margin:20px 0 12px}
        @media(max-width:760px){
          .v-shell{grid-template-columns:1fr}
          .v-side{padding:12px;border-inline-end:0;border-bottom:1px solid #26314a}
          .v-brand{font-size:21px;padding:4px 6px}
          .v-tag{padding:0 6px 10px}
          .v-nav{flex-direction:row;overflow:auto;padding-bottom:5px}
          .v-nav button{white-space:nowrap;padding:10px}
          .v-main{padding:14px}
          .v-title{font-size:21px}
          .v-metric{font-size:21px}
        }
      `}</style>

      <div className="v-shell">
        <aside className="v-side">
          <div className="v-logo">
            <div className="v-logo-mark">V</div>
            <div className="v-brand">VELTRO</div>
          </div>
          <div className="v-tag">Your Business. Your Control.</div>
          <nav className="v-nav">
            {NAV.map(([key, icon]) => (
              <button
                key={key}
                className={page === key ? "active" : ""}
                onClick={() => {
                  setPage(key);
                  if (key !== "products") closeProductForm();
                }}
              >
                <span>{icon}</span>{t[key]}
              </button>
            ))}
          </nav>
        </aside>

        <main className="v-main">
          <header className="v-top">
            <div>
              <h1 className="v-title">{t[page] || "VELTRO"}</h1>
              <div className="v-muted">{t.dashboardTitle}</div>
            </div>
            <div className="v-row">
              <select
                className="v-search"
                style={{ width: 125 }}
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
              <span className="v-pill">LOCAL</span>
            </div>
          </header>

          {page === "dashboard" && (
            <>
              <div className="v-grid">
                {card(t.productsCount, products.length)}
                {card(t.salesToday, money(salesTodayTotal))}
                {card(t.stockValue, money(stockValue), t.stockValueNote)}
                {card(t.profit, money(todaySales.reduce((s, x) => s + Number(x.profit || 0), 0)))}
              </div>
              <section className="v-panel">
                <h3>{t.lowStock}</h3>
                {table(
                  [t.name, t.barcode, t.quantity, t.minStock],
                  lowStock.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.barcode || "—"}</td>
                      <td><span className="v-pill">{p.quantity}</span></td>
                      <td>{p.minStock}</td>
                    </tr>
                  ))
                )}
              </section>
              <section className="v-panel">
                <h3>آخر المبيعات</h3>
                {table(
                  [t.date, t.total, t.payment, t.customer],
                  sales.slice(0, 8).map((s) => (
                    <tr key={s.id}>
                      <td>{new Date(s.date).toLocaleString()}</td>
                      <td>{money(s.total)}</td>
                      <td>{s.payment}</td>
                      <td>{s.customer || "—"}</td>
                    </tr>
                  ))
                )}
              </section>
            </>
          )}

          {page === "products" && (
            <>
              <section className="v-panel">
                <div className="v-product-head">
                  <div>
                    <h3>{t.products}</h3>
                    <div className="v-muted" style={{ marginTop: 7 }}>
                      {filteredProducts.length} / {products.length} {t.productsCount}
                    </div>
                  </div>
                  <button className="v-button" onClick={openNewProduct}>
                    ＋ {t.addProduct}
                  </button>
                </div>

                <input
                  className="v-search"
                  placeholder={t.search}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <div style={{ height: 14 }} />

                {table(
                  [
                    t.name, t.reference, t.barcode, t.category, t.quantity,
                    t.purchasePrice, t.salePrice, "سعر البيع 2", "سعر البيع 3",
                    t.expiryDate, t.actions,
                  ],
                  filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.reference || "—"}</td>
                      <td>{p.barcode || "—"}</td>
                      <td>{p.category || "—"}</td>
                      <td>{p.quantity} {p.unit || ""}</td>
                      <td>{money(p.purchasePrice)}</td>
                      <td>{money(p.salePrice1)}</td>
                      <td>{money(p.salePrice2)}</td>
                      <td>{money(p.salePrice3)}</td>
                      <td>{p.expiryDate || "—"}</td>
                      <td>
                        <div className="v-actions">
                          <button
                            className="v-button secondary v-small"
                            onClick={() => openEditProduct(p)}
                          >
                            {t.edit}
                          </button>
                          <button
                            className="v-button danger v-small"
                            onClick={() => deleteProduct(p.id)}
                          >
                            {t.delete}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </section>

              {showProductForm && (
                <section className="v-panel">
                  <div className="v-product-head">
                    <h3>{editing ? t.edit : t.addProduct}</h3>
                    <button
                      type="button"
                      className="v-button secondary"
                      onClick={closeProductForm}
                    >
                      ✕ {t.cancel}
                    </button>
                  </div>

                  <form onSubmit={saveProduct}>
                    <div className="v-section-label">معلومات المنتج</div>
                    <div className="v-form-grid">
                      {field(t.name, form.name, (v) => changeProduct("name", v), "text", true)}
                      {field(t.barcode, form.barcode, (v) => changeProduct("barcode", v))}
                      {field(t.reference, form.reference, (v) => changeProduct("reference", v))}
                      {field(t.category, form.category, (v) => changeProduct("category", v))}
                      {field(t.unit, form.unit, (v) => changeProduct("unit", v))}
                    </div>

                    <div className="v-section-label">المخزون والصلاحية</div>
                    <div className="v-form-grid">
                      {field(t.quantity, form.quantity, (v) => changeProduct("quantity", v), "number", true)}
                      {field(t.minStock, form.minStock, (v) => changeProduct("minStock", v), "number")}
                      {field(t.expiryDate, form.expiryDate, (v) => changeProduct("expiryDate", v), "date")}
                    </div>

                    <div className="v-section-label">الأسعار</div>
                    <div className="v-form-grid">
                      {field(t.purchasePrice, form.purchasePrice, (v) => changeProduct("purchasePrice", v), "number", true)}
                      {field(`${t.salePrice} 1`, form.salePrice1, (v) => changeProduct("salePrice1", v), "number", true)}
                      {field(`${t.salePrice} 2`, form.salePrice2, (v) => changeProduct("salePrice2", v), "number")}
                      {field(`${t.salePrice} 3`, form.salePrice3, (v) => changeProduct("salePrice3", v), "number")}
                    </div>

                    <div className="v-row" style={{ marginTop: 20 }}>
                      <button className="v-button" type="submit">
                        {t.save}
                      </button>
                      <button
                        className="v-button secondary"
                        type="button"
                        onClick={closeProductForm}
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </form>
                </section>
              )}
            </>
          )}

          {page === "pos" && (
            <>
              <section className="v-panel">
                <h3>{t.cart}</h3>
                <form className="v-row" onSubmit={scanProduct}>
                  <input
                    className="v-search"
                    style={{ flex: 1 }}
                    placeholder={`${t.barcode} / ${t.search}`}
                    value={scan}
                    onChange={(e) => setScan(e.target.value)}
                  />
                  <button className="v-button" type="submit">{t.add}</button>
                </form>
                <div style={{ height: 12 }} />
                <div className="v-form-grid">
                  {products.slice(0, 30).map((p) => (
                    <button
                      key={p.id}
                      className="v-button secondary"
                      onClick={() => addToCart(p)}
                      disabled={p.quantity <= 0}
                    >
                      {p.name}<br />
                      <small>{money(p.salePrice1)} · {p.quantity}</small>
                    </button>
                  ))}
                </div>
              </section>

              <section className="v-panel">
                <h3>{t.cart}</h3>
                {table(
                  [t.name, t.price, t.quantity, t.total, t.actions],
                  cart.map((item) => (
                    <tr key={item.productId}>
                      <td>{item.name}</td>
                      <td>{money(item.price)}</td>
                      <td>
                        <input
                          aria-label={t.quantity}
                          type="number"
                          min="0"
                          className="v-search"
                          style={{ width: 75 }}
                          value={item.qty}
                          onChange={(e) => updateCartQty(item.productId, e.target.value)}
                        />
                      </td>
                      <td>{money(item.price * item.qty)}</td>
                      <td>
                        <button
                          className="v-button danger v-small"
                          onClick={() => setCart((old) => old.filter((x) => x.productId !== item.productId))}
                        >
                          {t.delete}
                        </button>
                      </td>
                    </tr>
                  ))
                )}

                <div className="v-row" style={{ justifyContent: "space-between", marginTop: 16 }}>
                  <span>{t.total}</span>
                  <span className="v-total">{money(cartTotal)}</span>
                </div>

                <div className="v-form-grid" style={{ marginTop: 15 }}>
                  {selectField(t.payment, payment, setPayment, [
                    { value: "cash", label: t.cashPayment },
                    { value: "card", label: t.cardPayment },
                    { value: "credit", label: t.creditPayment },
                  ])}
                  {selectField(t.customer, saleCustomer, setSaleCustomer, [
                    { value: "", label: t.all },
                    ...customers.map((c) => ({ value: c.name, label: c.name })),
                  ])}
                </div>

                <div className="v-row" style={{ marginTop: 15 }}>
                  <button className="v-button" onClick={checkout}>{t.checkout}</button>
                  <button className="v-button secondary" onClick={() => setCart([])}>{t.clear}</button>
                </div>
                <p className="v-muted">{t.offersNote}</p>
              </section>
            </>
          )}

          {page === "purchases" && (
            <section className="v-panel">
              <h3>{t.purchases}</h3>
              <form onSubmit={addPurchase}>
                <div className="v-form-grid">
                  {selectField(t.name, purchaseProduct, setPurchaseProduct, [
                    { value: "", label: "اختر المنتج" },
                    ...products.map((p) => ({ value: p.id, label: p.name })),
                  ])}
                  {field(t.quantity, purchaseQty, setPurchaseQty, "number", true)}
                  {field(t.purchasePrice, purchasePrice, setPurchasePrice, "number", true)}
                  {selectField(t.supplier, purchaseSupplier, setPurchaseSupplier, [
                    { value: "", label: "—" },
                    ...suppliers.map((s) => ({ value: s.name, label: s.name })),
                  ])}
                </div>
                <div className="v-row" style={{ marginTop: 14 }}>
                  <button className="v-button" type="submit">{t.save}</button>
                </div>
              </form>
              <div style={{ height: 18 }} />
              {table(
                [t.date, t.name, t.quantity, t.purchasePrice, t.total, t.supplier],
                purchases.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.date).toLocaleString()}</td>
                    <td>{p.productName}</td>
                    <td>{p.qty}</td>
                    <td>{money(p.price)}</td>
                    <td>{money(p.total)}</td>
                    <td>{p.supplier || "—"}</td>
                  </tr>
                ))
              )}
            </section>
          )}

          {(page === "suppliers" || page === "customers") && (
            <section className="v-panel">
              <h3>{t[page]}</h3>
              <div className="v-form-grid">
                {field(t.name, recordName, setRecordName, "text", true)}
                {field(t.phone, recordPhone, setRecordPhone)}
              </div>
              <div className="v-row" style={{ marginTop: 14 }}>
                <button className="v-button" onClick={() => saveSimpleRecord(page)}>{t.add}</button>
              </div>
              <div style={{ height: 15 }} />
              {table(
                [t.name, t.phone, t.date, t.actions],
                (page === "suppliers" ? suppliers : customers).map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.phone || "—"}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="v-button danger v-small"
                        onClick={() => removeRecord(page === "suppliers" ? setSuppliers : setCustomers, r.id)}
                      >
                        {t.delete}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </section>
          )}

          {page === "stock" && (
            <section className="v-panel">
              <h3>{t.stock}</h3>
              <form onSubmit={adjustStock}>
                <div className="v-form-grid">
                  {selectField(t.name, selectedProduct, setSelectedProduct, [
                    { value: "", label: "اختر المنتج" },
                    ...products.map((p) => ({ value: p.id, label: `${p.name} (${p.quantity})` })),
                  ])}
                  {selectField(t.type, stockDirection, setStockDirection, [
                    { value: "in", label: t.stockIn },
                    { value: "out", label: t.stockOut },
                  ])}
                  {field(t.quantity, stockQty, setStockQty, "number", true)}
                  {field(t.reason, stockReason, setStockReason)}
                </div>
                <div className="v-row" style={{ marginTop: 14 }}>
                  <button className="v-button" type="submit">{t.confirm}</button>
                </div>
              </form>
              <div style={{ height: 18 }} />
              {table(
                [t.name, t.quantity, t.minStock, t.purchasePrice, t.salePrice],
                products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.quantity}</td>
                    <td>{p.minStock}</td>
                    <td>{money(p.purchasePrice)}</td>
                    <td>{money(p.salePrice1)}</td>
                  </tr>
                ))
              )}
            </section>
          )}

          {page === "offers" && (
            <>
              <section className="v-panel">
                <h3>{t.offers}</h3>
                <p className="v-muted">{t.offersNote}</p>
                <form onSubmit={saveOffer}>
                  <div className="v-form-grid">
                    {selectField(t.offerProduct, selectedProduct, setSelectedProduct, [
                      { value: "", label: "اختر المنتج" },
                      ...productOptions,
                    ])}
                    {field(t.buyQty, buyQty, setBuyQty, "number", true)}
                    {field(t.freeQty, freeQty, setFreeQty, "number", true)}
                  </div>
                  <div className="v-row" style={{ marginTop: 14 }}>
                    <button className="v-button" type="submit">{t.save}</button>
                  </div>
                </form>
              </section>
              <section className="v-panel">
                {table(
                  [t.offerProduct, t.buyQty, t.freeQty, t.actions],
                  offers.map((o) => (
                    <tr key={o.id}>
                      <td>{o.productName}</td>
                      <td>{o.buyQty}</td>
                      <td>{o.freeQty}</td>
                      <td>
                        <button className="v-button danger v-small" onClick={() => removeOffer(o.id)}>
                          {t.delete}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </section>
            </>
          )}

          {page === "expenses" && (
            <section className="v-panel">
              <h3>{t.expenses}</h3>
              <form onSubmit={addExpense}>
                <div className="v-form-grid">
                  {field(t.description, expenseName, setExpenseName, "text", true)}
                  {field(t.amount, expenseAmount, setExpenseAmount, "number", true)}
                </div>
                <div className="v-row" style={{ marginTop: 14 }}>
                  <button className="v-button" type="submit">{t.add}</button>
                </div>
              </form>
              <div style={{ height: 16 }} />
              {table(
                [t.date, t.description, t.amount, t.actions],
                expenses.map((e) => (
                  <tr key={e.id}>
                    <td>{new Date(e.date).toLocaleString()}</td>
                    <td>{e.name}</td>
                    <td>{money(e.amount)}</td>
                    <td>
                      <button className="v-button danger v-small" onClick={() => removeRecord(setExpenses, e.id)}>
                        {t.delete}
                      </button>
                    </td>
                  </tr>
                ))
              )}
              <h3 style={{ marginTop: 20 }}>الإجمالي: {money(expensesAll)}</h3>
            </section>
          )}

          {page === "cash" && (
            <>
              <div className="v-grid">
                {card("رصيد الصندوق", money(cashBalance))}
                {card(t.salesToday, money(salesTodayTotal))}
                {card(t.purchases, money(purchases.reduce((s, p) => s + p.total, 0)))}
                {card(t.expenses, money(expensesAll))}
              </div>
              <section className="v-panel">
                <h3>حركات الصندوق</h3>
                {table(
                  [t.date, t.type, t.description, t.amount],
                  movements.map((m) => (
                    <tr key={m.id}>
                      <td>{new Date(m.date).toLocaleString()}</td>
                      <td>{m.type === "in" ? "دخول" : "خروج"}</td>
                      <td>{m.note}</td>
                      <td>{money(m.amount)}</td>
                    </tr>
                  ))
                )}
              </section>
            </>
          )}

          {page === "reports" && (
            <>
              <div className="v-grid">
                {card("إجمالي المبيعات", money(salesTotalAll))}
                {card(t.profit, money(profitAll))}
                {card(t.purchases, money(purchases.reduce((s, p) => s + p.total, 0)))}
                {card(t.expenses, money(expensesAll))}
                {card(t.productsCount, products.length)}
                {card(t.stockValue, money(stockValue))}
              </div>
              <section className="v-panel">
                <div className="v-row" style={{ justifyContent: "space-between" }}>
                  <h3>سجل المبيعات</h3>
                  <button className="v-button" onClick={() => window.print()}>
                    {t.receipt} / PDF
                  </button>
                </div>
                {table(
                  [t.date, t.total, t.profit, t.payment, t.customer],
                  sales.map((s) => (
                    <tr key={s.id}>
                      <td>{new Date(s.date).toLocaleString()}</td>
                      <td>{money(s.total)}</td>
                      <td>{money(s.profit)}</td>
                      <td>{s.payment}</td>
                      <td>{s.customer || "—"}</td>
                    </tr>
                  ))
                )}
              </section>
            </>
          )}

          {page === "settings" && (
            <section className="v-panel">
              <h3>{t.settings}</h3>
              <div className="v-card">
                <div className="v-muted">{t.language}</div>
                <div className="v-row" style={{ marginTop: 12 }}>
                  <button className="v-button" onClick={() => setLang("ar")}>العربية</button>
                  <button className="v-button secondary" onClick={() => setLang("fr")}>Français</button>
                  <button className="v-button secondary" onClick={() => setLang("en")}>English</button>
                </div>
              </div>

              <div className="v-card" style={{ marginTop: 14 }}>
                <h3>{t.localStorage}</h3>
                <p className="v-muted">
                  البيانات محفوظة على هذا المتصفح وهذا الجهاز. لا تمسح بيانات المتصفح قبل تصدير نسخة احتياطية.
                </p>
                <p className="v-muted">{t.cloudLater}</p>
                <div className="v-row">
                  <button
                    className="v-button"
                    onClick={() => {
                      const data = {};
                      Object.entries(KEYS).forEach(([name, key]) => {
                        data[name] = read(key, name === "language" ? "ar" : []);
                      });
                      const blob = new Blob([JSON.stringify(data, null, 2)], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "veltro-backup.json";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    تصدير نسخة احتياطية
                  </button>

                  <button
                    className="v-button secondary"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".json,application/json";
                      input.onchange = async () => {
                        const file = input.files?.[0];
                        if (!file) return;
                        try {
                          const data = JSON.parse(await file.text());
                          if (!window.confirm("سيتم استبدال البيانات الحالية بالنسخة الاحتياطية. هل تريد المتابعة؟")) return;
                          Object.entries(KEYS).forEach(([name, key]) => {
                            if (data[name] !== undefined) {
                              localStorage.setItem(key, JSON.stringify(data[name]));
                            }
                          });
                          window.location.reload();
                        } catch {
                          alert("ملف النسخة الاحتياطية غير صالح");
                        }
                      };
                      input.click();
                    }}
                  >
                    استيراد نسخة احتياطية
                  </button>
                </div>
              </div>
            </section>
          )}

          {notice && <div className="v-notice">{notice}</div>}

          <footer className="v-muted" style={{ textAlign: "center", padding: "20px 0" }}>
            VELTRO · Your Business. Your Control.
          </footer>
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
