import React from "react";

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

  const handleNewProduct = () => {
    if (typeof openNewProduct === "function") {
      openNewProduct();
    } else if (typeof emptyProduct === "function") {
      setForm(emptyProduct());
      setEditing(null);
    }

    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    if (typeof openEditProduct === "function") {
      openEditProduct(product);
    }

    setShowForm(true);
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (typeof saveProduct === "function") {
      saveProduct(event);
      setShowForm(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);

    if (typeof setEditing === "function") {
      setEditing(null);
    }
  };

  const list = Array.isArray(filteredProducts)
    ? filteredProducts
    : products;

  const value = (key) => form?.[key] ?? "";

  return (
    <section className="products-page">
      <div className="products-header">
        <div>
          <h2>{t?.products || "Products"}</h2>
          <p>{list.length} products</p>
        </div>

        <button type="button" onClick={handleNewProduct}>
          + {t?.addProduct || "Add product"}
        </button>
      </div>

      <input
        type="search"
        value={search ?? ""}
        onChange={(event) => setSearch?.(event.target.value)}
        placeholder={t?.searchProducts || "Search products..."}
        aria-label="Search products"
      />

      {showForm && (
        <form className="product-form" onSubmit={handleSave}>
          <h3>
            {editing !== null
              ? t?.editProduct || "Edit product"
              : t?.addProduct || "Add product"}
          </h3>

          <div className="product-form-grid">
            <label>
              {t?.productName || "Product name"}
              <input
                required
                value={value("name")}
                onChange={(event) =>
                  changeProduct?.("name", event.target.value)
                }
              />
            </label>

            <label>
              {t?.barcode || "Barcode"}
              <input
                value={value("barcode")}
                onChange={(event) =>
                  changeProduct?.("barcode", event.target.value)
                }
              />
            </label>

            <label>
              {t?.reference || "Reference"}
              <input
                value={value("reference")}
                onChange={(event) =>
                  changeProduct?.("reference", event.target.value)
                }
              />
            </label>

            <label>
              {t?.category || "Category"}
              <input
                value={value("category")}
                onChange={(event) =>
                  changeProduct?.("category", event.target.value)
                }
              />
            </label>

            <label>
              {t?.quantity || "Quantity"}
              <input
                type="number"
                min="0"
                value={value("quantity")}
                onChange={(event) =>
                  changeProduct?.("quantity", event.target.value)
                }
              />
            </label>

            <label>
              {t?.unit || "Unit"}
              <input
                value={value("unit")}
                onChange={(event) =>
                  changeProduct?.("unit", event.target.value)
                }
              />
            </label>

            <label>
              {t?.purchasePrice || "Purchase price"}
              <input
                type="number"
                min="0"
                step="any"
                value={value("purchasePrice")}
                onChange={(event) =>
                  changeProduct?.("purchasePrice", event.target.value)
                }
              />
            </label>

            <label>
              {t?.salePrice || "Sale price"}
              <input
                type="number"
                min="0"
                step="any"
                value={value("salePrice1")}
                onChange={(event) =>
                  changeProduct?.("salePrice1", event.target.value)
                }
              />
            </label>

            <label>
              {t?.salePrice2 || "Sale price 2"}
              <input
                type="number"
                min="0"
                step="any"
                value={value("salePrice2")}
                onChange={(event) =>
                  changeProduct?.("salePrice2", event.target.value)
                }
              />
            </label>

            <label>
              {t?.salePrice3 || "Sale price 3"}
              <input
                type="number"
                min="0"
                step="any"
                value={value("salePrice3")}
                onChange={(event) =>
                  changeProduct?.("salePrice3", event.target.value)
                }
              />
            </label>

            <label>
              {t?.minStock || "Minimum stock"}
              <input
                type="number"
                min="0"
                value={value("minStock")}
                onChange={(event) =>
                  changeProduct?.("minStock", event.target.value)
                }
              />
            </label>

            <label>
              {t?.expiryDate || "Expiry date"}
              <input
                type="date"
                value={value("expiryDate")}
                onChange={(event) =>
                  changeProduct?.("expiryDate", event.target.value)
                }
              />
            </label>
          </div>

          <div className="product-form-actions">
            <button type="submit">
              {t?.save || "Save"}
            </button>

            <button type="button" onClick={handleCancel}>
              {t?.cancel || "Cancel"}
            </button>
          </div>
        </form>
      )}

      <div className="products-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>{t?.productName || "Product"}</th>
              <th>{t?.barcode || "Barcode"}</th>
              <th>{t?.quantity || "Quantity"}</th>
              <th>{t?.purchasePrice || "Purchase price"}</th>
              <th>{t?.salePrice || "Sale price"}</th>
              <th>{t?.actions || "Actions"}</th>
            </tr>
          </thead>

          <tbody>
            {list.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.barcode || "—"}</td>
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
                  <button
                    type="button"
                    onClick={() => handleEditProduct(product)}
                  >
                    {t?.edit || "Edit"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          t?.confirmDelete ||
                            "Are you sure you want to delete this product?"
                        )
                      ) {
                        deleteProduct?.(product.id);
                      }
                    }}
                  >
                    {t?.delete || "Delete"}
                  </button>
                </td>
              </tr>
            ))}

            {list.length === 0 && (
              <tr>
                <td colSpan="6">
                  {t?.noProducts || "No products found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
