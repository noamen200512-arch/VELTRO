
import React, { useEffect, useMemo, useState } from "react";
import "./pos.css";

const DB = {
  customers: "veltro_customers",
  receipts: "veltro_receipts",
  offers: "veltro_offers",
  visits: "veltro_visits",
  audit: "veltro_audit",
  fence: "veltro_fence",
};

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const save = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const money = (value) =>
  `${Number(value || 0).toLocaleString("fr-DZ", {
    maximumFractionDigits: 2,
  })} DA`;

const dateNow = () => new Date().toISOString();

const distance = (a, b) => {
  const rad = (n) => (n * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) *
      Math.cos(rad(b.lat)) *
      Math.sin(dLon / 2) ** 2;

  return (
    6371000 *
    2 *
    Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  );
};

export default function POS({
  products = [],
  setProducts = () => {},
  lang = "fr",
}) {
  const [customers, setCustomers] = useState(() =>
    load(DB.customers, [
      {
        id: "cash-customer",
        name: "Client comptant",
        type: "regular",
        photo: "",
        debt: 0,
      },
    ])
  );

  const [receipts, setReceipts] = useState(() =>
    load(DB.receipts, [])
  );

  const [offers, setOffers] = useState(() =>
    load(DB.offers, [])
  );

  const [visits, setVisits] = useState(() =>
    load(DB.visits, [])
  );

  const [audit, setAudit] = useState(() =>
    load(DB.audit, [])
  );

  const [fence, setFence] = useState(() =>
    load(DB.fence, {
      enabled: false,
      name: "منطقة الزيارة",
      lat: "",
      lon: "",
      radius: 150,
    })
  );

  const [screen, setScreen] = useState("home");
  const [message, setMessage] = useState("");
  const [customer, setCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [editing, setEditing] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [quantity, setQuantity] = useState("1");
  const [packType, setPackType] = useState("unit");
  const [packs, setPacks] = useState("1");
  const [unitsPerPack, setUnitsPerPack] = useState("1");
  const [priceType, setPriceType] = useState("1");
  const [manualPrice, setManualPrice] = useState("");
  const [lineDiscount, setLineDiscount] = useState("0");

  const [paid, setPaid] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showPayment, setShowPayment] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    type: "regular",
    photo: "",
    debt: 0,
  });

  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [offerForm, setOfferForm] = useState({
    name: "",
    productQuery: "",
    requiredQty: 10,
    freeQty: 1,
    discount: 0,
    stock: 1,
    active: true,
  });

  const [visitCustomer, setVisitCustomer] = useState("");
  const [visitNote, setVisitNote] = useState("");

  const [permissions, setPermissions] = useState({
    editReceipts: false,
    editPrices: false,
  });

  const [receiptFilter, setReceiptFilter] = useState("all");

  useEffect(() => save(DB.customers, customers), [customers]);
  useEffect(() => save(DB.receipts, receipts), [receipts]);
  useEffect(() => save(DB.offers, offers), [offers]);
  useEffect(() => save(DB.visits, visits), [visits]);
  useEffect(() => save(DB.audit, audit), [audit]);
  useEffect(() => save(DB.fence, fence), [fence]);

  const notify = (text) => setMessage(text);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const logAction = (action, receiptNumber = "", details = {}) => {
    setAudit((old) => [
      {
        id: uid(),
        action,
        receiptNumber,
        user: "المستخدم الحالي",
        page: screen,
        time: dateNow(),
        details,
      },
      ...old,
    ]);
  };

  const getLocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        notify("تحديد الموقع غير مدعوم في هذا الجهاز.");
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
            capturedAt: dateNow(),
          });
        },
        () => {
          notify("تعذر تحديد الموقع. تحقق من إذن GPS.");
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        }
      );
    });

  const insideFence = (point) => {
    if (!fence.enabled || !fence.lat || !fence.lon) {
      return null;
    }

    if (!point) return false;

    return (
      distance(point, {
        lat: Number(fence.lat),
        lon: Number(fence.lon),
      }) <= Number(fence.radius || 150)
    );
  };

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();

    return customers.filter((item) =>
      item.name.toLowerCase().includes(q)
    );
  }, [customers, customerSearch]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();

    return products.filter((p) =>
      [
        p.name,
        p.barcode,
        p.reference,
        ...(p.extraBarcodes || []),
      ].some((value) =>
        String(value || "").toLowerCase().includes(q)
      )
    ).slice(0, 15);
  }, [products, productSearch]);

  const totals = useMemo(() => {
    const before = cart.reduce(
      (sum, line) => sum + line.qty * line.price,
      0
    );

    const discounts = cart.reduce(
      (sum, line) => sum + Number(line.discount || 0),
      0
    );

    const total = Math.max(0, before - discounts);

    return {
      before,
      discounts,
      total,
      previousDebt: Number(customer?.debt || 0),
      paid: Number(paid || 0),
      remaining: Math.max(0, total - Number(paid || 0)),
    };
  }, [cart, customer, paid]);

  const createCustomer = () => {
    if (!newCustomer.name.trim()) {
      notify("أدخل اسم العميل.");
      return;
    }

    const item = {
      ...newCustomer,
      id: uid(),
      name: newCustomer.name.trim(),
      debt: Number(newCustomer.debt || 0),
    };

    setCustomers((old) => [...old, item]);
    setCustomer(item);
    setNewCustomer({
      name: "",
      type: "regular",
      photo: "",
      debt: 0,
    });
    setShowNewCustomer(false);
    notify("تمت إضافة العميل.");
  };

  const beginSale = () => {
    if (!customer) {
      notify("يجب اختيار العميل أولًا.");
      return;
    }

    setCart([]);
    setEditing(null);
    setProductSearch("");
    setPaid("0");
    setScreen("cashier");
  };

  const openProduct = (product) => {
    setSelectedProduct(product);
    setQuantity("1");
    setPackType("unit");
    setPacks("1");
    setUnitsPerPack(String(product.unitsPerCarton || 1));
    setPriceType("1");
    setManualPrice("");
    setLineDiscount("0");
  };

  const addProduct = () => {
    const product = selectedProduct;
    if (!product) return;

    let qty = Number(quantity || 0);

    if (packType !== "unit") {
      qty =
        Number(packs || 0) *
        Number(unitsPerPack || 1) *
        (packType === "half" ? 0.5 : 1);
    }

    if (qty <= 0) {
      notify("أدخل كمية صحيحة.");
      return;
    }

    if (manualPrice !== "" && !permissions.editPrices) {
      notify("تعديل السعر اليدوي يحتاج إلى صلاحية.");
      return;
    }

    const key = `salePrice${priceType}`;

    const price =
      manualPrice !== ""
        ? Number(manualPrice)
        : Number(product[key] ?? product.salePrice1 ?? 0);

    if (
      manualPrice !== "" &&
      price < Number(product.purchasePrice || 0)
    ) {
      const confirmed = window.confirm(
        "تنبيه: سعر البيع أقل من سعر الشراء. هل تريد المتابعة؟"
      );

      if (!confirmed) return;
    }

    setCart((old) => [
      ...old,
      {
        id: uid(),
        productId: product.id,
        name: product.name,
        qty,
        price,
        discount: Math.max(0, Number(lineDiscount || 0)),
        purchasePrice: Number(product.purchasePrice || 0),
        packType,
        packs: Number(packs || 0),
        unitsPerPack: Number(unitsPerPack || 1),
        locked: false,
        offer: false,
      },
    ]);

    setSelectedProduct(null);
    setProductSearch("");
  };

  const changeLine = (id, field, value) => {
    setCart((old) =>
      old.map((line) =>
        line.id === id && !line.locked
          ? { ...line, [field]: Number(value || 0) }
          : line
      )
    );
  };

  const removeLine = (id) => {
    setCart((old) =>
      old.filter((line) => line.id !== id || line.locked)
    );
  };

  const availableOffers = offers
    .filter((o) => o.active && Number(o.stock) > 0);

  const unavailableOffers = offers
    .filter((o) => !o.active || Number(o.stock) <= 0);

  const addOffer = (offer) => {
    const product = products.find((p) =>
      String(p.name).toLowerCase().includes(
        offer.productQuery.toLowerCase()
      )
    );

    if (!product) {
      notify("لم يتم العثور على المنتج المرتبط بالعرض.");
      return;
    }

    const required = Number(offer.requiredQty || 1);
    const free = Number(offer.freeQty || 0);
    const price = Number(product.salePrice1 || 0);

    setCart((old) => [
      ...old,
      {
        id: uid(),
        productId: product.id,
        name: `🎁 ${offer.name} — ${product.name}`,
        qty: required + free,
        price,
        discount:
          Number(offer.discount || 0) + free * price,
        packType: "offer",
        packs: required,
        unitsPerPack: 1,
        locked: true,
        offer: true,
        offerId: offer.id,
        purchasePrice: Number(product.purchasePrice || 0),
      },
    ]);

    setScreen("cashier");
    notify("أضيف العرض كبند ثابت لا يمكن تعديله.");
  };

  const nextNumber = () => {
    const prefix = new Date()
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "");

    const existing = receipts
      .map((r) => r.number)
      .filter((n) => String(n).startsWith(prefix))
      .length;

    return `${prefix}-${String(existing + 1).padStart(3, "0")}`;
  };

  const saveReceipt = async (status) => {
    if (!customer) {
      notify("اختر العميل أولًا.");
      return;
    }

    if (!cart.length) {
      notify("أضف منتجًا واحدًا على الأقل.");
      return;
    }

    if (status === "sale" && !showPayment) {
      setPaid(String(totals.total));
      setShowPayment(true);
      return;
    }

    let location = null;

    if (status === "sale") {
      if (Number(paid || 0) > totals.total) {
        notify("المبلغ المدفوع أكبر من إجمالي الفاتورة.");
        return;
      }

      location = await getLocation();
    }

    const oldReceipt = editing;

    const receipt = {
      id: oldReceipt?.id || uid(),
      number: oldReceipt?.number || nextNumber(),
      customerId: customer.id,
      customerName: customer.name,
      customerPhoto: customer.photo || "",
      lines: cart,
      beforeDiscount: totals.before,
      discountTotal: totals.discounts,
      total: totals.total,
      paid: status === "sale" ? Number(paid || 0) : 0,
      debt:
        status === "sale"
          ? Math.max(0, totals.total - Number(paid || 0))
          : 0,
      previousDebt: Number(customer.debt || 0),
      status,
      location: location || oldReceipt?.location || null,
      createdAt: oldReceipt?.createdAt || dateNow(),
      updatedAt: dateNow(),
    };

    setReceipts((old) =>
      oldReceipt
        ? old.map((r) =>
            r.id === oldReceipt.id ? receipt : r
          )
        : [receipt, ...old]
    );

    if (status === "sale") {
      setCustomers((old) =>
        old.map((c) =>
          c.id === customer.id
            ? {
                ...c,
                debt: Number(c.debt || 0) + receipt.debt,
              }
            : c
        )
      );

      setProducts((old) =>
        old.map((p) => {
          const sold = cart
            .filter((line) => line.productId === p.id)
            .reduce((sum, line) => sum + line.qty, 0);

          return sold
            ? {
                ...p,
                quantity: Math.max(
                  0,
                  Number(p.quantity || 0) - sold
                ),
              }
            : p;
        })
      );

      setOffers((old) =>
        old.map((offer) => {
          const used = cart.filter(
            (line) =>
              line.offer && line.offerId === offer.id
          ).length;

          return used
            ? {
                ...offer,
                stock: Math.max(
                  0,
                  Number(offer.stock || 0) - used
                ),
              }
            : offer;
        })
      );
    }

    logAction(
      status === "draft"
        ? "حفظ مسودة"
        : status === "order"
        ? "حفظ طلبية"
        : oldReceipt
        ? "إنهاء تعديل البون"
        : "إنهاء البيع",
      receipt.number,
      { status, location }
    );

    setShowPayment(false);
    setCart([]);
    setEditing(null);
    setScreen("receipts");

    notify(
      status === "draft"
        ? "تم حفظ المسودة."
        : status === "order"
        ? "تم حفظ الطلبية."
        : "تم تسجيل البيع."
    );
  };

  const editReceipt = (receipt) => {
    if (!permissions.editReceipts) {
      notify("تعديل البونات يتطلب صلاحية المالك.");
      return;
    }

    const selected = customers.find(
      (c) => c.id === receipt.customerId
    );

    setCustomer(
      selected || {
        id: receipt.customerId,
        name: receipt.customerName,
        photo: receipt.customerPhoto,
        debt: receipt.previousDebt || 0,
      }
    );

    setCart(
      (receipt.lines || []).map((line) => ({
        ...line,
        id: uid(),
      }))
    );

    setEditing(receipt);

    logAction("بدء تعديل البون", receipt.number, {
      page: screen,
    });

    setScreen("cashier");
  };

  const createOffer = () => {
    if (!offerForm.name.trim() || !offerForm.productQuery.trim()) {
      notify("أدخل اسم العرض واسم المنتج.");
      return;
    }

    setOffers((old) => [
      {
        ...offerForm,
        id: uid(),
        requiredQty: Number(offerForm.requiredQty),
        freeQty: Number(offerForm.freeQty),
        discount: Number(offerForm.discount),
        stock: Number(offerForm.stock),
      },
      ...old,
    ]);

    setOfferForm({
      name: "",
      productQuery: "",
      requiredQty: 10,
      freeQty: 1,
      discount: 0,
      stock: 1,
      active: true,
    });

    notify("تم حفظ العرض.");
  };

  const registerVisit = async () => {
    if (!visitCustomer) {
      notify("اختر العميل الذي تمت زيارته.");
      return;
    }

    const point = await getLocation();
    const inside = insideFence(point);

    const visit = {
      id: uid(),
      customerId: visitCustomer,
      customerName:
        customers.find((c) => c.id === visitCustomer)?.name ||
        "عميل",
      note: visitNote,
      location: point,
      insideFence: inside,
      status:
        inside === true
          ? "داخل النطاق"
          : inside === false
          ? "خارج النطاق أو يحتاج مراجعة"
          : "تعذر التحقق من الموقع",
      time: dateNow(),
      orderCreated: false,
    };

    setVisits((old) => [visit, ...old]);
    logAction("تسجيل زيارة دون طلبية", visit.customerName, visit);

    setVisitNote("");

    notify(
      inside === false
        ? "تنبيه: الزيارة خارج النطاق المحدد."
        : "تم تسجيل الزيارة."
    );
  };

  const mapUrl =
    fence.lat && fence.lon
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(fence.lon) - 0.01}%2C${Number(fence.lat) - 0.01}%2C${Number(fence.lon) + 0.01}%2C${Number(fence.lat) + 0.01}&layer=mapnik&marker=${fence.lat}%2C${fence.lon}`
      : "";

  return (
    <div className="pos-shell" dir={lang === "ar" ? "rtl" : "ltr"}>
      <header className="pos-header">
        <div>
          <span className="pos-eyebrow">VELTRO · SALES</span>
          <h1>إدارة المبيعات</h1>
          <p>سطح الكاشير والبونات والعروض والزيارات</p>
        </div>

        <button
          className="pos-btn primary"
          onClick={() => {
            setCustomer(null);
            setScreen("customers");
          }}
        >
          + بون جديد
        </button>
      </header>

      <nav className="pos-nav">
        {[
          ["home", "الرئيسية"],
          ["customers", "العملاء"],
          ["receipts", "البونات السابقة"],
          ["offers", "العروض"],
          ["visits", "الخريطة والزيارات"],
          ["settings", "إعدادات المالك"],
        ].map(([id, title]) => (
          <button
            key={id}
            className={screen === id ? "active" : ""}
            onClick={() => setScreen(id)}
          >
            {title}
          </button>
        ))}
      </nav>

      {message && (
        <div className="pos-message">{message}</div>
      )}

      {screen === "home" && (
        <>
          <div className="pos-stats">
            <div>
              <small>كل البونات</small>
              <strong>{receipts.length}</strong>
            </div>
            <div>
              <small>المسودات</small>
              <strong>
                {receipts.filter((r) => r.status === "draft").length}
              </strong>
            </div>
            <div>
              <small>الطلبيات</small>
              <strong>
                {receipts.filter((r) => r.status === "order").length}
              </strong>
            </div>
            <div>
              <small>الزيارات</small>
              <strong>{visits.length}</strong>
            </div>
          </div>

          <section className="pos-panel">
            <h2>ابدأ عملية بيع</h2>
            <p>اختر العميل أولًا للانتقال إلى سطح الكاشير.</p>
            <button
              className="pos-btn success"
              onClick={() => setScreen("customers")}
            >
              اختيار العميل
            </button>
          </section>
        </>
      )}

      {screen === "customers" && (
        <section className="pos-panel">
          <div className="pos-panel-title">
            <h2>اختيار العميل</h2>
            <button
              className="pos-btn primary"
              onClick={() => setShowNewCustomer(!showNewCustomer)}
            >
              + عميل جديد
            </button>
          </div>

          <input
            className="pos-input"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            placeholder="ابحث عن العميل..."
          />

          <div className="pos-customer-grid">
            {filteredCustomers.map((item) => (
              <button
                key={item.id}
                className={`pos-customer-card ${
                  customer?.id === item.id ? "selected" : ""
                }`}
                onClick={() => setCustomer(item)}
              >
                <div className="pos-avatar">
                  {item.photo ? (
                    <img src={item.photo} alt="" />
                  ) : (
                    item.name.slice(0, 1)
                  )}
                </div>
                <strong>{item.name}</strong>
                <small>
                  {item.type === "trader" ? "تاجر" : "زبون عادي"}
                </small>
                <span>الدين: {money(item.debt)}</span>
              </button>
            ))}
          </div>

          {showNewCustomer && (
            <div className="pos-form-grid">
              <label>
                اسم العميل
                <input
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      name: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                نوع العميل
                <select
                  value={newCustomer.type}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="regular">زبون عادي</option>
                  <option value="trader">تاجر</option>
                </select>
              </label>

              <label>
                الدين السابق
                <input
                  type="number"
                  value={newCustomer.debt}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      debt: e.target.value,
                    })
                  }
                />
              </label>

              <button
                className="pos-btn primary"
                onClick={createCustomer}
              >
                حفظ العميل
              </button>
            </div>
          )}

          {customer && (
            <div className="pos-selected-customer">
              العميل المحدد: <strong>{customer.name}</strong>
            </div>
          )}

          <button
            className="pos-btn success"
            disabled={!customer}
            onClick={beginSale}
          >
            تأكيد العميل والانتقال إلى الكاشير
          </button>
        </section>
      )}

      {screen === "cashier" && (
        <>
          <section className="pos-customer-banner">
            <div className="pos-avatar">
              {customer?.photo ? (
                <img src={customer.photo} alt="" />
              ) : (
                customer?.name?.slice(0, 1)
              )}
            </div>
            <div>
              <small>العميل</small>
              <strong>{customer?.name}</strong>
            </div>
            <div className="pos-spacer" />
            <button
              className="pos-btn secondary"
              onClick={() => setScreen("offers")}
            >
              🎁 العروض ({availableOffers.length})
            </button>
          </section>

          <div className="pos-search-row">
            <input
              className="pos-input"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="ابحث بالاسم أو امسح الباركود أو أدخل المرجع..."
            />
          </div>

          {productSearch && (
            <section className="pos-panel pos-results">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => openProduct(p)}
                >
                  <span>
                    <strong>{p.name}</strong>
                    <small>
                      باركود: {p.barcode || "—"} · مرجع: {p.reference || "—"}
                    </small>
                  </span>
                  <strong>{money(p.salePrice1)}</strong>
                  <small>المخزون: {p.quantity ?? "—"}</small>
                </button>
              ))}
            </section>
          )}

          <section className="pos-panel">
            <h2>المنتجات في البون</h2>
            <div className="pos-table-wrap">
              <table className="pos-table">
                <thead>
                  <tr>
                    <th>المنتج</th>
                    <th>الكمية</th>
                    <th>سعر الوحدة</th>
                    <th>التعبئة</th>
                    <th>الخصم</th>
                    <th>الإجمالي</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((line) => (
                    <tr
                      key={line.id}
                      className={line.offer ? "offer-line" : ""}
                    >
                      <td>
                        {line.name}
                        {line.locked && (
                          <small>عرض ثابت 🔒</small>
                        )}
                      </td>
                      <td>
                        {line.locked ? (
                          line.qty
                        ) : (
                          <input
                            className="pos-small-input"
                            type="number"
                            min="0.01"
                            step="any"
                            value={line.qty}
                            onChange={(e) =>
                              changeLine(line.id, "qty", e.target.value)
                            }
                          />
                        )}
                      </td>
                      <td>{money(line.price)}</td>
                      <td>
                        {line.packType === "offer"
                          ? "عرض"
                          : line.packType === "unit"
                          ? "وحدة"
                          : `${line.packs} × ${line.unitsPerPack}`}
                      </td>
                      <td>
                        {line.locked ? (
                          money(line.discount)
                        ) : (
                          <input
                            className="pos-small-input"
                            type="number"
                            min="0"
                            value={line.discount}
                            onChange={(e) =>
                              changeLine(
                                line.id,
                                "discount",
                                e.target.value
                              )
                            }
                          />
                        )}
                      </td>
                      <td>
                        {money(
                          Math.max(
                            0,
                            line.qty * line.price - line.discount
                          )
                        )}
                      </td>
                      <td>
                        {!line.locked && (
                          <button
                            className="pos-delete"
                            onClick={() => removeLine(line.id)}
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!cart.length && (
              <p className="pos-empty">
                ابحث عن منتج لإضافته إلى البون.
              </p>
            )}
          </section>

          <section className="pos-finance">
            <div className="pos-total-banner">
              <span>TOTAL DE BON</span>
              <strong>{money(totals.total)}</strong>
            </div>

            <div className="pos-finance-grid">
              <div>
                <small>السعر قبل الخصم</small>
                <strong>{money(totals.before)}</strong>
              </div>
              <div className="pos-saving">
                <small>🎉 مبلغ الخصم والتوفير</small>
                <strong>− {money(totals.discounts)}</strong>
              </div>
              <div>
                <small>السعر بعد الخصم</small>
                <strong>{money(totals.total)}</strong>
              </div>
              <div>
                <small>الدين السابق</small>
                <strong>{money(totals.previousDebt)}</strong>
              </div>
              <div>
                <small>المدفوع</small>
                <strong>{money(totals.paid)}</strong>
              </div>
              <div>
                <small>الباقي من البون</small>
                <strong>{money(totals.remaining)}</strong>
              </div>
              <div>
                <small>مجموع الفاتورة</small>
                <strong>{money(totals.total)}</strong>
              </div>
              <div className="pos-account-total">
                <small>مجموع الحساب</small>
                <strong>
                  {money(totals.total + totals.previousDebt)}
                </strong>
              </div>
            </div>

            <div className="pos-actions">
              <button
                className="pos-btn secondary"
                onClick={() => saveReceipt("draft")}
              >
                حفظ كمسودة
              </button>
              <button
                className="pos-btn primary"
                onClick={() => saveReceipt("order")}
              >
                حفظ كطلبية
              </button>
              <button
                className="pos-btn success"
                onClick={() => saveReceipt("sale")}
              >
                بيع مباشر
              </button>
            </div>
          </section>

          {selectedProduct && (
            <div className="pos-modal-backdrop">
              <div className="pos-modal">
                <div className="pos-panel-title">
                  <h2>{selectedProduct.name}</h2>
                  <button
                    className="pos-delete"
                    onClick={() => setSelectedProduct(null)}
                  >
                    ×
                  </button>
                </div>

                <div className="pos-stock-note">
                  المخزون الحالي:{" "}
                  <strong>{selectedProduct.quantity ?? "—"}</strong>
                  <br />
                  سعر الشراء:{" "}
                  {money(selectedProduct.purchasePrice)}
                </div>

                <div className="pos-form-grid">
                  <label>
                    طريقة البيع
                    <select
                      value={packType}
                      onChange={(e) => setPackType(e.target.value)}
                    >
                      <option value="unit">كمية يدوية / وحدة</option>
                      <option value="pallet">باليت</option>
                      <option value="half">نصف باليت</option>
                    </select>
                  </label>

                  {packType === "unit" ? (
                    <label>
                      الكمية
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </label>
                  ) : (
                    <>
                      <label>
                        عدد الباليتات
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={packs}
                          onChange={(e) => setPacks(e.target.value)}
                        />
                      </label>
                      <label>
                        الوحدات في الباليت
                        <input
                          type="number"
                          min="1"
                          value={unitsPerPack}
                          onChange={(e) =>
                            setUnitsPerPack(e.target.value)
                          }
                        />
                      </label>
                    </>
                  )}

                  <label>
                    سعر البيع
                    <select
                      value={priceType}
                      onChange={(e) => setPriceType(e.target.value)}
                    >
                      <option value="1">
                        الأول — {money(selectedProduct.salePrice1)}
                      </option>
                      <option value="2">
                        الثاني — {money(selectedProduct.salePrice2)}
                      </option>
                      <option value="3">
                        الثالث — {money(selectedProduct.salePrice3)}
                      </option>
                    </select>
                  </label>

                  <label>
                    السعر اليدوي (يتطلب صلاحية)
                    <input
                      type="number"
                      min="0"
                      disabled={!permissions.editPrices}
                      value={manualPrice}
                      onChange={(e) => setManualPrice(e.target.value)}
                      placeholder="سعر مخصص"
                    />
                  </label>

                  <label>
                    الخصم على المنتج
                    <input
                      type="number"
                      min="0"
                      value={lineDiscount}
                      onChange={(e) => setLineDiscount(e.target.value)}
                    />
                  </label>
                </div>

                <div className="pos-actions">
                  <button
                    className="pos-btn secondary"
                    onClick={() => setSelectedProduct(null)}
                  >
                    إلغاء
                  </button>
                  <button
                    className="pos-btn success"
                    onClick={addProduct}
                  >
                    إضافة إلى البون
                  </button>
                </div>
              </div>
            </div>
          )}

          {showPayment && (
            <div className="pos-modal-backdrop">
              <div className="pos-modal">
                <h2>إتمام البيع</h2>
                <p>إجمالي البون: {money(totals.total)}</p>

                <label>
                  طريقة الدفع
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash">نقدًا</option>
                    <option value="card">بطاقة</option>
                    <option value="transfer">تحويل</option>
                    <option value="partial">دفع جزئي</option>
                  </select>
                </label>

                <label>
                  المبلغ المدفوع
                  <input
                    type="number"
                    min="0"
                    value={paid}
                    onChange={(e) => setPaid(e.target.value)}
                  />
                </label>

                <p>
                  الباقي:{" "}
                  {money(
                    Math.max(0, totals.total - Number(paid || 0))
                  )}
                </p>

                <div className="pos-actions">
                  <button
                    className="pos-btn secondary"
                    onClick={() => setShowPayment(false)}
                  >
                    إلغاء
                  </button>
                  <button
                    className="pos-btn success"
                    onClick={() => saveReceipt("sale")}
                  >
                    تأكيد البيع
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {screen === "receipts" && (
        <section className="pos-panel">
          <div className="pos-panel-title">
            <h2>البونات السابقة</h2>
            <select
              value={receiptFilter}
              onChange={(e) => setReceiptFilter(e.target.value)}
            >
              <option value="all">كل الحالات</option>
              <option value="sale">بيع مباشر</option>
              <option value="order">طلبيات</option>
              <option value="draft">مسودات</option>
            </select>
          </div>

          <div className="pos-table-wrap">
            <table className="pos-table">
              <thead>
                <tr>
                  <th>رقم البون</th>
                  <th>العميل</th>
                  <th>التاريخ</th>
                  <th>الحالة</th>
                  <th>قبل الخصم</th>
                  <th>الخصم</th>
                  <th>الإجمالي</th>
                  <th>المدفوع</th>
                  <th>الدين</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {receipts
                  .filter(
                    (r) =>
                      receiptFilter === "all" ||
                      r.status === receiptFilter
                  )
                  .map((r) => (
                    <tr key={r.id}>
                      <td>{r.number}</td>
                      <td>{r.customerName}</td>
                      <td>
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td>
                        {r.status === "sale"
                          ? "بيع"
                          : r.status === "order"
                          ? "طلبية"
                          : "مسودة"}
                      </td>
                      <td>{money(r.beforeDiscount)}</td>
                      <td>{money(r.discountTotal)}</td>
                      <td>{money(r.total)}</td>
                      <td>{money(r.paid)}</td>
                      <td>{money(r.debt)}</td>
                      <td>
                        <button
                          className="pos-btn secondary"
                          onClick={() => editReceipt(r)}
                        >
                          تعديل
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <h3>سجل الأحداث والتعديلات</h3>
          {audit.map((item) => (
            <div className="pos-audit-row" key={item.id}>
              <strong>{item.action}</strong>
              <span>{item.receiptNumber}</span>
              <small>
                {item.user} · {item.page} ·{" "}
                {new Date(item.time).toLocaleString()}
              </small>
            </div>
          ))}
        </section>
      )}

      {screen === "offers" && (
        <section className="pos-panel">
          <h2>العروض الترويجية</h2>
          <p>
            العروض المتاحة تظهر أولًا، والعروض النافدة تظهر بالرمادي.
          </p>

          <div className="pos-form-grid">
            <label>
              اسم العرض
              <input
                value={offerForm.name}
                onChange={(e) =>
                  setOfferForm({ ...offerForm, name: e.target.value })
                }
              />
            </label>
            <label>
              اسم المنتج
              <input
                value={offerForm.productQuery}
                onChange={(e) =>
                  setOfferForm({
                    ...offerForm,
                    productQuery: e.target.value,
                  })
                }
              />
            </label>
            <label>
              الكمية المطلوبة
              <input
                type="number"
                value={offerForm.requiredQty}
                onChange={(e) =>
                  setOfferForm({
                    ...offerForm,
                    requiredQty: e.target.value,
                  })
                }
              />
            </label>
            <label>
              الكمية المجانية
              <input
                type="number"
                value={offerForm.freeQty}
                onChange={(e) =>
                  setOfferForm({
                    ...offerForm,
                    freeQty: e.target.value,
                  })
                }
              />
            </label>
            <label>
              خصم إضافي
              <input
                type="number"
                value={offerForm.discount}
                onChange={(e) =>
                  setOfferForm({
                    ...offerForm,
                    discount: e.target.value,
                  })
                }
              />
            </label>
            <label>
              عدد العروض المتاح
              <input
                type="number"
                value={offerForm.stock}
                onChange={(e) =>
                  setOfferForm({
                    ...offerForm,
                    stock: e.target.value,
                  })
                }
              />
            </label>
          </div>

          <button
            className="pos-btn primary"
            onClick={createOffer}
          >
            إنشاء العرض
          </button>

          <h3>العروض المتاحة</h3>
          {availableOffers.map((offer) => (
            <div className="pos-offer available" key={offer.id}>
              <div>
                <strong>{offer.name}</strong>
                <small>
                  {offer.requiredQty} + {offer.freeQty} مجاني
                </small>
                <small>المتاح: {offer.stock}</small>
              </div>
              <button
                className="pos-btn success"
                onClick={() => addOffer(offer)}
              >
                إضافة للفاتورة
              </button>
            </div>
          ))}

          <h3>العروض النافدة أو غير المتاحة</h3>
          {unavailableOffers.map((offer) => (
            <div className="pos-offer unavailable" key={offer.id}>
              <strong>{offer.name}</strong>
              <small>نافد أو غير مفعل</small>
            </div>
          ))}
        </section>
      )}

      {screen === "visits" && (
        <section className="pos-panel">
          <h2>الخريطة والزيارات</h2>
          <p>
            يمكن تسجيل الزيارة حتى إذا لم يطلب العميل أي منتجات.
          </p>

          <div className="pos-form-grid">
            <label>
              العميل
              <select
                value={visitCustomer}
                onChange={(e) => setVisitCustomer(e.target.value)}
              >
                <option value="">اختر العميل</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              ملاحظة الزيارة
              <input
                value={visitNote}
                onChange={(e) => setVisitNote(e.target.value)}
                placeholder="لم يطلب بضاعة..."
              />
            </label>
          </div>

          <button
            className="pos-btn primary"
            onClick={registerVisit}
          >
            تسجيل الزيارة والتحقق من الموقع
          </button>

          {mapUrl ? (
            <iframe
              title="خريطة النطاق الجغرافي"
              className="pos-map"
              src={mapUrl}
              loading="lazy"
            />
          ) : (
            <p className="pos-empty">
              حدد النطاق من إعدادات المالك لعرض الخريطة.
            </p>
          )}

          <h3>سجل الزيارات والتنبيهات</h3>
          {visits.map((visit) => (
            <div className="pos-audit-row" key={visit.id}>
              <strong>{visit.customerName}</strong>
              <span>{visit.status}</span>
              <small>
                {new Date(visit.time).toLocaleString()}
              </small>
              {visit.note && <small>{visit.note}</small>}
            </div>
          ))}
        </section>
      )}

      {screen === "settings" && (
        <section className="pos-panel">
          <h2>إعدادات المالك والصلاحيات</h2>

          <label className="pos-check">
            <input
              type="checkbox"
              checked={permissions.editReceipts}
              onChange={(e) =>
                setPermissions({
                  ...permissions,
                  editReceipts: e.target.checked,
                })
              }
            />
            السماح بتعديل البونات
          </label>

          <label className="pos-check">
            <input
              type="checkbox"
              checked={permissions.editPrices}
              onChange={(e) =>
                setPermissions({
                  ...permissions,
                  editPrices: e.target.checked,
                })
              }
            />
            السماح بتغيير الأسعار يدويًا
          </label>

          <hr />

          <h3>النطاق الجغرافي الإلزامي</h3>

          <label className="pos-check">
            <input
              type="checkbox"
              checked={fence.enabled}
              onChange={(e) =>
                setFence({ ...fence, enabled: e.target.checked })
              }
            />
            تفعيل التحقق من النطاق
          </label>

          <div className="pos-form-grid">
            <label>
              اسم المنطقة
              <input
                value={fence.name}
                onChange={(e) =>
                  setFence({ ...fence, name: e.target.value })
                }
              />
            </label>

            <label>
              خط العرض Latitude
              <input
                type="number"
                value={fence.lat}
                onChange={(e) =>
                  setFence({ ...fence, lat: e.target.value })
                }
              />
            </label>

            <label>
              خط الطول Longitude
              <input
                type="number"
                value={fence.lon}
                onChange={(e) =>
                  setFence({ ...fence, lon: e.target.value })
                }
              />
            </label>

            <label>
              نصف قطر النطاق بالأمتار
              <input
                type="number"
                min="20"
                value={fence.radius}
                onChange={(e) =>
                  setFence({ ...fence, radius: e.target.value })
                }
              />
            </label>
          </div>

          <button
            className="pos-btn secondary"
            onClick={async () => {
              const point = await getLocation();

              if (point) {
                setFence({
                  ...fence,
                  lat: point.lat,
                  lon: point.lon,
                });
              }
            }}
          >
            استخدام موقعي الحالي كنطاق
          </button>

          <button
            className="pos-btn success"
            onClick={() => {
              save(DB.fence, fence);
              notify("تم حفظ إعدادات النطاق.");
            }}
          >
            حفظ إعدادات النطاق
          </button>

          <p className="pos-note">
            هذه صلاحيات محلية أولية. التنبيه الحقيقي للمالك على جهاز
            آخر يتطلب خادمًا مشتركًا. GPS قد يكون غير دقيق، لذلك
            يجب مراجعة الحالات المشكوك فيها يدويًا.
          </p>
        </section>
      )}
    </div>
  );
}
