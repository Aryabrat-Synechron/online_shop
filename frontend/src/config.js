// Base API URL; in dev we use Vite proxy with "/api"
// In prod, you can set VITE_API_BASE to your backend URL like "https://your-domain/api"
export const API_BASE = import.meta.env.VITE_API_BASE || "/api";