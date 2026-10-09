
import React from "react";

const UNITS = [
  { value: "piece", label: "قطعة / Piece" },
  { value: "carton", label: "كرتون / Carton" },
  { value: "pack", label: "علبة / Pack" },
  { value: "kg", label: "كيلوغرام / KG" },
  { value: "g", label: "غرام / G" },
  { value: "liter", label: "لتر / Liter" },
  { value: "bottle", label: "قارورة / Bottle" },
  { value: "box", label: "صندوق / Box" },
];

const getBarcodes = (value) => {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[\n,;]+/)
      : [];

  return values.map((v) => String(v || "").trim()).filter(Boolean);
};

const normalizeBarcode = (value) =>
  String(value || "").trim().toUpperCase();

const getMarkup = (sale, purchase) => {
  const cost = Number(purchase || 0);
  const price = Number(sale || 0);

  if (cost <= 0) return "—";

  const percent = ((price - cost) / cost) * 100;

  return `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`;
};

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error("الرجاء اختيار ملف صورة صالح."));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("يجب ألا يتجاوز حجم الصورة 5 ميغابايت."));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => reject(new Error("تعذرت قراءة الصورة."));

    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error("تعذرت معالجة الصورة."));

      image.onload = () => {
        const max = 600;
        const scale = Math.min(
          1,
          max / Math.max(image.width, image.height)
        );

        const canvas = document.createElement("canvas");

        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("تعذرت معالجة الصورة في هذا المتصفح."));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };

      image.src = String(reader.result || "");
    };

    reader.readAsDataURL(file);
  });

export default function Products({
  t,
  products = [],
  filteredProducts = [],
  search,
  setSearch,
  editing,
  form,
  changeProduct,
  openNewProduct,
  openEditProduct,
  deleteProduct,
  saveProduct,
  setEditing,
  setForm,
  emptyProduct,
  money,
  table,
}) {
  const [showForm, setShowForm] = React.useState(false);
  const [extraBarcodes, setExtraBarcodes] = React.useState([]);
  const [error, setError] = React.useState("");
  const [imageLoading, setImageLoading] = React.useState(false);

  const tr = (key, fallback) => t?.[key] || fallback;
  const value = (key) => form?.[key] ?? "";

  const update = (key, nextValue) => {
    if (typeof changeProduct === "function") {
      changeProduct(key, nextValue);
    } else if (typeof setForm === "function") {
      setForm((previous) => ({
        ...(previous || form || {}),
        [key]: nextValue,
      }));
    }
  };

  const updateAliases = (nextAliases) => {
    setExtraBarcodes(nextAliases);
    update("barcodeAliases", getBarcodes(nextAliases));
  };

  React.useEffect(() => {
    setExtraBarcodes(getBarcodes(form?.barcodeAliases));
  }, [editing, form?.id, showForm]);

  const currentProductId = () => editing ?? form?.id;

  const getUsedBarcodes = () => {
    const used = new Set();
    const currentId = currentProductId();

    (Array.isArray(products) ? products : []).forEach((product) => {
      if (String(product.id) === String(currentId)) return;

      [
        product.barcode,
        ...getBarcodes(product.barcodeAliases),
      ].forEach((barcode) => {
        const normalized = normalizeBarcode(barcode);
        if (normalized) used.add(normalized);
      });
    });

    return used;
  };

  const generateUniqueBarcode = (excludedAliasIndex = null) => {
    const used = getUsedBarcodes();

    const localBarcodes = [
      value("barcode"),
      ...extraBarcodes.filter((_, index) => index !== excludedAliasIndex),
    ];

    localBarcodes.forEach((barcode) => {
      const normalized = normalizeBarcode(barcode);
      if (normalized) used.add(normalized);
    });

    let candidate = "";
    let attempts = 0;

    do {
      const timePart = Date.now().toString(36).toUpperCase();
      const randomPart = Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase();

      candidate = `VLT-${timePart}-${randomPart}`;
      attempts += 1;
    } while (used.has(normalizeBarcode(candidate)) && attempts < 100);

    if (used.has(normalizeBarcode(candidate))) {
      setError("تعذر توليد باركود فريد. حاول مرة أخرى.");
      return "";
    }

    setError("");
    return candidate;
  };

  const generateMainBarcode = () => {
    const barcode = generateUniqueBarcode();

    if (barcode) update("barcode", barcode);
  };

  const generateAliasBarcode = (index) => {
    const barcode = generateUniqueBarcode(index);

    if (!barcode) return;

    const next = [...extraBarcodes];
    next[index] = barcode;
    updateAliases(next);
  };

  const handleNew = () => {
    setError("");
    setExtraBarcodes([]);

    if (typeof openNewProduct === "function") {
      openNewProduct();
    } else {
      setForm?.(emptyProduct?.() || {});
      setEditing?.(null);
    }

    setShowForm(true);
  };

  const handleEdit = (product) => {
    setError("");

    if (typeof openEditProduct === "function") {
      openEditProduct(product);
    } else {
      setForm?.({
        ...(emptyProduct?.() || {}),
        ...product,
      });

      setEditing?.(product.id);
    }

    setExtraBarcodes(getBarcodes(product.barcodeAliases));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setError("");
    setImageLoading(false);
    setEditing?.(null);
  };

  const handleImage = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImageLoading(true);
    setError("");

    try {
      const imageData = await compressImage(file);
      update("image", imageData);
    } catch (err) {
      setError(err.message || "تعذرت معالجة الصورة.");
    } finally {
      setImageLoading(false);
      event.target.value = "";
    }
  };

  const handleSave = (event) => {
    event.preventDefault();
    setError("");

    const mainBarcode = String(value("barcode") || "").trim();
    const aliases = getBarcodes(extraBarcodes);
    const allBarcodes = [mainBarcode, ...aliases].filter(Boolean);
    const normalizedBarcodes = allBarcodes.map(normalizeBarcode);

    if (new Set(normalizedBarcodes).size !== normalizedBarcodes.length) {
      setError("يوجد باركود مكرر داخل هذا المنتج.");
      return;
    }

    const usedBarcodes = getUsedBarcodes();
    const conflict = allBarcodes.find((barcode) =>
      usedBarcodes.has(normalizeBarcode(barcode))
    );

    if (conflict) {
      setError(`الباركود ${conflict} مستخدم في منتج آخر.`);
      return;
    }

    const cartonQty = Number(value("cartonQty") || 1);

    if (!Number.isFinite(cartonQty) || cartonQty < 1) {
      setError("عدد القطع في الكرتون يجب أن يكون 1 على الأقل.");
      return;
    }

    update("barcode", mainBarcode);
    update("barcodeAliases", aliases);
    update("cartonQty", cartonQty);

    if (typeof saveProduct === "function") {
      saveProduct(event);
      setShowForm(false);
    }
  };

  const list = Array.isArray(filteredProducts)
    ? filteredProducts
    : products;

  const purchasePrice = Number(value("purchasePrice") || 0);
  const unitValue = String(value("unit") || "piece");

  const units = UNITS.some((unit) => unit.value === unitValue)
    ? UNITS
    : [{ value: unitValue, label: unitValue }, ...UNITS];

  return (
    <section className="products-page veltro-products">
      <style>{`
        .veltro-products * { box-sizing: border-box; }

        .veltro-products .products-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .veltro-products .products-header h2 { margin: 0 0 5px; }
        .veltro-products .products-header p { margin: 0; opacity: .7; }

        .veltro-products .product-search {
          width: 100%;
          max-width: 450px;
          margin-bottom: 16px;
        }

        .veltro-products .product-search input { width: 100%; }

        .veltro-products .products-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border-radius: 12px;
        }

        .veltro-products table {
          width: 100%;
          min-width: 680px;
          border-collapse: collapse;
        }

        .veltro-products th,
        .veltro-products td {
          padding: 12px 10px;
          text-align: start;
          vertical-align: middle;
        }

        .veltro-products td button { margin: 2px 4px 2px 0; }

        .veltro-products .product-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          overflow-y: auto;
          background: rgba(0, 0, 0, .68);
        }

        .veltro-products .product-modal {
          width: min(900px, 100%);
          max-height: calc(100vh - 32px);
          overflow-y: auto;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(128,128,128,.25);
          background: var(--card-bg, #fff);
          color: var(--text, #171717);
          box-shadow: 0 20px 70px rgba(0,0,0,.35);
        }

        .veltro-products .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 18px;
        }

        .veltro-products .modal-header h3 { margin: 0 0 5px; }
        .veltro-products .modal-header p { margin: 0; opacity: .7; font-size: .9rem; }

        .veltro-products .close-modal {
          min-width: 38px;
          height: 38px;
          padding: 0;
          font-size: 24px;
        }

        .veltro-products .product-section {
          margin-bottom: 14px;
          padding: 15px;
          border: 1px solid rgba(128,128,128,.28);
          border-radius: 12px;
        }

        .veltro-products .product-section h4 { margin: 0 0 13px; }

        .veltro-products .product-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
        }

        .veltro-products .product-form-grid label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
          font-size: .9rem;
          font-weight: 600;
        }

        .veltro-products .product-form-grid input,
        .veltro-products .product-form-grid select,
        .veltro-products .product-form-grid textarea {
          width: 100%;
          min-width: 0;
          padding: 10px;
          border: 1px solid #aaa;
          border-radius: 8px;
          background: transparent;
          color: inherit;
          font: inherit;
        }

        .veltro-products .product-form-grid textarea {
          min-height: 80px;
          resize: vertical;
        }

        .veltro-products .barcode-row {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .veltro-products .barcode-row input {
          flex: 1;
          min-width: 0;
        }

        .veltro-products .barcode-row button {
          flex-shrink: 0;
          white-space: nowrap;
        }

        .veltro-products .barcode-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .veltro-products .barcode-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .veltro-products .barcode-item small {
          opacity: .7;
          font-size: .78rem;
        }

        .veltro-products .barcode-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .veltro-products .price-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .veltro-products .price-row input { flex: 1; }

        .veltro-products .markup {
          min-width: 64px;
          padding: 7px 5px;
          text-align: center;
          border-radius: 7px;
          background: rgba(22,130,79,.12);
          color: #16824f;
          font-size: .8rem;
          font-weight: 700;
        }

        .veltro-products .field-hint {
          font-size: .78rem;
          opacity: .7;
          font-weight: 400;
        }

        .veltro-products .image-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
        }

        .veltro-products .image-preview,
        .veltro-products .image-placeholder {
          width: 105px;
          height: 105px;
          border: 1px dashed #aaa;
          border-radius: 10px;
        }

        .veltro-products .image-preview { object-fit: contain; }

        .veltro-products .image-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          text-align: center;
          opacity: .7;
        }

        .veltro-products .form-error {
          padding: 11px;
          margin-bottom: 14px;
          border-radius: 8px;
          color: #b42318;
          background: rgba(220,38,38,.1);
        }

        .veltro-products .form-actions {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 10px;
        }

        @media (max-width: 600px) {
          .veltro-products .product-modal-backdrop {
            padding: 8px;
            align-items: flex-start;
          }

          .veltro-products .product-modal {
            max-height: calc(100vh - 16px);
            padding: 12px;
            margin: auto 0;
          }

          .veltro-products .product-form-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .veltro-products .product-section { padding: 12px; }

          .veltro-products .barcode-row {
            flex-wrap: wrap;
          }

          .veltro-products .barcode-row input {
            flex-basis: 100%;
          }
        }
      `}</style>

      <div className="products-header">
        <div>
          <h2>{tr("products", "Products")}</h2>
          <p>{list.length} {tr("productsCount", "products")}</p>
        </div>

        <button type="button" onClick={handleNew}>
          + {tr("addProduct", "Add product")}
        </button>
      </div>

      <div className="product-search">
        <input
          type="search"
          value={search ?? ""}
          onChange={(event) => setSearch?.(event.target.value)}
          placeholder={tr("searchProducts", "Search products...")}
          aria-label={tr("searchProducts", "Search products")}
        />
      </div>

      {showForm && (
        <div
          className="product-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <form
            className="product-modal"
            role="dialog"
            aria-modal="true"
            onSubmit={handleSave}
          >
            <div className="modal-header">
              <div>
                <h3>
                  {editing !== null && editing !== undefined
                    ? tr("editProduct", "Edit product")
                    : tr("addProduct", "Add product")}
                </h3>
                <p>{tr("productDetailsHint", "Product details")}</p>
              </div>

              <button
                type="button"
                className="close-modal"
                onClick={closeForm}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}

            <div className="product-section">
              <h4>{tr("basicInformation", "Basic information")}</h4>

              <div className="product-form-grid">
                <label>
                  {tr("productName", "Product name")} *
                  <input
                    required
                    autoFocus
                    value={value("name")}
                    onChange={(event) => update("name", event.target.value)}
                  />
                </label>

                <label>
                  {tr("reference", "Reference")}
                  <input
                    value={value("reference")}
                    onChange={(event) => update("reference", event.target.value)}
                  />
                </label>

                <label>
                  {tr("category", "Category")}
                  <input
                    value={value("category")}
                    onChange={(event) => update("category", event.target.value)}
                  />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  {tr("barcode", "Main barcode")}
                  <div className="barcode-row">
                    <input
                      value={value("barcode")}
                      onChange={(event) => update("barcode", event.target.value)}
                      placeholder="VLT-..."
                    />
                    <button type="button" onClick={generateMainBarcode}>
                      توليد تلقائي
                    </button>
                  </div>
                  <span className="field-hint">
                    باركود داخلي فريد خاص بنظام VELTRO.
                  </span>
                </label>

                <div style={{ gridColumn: "1 / -1" }}>
                  <h4 style={{ marginBottom: 5 }}>
                    الباركودات الإضافية
                  </h4>

                  <p className="field-hint" style={{ marginTop: 0 }}>
                    أضف باركودًا آخر لنفس المنتج، مثل باركود العبوة والكرتون.
                  </p>

                  <div className="barcode-list">
                    {extraBarcodes.map((barcode, index) => (
                      <div className="barcode-item" key={index}>
                        <small>الباركود الإضافي {index + 1}</small>

                        <div className="barcode-row">
                          <input
                            value={barcode}
                            onChange={(event) => {
                              const next = [...extraBarcodes];
                              next[index] = event.target.value;
                              updateAliases(next);
                            }}
                            placeholder={`باركود إضافي ${index + 1}`}
                            aria-label={`الباركود الإضافي ${index + 1}`}
                          />

                          <button
                            type="button"
                            onClick={() => generateAliasBarcode(index)}
                          >
                            توليد
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const next = extraBarcodes.filter(
                                (_, itemIndex) => itemIndex !== index
                              );
                              updateAliases(next);
                            }}
                            aria-label={`حذف الباركود الإضافي ${index + 1}`}
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}

                    {extraBarcodes.length === 0 && (
                      <p className="field-hint">
                        لا توجد باركودات إضافية لهذا المنتج.
                      </p>
                    )}
                  </div>

                  <div className="barcode-actions">
                    <button
                      type="button"
                      onClick={() => updateAliases([...extraBarcodes, ""])}
                    >
                      + إضافة خانة باركود
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="product-section">
              <h4>{tr("pricing", "Pricing")}</h4>

              <div className="product-form-grid">
                <label>
                  {tr("purchasePrice", "Purchase price")}
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={value("purchasePrice")}
                    onChange={(event) =>
                      update("purchasePrice", event.target.value)
                    }
                  />
                </label>

                <label>
                  {tr("salePrice", "Sale price 1")}
                  <div className="price-row">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={value("salePrice1") ?? value("salePrice")}
                      onChange={(event) =>
                        update("salePrice1", event.target.value)
                      }
                    />
                    <span className="markup">
                      {getMarkup(
                        value("salePrice1") ?? value("salePrice"),
                        purchasePrice
                      )}
                    </span>
                  </div>
                </label>

                <label>
                  {tr("salePrice2", "Sale price 2")}
                  <div className="price-row">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={value("salePrice2")}
                      onChange={(event) =>
                        update("salePrice2", event.target.value)
                      }
                    />
                    <span className="markup">
                      {getMarkup(value("salePrice2"), purchasePrice)}
                    </span>
                  </div>
                </label>

                <label>
                  {tr("salePrice3", "Sale price 3")}
                  <div className="price-row">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={value("salePrice3")}
                      onChange={(event) =>
                        update("salePrice3", event.target.value)
                      }
                    />
                    <span className="markup">
                      {getMarkup(value("salePrice3"), purchasePrice)}
                    </span>
                  </div>
                </label>
              </div>

              <p className="field-hint">
                النسبة توضح الزيادة مقارنة بسعر الشراء.
              </p>
            </div>

            <div className="product-section">
              <h4>{tr("stockAndPackaging", "Stock and packaging")}</h4>

              <div className="product-form-grid">
                <label>
                  {tr("quantity", "Quantity")}
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={value("quantity")}
                    onChange={(event) => update("quantity", event.target.value)}
                  />
                </label>

                <label>
                  {tr("unit", "Unit")}
                  <select
                    value={unitValue}
                    onChange={(event) => update("unit", event.target.value)}
                  >
                    {units.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  {tr("cartonQty", "Units per carton")}
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={value("cartonQty") ?? 1}
                    onChange={(event) => update("cartonQty", event.target.value)}
                  />
                  <span className="field-hint">
                    عدد القطع داخل الكرتون الواحد
                  </span>
                </label>

                <label>
                  {tr("minStock", "Minimum stock")}
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={value("minStock")}
                    onChange={(event) => update("minStock", event.target.value)}
                  />
                </label>

                <label>
                  {tr("expiryDate", "Expiry date")}
                  <input
                    type="date"
                    value={value("expiryDate")}
                    onChange={(event) => update("expiryDate", event.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="product-section">
              <h4>{tr("productImage", "Product image")}</h4>

              <div className="image-row">
                {value("image") || value("imageUrl") ? (
                  <img
                    className="image-preview"
                    src={value("image") || value("imageUrl")}
                    alt="Product"
                  />
                ) : (
                  <div className="image-placeholder">
                    {tr("noImage", "No image")}
                  </div>
                )}

                <div>
                  <label>
                    {tr("uploadImage", "Upload image")}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImage}
                      style={{
                        display: "block",
                        maxWidth: "100%",
                        marginTop: 8,
                      }}
                    />
                  </label>

                  <p className="field-hint">
                    الحد الأقصى 5 ميغابايت. ستُصغّر الصورة قبل حفظها.
                  </p>

                  {(value("image") || value("imageUrl")) && (
                    <button
                      type="button"
                      onClick={() => {
                        update("image", "");
                        update("imageUrl", "");
                      }}
                    >
                      {tr("removeImage", "Remove image")}
                    </button>
                  )}

                  {imageLoading && <p>جارٍ تجهيز الصورة...</p>}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={closeForm}>
                {tr("cancel", "Cancel")}
              </button>

              <button type="submit" disabled={imageLoading}>
                {imageLoading ? "جارٍ تجهيز الصورة..." : tr("save", "Save")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>{tr("productName", "Product")}</th>
              <th>{tr("barcode", "Barcode")}</th>
              <th>{tr("quantity", "Quantity")}</th>
              <th>{tr("purchasePrice", "Purchase price")}</th>
              <th>{tr("salePrice", "Sale price")}</th>
              <th>{tr("actions", "Actions")}</th>
            </tr>
          </thead>

          <tbody>
            {list.map((product) => (
              <tr key={product.id}>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                    }}
                  >
                    {(product.image || product.imageUrl) && (
                      <img
                        src={product.image || product.imageUrl}
                        alt=""
                        style={{
                          width: 36,
                          height: 36,
                          objectFit: "contain",
                          borderRadius: 6,
                        }}
                      />
                    )}
                    <span>{product.name}</span>
                  </div>
                </td>

                <td>
                  <div>{product.barcode || "—"}</div>
                  {getBarcodes(product.barcodeAliases).length > 0 && (
                    <small style={{ opacity: 0.7 }}>
                      +{getBarcodes(product.barcodeAliases).length} باركود إضافي
                    </small>
                  )}
                </td>

                <td>
                  {product.quantity} {product.unit || ""}
                </td>

                <td>
                  {typeof money === "function"
                    ? money(product.purchasePrice)
                    : product.purchasePrice}
                </td>

                <td>
                  {typeof money === "function"
                    ? money(product.salePrice1 ?? product.salePrice)
                    : product.salePrice1 ?? product.salePrice}
                </td>

                <td>
                  <button type="button" onClick={() => handleEdit(product)}>
                    {tr("edit", "Edit")}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          tr(
                            "confirmDelete",
                            "Are you sure you want to delete this product?"
                          )
                        )
                      ) {
                        deleteProduct?.(product.id);
                      }
                    }}
                  >
                    {tr("delete", "Delete")}
                  </button>
                </td>
              </tr>
            ))}

            {list.length === 0 && (
              <tr>
                <td colSpan="6">
                  {tr("noProducts", "No products found")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
