// Kết nối Supabase + kiểm tra đăng nhập dùng chung cho các trang.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

export const configured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
export const sb = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Mỗi ngày (giờ Việt Nam) chỉ cần đăng nhập một lần. Sang ngày mới thì phải đăng nhập lại.
const LOGIN_DAY_KEY = "q9LoginDay";
const vnToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
export function markLoginToday() { try { localStorage.setItem(LOGIN_DAY_KEY, vnToday()); } catch {} }
function loggedInToday() { try { return localStorage.getItem(LOGIN_DAY_KEY) === vnToday(); } catch { return true; } }
// "Ghi nhớ máy này": máy làm việc của Admin / nhân viên phòng ban (kể cả trình duyệt chạy lịch tự động)
// không phải đăng nhập lại mỗi ngày. Khách, CTV, chủ nhà vẫn đăng nhập mỗi ngày.
const KEEP_KEY = "q9KeepLogin";
export function setKeepLogin(on) { try { on ? localStorage.setItem(KEEP_KEY, "1") : localStorage.removeItem(KEEP_KEY); } catch {} }
function keepLogin() { try { return localStorage.getItem(KEEP_KEY) === "1"; } catch { return false; } }
const isStaff = p => p && (p.role === "admin" || p.kind === "nhanvien");

// Ghi nhớ sales đã gửi link (?s=...) để khi khách đăng ký thì gắn với sales đó
try { const s = new URLSearchParams(location.search).get("s"); if (s && /^[0-9a-f-]{36}$/i.test(s)) localStorage.setItem("q9SalesRef", s); } catch {}
export function salesRefFromLink() { try { return localStorage.getItem("q9SalesRef") || ""; } catch { return ""; } }

export async function currentProfile() {
  if (!sb) return null;
  // Link trong email (xác nhận / đặt lại mật khẩu) cũng tính là một lần đăng nhập
  if (/access_token|type=recovery|type=signup/.test(location.hash)) markLoginToday();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return null;
  const today = loggedInToday();
  if (!today && !keepLogin()) { await sb.auth.signOut(); return null; }
  const { data, error } = await sb.from("profiles").select("*").eq("id", session.user.id).single();
  if (error) { console.error(error); if (!today) { await sb.auth.signOut(); return null; } return { id: session.user.id, email: session.user.email, status: "pending" }; }
  if (!today) { if (!isStaff(data)) { setKeepLogin(false); await sb.auth.signOut(); return null; } markLoginToday(); }
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

export async function loadUnits(hideCode = false) {
  if (!sb) return null;
  // Cộng tác viên đọc qua hàm units_for_ctv: mã căn thật được thay bằng mã ẩn
  const { data, error } = hideCode ? await sb.rpc("units_for_ctv") : await sb.from("units").select("*").order("price");
  if (error) { console.error(error); return null; }
  return data.map(r => ({ ...r, area: +r.area, price: +r.price }));
}

export async function signOut() { try { localStorage.removeItem(LOGIN_DAY_KEY); localStorage.removeItem(KEEP_KEY); } catch {} if (sb) await sb.auth.signOut(); location.replace("login.html"); }

// ====== Thông báo "đã có nguồn hàng mới" ======
// Hiện thông báo mới nhất trong ngày (Admin gửi, hoặc lượt nhập hàng buổi sáng tự gửi).
// Nếu hôm nay chưa có thông báo nhưng có căn mới thì tự báo số căn mới.
const vnDay = d => new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
function noticeBanner(text, key, onOpen) {
  try { if (localStorage.getItem("q9NoticeSeen") === key) return; } catch {}
  document.querySelector("#q9Notice")?.remove();
  const el = document.createElement("div"); el.id = "q9Notice"; el.setAttribute("role", "status");
  el.style.cssText = "position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:9999;max-width:min(560px,calc(100vw - 24px));width:max-content;background:#1b2b31;color:#e8efe9;border:1px solid #d6a75c;border-radius:12px;padding:10px 12px;box-shadow:0 8px 30px rgba(0,0,0,.45);display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.45";
  const t = document.createElement("div"); t.style.cssText = "flex:1;white-space:pre-wrap"; t.textContent = text;
  const acts = document.createElement("div"); acts.style.cssText = "display:flex;gap:6px;flex:none";
  const mk = (label, primary) => { const b = document.createElement("button"); b.type = "button"; b.textContent = label;
    b.style.cssText = `font:inherit;font-size:13px;border-radius:8px;padding:5px 10px;cursor:pointer;border:1px solid #d6a75c;${primary ? "background:#d6a75c;color:#13242b;font-weight:600" : "background:none;color:#e8efe9"}`; return b; };
  const close = () => { try { localStorage.setItem("q9NoticeSeen", key); } catch {} el.remove(); };
  if (onOpen) { const o = mk("Xem hàng", true); o.onclick = () => { close(); onOpen(); }; acts.append(o); }
  const x = mk("Đóng", false); x.onclick = close; acts.append(x);
  el.append(t, acts); document.body.append(el);
}
export async function initNotices(units, onOpen) {
  if (!sb) return;
  const today = vnToday();
  const { data } = await sb.from("notices").select("*").order("created_at", { ascending: false }).limit(1);
  const n = data?.[0], newToday = (units || []).filter(u => u.created_at && vnDay(u.created_at) === today).length;
  if (n && vnDay(n.created_at) === today) noticeBanner(n.body, "n" + n.id, onOpen);
  else if (newToday) noticeBanner(`🔔 Hôm nay đã có ${newToday} căn mới trong giỏ hàng. Mọi người vào xem nhé!`, "auto" + today + ":" + newToday, onOpen);
  sb.channel("notices-live").on("postgres_changes", { event: "INSERT", schema: "public", table: "notices" }, p => noticeBanner(p.new.body, "n" + p.new.id, onOpen)).subscribe();
}
export async function sendNotice(body, newCount) {
  if (!sb) return { error: { message: "Chế độ xem thử" } };
  return sb.from("notices").insert({ body, new_count: newCount ?? null });
}
