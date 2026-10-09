import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

const STORAGE_KEY = "veltro_products";
const HISTORY_KEY = "veltro_product_history";
const LANGUAGE_KEY = "veltro_language";
const ACCESS_KEY = "veltro_transfer_password";

const emptyProduct = () => ({
  id: crypto.randomUUID(),
  name: "",
  barcode: "",
  extraBarcodes: [],
  reference: "",
  quantity: 0,
  purchasePrice: 0,
  salePrice1: 0,
  salePrice2: 0,
  salePrice3: 0,
  margin1: 0,
  margin2: 0,
  margin3: 0,
  unitsPerCarton: 1,
  expiryDate: "",
  unit: "piece",
  image: "",
  category: "",
  minStock: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const translations = {
  en: {
    dashboard: "Dashboard",
    achats: "Purchases",
    ventes: "Sales",
    produits: "Products",
    fournisseurs: "Suppliers",
    clients: "Customers",
    stock: "Stock",
    caisse: "Cash register",
    depenses: "Expenses",
    rapports: "Reports",
    parametres: "Settings",
    search: "Search products...",
    addProduct: "Add product",
    edit: "Edit",
    delete: "Delete",
    name: "Product name",
    barcode: "Primary barcode",
    extraBarcodes: "Additional barcodes",
    reference: "Reference",
    quantity: "Current quantity",
    purchasePrice: "Purchase price",
    salePrice1: "Sale price 1",
    salePrice2: "Sale price 2",
    salePrice3: "Sale price 3",
    margin: "Margin %",
    carton: "Units per carton",
    expiry: "Expiry date",
    unit: "Measurement unit",
    image: "Product image",
    category: "Category",
    minStock: "Minimum stock",
    save: "Save",
    cancel: "Cancel",
    part1: "Product information",
    part2: "Expiry and unit",
    part3: "Product image",
    confirmSave: "Confirm saving these changes?",
    saved: "Product saved successfully.",
    priceWarning: "Warning: a sale price is lower than the purchase price.",
    history: "Edit history",
    printLabels: "Print price labels",
    import: "Import spreadsheet",
    export: "Export spreadsheet",
    password: "Transfer password",
    passwordPrompt: "Enter the password to continue.",
    wrongPassword: "Incorrect password.",
    setPassword: "Set transfer password",
    passwordHelp: "Used only for product import and export.",
    noProducts: "No products found.",
    totalProducts: "Total products",
    totalQuantity: "Total units",
    lowStock: "Low stock",
    actions: "Actions",
    confirmDelete: "Delete this product?",
    yes: "Confirm",
    no: "Cancel",
    selectFile: "Choose image",
    removeImage: "Remove image",
    addBarcode: "Add barcode",
    barcodePlaceholder: "Enter an additional barcode",
    all: "All",
    close: "Close",
    print: "Print",
    date: "Date and time",
    changedProduct: "Product",
    changes: "Action",
    created: "Created",
    updated: "Updated",
    deleted: "Deleted",
    dashboardTitle: "Business overview",
    noHistory: "No changes recorded yet.",
    product: "Product",
    price: "Price",
    barcodeRequired: "Product name and primary barcode are required.",
    duplicateBarcode: "This barcode is already used by another product.",
    importSuccess: "Import completed.",
    importError: "Could not read this file.",
    exportError: "Could not export products.",
    stockStatus: "Stock status",
    available: "Available",
    outOfStock: "Out of stock",
    belowMinimum: "Below minimum",
    units: "Units",
    settingsTitle: "Settings",
    language: "Language",
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
    search: "Rechercher un produit...",
    addProduct: "Ajouter un produit",
    edit: "Modifier",
    delete: "Supprimer",
    name: "Nom du produit",
    barcode: "Code-barres principal",
    extraBarcodes: "Codes-barres supplémentaires",
    reference: "Référence",
    quantity: "Quantité actuelle",
    purchasePrice: "Prix d'achat",
    salePrice1: "Prix de vente 1",
    salePrice2: "Prix de vente 2",
    salePrice3: "Prix de vente 3",
    margin: "Marge %",
    carton: "Unités par carton",
    expiry: "Date d'expiration",
    unit: "Unité de mesure",
    image: "Image du produit",
    category: "Catégorie",
    minStock: "Stock minimum",
    save: "Enregistrer",
    cancel: "Annuler",
    part1: "Informations du produit",
    part2: "Expiration et unité",
    part3: "Image du produit",
    confirmSave: "Confirmer l'enregistrement des modifications ?",
    saved: "Produit enregistré avec succès.",
    priceWarning: "Attention : un prix de vente est inférieur au prix d'achat.",
    history: "Historique des modifications",
    printLabels: "Imprimer les étiquettes",
    import: "Importer un tableau",
    export: "Exporter le tableau",
    password: "Mot de passe de transfert",
    passwordPrompt: "Entrez le mot de passe pour continuer.",
    wrongPassword: "Mot de passe incorrect.",
    setPassword: "Définir le mot de passe de transfert",
    passwordHelp: "Utilisé uniquement pour l'importation et l'exportation.",
    noProducts: "Aucun produit trouvé.",
    totalProducts: "Nombre de produits",
    totalQuantity: "Quantité totale",
    lowStock: "Stock faible",
    actions: "Actions",
    confirmDelete: "Supprimer ce produit ?",
    yes: "Confirmer",
    no: "Annuler",
    selectFile: "Choisir une image",
    removeImage: "Supprimer l'image",
    addBarcode: "Ajouter un code-barres",
    barcodePlaceholder: "Saisir un code-barres supplémentaire",
    all: "Tous",
    close: "Fermer",
    print: "Imprimer",
    date: "Date et heure",
    changedProduct: "Produit",
    changes: "Action",
    created: "Créé",
    updated: "Modifié",
    deleted: "Supprimé",
    dashboardTitle: "Vue d'ensemble",
    noHistory: "Aucune modification enregistrée.",
    product: "Produit",
    price: "Prix",
    barcodeRequired: "Le nom et le code-barres principal sont obligatoires.",
    duplicateBarcode: "Ce code-barres est déjà utilisé par un autre produit.",
    importSuccess: "Importation terminée.",
    importError: "Impossible de lire ce fichier.",
    exportError: "Impossible d'exporter les produits.",
    stockStatus: "État du stock",
    available: "Disponible",
    outOfStock: "Rupture de stock",
    belowMinimum: "Sous le minimum",
    units: "Unités",
    settingsTitle: "Paramètres",
    language: "Langue",
  },
  ar: {
    dashboard: "لوحة التحكم",
    achats: "المشتريات",
    ventes: "المبيعات",
    produits: "قائمة المنتجات",
    fournisseurs: "الموردون",
    clients: "العملاء",
    stock: "المخزون",
    caisse: "الصندوق",
    depenses: "المصاريف",
    rapports: "التقارير",
    parametres: "الإعدادات",
    search: "ابحث عن منتج...",
    addProduct: "إضافة منتج",
    edit: "تعديل",
    delete: "حذف",
    name: "اسم المنتج",
    barcode: "الباركود الرئيسي",
    extraBarcodes: "باركودات إضافية",
    reference: "المرجع",
    quantity: "الكمية الحالية",
    purchasePrice: "سعر الشراء",
    salePrice1: "سعر البيع الأول",
    salePrice2: "سعر البيع الثاني",
    salePrice3: "سعر البيع الثالث",
    margin: "هامش الربح %",
    carton: "عدد الوحدات في الكرتون",
    expiry: "تاريخ انتهاء الصلاحية",
    unit: "وحدة القياس",
    image: "صورة المنتج",
    category: "الصنف",
    minStock: "الحد الأدنى للمخزون",
    save: "حفظ",
    cancel: "إلغاء",
    part1: "معلومات المنتج",
    part2: "الصلاحية ووحدة القياس",
    part3: "صورة المنتج",
    confirmSave: "هل تؤكد حفظ هذه التعديلات؟",
    saved: "تم حفظ المنتج بنجاح.",
    priceWarning: "تنبيه: يوجد سعر بيع أقل من سعر الشراء.",
    history: "سجل التعديلات",
    printLabels: "طباعة ملصقات الأسعار",
    import: "استيراد جدول",
    export: "تصدير جدول",
    password: "كلمة مرور النقل",
    passwordPrompt: "أدخل كلمة المرور للمتابعة.",
    wrongPassword: "كلمة المرور غير صحيحة.",
    setPassword: "تعيين كلمة مرور النقل",
    passwordHelp: "تُستخدم فقط لاستيراد المنتجات وتصديرها.",
    noProducts: "لا توجد منتجات.",
    totalProducts: "عدد المنتجات",
    totalQuantity: "إجمالي الوحدات",
    lowStock: "مخزون منخفض",
    actions: "الإجراءات",
    confirmDelete: "هل تريد حذف هذا المنتج؟",
    yes: "تأكيد",
    no: "إلغاء",
    selectFile: "اختيار صورة",
    removeImage: "حذف الصورة",
    addBarcode: "إضافة باركود",
    barcodePlaceholder: "أدخل باركودًا إضافيًا",
    all: "الكل",
    close: "إغلاق",
    print: "طباعة",
    date: "التاريخ والوقت",
    changedProduct: "المنتج",
    changes: "العملية",
    created: "إنشاء",
    updated: "تعديل",
    deleted: "حذف",
    dashboardTitle: "نظرة عامة على النشاط",
    noHistory: "لا توجد تعديلات مسجلة.",
    product: "المنتج",
    price: "السعر",
    barcodeRequired: "اسم المنتج والباركود الرئيسي مطلوبان.",
    duplicateBarcode: "هذا الباركود مستخدم في منتج آخر.",
    importSuccess: "اكتمل الاستيراد.",
    importError: "تعذرت قراءة الملف.",
    exportError: "تعذر تصدير المنتجات.",
    stockStatus: "حالة المخزون",
    available: "متوفر",
    outOfStock: "نفد المخزون",
    belowMinimum: "أقل من الحد الأدنى",
    units: "وحدة",
    settingsTitle: "الإعدادات",
    language: "اللغة",
  },
};

const menuKeys = [
  "dashboard",
  "achats",
  "ventes",
  "produits",
  "fournisseurs",
  "clients",
  "stock",
  "caisse",
  "depenses",
  "rapports",
  "parametres",
];

const menuIcons = {
  dashboard: "▦",
  achats: "⇩",
  ventes: "⇧",
  produits: "▤",
  fournisseurs: "♙",
  clients: "♧",
  stock: "▦",
  caisse: "▣",
  depenses: "−",
  rapports: "▥",
  parametres: "⚙",
};

const currency = (value, lang) =>
  `${Number(value || 0).toLocaleString(lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-DZ" : "en-US")} DA`;

const normalizeProduct = (p) => ({
  ...emptyProduct(),
  ...p,
  extraBarcodes: Array.isArray(p.extraBarcodes)
    ? p.extraBarcodes
    : typeof p.extraBarcodes === "string"
      ? p.extraBarcodes.split(",").map((x) => x.trim()).filter(Boolean)
      : [],
});

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem(LANGUAGE_KEY) || "fr");
  const t = translations[lang] || translations.fr;
  const isArabic = lang === "ar";

  const [activePage, setActivePage] = useState("dashboard");
  const [products, setProducts] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? saved.map(normalizeProduct) : [];
    } catch {
      return [];
    }
  });
  const [history, setHistory] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProduct());
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordModal, setPasswordModal] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [transferAction, setTransferAction] = useState(null);
  const [importInputKey, setImportInputKey] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [
        p.name,
        p.barcode,
        p.reference,
        p.category,
        ...(p.extraBarcodes || []),
      ].some((value) => String(value || "").toLowerCase().includes(q))
    );
  }, [products, search]);

  const lowStockCount = products.filter(
    (p) => Number(p.quantity) <= Number(p.minStock)
  ).length;

  const totalQuantity = products.reduce(
    (sum, p) => sum + Number(p.quantity || 0),
    0
  );

  const writeHistory = (action, product, before = null) => {
    const entry = {
      id: crypto.randomUUID(),
      action,
      productId: product.id,
      productName: product.name || "—",
      date: new Date().toISOString(),
      before,
      after: action === "deleted" ? null : { ...product },
    };
    setHistory((old) => [entry, ...old].slice(0, 2000));
  };

  const openNewProduct = () => {
    setEditingId(null);
    setForm(emptyProduct());
    setBarcodeInput("");
    setEditorOpen(true);
  };

  const openEditProduct = (product) => {
    setEditingId(product.id);
    setForm(normalizeProduct(product));
    setBarcodeInput("");
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setSaveConfirmOpen(false);
    setBarcodeInput("");
  };

  const updateField = (field, value) => {
    setForm((old) => {
      const next = { ...old, [field]: value };

      if (field === "purchasePrice") {
        ["1", "2", "3"].forEach((n) => {
          const sale = Number(next[`salePrice${n}`] || 0);
          next[`margin${n}`] =
            Number(value) > 0
              ? Number((((sale - Number(value)) / Number(value)) * 100).toFixed(2))
              : 0;
        });
      }

      if (["salePrice1", "salePrice2", "salePrice3"].includes(field)) {
        const n = field.slice(-1);
        const purchase = Number(next.purchasePrice || 0);
        next[`margin${n}`] =
          purchase > 0
            ? Number((((Number(value) - purchase) / purchase) * 100).toFixed(2))
            : 0;
      }

      return next;
    });
  };

  const updateMargin = (number, value) => {
    const margin = Number(value || 0);
    const purchase = Number(form.purchasePrice || 0);
    const sale = purchase + (purchase * margin) / 100;

    setForm((old) => ({
      ...old,
      [`margin${number}`]: margin,
      [`salePrice${number}`]: Number(sale.toFixed(2)),
    }));
  };

  const addExtraBarcode = () => {
    const value = barcodeInput.trim();
    if (!value) return;

    const exists = [
      form.barcode,
      ...form.extraBarcodes,
      ...products
        .filter((p) => p.id !== editingId)
        .flatMap((p) => [p.barcode, ...(p.extraBarcodes || [])]),
    ].some((code) => String(code || "").trim() === value);

    if (exists) {
      setMessage(t.duplicateBarcode);
      return;
    }

    setForm((old) => ({
      ...old,
      extraBarcodes: [...old.extraBarcodes, value],
    }));
    setBarcodeInput("");
  };

  const removeExtraBarcode = (value) => {
    setForm((old) => ({
      ...old,
      extraBarcodes: old.extraBarcodes.filter((code) => code !== value),
    }));
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage(t.importError);
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setMessage("Image size must be less than 3 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updateField("image", String(reader.result || ""));
    reader.onerror = () => setMessage(t.importError);
    reader.readAsDataURL(file);
  };

  const barcodeExists = (candidate, ignoredId) => {
    const allCodes = [
      candidate.barcode,
      ...(candidate.extraBarcodes || []),
    ].filter(Boolean);

    for (const p of products) {
      if (p.id === ignoredId) continue;
      const existing = [p.barcode, ...(p.extraBarcodes || [])].filter(Boolean);
      if (allCodes.some((code) => existing.includes(code))) return true;
    }

    return false;
  };

  const requestSave = () => {
    if (!form.name.trim() || !form.barcode.trim()) {
      setMessage(t.barcodeRequired);
      return;
    }

    if (barcodeExists(form, editingId)) {
      setMessage(t.duplicateBarcode);
      return;
    }

    setSaveConfirmOpen(true);
  };

  const confirmSave = () => {
    const now = new Date().toISOString();
    const prepared = {
      ...normalizeProduct(form),
      id: editingId || form.id || crypto.randomUUID(),
      name: form.name.trim(),
      barcode: form.barcode.trim(),
      reference: form.reference.trim(),
      updatedAt: now,
    };

    const oldProduct = editingId
      ? products.find((p) => p.id === editingId)
      : null;

    if (editingId) {
      setProducts((old) =>
        old.map((p) => (p.id === editingId ? prepared : p))
      );
      writeHistory("updated", prepared, oldProduct || null);
    } else {
      prepared.createdAt = now;
      setProducts((old) => [prepared, ...old]);
      writeHistory("created", prepared);
    }

    const priceBelowCost = [1, 2, 3].some(
      (n) =>
        Number(prepared[`salePrice${n}`] || 0) > 0 &&
        Number(prepared[`salePrice${n}`]) < Number(prepared.purchasePrice || 0)
    );

    closeEditor();
    setMessage(
      priceBelowCost
        ? `${t.saved} ${t.priceWarning}`
        : t.saved
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    writeHistory("deleted", deleteTarget);
    setProducts((old) => old.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
    setMessage(t.deleted);
  };

  const transferPassword = () => localStorage.getItem(ACCESS_KEY) || "";

  const startTransfer = (action) => {
    setTransferAction(action);
    setPasswordInput("");
    setPasswordModal("verify");
  };

  const verifyTransferPassword = () => {
    const stored = transferPassword();

    if (!stored) {
      setPasswordModal("");
      setShowPasswordSetup(true);
      return;
    }

    if (passwordInput !== stored) {
      setMessage(t.wrongPassword);
      return;
    }

    setPasswordModal("");
    setPasswordInput("");

    if (transferAction === "export") {
      exportProducts();
    } else if (transferAction === "import") {
      document.getElementById("veltro-import-file")?.click();
    }
  };

  const saveTransferPassword = () => {
    if (newPassword.trim().length < 4) {
      setMessage("Password must contain at least 4 characters.");
      return;
    }

    localStorage.setItem(ACCESS_KEY, newPassword.trim());
    setNewPassword("");
    setShowPasswordSetup(false);
    setMessage(t.saved);

    if (transferAction === "export") {
      exportProducts();
    } else if (transferAction === "import") {
      setTimeout(() => document.getElementById("veltro-import-file")?.click(), 0);
    }
  };

  const exportProducts = () => {
    try {
      const headers = [
        "name",
        "barcode",
        "extraBarcodes",
        "reference",
        "quantity",
        "purchasePrice",
        "salePrice1",
        "salePrice2",
        "salePrice3",
        "margin1",
        "margin2",
        "margin3",
        "unitsPerCarton",
        "expiryDate",
        "unit",
        "category",
        "minStock",
      ];

      const escapeCSV = (value) => {
        const raw = Array.isArray(value) ? value.join("|") : String(value ?? "");
        return `"${raw.replace(/"/g, '""')}"`;
      };

      const csv = [
        headers.join(","),
        ...products.map((p) =>
          headers.map((key) => escapeCSV(p[key])).join(",")
        ),
      ].join("\r\n");

      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `VELTRO-products-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage(t.export);
    } catch {
      setMessage(t.exportError);
    }
  };

  const parseCSVLine = (line) => {
    const values = [];
    let current = "";
    let quoted = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];

      if (char === '"' && quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current);
    return values;
  };

  const importProducts = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setImportInputKey((n) => n + 1);
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = String(reader.result || "").replace(/^\uFEFF/, "");
        const lines = text.split(/\r?\n/).filter((line) => line.trim());

        if (lines.length < 2) {
          setMessage(t.importError);
          return;
        }

        const headers = parseCSVLine(lines[0]).map((x) =>
          x.trim().toLowerCase()
        );
        const imported = [];

        for (const line of lines.slice(1)) {
          const cells = parseCSVLine(line);
          const row = {};

          headers.forEach((key, index) => {
            row[key] = cells[index] ?? "";
          });

          if (!row.name || !row.barcode) continue;

          const product = normalizeProduct({
            ...row,
            id: crypto.randomUUID(),
            extraBarcodes: String(row.extrabarcodes || "")
              .split("|")
              .map((x) => x.trim())
              .filter(Boolean),
            quantity: Number(row.quantity || 0),
            purchasePrice: Number(row.purchaseprice || 0),
            salePrice1: Number(row.saleprice1 || 0),
            salePrice2: Number(row.saleprice2 || 0),
            salePrice3: Number(row.saleprice3 || 0),
            margin1: Number(row.margin1 || 0),
            margin2: Number(row.margin2 || 0),
            margin3: Number(row.margin3 || 0),
            unitsPerCarton: Number(row.unitspercarton || 1),
            minStock: Number(row.minstock || 0),
            expiryDate: row.expirydate || "",
            unit: row.unit || "piece",
            category: row.category || "",
            updatedAt: new Date().toISOString(),
          });

          imported.push(product);
        }

        if (!imported.length) {
          setMessage(t.importError);
          return;
        }

        setProducts((old) => {
          const next = [...old];
          imported.forEach((p) => {
            const duplicate = next.find(
              (existing) =>
                existing.barcode === p.barcode ||
                (existing.extraBarcodes || []).some((code) =>
                  [p.barcode, ...(p.extraBarcodes || [])].includes(code)
                )
            );

            if (duplicate) {
              const index = next.findIndex((item) => item.id === duplicate.id);
              next[index] = { ...p, id: duplicate.id };
            } else {
              next.unshift(p);
            }
          });
          return next;
        });

        imported.forEach((p) => writeHistory("created", p));
        setMessage(`${t.importSuccess} (${imported.length})`);
      } catch {
        setMessage(t.importError);
      }
    };

    reader.onerror = () => setMessage(t.importError);
    reader.readAsText(file, "UTF-8");
  };

  const printLabels = () => {
    const printable = filteredProducts;

    if (!printable.length) {
      setMessage(t.noProducts);
      return;
    }

    const labelWindow = window.open("", "_blank", "width=900,height=700");

    if (!labelWindow) {
      setMessage("Allow pop-ups to print labels.");
      return;
    }

    const escapeHTML = (value) =>
      String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]);

    labelWindow.document.write(`
      <!doctype html>
      <html lang="${lang}">
      <head>
        <meta charset="utf-8">
        <title>${escapeHTML(t.printLabels)}</title>
        <style>
          body{font-family:Arial,sans-serif;margin:10mm}
          .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
          .label{border:1px solid #aaa;padding:12px;text-align:center;break-inside:avoid}
          .name{font-size:14px;font-weight:bold;min-height:30px}
          .price{font-size:23px;font-weight:bold;margin:10px 0}
          .code{font-size:11px;overflow-wrap:anywhere}
          @media print{.label{border:1px solid #777}}
        </style>
      </head>
      <body>
        <div class="grid">
          ${printable.map((p) => `
            <div class="label">
              <div class="name">${escapeHTML(p.name)}</div>
              <div class="price">${escapeHTML(p.salePrice1)} DA</div>
              <div class="code">${escapeHTML(p.barcode)}</div>
              ${p.reference ? `<div class="code">${escapeHTML(p.reference)}</div>` : ""}
            </div>
          `).join("")}
        </div>
        <script>window.onload=()=>window.print();<\/script>
      </body>
      </html>
    `);

    labelWindow.document.close();
  };

  const formatHistoryDate = (date) => {
    try {
      return new Date(date).toLocaleString(
        lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-DZ" : "en-US"
      );
    } catch {
      return date;
    }
  };

  const actionLabel = (action) =>
    action === "created"
      ? t.created
      : action === "updated"
        ? t.updated
        : t.deleted;

  const inputStyle = {
    width: "100%",
    minWidth: 0,
    padding: "10px 11px",
    border: "1px solid #d7dce4",
    borderRadius: 8,
    fontSize: 14,
    background: "#fff",
    color: "#172033",
    boxSizing: "border-box",
  };

  const fieldLabelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
    color: "#475467",
  };

  const buttonStyle = {
    border: 0,
    borderRadius: 8,
    padding: "10px 13px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  };

  const primaryButton = {
    ...buttonStyle,
    background: "#e86b28",
    color: "#fff",
  };

  const secondaryButton = {
    ...buttonStyle,
    background: "#edf0f5",
    color: "#243047",
  };

  const dangerButton = {
    ...buttonStyle,
    background: "#fff0ef",
    color: "#b42318",
  };

  const field = (label, key, type = "text", extra = {}) => (
    <label style={{ display: "block", minWidth: 0 }}>
      <span style={fieldLabelStyle}>{label}</span>
      <input
        style={inputStyle}
        type={type}
        value={form[key] ?? ""}
        onChange={(e) =>
          updateField(
            key,
            type === "number" ? Number(e.target.value) : e.target.value
          )
        }
        {...extra}
      />
    </label>
  );

  const salePriceField = (number) => (
    <div
      key={number}
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 110px",
        gap: 8,
        alignItems: "end",
      }}
    >
      <label style={{ display: "block", minWidth: 0 }}>
        <span style={fieldLabelStyle}>{t[`salePrice${number}`]}</span>
        <input
          style={{
            ...inputStyle,
            borderColor:
              Number(form[`salePrice${number}`] || 0) > 0 &&
              Number(form[`salePrice${number}`]) <
                Number(form.purchasePrice || 0)
                ? "#e5484d"
                : "#d7dce4",
          }}
          type="number"
          min="0"
          step="0.01"
          value={form[`salePrice${number}`] ?? 0}
          onChange={(e) =>
            updateField(`salePrice${number}`, Number(e.target.value))
          }
        />
      </label>
      <label style={{ display: "block", minWidth: 0 }}>
        <span style={fieldLabelStyle}>{t.margin}</span>
        <div style={{ position: "relative" }}>
          <input
            style={{ ...inputStyle, paddingRight: 26 }}
            type="number"
            step="0.1"
            value={form[`margin${number}`] ?? 0}
            onChange={(e) => updateMargin(number, e.target.value)}
          />
          <span
            style={{
              position: "absolute",
              right: 9,
              top: 10,
              color: "#667085",
              fontSize: 13,
            }}
          >
            %
          </span>
        </div>
      </label>
    </div>
  );

  const sectionCard = (title, children) => (
    <section
      style={{
        border: "1px solid #e4e7ec",
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        background: "#fff",
      }}
    >
      <h3 style={{ fontSize: 15, margin: "0 0 15px", color: "#1d2939" }}>
        {title}
      </h3>
      {children}
    </section>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#f5f7fa",
        color: "#172033",
        fontFamily: "Arial, sans-serif",
        direction: isArabic ? "rtl" : "ltr",
      }}
    >
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          background: "#172033",
          color: "#fff",
          padding: "20px 12px",
          boxSizing: "border-box",
          minHeight: "100vh",
        }}
      >
        <div style={{ padding: "0 10px 24px" }}>
          <div style={{ fontSize: 27, fontWeight: 900, letterSpacing: 2 }}>
            VELTRO
          </div>
          <div style={{ fontSize: 10, color: "#c1c9d6", marginTop: 4 }}>
            Your Business. Your Control.
          </div>
        </div>

        <nav style={{ display: "grid", gap: 5 }}>
          {menuKeys.map((key) => (
            <button
              key={key}
              onClick={() => setActivePage(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                width: "100%",
                textAlign: isArabic ? "right" : "left",
                border: 0,
                borderRadius: 8,
                padding: "11px 12px",
                cursor: "pointer",
                color: "#fff",
                background: activePage === key ? "#e86b28" : "transparent",
                fontSize: 13,
                fontWeight: activePage === key ? 700 : 500,
              }}
            >
              <span style={{ width: 20, fontSize: 18 }}>
                {menuIcons[key]}
              </span>
              {t[key]}
            </button>
          ))}
        </nav>

        <div
          style={{
            margin: "28px 8px 0",
            paddingTop: 15,
            borderTop: "1px solid #394356",
            fontSize: 11,
            color: "#aab4c5",
          }}
        >
          VELTRO · v1.0
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: 22, overflowX: "hidden" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ fontSize: 24, margin: 0, fontWeight: 800 }}>
              {activePage === "dashboard"
                ? t.dashboardTitle
                : t[activePage] || activePage}
            </h1>
            <p style={{ margin: "6px 0 0", color: "#667085", fontSize: 12 }}>
              VELTRO / {t[activePage] || activePage}
            </p>
          </div>

          <select
            aria-label={t.language}
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{
              ...inputStyle,
              width: 125,
              fontWeight: 700,
            }}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </header>

        {message && (
          <div
            role="status"
            style={{
              padding: "12px 15px",
              marginBottom: 18,
              background: "#fff",
              border: "1px solid #e4e7ec",
              borderRadius: 9,
              color: "#344054",
              fontSize: 13,
            }}
          >
            {message}
          </div>
        )}

        {activePage === "dashboard" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
                gap: 14,
              }}
            >
              {[
                [t.totalProducts, products.length, "▤"],
                [t.totalQuantity, totalQuantity, "▦"],
                [t.lowStock, lowStockCount, "⚠"],
              ].map(([label, value, icon]) => (
                <div
                  key={label}
                  style={{
                    background: "#fff",
                    border: "1px solid #eaecf0",
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <div style={{ color: "#667085", fontSize: 13 }}>{label}</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 15,
                    }}
                  >
                    <strong style={{ fontSize: 30 }}>{value}</strong>
                    <span style={{ color: "#e86b28", fontSize: 24 }}>{icon}</span>
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 18,
                background: "#fff",
                padding: 18,
                border: "1px solid #eaecf0",
                borderRadius: 12,
              }}
            >
              <h2 style={{ fontSize: 16, marginTop: 0 }}>{t.produits}</h2>
              <button
                style={primaryButton}
                onClick={() => setActivePage("produits")}
              >
                {t.produits} →
              </button>
            </div>
          </div>
        )}

        {activePage === "produits" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <input
                style={{ ...inputStyle, maxWidth: 360, flex: "1 1 220px" }}
                placeholder={t.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button style={primaryButton} onClick={openNewProduct}>
                + {t.addProduct}
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <button style={secondaryButton} onClick={printLabels}>
                ▣ {t.printLabels}
              </button>
              <button
                style={secondaryButton}
                onClick={() => startTransfer("import")}
              >
                ⇧ {t.import}
              </button>
              <button
                style={secondaryButton}
                onClick={() => startTransfer("export")}
              >
                ⇩ {t.export}
              </button>
              <button
                style={secondaryButton}
                onClick={() => setHistoryOpen(true)}
              >
                ◷ {t.history}
              </button>
              <button
                style={secondaryButton}
                onClick={() => setShowPasswordSetup(true)}
              >
                ⚙ {t.setPassword}
              </button>
              <input
                key={importInputKey}
                id="veltro-import-file"
                type="file"
                accept=".csv,text/csv"
                onChange={importProducts}
                style={{ display: "none" }}
              />
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #eaecf0",
                borderRadius: 12,
                overflow: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                  minWidth: 1150,
                }}
              >
                <thead>
                  <tr style={{ background: "#f9fafb", textAlign: isArabic ? "right" : "left" }}>
                    {[
                      t.product,
                      t.barcode,
                      t.reference,
                      t.quantity,
                      t.purchasePrice,
                      t.salePrice1,
                      t.salePrice2,
                      t.salePrice3,
                      t.carton,
                      t.expiry,
                      t.actions,
                    ].map((label) => (
                      <th
                        key={label}
                        style={{
                          padding: "13px 12px",
                          borderBottom: "1px solid #eaecf0",
                          color: "#667085",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 6,
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 6,
                                background: "#f2f4f7",
                                display: "grid",
                                placeItems: "center",
                                color: "#98a2b3",
                              }}
                            >
                              ▧
                            </div>
                          )}
                          <div>
                            <strong>{p.name}</strong>
                            {p.category && (
                              <div style={{ color: "#98a2b3", marginTop: 3 }}>
                                {p.category}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>{p.barcode}</td>
                      <td style={tdStyle}>{p.reference || "—"}</td>
                      <td
                        style={{
                          ...tdStyle,
                          color:
                            Number(p.quantity) <= Number(p.minStock)
                              ? "#b42318"
                              : "#027a48",
                          fontWeight: 700,
                        }}
                      >
                        {p.quantity} {p.unit}
                      </td>
                      <td style={tdStyle}>{currency(p.purchasePrice, lang)}</td>
                      <td style={tdStyle}>{currency(p.salePrice1, lang)}</td>
                      <td style={tdStyle}>{currency(p.salePrice2, lang)}</td>
                      <td style={tdStyle}>{currency(p.salePrice3, lang)}</td>
                      <td style={tdStyle}>{p.unitsPerCarton || 1}</td>
                      <td style={tdStyle}>{p.expiryDate || "—"}</td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            title={t.edit}
                            style={iconButtonStyle}
                            onClick={() => openEditProduct(p)}
                          >
                            ✎
                          </button>
                          <button
                            title={t.delete}
                            style={{ ...iconButtonStyle, color: "#b42318" }}
                            onClick={() => setDeleteTarget(p)}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredProducts.length && (
                    <tr>
                      <td
                        colSpan={11}
                        style={{
                          padding: 35,
                          textAlign: "center",
                          color: "#98a2b3",
                        }}
                      >
                        {t.noProducts}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ color: "#667085", fontSize: 12, marginTop: 10 }}>
              {t.totalProducts}: {filteredProducts.length}
            </div>
          </div>
        )}

        {activePage !== "dashboard" && activePage !== "produits" && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #eaecf0",
              borderRadius: 12,
              padding: 24,
              color: "#667085",
            }}
          >
            {t[activePage]}
          </div>
        )}
      </main>

      {editorOpen && (
        <div style={overlayStyle} onMouseDown={(e) => {
          if (e.target === e.currentTarget) closeEditor();
        }}>
          <div style={modalStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                borderBottom: "1px solid #eaecf0",
                paddingBottom: 14,
                marginBottom: 16,
              }}
            >
              <div>
                <h2 style={{ fontSize: 20, margin: 0 }}>
                  {editingId ? t.edit : t.addProduct}
                </h2>
                <p style={{ color: "#667085", fontSize: 12, margin: "5px 0 0" }}>
                  VELTRO · {t.produits}
                </p>
              </div>
              <button style={iconButtonStyle} onClick={closeEditor}>✕</button>
            </div>

            {sectionCard(
              `01 · ${t.part1}`,
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                    gap: 13,
                  }}
                >
                  {field(t.name, "name", "text", { required: true })}
                  {field(t.barcode, "barcode", "text", { required: true })}
                  {field(t.reference, "reference")}
                  {field(t.category, "category")}
                  {field(t.quantity, "quantity", "number", { min: 0, step: "any" })}
                  {field(t.purchasePrice, "purchasePrice", "number", { min: 0, step: "any" })}
                  {field(t.minStock, "minStock", "number", { min: 0, step: "any" })}
                  {field(t.carton, "unitsPerCarton", "number", { min: 1, step: 1 })}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
                    gap: 12,
                    marginTop: 16,
                  }}
                >
                  {[1, 2, 3].map(salePriceField)}
                </div>

                {[1, 2, 3].some(
                  (n) =>
                    Number(form[`salePrice${n}`] || 0) > 0 &&
                    Number(form[`salePrice${n}`]) <
                      Number(form.purchasePrice || 0)
                ) && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 11,
                      borderRadius: 8,
                      background: "#fff0ef",
                      color: "#b42318",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    ⚠ {t.priceWarning}
                  </div>
                )}

                <div style={{ marginTop: 17 }}>
                  <label style={fieldLabelStyle}>{t.extraBarcodes}</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      style={inputStyle}
                      value={barcodeInput}
                      placeholder={t.barcodePlaceholder}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addExtraBarcode();
                        }
                      }}
                    />
                    <button
                      type="button"
                      style={secondaryButton}
                      onClick={addExtraBarcode}
                    >
                      + {t.addBarcode}
                    </button>
                  </div>
                  {form.extraBarcodes.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 7,
                        marginTop: 9,
                      }}
                    >
                      {form.extraBarcodes.map((code) => (
                        <span
                          key={code}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            background: "#eef2f6",
                            borderRadius: 20,
                            padding: "6px 10px",
                            fontSize: 12,
                          }}
                        >
                          {code}
                          <button
                            type="button"
                            onClick={() => removeExtraBarcode(code)}
                            style={{
                              border: 0,
                              background: "transparent",
                              color: "#b42318",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {sectionCard(
              `02 · ${t.part2}`,
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                  gap: 13,
                }}
              >
                {field(t.expiry, "expiryDate", "date")}
                <label style={{ display: "block" }}>
                  <span style={fieldLabelStyle}>{t.unit}</span>
                  <select
                    style={inputStyle}
                    value={form.unit}
                    onChange={(e) => updateField("unit", e.target.value)}
                  >
                    <option value="piece">Piece / حبة</option>
                    <option value="carton">Carton / كرتون</option>
                    <option value="kg">Kilogram / كغ</option>
                    <option value="g">Gram / غ</option>
                    <option value="liter">Liter / لتر</option>
                    <option value="ml">Milliliter / مل</option>
                    <option value="box">Box / علبة</option>
                    <option value="pack">Pack / حزمة</option>
                    <option value="meter">Meter / متر</option>
                  </select>
                </label>
              </div>
            )}

            {sectionCard(
              `03 · ${t.part3}`,
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px minmax(0,1fr)",
                  gap: 15,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 10,
                    border: "1px dashed #cbd5e1",
                    background: "#f8fafc",
                    overflow: "hidden",
                    display: "grid",
                    placeItems: "center",
                    color: "#98a2b3",
                  }}
                >
                  {form.image ? (
                    <img
                      src={form.image}
                      alt={form.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 34 }}>▧</span>
                  )}
                </div>
                <div>
                  <label
                    style={{
                      ...buttonStyle,
                      ...secondaryButton,
                      display: "inline-block",
                    }}
                  >
                    {t.selectFile}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImage}
                      style={{ display: "none" }}
                    />
                  </label>
                  {form.image && (
                    <button
                      style={{ ...dangerButton, marginTop: 10, display: "block" }}
                      onClick={() => updateField("image", "")}
                    >
                      {t.removeImage}
                    </button>
                  )}
                  <p style={{ fontSize: 11, color: "#667085", marginTop: 10 }}>
                    JPG, PNG or WebP · Maximum 3 MB
                  </p>
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 9,
                flexWrap: "wrap",
                paddingTop: 5,
              }}
            >
              <button style={secondaryButton} onClick={closeEditor}>
                {t.cancel}
              </button>
              <button style={primaryButton} onClick={requestSave}>
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {saveConfirmOpen && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: 420, alignSelf: "center" }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>{t.confirmSave}</h2>
            {[1, 2, 3].some(
              (n) =>
                Number(form[`salePrice${n}`] || 0) > 0 &&
                Number(form[`salePrice${n}`]) <
                  Number(form.purchasePrice || 0)
            ) && (
              <p style={{ color: "#b42318", fontSize: 13 }}>
                ⚠ {t.priceWarning}
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
              <button
                style={secondaryButton}
                onClick={() => setSaveConfirmOpen(false)}
              >
                {t.cancel}
              </button>
              <button style={primaryButton} onClick={confirmSave}>
                {t.yes}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: 420, alignSelf: "center" }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>{t.confirmDelete}</h2>
            <p style={{ color: "#667085" }}>{deleteTarget.name}</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
              <button style={secondaryButton} onClick={() => setDeleteTarget(null)}>
                {t.no}
              </button>
              <button style={dangerButton} onClick={confirmDelete}>
                {t.yes}
              </button>
            </div>
          </div>
        </div>
      )}

      {passwordModal === "verify" && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: 420, alignSelf: "center" }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>
              {transferAction === "import" ? t.import : t.export}
            </h2>
            <p style={{ color: "#667085", fontSize: 13 }}>{t.passwordPrompt}</p>
            <label style={{ display: "block", marginBottom: 15 }}>
              <span style={fieldLabelStyle}>{t.password}</span>
              <input
                style={inputStyle}
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") verifyTransferPassword();
                }}
                autoFocus
              />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
              <button style={secondaryButton} onClick={() => setPasswordModal("")}>
                {t.cancel}
              </button>
              <button style={primaryButton} onClick={verifyTransferPassword}>
                {t.yes}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordSetup && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: 420, alignSelf: "center" }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>{t.setPassword}</h2>
            <p style={{ color: "#667085", fontSize: 13 }}>{t.passwordHelp}</p>
            <label style={{ display: "block", marginBottom: 15 }}>
              <span style={fieldLabelStyle}>{t.password}</span>
              <input
                style={inputStyle}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoFocus
              />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
              <button
                style={secondaryButton}
                onClick={() => {
                  setShowPasswordSetup(false);
                  setNewPassword("");
                }}
              >
                {t.cancel}
              </button>
              <button style={primaryButton} onClick={saveTransferPassword}>
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {historyOpen && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                marginBottom: 15,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20 }}>{t.history}</h2>
              <button style={iconButtonStyle} onClick={() => setHistoryOpen(false)}>
                ✕
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 500,
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr style={{ background: "#f9fafb", textAlign: isArabic ? "right" : "left" }}>
                    {[t.date, t.changedProduct, t.changes].map((label) => (
                      <th
                        key={label}
                        style={{
                          padding: 12,
                          borderBottom: "1px solid #eaecf0",
                        }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td style={tdStyle}>{formatHistoryDate(item.date)}</td>
                      <td style={tdStyle}>{item.productName}</td>
                      <td style={tdStyle}>{actionLabel(item.action)}</td>
                    </tr>
                  ))}
                  {!history.length && (
                    <tr>
                      <td colSpan={3} style={{ ...tdStyle, textAlign: "center" }}>
                        {t.noHistory}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
              <button style={secondaryButton} onClick={() => setHistoryOpen(false)}>
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #f0f1f3",
  whiteSpace: "nowrap",
  verticalAlign: "middle",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background: "rgba(15,23,42,.58)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: 14,
  overflowY: "auto",
};

const modalStyle = {
  width: "100%",
  maxWidth: 850,
  margin: "auto",
  background: "#f8fafc",
  borderRadius: 14,
  padding: 20,
  boxSizing: "border-box",
  maxHeight: "calc(100vh - 28px)",
  overflowY: "auto",
  boxShadow: "0 20px 60px rgba(0,0,0,.25)",
};

const iconButtonStyle = {
  border: "1px solid #eaecf0",
  background: "#fff",
  borderRadius: 7,
  minWidth: 32,
  minHeight: 32,
  cursor: "pointer",
  fontSize: 15,
  color: "#344054",
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
