// Kết nối Supabase + kiểm tra đăng nhập dùng chung cho các trang.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

export const configured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
export const sb = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Mỗi ngày (giờ Việt Nam) chỉ cần đăng nhập một lần. Sang ngày mới thì phải đăng nhập lại.
const LOGIN_DAY_KEY = "q9LoginDay";
const vnToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
export function markLoginToday() { try { localStorage.setItem(LOGIN_DAY_KEY, vnToday()); } catch {} }
function loggedInToday() { try { return localStorage.getItem(LOGIN_DAY_KEY) === vnToday(); } catch { return true; } }

// Ghi nhớ sales đã gửi link (?s=...) để khi khách đăng ký thì gắn với sales đó
try { const s = new URLSearchParams(location.search).get("s"); if (s && /^[0-9a-f-]{36}$/i.test(s)) localStorage.setItem("q9SalesRef", s); } catch {}
export function salesRefFromLink() { try { return localStorage.getItem("q9SalesRef") || ""; } catch { return ""; } }

export async function currentProfile() {
  if (!sb) return null;
  // Link trong email (xác nhận / đặt lại mật khẩu) cũng tính là một lần đăng nhập
  if (/access_token|type=recovery|type=signup/.test(location.hash)) markLoginToday();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return null;
  if (!loggedInToday()) { await sb.auth.signOut(); return null; }
  const { data, error } = await sb.from("profiles").select("*").eq("id", session.user.id).single();
  if (error) { console.error(error); return { id: session.user.id, email: session.user.email, status: "pending" }; }
  return data;
}

// Trang cần đăng nhập: chưa đăng nhập hoặc chưa được duyệt thì chuyển về trang đăng nhập.
// Khi chưa nối Supabase (đang chạy thử) thì cho xem với dữ liệu mẫu.
export async function requireApproved() {
  if (!configured) return { demo: true, full_name: "Chế độ xem thử", kind: "nhanvien", role: "admin", status: "approved" };
  const p = await currentProfile();
  if (!p || p.status !== "approved") { try { if (location.hash) sessionStorage.setItem("afterLogin", (location.pathname.split("/").pop() || "index.html") + location.hash); } catch {} location.replace("login.html"); return new Promise(() => {}); }
  return p;
}

export async function loadUnits() {
  if (!sb) return null;
  const { data, error } = await sb.from("units").select("*").order("price");
  if (error) { console.error(error); return null; }
  return data.map(r => ({ ...r, area: +r.area, price: +r.price }));
}

export async function signOut() { try { localStorage.removeItem(LOGIN_DAY_KEY); } catch {} if (sb) await sb.auth.signOut(); location.replace("login.html"); }
