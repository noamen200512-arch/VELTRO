import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

const translations = {
  en: {
    dashboard: "Dashboard",
    achats: "Purchases",
    ventes: "Sales",
    produits: "Products",
    fournisseurs: "Suppliers",
    clients: "Customers",
    stock: "Inventory",
    caisse: "Cash Register",
    depenses: "Expenses",
    rapports: "Reports",
    parametres: "Settings",
    welcome: "Welcome back to VELTRO.",
    subtitle: "Your Business. Your Control.",
    description: "Manage your business from one powerful system.",
    salesToday: "Sales Today",
    profit: "Profit",
    productCount: "Products",
    lowStock: "Low Stock",
    language: "Language",
    empty: "This section is ready for its next features.",
    search: "Search...",
    actions: "Quick Actions",
    newSale: "New Sale",
    addProduct: "Add Product",
    newPurchase: "New Purchase",
    viewReports: "View Reports",
    total: "Total",
    status: "Status",
    date: "Date",
    name: "Name",
    amount: "Amount",
    comingSoon: "More features coming soon",
    footer: "Your Business. Your Control.",
  },
  fr: {
    dashboard: "Tableau de bord",
    achats: "Achats",
    ventes: "Ventes",
    produits: "Produits",
    fournisseurs: "Fournisseurs",
    clients: "Clients",
    stock: "Stock",
    caisse: "Caisse",
    depenses: "Dépenses",
    rapports: "Rapports",
    parametres: "Paramètres",
    welcome: "Bienvenue sur VELTRO.",
    subtitle: "Votre entreprise. Votre contrôle.",
    description: "Gérez votre activité avec un système puissant.",
    salesToday: "Ventes du jour",
    profit: "Bénéfice",
    productCount: "Produits",
    lowStock: "Stock faible",
    language: "Langue",
    empty: "Cette section est prête pour les prochaines fonctionnalités.",
    search: "Rechercher...",
    actions: "Actions rapides",
    newSale: "Nouvelle vente",
    addProduct: "Ajouter un produit",
    newPurchase: "Nouvel achat",
    viewReports: "Voir les rapports",
    total: "Total",
    status: "Statut",
    date: "Date",
    name: "Nom",
    amount: "Montant",
    comingSoon: "D'autres fonctionnalités arrivent bientôt",
    footer: "Votre entreprise. Votre contrôle.",
  },
  ar: {
    dashboard: "لوحة التحكم",
    achats: "المشتريات",
    ventes: "المبيعات",
    produits: "المنتجات",
    fournisseurs: "الموردون",
    clients: "العملاء",
    stock: "المخزون",
    caisse: "الصندوق",
    depenses: "المصاريف",
    rapports: "التقارير",
    parametres: "الإعدادات",
    welcome: "مرحبًا بك مجددًا في VELTRO.",
    subtitle: "أعمالك. تحكمك الكامل.",
    description: "أدر نشاطك التجاري من نظام واحد متكامل.",
    salesToday: "مبيعات اليوم",
    profit: "الأرباح",
    productCount: "المنتجات",
    lowStock: "مخزون منخفض",
    language: "اللغة",
    empty: "هذا القسم جاهز لإضافة الوظائف القادمة.",
    search: "بحث...",
    actions: "إجراءات سريعة",
    newSale: "عملية بيع جديدة",
    addProduct: "إضافة منتج",
    newPurchase: "عملية شراء جديدة",
    viewReports: "عرض التقارير",
    total: "الإجمالي",
    status: "الحالة",
    date: "التاريخ",
    name: "الاسم",
    amount: "المبلغ",
    comingSoon: "المزيد من الوظائف قريبًا",
    footer: "أعمالك. تحكمك الكامل.",
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

function App() {
  const [active, setActive] = useState("dashboard");
  const [language, setLanguage] = useState("fr");
  const [search, setSearch] = useState("");

  const t = translations[language];
  const isArabic = language === "ar";

  const changeSection = (id) => {
    setActive(id);
    setSearch("");
  };

  return (
    <div className="app" dir={isArabic ? "rtl" : "ltr"}>
      <aside className="sidebar">
        <div className="logo">VELTRO</div>
        <div className="brand-subtitle">
          YOUR BUSINESS. YOUR CONTROL.
        </div>

        <nav>
          {menu.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${
                active === item.id ? "active" : ""
              }`}
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
            <p>
              {active === "dashboard"
                ? t.welcome
                : t[active]}
            </p>
          </div>

          <div className="topbar-actions">
            <select
              aria-label={t.language}
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value)
              }
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>

            <button
              className="profile"
              type="button"
              title="VELTRO profile"
            >
              N
            </button>
          </div>
        </header>

        {active === "dashboard" ? (
          <>
            <section className="cards">
              <div className="card">
                <span>{t.salesToday}</span>
                <strong>0 DA</strong>
              </div>

              <div className="card">
                <span>{t.profit}</span>
                <strong>0 DA</strong>
              </div>

              <div className="card">
                <span>{t.productCount}</span>
                <strong>0</strong>
              </div>

              <div className="card">
                <span>{t.lowStock}</span>
                <strong>0</strong>
              </div>
            </section>

            <section className="welcome">
              <h2>{t.subtitle}</h2>
              <p>{t.description}</p>

              <h3>{t.actions}</h3>

              <div className="quick-actions">
                <button
                  type="button"
                  onClick={() => changeSection("ventes")}
                >
                  + {t.newSale}
                </button>

                <button
                  type="button"
                  onClick={() => changeSection("produits")}
                >
                  + {t.addProduct}
                </button>

                <button
                  type="button"
                  onClick={() => changeSection("achats")}
                >
                  + {t.newPurchase}
                </button>

                <button
                  type="button"
                  onClick={() => changeSection("rapports")}
                >
                  {t.viewReports}
                </button>
              </div>
            </section>
          </>
        ) : (
          <section className="welcome section-content">
            <div className="section-symbol">
              {menu.find((item) => item.id === active)?.icon}
            </div>

            <h2>{t[active]}</h2>
            <p>{t.empty}</p>

            <input
              type="search"
              placeholder={t.search}
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              aria-label={t.search}
            />

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
