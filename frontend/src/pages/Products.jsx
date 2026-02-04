import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";

export default function Products() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data || []);
    } catch (e) {
      setMsg(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (p) => {
    if (!token) {
      setMsg("Please login to add to cart.");
      return;
    }
    try {
      await api.addToCart(token, p.id, 1);
      setMsg("Added to cart ✅");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setTimeout(() => setMsg(""), 2000);
    }
  };

  // Optional: Quick seed demo products (dev helper)
  const seed = async () => {
    try {
      await api.createProduct(token, { name: "Cotton T-Shirt", description: "Comfortable tee", price: 499, stock: 50 });
      await api.createProduct(token, { name: "Wireless Mouse", description: "2.4GHz ergonomic", price: 799, stock: 30 });
      await api.createProduct(token, { name: "Water Bottle", description: "Insulated 1L", price: 649, stock: 40 });
      await load();
      setMsg("Seeded demo products");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setTimeout(() => setMsg(""), 2000);
    }
  };

  return (
    <div className="container container-narrow">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h4 className="m-0">Products</h4>
        <button className="btn btn-sm btn-outline-secondary" onClick={seed}>Seed Demo</button>
      </div>
      {msg && <div className="alert alert-info">{msg}</div>}
      <div className="row row-cols-1 row-cols-md-3 g-3">
        {products.map(p => (
          <ProductCard key={p.id} product={p} onAdd={add} />
        ))}
      </div>
    </div>
  );
}
