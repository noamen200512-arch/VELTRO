
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

const translations = {
  en: {
    dashboard: "Dashboard", achats: "Purchases", ventes: "Sales",
    produits: "Products", fournisseurs: "Suppliers", clients: "Customers",
    stock: "Inventory", caisse: "Cash Register", depenses: "Expenses",
    rapports: "Reports", parametres: "Settings",
    welcome: "Welcome back to VELTRO.",
    subtitle: "Your Business. Your Control.",
    description: "Manage your business from one powerful system.",
    salesToday: "Sales Today", profit: "Profit", productCount: "Products",
    lowStock: "Low Stock", language: "Language",
    empty: "This section will be developed in a later step.",
    search: "Search by name or barcode...",
    actions: "Quick Actions", newSale: "New Sale",
    addProduct: "Add Product", newPurchase: "New Purchase",
    viewReports: "View Reports", total: "Total", status: "Status",
    date: "Date", name: "Name", amount: "Amount",
    comingSoon: "More features coming soon",
    footer: "Your Business. Your Control.",
    productName: "Product name", barcode: "Barcode",
    category: "Category", purchasePrice: "Purchase price (DA)",
    salePrice: "Sale price (DA)", quantity: "Quantity",
    minStock: "Minimum stock alert", save: "Save Product",
    cancel: "Cancel", edit: "Edit", delete: "Delete",
    actionsCol: "Actions", noProducts: "No products found.",
    addFirst: "Add your first product to get started.",
    allProducts: "All Products", inventoryValue: "Stock value",
    margin: "Profit per unit", required: "Please fill in the required fields.",
    invalidPrice: "Prices and quantities must be valid non-negative numbers.",
    deleteConfirm: "Delete this product?",
    saved: "Product saved successfully.",
    inStock: "In stock", low: "Low stock", out: "Out of stock",
    productCountLabel: "Registered products",
    lowStockCount: "Products needing restock",
    productSaved: "Product saved",
    noBarcode: "No barcode",
    categoryPlaceholder: "e.g. Drinks",
    all: "All",
    currency: "DA",
    actionsTitle: "Product management",
    localNotice: "Data is saved on this device only.",
    profitHint: "Excludes expenses and other costs.",
    emptyStock: "No products need restocking.",
  },
  fr: {
    dashboard: "Tableau de bord", achats: "Achats", ventes: "Ventes",
    produits: "Produits", fournisseurs: "Fournisseurs", clients: "Clients",
    stock: "Stock", caisse: "Caisse", depenses: "Dépenses",
    rapports: "Rapports", parametres: "Paramètres",
    welcome: "Bienvenue sur VELTRO.",
    subtitle: "Votre entreprise. Votre contrôle.",
    description: "Gérez votre activité avec un système puissant.",
    salesToday: "Ventes du jour", profit: "Bénéfice", productCount: "Produits",
    lowStock: "Stock faible", language: "Langue",
    empty: "Cette section sera développée lors d'une prochaine étape.",
    search: "Rechercher par nom ou code-barres...",
    actions: "Actions rapides", newSale: "Nouvelle vente",
    addProduct: "Ajouter un produit", newPurchase: "Nouvel achat",
    viewReports: "Voir les rapports", total: "Total", status: "Statut",
    date: "Date", name: "Nom", amount: "Montant",
    comingSoon: "D'autres fonctionnalités arrivent bientôt",
    footer: "Votre entreprise. Votre contrôle.",
    productName: "Nom du produit", barcode: "Code-barres",
    category: "Catégorie", purchasePrice: "Prix d'achat (DA)",
    salePrice: "Prix de vente (DA)", quantity: "Quantité",
    minStock: "Seuil d'alerte du stock", save: "Enregistrer le produit",
    cancel: "Annuler", edit: "Modifier", delete: "Supprimer",
    actionsCol: "Actions", noProducts: "Aucun produit trouvé.",
    addFirst: "Ajoutez votre premier produit pour commencer.",
    allProducts: "Tous les produits", inventoryValue: "Valeur du stock",
    margin: "Marge par unité", required: "Veuillez remplir les champs obligatoires.",
    invalidPrice: "Les prix et quantités doivent être des nombres positifs ou nuls.",
    deleteConfirm: "Supprimer ce produit ?",
    saved: "Produit enregistré avec succès.",
    inStock: "En stock", low: "Stock faible", out: "Rupture de stock",
    productCountLabel: "Produits enregistrés",
    lowStockCount: "Produits à réapprovisionner",
    productSaved: "Produit enregistré",
    noBarcode: "Sans code-barres",
    categoryPlaceholder: "Ex. : Boissons",
    all: "Tous",
    currency: "DA",
    actionsTitle: "Gestion des produits",
    localNotice: "Les données sont enregistrées sur cet appareil uniquement.",
    profitHint: "Hors dépenses et autres coûts.",
    emptyStock: "Aucun produit à réapprovisionner.",
  },
  ar: {
    dashboard: "لوحة التحكم", achats: "المشتريات", ventes: "المبيعات",
    produits: "المنتجات", fournisseurs: "الموردون", clients: "العملاء",
    stock: "المخزون", caisse: "الصندوق", depenses: "المصاريف",
    rapports: "التقارير", parametres: "الإعدادات",
    welcome: "مرحبًا بك مجددًا في VELTRO.",
    subtitle: "أعمالك. تحكمك الكامل.",
    description: "أدر نشاطك التجاري من نظام واحد متكامل.",
    salesToday: "مبيعات اليوم", profit: "الربح التقديري",
    productCount: "المنتجات", lowStock: "مخزون منخفض",
    language: "اللغة",
    empty: "ستتم إضافة وظائف هذا القسم في مرحلة لاحقة.",
    search: "ابحث بالاسم أو الباركود...",
    actions: "إجراءات سريعة", newSale: "عملية بيع جديدة",
    addProduct: "إضافة منتج", newPurchase: "عملية شراء جديدة",
    viewReports: "عرض التقارير", total: "الإجمالي", status: "الحالة",
    date: "التاريخ", name: "الاسم", amount: "المبلغ",
    comingSoon: "المزيد من الوظائف قريبًا",
    footer: "أعمالك. تحكمك الكامل.",
    productName: "اسم المنتج", barcode: "الباركود",
    category: "التصنيف", purchasePrice: "سعر الشراء (دج)",
    salePrice: "سعر البيع (دج)", quantity: "الكمية",
    minStock: "حد التنبيه للمخزون", save: "حفظ المنتج",
    cancel: "إلغاء", edit: "تعديل", delete: "حذف",
    actionsCol: "الإجراءات", noProducts: "لم يتم العثور على منتجات.",
    addFirst: "أضف منتجك الأول للبدء.",
    allProducts: "جميع المنتجات", inventoryValue: "قيمة المخزون",
    margin: "الربح لكل وحدة", required: "يرجى ملء الحقول المطلوبة.",
    invalidPrice: "يجب أن تكون الأسعار والكميات أرقامًا صحيحة غير سالبة.",
    deleteConfirm: "هل تريد حذف هذا المنتج؟",
    saved: "تم حفظ المنتج بنجاح.",
    inStock: "متوفر", low: "مخزون منخفض", out: "نفد المخزون",
    productCountLabel: "المنتجات المسجلة",
    lowStockCount: "منتجات تحتاج إلى إعادة التموين",
    productSaved: "تم حفظ المنتج",
    noBarcode: "بدون باركود",
    categoryPlaceholder: "مثال: مشروبات",
    all: "الكل",
    currency: "دج",
    actionsTitle: "إدارة المنتجات",
    localNotice: "تُحفظ البيانات على هذا الجهاز فقط.",
    profitHint: "لا يشمل المصاريف والتكاليف الأخرى.",
    emptyStock: "لا توجد منتجات تحتاج إلى إعادة التموين.",
  },
};

const menu = [
  { id: "dashboard", icon: "⌂" },
  { id: "achats", icon: "↓" },
  { id: "ventes", icon: "↗" },
  { id: "produits", icon: "▦" },
  { id: "fournisseurs", icon: "♧" },
  { id: "clients", icon: "♙" },
  { id: "stock", icon: "▤" },
  { id: "caisse", icon: "▣" },
  { id: "depenses", icon: "↘" },
  { id: "rapports", icon: "▥" },
  { id: "parametres", icon: "⚙" },
];

const initialForm = {
  name: "",
  barcode: "",
  category: "",
  purchasePrice: "",
  salePrice: "",
  quantity: "",
  minStock: "5",
};

const buttonStyle = {
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600,
};

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  background: "var(--input-bg, #fff)",
  color: "var(--text-color, #111827)",
  fontSize: "14px",
};

function readProducts() {
  try {
    const saved = localStorage.getItem("veltro_products");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function App() {
  const [active, setActive] = useState("dashboard");
  const [language, setLanguage] = useState("fr");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState(readProducts);
  const [form, setForm] = useState(initialForm);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState("");

  const t = translations[language];
  const isArabic = language === "ar";

  useEffect(() => {
    try {
      localStorage.setItem("veltro_products", JSON.stringify(products));
    } catch {
      setNotice(
        "Unable to save data on this device. Check browser storage."
      );
    }
  }, [products]);

  const changeSection = (id) => {
    setActive(id);
    setSearch("");
    setNotice("");
    setFormOpen(false);
  };

  const openNewProduct = () => {
    setForm({ ...initialForm });
    setEditingId(null);
    setNotice("");
    setFormOpen(true);
  };

  const openEditProduct = (product) => {
    setForm({
      name: product.name,
      barcode: product.barcode,
      category: product.category,
      purchasePrice: String(product.purchasePrice),
      salePrice: String(product.salePrice),
      quantity: String(product.quantity),
      minStock: String(product.minStock),
    });
    setEditingId(product.id);
    setNotice("");
    setFormOpen(true);
  };

  const saveProduct = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    if (!name) {
      setNotice(t.required);
      return;
    }

    const purchasePrice = Number(form.purchasePrice);
    const salePrice = Number(form.salePrice);
    const quantity = Number(form.quantity);
    const minStock = Number(form.minStock);

    if (
      form.purchasePrice === "" ||
      form.salePrice === "" ||
      form.quantity === "" ||
      form.minStock === "" ||
      ![purchasePrice, salePrice, quantity, minStock].every(
        (value) => Number.isFinite(value) && value >= 0
      )
    ) {
      setNotice(t.invalidPrice);
      return;
    }

    const barcode = form.barcode.trim();
    const duplicateBarcode = barcode && products.some(
      (product) =>
        product.barcode === barcode && product.id !== editingId
    );

    if (duplicateBarcode) {
      setNotice(
        language === "ar"
          ? "هذا الباركود مستخدم بالفعل."
          : language === "fr"
          ? "Ce code-barres est déjà utilisé."
          : "This barcode is already in use."
      );
      return;
    }

    const product = {
      id: editingId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      barcode,
      category: form.category.trim(),
      purchasePrice,
      salePrice,
      quantity,
      minStock,
    };

    setProducts((current) =>
      editingId
        ? current.map((item) => item.id === editingId ? product : item)
        : [...current, product]
    );

    setFormOpen(false);
    setEditingId(null);
    setForm({ ...initialForm });
    setNotice(t.saved);
  };

  const deleteProduct = (id) => {
    if (!window.confirm(t.deleteConfirm)) return;

    setProducts((current) => current.filter((item) => item.id !== id));
    setNotice("");
    setFormOpen(false);
  };

  const lowStockProducts = products.filter(
    (product) => product.quantity <= product.minStock
  );

  const visibleProducts = products.filter((product) => {
    const matchesSearch =
      `${product.name} ${product.barcode} ${product.category}`
        .toLowerCase()
        .includes(search.trim().toLowerCase());

    const matchesSection =
      active !== "stock" || product.quantity <= product.minStock;

    return matchesSearch && matchesSection;
  });

  const money = (value) =>
    `${new Intl.NumberFormat(
      language === "ar" ? "ar-DZ" : language === "fr" ? "fr-DZ" : "en-US",
      { maximumFractionDigits: 2 }
    ).format(value)} ${t.currency}`;

  const inventoryValue = products.reduce(
    (sum, product) => sum + product.purchasePrice * product.quantity,
    0
  );

  const estimatedProfit = products.reduce(
    (sum, product) =>
      sum + (product.salePrice - product.purchasePrice) * product.quantity,
    0
  );

  const statusFor = (product) => {
    if (product.quantity <= 0) return t.out;
    if (product.quantity <= product.minStock) return t.low;
    return t.inStock;
  };

  const inputField = (label, key, options = {}) => (
    <label
      key={key}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: "13px", fontWeight: 600 }}>{label}</span>
      <input
        style={fieldStyle}
        value={form[key]}
        onChange={(event) =>
          setForm((current) => ({
            ...current,
            [key]: event.target.value,
          }))
        }
        type={options.number ? "number" : "text"}
        min={options.number ? "0" : undefined}
        step={options.number ? "any" : undefined}
        required={options.required}
        placeholder={options.placeholder || ""}
      />
    </label>
  );

  return (
    <div className="app" dir={isArabic ? "rtl" : "ltr"}>
      <aside className="sidebar">
        <div className="logo">VELTRO</div>
        <div className="brand-subtitle">YOUR BUSINESS. YOUR CONTROL.</div>

        <nav>
          {menu.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${active === item.id ? "active" : ""}`}
              onClick={() => changeSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{t[item.id]}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">VELTRO © 2026</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>{t[active]}</h1>
            <p>{active === "dashboard" ? t.welcome : t[active]}</p>
          </div>

          <div className="topbar-actions">
            <select
              aria-label={t.language}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>

            <button className="profile" type="button" title="VELTRO profile">
              N
            </button>
          </div>
        </header>

        {active === "dashboard" && (
          <>
            <section className="cards">
              <div className="card">
                <span>{t.salesToday}</span>
                <strong>{money(0)}</strong>
              </div>
              <div className="card">
                <span>{t.profit}</span>
                <strong>{money(estimatedProfit)}</strong>
              </div>
              <div className="card">
                <span>{t.productCount}</span>
                <strong>{products.length}</strong>
              </div>
              <div className="card">
                <span>{t.lowStock}</span>
                <strong>{lowStockProducts.length}</strong>
              </div>
            </section>

            <section className="welcome">
              <h2>{t.subtitle}</h2>
              <p>{t.description}</p>

              <h3>{t.actions}</h3>
              <div className="quick-actions">
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => changeSection("ventes")}
                >
                  + {t.newSale}
                </button>
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => {
                    changeSection("produits");
                    openNewProduct();
                  }}
                >
                  + {t.addProduct}
                </button>
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => changeSection("achats")}
                >
                  + {t.newPurchase}
                </button>
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => changeSection("rapports")}
                >
                  {t.viewReports}
                </button>
              </div>
              <p style={{ fontSize: "12px", opacity: 0.7, marginTop: "16px" }}>
                {t.profitHint}
              </p>
            </section>
          </>
        )}

        {(active === "produits" || active === "stock") && (
          <section className="welcome section-content">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h2>{active === "stock" ? t.stock : t.actionsTitle}</h2>
                <p>
                  {active === "stock" ? t.lowStockCount : t.allProducts}:{" "}
                  {active === "stock" ? lowStockProducts.length : products.length}
                </p>
              </div>
              {active === "produits" && (
                <button
                  type="button"
                  style={{
                    ...buttonStyle,
                    background: "#2563eb",
                    color: "#ffffff",
                    borderColor: "#2563eb",
                  }}
                  onClick={openNewProduct}
                >
                  + {t.addProduct}
                </button>
              )}
            </div>

            {notice && (
              <p
                role="status"
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                }}
              >
                {notice}
              </p>
            )}

            {formOpen && active === "produits" && (
              <form
                onSubmit={saveProduct}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                  gap: "14px",
                  padding: "16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "12px",
                  margin: "20px 0",
                }}
              >
                {inputField(t.productName, "name", { required: true })}
                {inputField(t.barcode, "barcode")}
                {inputField(t.category, "category", {
                  placeholder: t.categoryPlaceholder,
                })}
                {inputField(t.purchasePrice, "purchasePrice", {
                  number: true,
                  required: true,
                })}
                {inputField(t.salePrice, "salePrice", {
                  number: true,
                  required: true,
                })}
                {inputField(t.quantity, "quantity", {
                  number: true,
                  required: true,
                })}
                {inputField(t.minStock, "minStock", {
                  number: true,
                  required: true,
                })}

                <div
                  style={{
                    display: "flex",
                    alignItems: "end",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      ...buttonStyle,
                      background: "#2563eb",
                      color: "#fff",
                      borderColor: "#2563eb",
                    }}
                  >
                    {t.save}
                  </button>
                  <button
                    type="button"
                    style={buttonStyle}
                    onClick={() => {
                      setFormOpen(false);
                      setEditingId(null);
                      setNotice("");
                    }}
                  >
                    {t.cancel}
                  </button>
                </div>
              </form>
            )}

            <div style={{ margin: "18px 0" }}>
              <input
                type="search"
                style={fieldStyle}
                placeholder={t.search}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label={t.search}
              />
            </div>

            {active === "stock" && (
              <div className="cards">
                <div className="card">
                  <span>{t.inventoryValue}</span>
                  <strong>{money(inventoryValue)}</strong>
                </div>
                <div className="card">
                  <span>{t.lowStockCount}</span>
                  <strong>{lowStockProducts.length}</strong>
                </div>
              </div>
            )}

            {visibleProducts.length === 0 ? (
              <p style={{ padding: "20px 0" }}>
                {active === "stock" && !search
                  ? t.emptyStock
                  : products.length === 0
                  ? t.addFirst
                  : t.noProducts}
              </p>
            ) : (
              <div style={{ overflowX: "auto", marginTop: "16px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                    minWidth: "720px",
                  }}
                >
                  <thead>
                    <tr>
                      {[t.productName, t.barcode, t.purchasePrice, t.salePrice,
                        t.quantity, t.status, t.actionsCol].map((heading) => (
                        <th
                          key={heading}
                          style={{
                            padding: "12px 8px",
                            textAlign: isArabic ? "right" : "left",
                            borderBottom: "1px solid #d1d5db",
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleProducts.map((product) => (
                      <tr key={product.id}>
                        <td style={{ padding: "12px 8px", borderBottom: "1px solid #e5e7eb" }}>
                          <strong>{product.name}</strong>
                          {product.category && (
                            <div style={{ fontSize: "11px", opacity: 0.7 }}>
                              {product.category}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "12px 8px", borderBottom: "1px solid #e5e7eb" }}>
                          {product.barcode || t.noBarcode}
                        </td>
                        <td style={{ padding: "12px 8px", borderBottom: "1px solid #e5e7eb" }}>
                          {money(product.purchasePrice)}
                        </td>
                        <td style={{ padding: "12px 8px", borderBottom: "1px solid #e5e7eb" }}>
                          {money(product.salePrice)}
                        </td>
                        <td style={{ padding: "12px 8px", borderBottom: "1px solid #e5e7eb" }}>
                          {product.quantity}
                        </td>
                        <td style={{ padding: "12px 8px", borderBottom: "1px solid #e5e7eb" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 8px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              background: product.quantity <= 0
                                ? "#fee2e2"
                                : product.quantity <= product.minStock
                                ? "#fef3c7"
                                : "#dcfce7",
                              color: product.quantity <= 0
                                ? "#991b1b"
                                : product.quantity <= product.minStock
                                ? "#92400e"
                                : "#166534",
                            }}
                          >
                            {statusFor(product)}
                          </span>
                        </td>
                        <td style={{ padding: "12px 8px", borderBottom: "1px solid #e5e7eb" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            {active === "produits" && (
                              <button
                                type="button"
                                style={buttonStyle}
                                onClick={() => openEditProduct(product)}
                              >
                                {t.edit}
                              </button>
                            )}
                            <button
                              type="button"
                              style={{
                                ...buttonStyle,
                                color: "#b91c1c",
                              }}
                              onClick={() => deleteProduct(product.id)}
                            >
                              {t.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p style={{ fontSize: "12px", opacity: 0.65, marginTop: "18px" }}>
              {t.localNotice}
            </p>
          </section>
        )}

        {!["dashboard", "produits", "stock"].includes(active) && (
          <section className="welcome section-content">
            <div className="section-symbol">
              {menu.find((item) => item.id === active)?.icon}
            </div>
            <h2>{t[active]}</h2>
            <p>{t.empty}</p>
            <p className="coming-soon">{t.comingSoon}</p>
          </section>
        )}

        <footer className="app-footer">
          {t.footer} · VELTRO © 2026
        </footer>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
