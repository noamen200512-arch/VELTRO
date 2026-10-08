import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">VELTRO</div>

        <nav>
          <div className="nav-item active">Dashboard</div>
          <div className="nav-item">Achats</div>
          <div className="nav-item">Ventes</div>
          <div className="nav-item">Produits</div>
          <div className="nav-item">Fournisseurs</div>
          <div className="nav-item">Clients</div>
          <div className="nav-item">Stock</div>
          <div className="nav-item">Caisse</div>
          <div className="nav-item">Dépenses</div>
          <div className="nav-item">Rapports</div>
          <div className="nav-item">Paramètres</div>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back to VELTRO.</p>
          </div>

          <button className="profile">N</button>
        </header>

        <section className="cards">
          <div className="card">
            <span>Ventes aujourd'hui</span>
            <strong>0 DA</strong>
          </div>

          <div className="card">
            <span>Bénéfice</span>
            <strong>0 DA</strong>
          </div>

          <div className="card">
            <span>Produits</span>
            <strong>0</strong>
          </div>

          <div className="card">
            <span>Stock faible</span>
            <strong>0</strong>
          </div>
        </section>

        <section className="welcome">
          <h2>Your Business. Your Control.</h2>
          <p>
            Manage your sales, purchases, products, customers and stock
            from one powerful system.
          </p>
        </section>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
