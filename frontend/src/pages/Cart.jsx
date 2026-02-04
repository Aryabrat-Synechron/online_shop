import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { token } = useAuth();
  const [cart, setCart] = useState(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const c = await api.getCart(token);
      setCart(c);
    } catch (e) {
      setCart(null);
      setMsg(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const updateQty = async (itemId, qty) => {
    try {
      await api.updateCartItem(token, itemId, qty);
      await load();
    } catch (e) { setMsg(e.message); }
  };

  const removeItem = async (itemId) => {
    try {
      await api.removeCartItem(token, itemId);
      await load();
    } catch (e) { setMsg(e.message); }
  };

  const checkout = async () => {
    try {
      const r = await api.checkout(token);
      setMsg(`Order ${r.order_id} placed! Total ₹ ${Number(r.total_amount).toFixed(2)}`);
      await load();
    } catch (e) { setMsg(e.message); }
  };

  return (
    <div className="container container-narrow">
      <h4>Your Cart</h4>
      {msg && <div className="alert alert-info">{msg}</div>}

      {!cart || !cart.items?.length ? (
        <p className="text-muted">Your cart is empty.</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th style={{width: 120}}>Qty</th>
                  <th>Unit</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map(it => (
                  <tr key={it.id}>
                    <td>{it.product_id}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        min="1"
                        defaultValue={it.quantity}
                        onBlur={(e) => {
                          const q = parseInt(e.target.value || 1, 10);
                          if (q !== it.quantity) updateQty(it.id, q);
                        }} />
                    </td>
                    <td>₹ {Number(it.unit_price).toFixed(2)}</td>
                    <td>₹ {(Number(it.unit_price) * it.quantity).toFixed(2)}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeItem(it.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-end">
            <strong>Total: ₹ {Number(cart.total).toFixed(2)}</strong>
          </div>

          <div className="mt-3 text-end">
            <button className="btn btn-success" onClick={checkout}>Checkout</button>
          </div>
        </>
      )}
    </div>
  );
}