import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
function App() {
return (
<div>
<h1>VELTRO</h1>
<p>Your Business. Your Control.</p>
</div>
);
}

ReactDOM.createRoot(document.getElementById("root")).render(
<React.StrictMode>
<App />
</React.StrictMode>
);
