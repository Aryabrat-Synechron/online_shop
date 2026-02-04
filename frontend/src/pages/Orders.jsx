import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const list = await api.getOrders(token);
      setOrders(list || []);
    } catch (e) {
      setMsg(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="container container-narrow">
      <h4>Your Orders</h4>
      {msg && <div className="alert alert-info">{msg}</div>}

      {!orders.length ? (
        <p className="text-muted">No orders yet.</p>
      ) : (
        <div className="d-flex flex-column gap-2">
          {orders.map(o => (
            <div className="card" key={o.id}>
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>Order <strong>#{o.id}</strong></div>
                  <div><strong>Total: ₹ {Number(o.total_amount).toFixed(2)}</strong></div>
                </div>
                <ul className="mt-2 mb-0">
                  {o.items.map((i, idx) => (
                    <li key={idx}>Product {i.product_id} × {i.quantity} @ ₹ {Number(i.unit_price).toFixed(2)}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}