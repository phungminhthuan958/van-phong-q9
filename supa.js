// Kết nối Supabase + kiểm tra đăng nhập dùng chung cho các trang.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

export const configured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
export const sb = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export async function currentProfile() {
  if (!sb) return null;
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return null;
  const { data, error } = await sb.from("profiles").select("*").eq("id", session.user.id).single();
  if (error) { console.error(error); return { id: session.user.id, email: session.user.email, status: "pending" }; }
  return data;
}

// Trang cần đăng nhập: chưa đăng nhập hoặc chưa được duyệt thì chuyển về trang đăng nhập.
// Khi chưa nối Supabase (đang chạy thử) thì cho xem với dữ liệu mẫu.
export async function requireApproved() {
  if (!configured) return { demo: true, full_name: "Chế độ xem thử", kind: "nhanvien", role: "admin", status: "approved" };
  const p = await currentProfile();
  if (!p || p.status !== "approved") { location.replace("login.html"); return new Promise(() => {}); }
  return p;
}

export async function loadUnits() {
  if (!sb) return null;
  const { data, error } = await sb.from("units").select("*").order("price");
  if (error) { console.error(error); return null; }
  return data.map(r => ({ ...r, area: +r.area, price: +r.price }));
}

export async function signOut() { if (sb) await sb.auth.signOut(); location.replace("login.html"); }
