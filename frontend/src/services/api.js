import { API_BASE } from "../config";

// Utility: build headers with optional JWT
const authHeaders = (token, extra = {}) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...extra,
});

const handle = async (res) => {
  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      message = body.detail || JSON.stringify(body);
    } catch (e) {
      // keep default
    }
    throw new Error(message);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
};

export const api = {
  // AUTH
  register: (email, password) =>
    fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email, password }),
    }).then(handle),

  login: (email, password) =>
    fetch(`${API_BASE}/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
      method: "POST",
      headers: authHeaders(),
    }).then(handle),

  // PRODUCTS
  getProducts: () =>
    fetch(`${API_BASE}/products/`).then(handle),

  createProduct: (token, product) =>
    fetch(`${API_BASE}/products/`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(product),
    }).then(handle),

  // CART
  getCart: (token) =>
    fetch(`${API_BASE}/cart/`, {
      headers: authHeaders(token),
    }).then(handle),

  addToCart: (token, product_id, quantity = 1) =>
    fetch(`${API_BASE}/cart/add`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ product_id, quantity }),
    }).then(handle),

  updateCartItem: (token, item_id, quantity) =>
    fetch(`${API_BASE}/cart/item/${item_id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ quantity }),
    }).then(handle),

  removeCartItem: (token, item_id) =>
    fetch(`${API_BASE}/cart/item/${item_id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }).then(handle),

  checkout: (token) =>
    fetch(`${API_BASE}/cart/checkout`, {
      method: "POST",
      headers: authHeaders(token),
    }).then(handle),

  // ORDERS
  getOrders: (token) =>
    fetch(`${API_BASE}/orders/`, {
      headers: authHeaders(token),
    }).then(handle),
};