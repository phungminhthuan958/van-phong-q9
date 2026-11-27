// Dữ liệu dùng chung: phân khu, loại căn, phòng ban, dữ liệu mẫu.
export const ZONES = [
  // Theo mặt bằng tổng thể trên grandpark-vinhomes.com/mat-bang (bản 2021) và trang từng phân khu.
  // tf: số tầng + hình dáng mặt bằng (Z, T, U) của từng toà. Toà không có số liệu hình dáng thì để T.
  // c: tâm cụm toà trên sa bàn (x: Tây → Đông, z: Bắc → Nam), ang: góc xoay của cụm, cols: số toà mỗi hàng, sp: khoảng cách [dọc hàng, giữa hàng].
  { id:"rainbow", name:"The Rainbow", color:0x5fa8d3, ppm:[46,54], c:[-2.07,.12], ang:-23.5, cols:6, sp:[.33,.27],
    tf:{"S1.01":[25,"Z"],"S1.02":[35,"T"],"S1.03":[25,"Z"],"S1.05":[25,"Z"],"S1.06":[35,"T"],"S1.07":[35,"T"],"S2.01":[26,"Z"],"S2.02":[34,"T"],"S2.03":[26,"Z"],
        "S2.05":[35,"T"],"S3.01":[25,"Z"],"S3.02":[35,"T"],"S3.03":[25,"Z"],"S3.05":[35,"T"],"S5.01":[35,"U"],"S5.02":[26,"Z"],"S5.03":[35,"T"]} },
  { id:"origami", name:"The Origami", color:0xc98bd8, ppm:[52,62], c:[-1.0,-1.42], ang:0, cols:5, sp:[.27,.3],
    tf:{"S6.01":[26,"T"],"S6.02":[21,"Z"],"S6.03":[21,"Z"],"S6.05":[26,"T"],"S6.06":[29,"U"],"S7.01":[26,"T"],"S7.02":[30,"U"],"S7.03":[26,"T"],"S7.05":[21,"Z"],
        "S8.01":[26,"T"],"S8.02":[21,"Z"],"S8.03":[21,"Z"],"S9.01":[21,"Z"],"S9.02":[30,"U"],"S9.03":[20,"Z"],"S10.01":[20,"Z"],"S10.02":[26,"T"],"S10.03":[26,"T"],
        "S10.05":[20,"Z"],"S10.06":[26,"T"],"S10.07":[26,"T"]} },
  { id:"glory",   name:"Glory Heights", color:0xe2a55b, ppm:[60,68], c:[.12,-1.62], ang:-15, cols:2, sp:[.36,.36],
    tf:{"GH1":[25,"Z"],"GH2":[34,"T"],"GH3":[39,"U"],"GH5":[25,"Z"],"GH6":[24,"Z"]} },
  { id:"solari",  name:"The Beverly Solari", color:0xf0d27a, ppm:[56,66], c:[.78,-2.05], ang:0, cols:4, sp:[.32,.32],
    tf:{"BS7":[34,"T"],"BS8":[39,"T"],"BS9":[34,"T"],"BS10":[34,"T"],"BS11":[24,"T"],"BS12":[24,"T"],"BS15":[34,"T"],"BS16":[39,"T"]} },
  { id:"beverly", name:"The Beverly", color:0x6fc49a, ppm:[64,74], c:[1.62,-1.45], ang:0, cols:3, sp:[.32,.34],
    tf:{"BE1":[34,"T"],"BE2":[34,"T"],"BE3":[34,"T"],"BE5":[32,"T"],"BE6":[32,"T"],"BE7":[32,"T"]} },
  { id:"opus",    name:"The Opus One", color:0xe07a6a, ppm:[70,82], c:[.72,-.95], ang:0, cols:2, sp:[.34,.32],
    tf:{"OS1":[34,"T"],"OS2":[32,"T"],"OS3":[32,"T"],"OS5":[34,"T"]} },
];
ZONES.forEach(z => z.towers = Object.keys(z.tf));
export const towerInfo = t => { for (const z of ZONES) if (z.tf[t]) return { zone:z, floors:z.tf[t][0], shape:z.tf[t][1] }; return null; };
export const TYPES = [{n:"Studio",a:[28,35]},{n:"1PN+",a:[43,50]},{n:"2PN",a:[59,70]},{n:"2PN+",a:[69,76]},{n:"3PN",a:[80,98]}];
export const DIRS = ["Đông Nam","Tây Bắc","Đông Bắc","Tây Nam","Nam","Bắc","Đông","Tây"];
export const VIEWS = ["Nội khu","Công viên 36ha","Hồ bơi","Thành phố","Sông"];
export const ST = { ok:"Còn hàng", hold:"Đang giữ chỗ", sold:"Đã bán" };
export const KINDS = { khach:"Khách hàng", ctv:"Cộng tác viên", nhanvien:"Nhân viên" };
export const ROLES = { member:"Thành viên", lead:"Trưởng phòng", admin:"Quản trị" };
export const STATUSES = { pending:"Chờ duyệt", approved:"Đã duyệt", blocked:"Đã chặn" };

export const hex = c => "#" + c.toString(16).padStart(6, "0");
export const zoneOf = id => ZONES.find(z => z.id === id) || { name:id, color:0x888888 };
// Căn bán: giá tính bằng tỷ. Căn cho thuê: giá tính bằng triệu/tháng.
export const fmtPrice = (v, deal) => deal === "thue"
  ? Number(v).toLocaleString("vi-VN", { maximumFractionDigits:1 }) + " tr/tháng"
  : Number(v).toLocaleString("vi-VN", { minimumFractionDigits:2, maximumFractionDigits:2 }) + " tỷ";
export const DEALS = { ban:"Bán", thue:"Cho thuê" };
export const TIERS = { tot:"Giá tốt", thitruong:"Giá thị trường", cao:"Giá cao" };
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

// Phòng ban & vị trí. Anh sửa tên vị trí / nhiệm vụ tại đây.
export const DEPTS = [
  {id:"nguon",name:"Nguồn hàng",sign:"NGUỒN HÀNG",tag:"Tìm căn · Xác minh · Giỏ hàng",color:0xe0a84a,pos:[9.5,-5],size:[6,7.4],
   desc:"Nơi giữ một bảng giỏ hàng chuẩn duy nhất. Các phòng khác chỉ lấy thông tin từ đây.",
   roles:[{t:"Trưởng nhóm nguồn hàng",d:"Duyệt giá, quyết định căn nào được đưa lên giỏ hàng."},
          {t:"Khai thác nguồn",d:"Tìm căn từ chủ nhà, đối tác, các sàn khác."},
          {t:"Xác minh căn",d:"Kiểm tra pháp lý, hiện trạng, chụp ảnh thực tế."},
          {t:"Cập nhật giỏ hàng",d:"Nhập căn mới, đổi trạng thái còn / giữ chỗ / đã bán mỗi ngày."},
          {t:"Nhập căn tự động (Zalo)",d:"Đọc tin các nhóm Zalo nguồn hàng, tự tách thành căn. Người kiểm tra lại rồi bấm nhập."}]},
  {id:"zalo",name:"Zalo",sign:"ZALO",tag:"OA · Nhóm khách · Chat",color:0x2f8cff,pos:[-9.5,-1],size:[6,5.2],
   desc:"Giữ liên lạc với khách qua Zalo OA, nhóm Zalo và chat 1-1.",
   roles:[{t:"Quản lý Zalo OA & nhóm",d:"Duy trì nhóm khách, tin nhắn tự động, gắn nhãn khách."},
          {t:"Nhân viên chat Zalo",d:"Trả lời khách, gửi bảng giá, hẹn lịch xem nhà."},
          {t:"Đăng tin Zalo",d:"Đăng căn mới từ giỏ hàng vào nhóm và nhật ký mỗi ngày."}]},
  {id:"facebook",name:"Facebook",sign:"FACEBOOK",tag:"Fanpage · Group · Quảng cáo",color:0x8f7cf2,pos:[-9.5,4.6],size:[6,5.2],
   desc:"Kéo khách mới về qua fanpage, group và quảng cáo.",
   roles:[{t:"Quản trị fanpage & group",d:"Duyệt bài, trả lời bình luận, inbox Messenger."},
          {t:"Viết nội dung",d:"Viết bài bán căn theo đúng thông tin giỏ hàng."},
          {t:"Chạy quảng cáo",d:"Lên chiến dịch, theo dõi chi phí trên mỗi khách."}]},
  {id:"video",name:"Video",sign:"VIDEO",tag:"Kịch bản · Quay · Dựng",color:0xe0645c,pos:[-9.5,-6.6],size:[6,5.2],
   desc:"Làm video review căn, tiện ích nội khu cho Facebook, Zalo, TikTok.",
   roles:[{t:"Kịch bản",d:"Lên ý tưởng video review, Reels, TikTok theo căn đang bán."},
          {t:"Quay phim",d:"Quay căn thực tế, tiện ích, toàn cảnh dự án."},
          {t:"Dựng video",d:"Cắt dựng, phụ đề, xuất bản lên các kênh."}]},
  {id:"cskh",name:"Chăm sóc khách & chủ nhà",sign:"CHĂM SÓC KHÁCH",tag:"Khách mua/thuê · Chủ nhà",color:0x4fbf8f,pos:[9.5,3.6],size:[6,7.4],
   desc:"Theo khách và chủ nhà từ lần liên hệ đầu tiên đến khi giao dịch xong.",
   roles:[{t:"Chăm sóc khách mua/thuê",d:"Gọi lại, theo dõi khách tiềm năng, nhắc lịch xem nhà."},
          {t:"Khai thác khách mới",d:"Lọc data, gọi điện, đặt lịch tư vấn."},
          {t:"Chăm sóc chủ nhà",d:"Giữ quan hệ, cập nhật giá ký gửi, nhận căn mới."},
          {t:"Hỗ trợ giao dịch",d:"Đặt cọc, hợp đồng, bàn giao."}]},
];
export const deptOf = id => DEPTS.find(d => d.id === id);

// Bài đăng chuẩn: Zalo, Facebook, Video dùng chung một nội dung lấy từ giỏ hàng.
export function postText(u, contact) {
  return [
    `🏢 ${zoneOf(u.zone).name} · Toà ${u.tower} · Căn ${u.code}`,
    `📐 ${u.type} · ${u.area} m² · Tầng ${u.floor ?? "-"}`,
    `🧭 Ban công ${u.dir || "-"} · View ${u.view || "-"}`,
    `🛋️ ${u.furnish || "Bàn giao cơ bản"}`,
    u.deal === "thue" ? `💰 Giá thuê: ${fmtPrice(u.price, u.deal)}` : `💰 Giá: ${fmtPrice(u.price)} (~${Math.round(u.price * 1000 / u.area)} tr/m²)`,
    `📌 Tình trạng: ${ST[u.status]}`,
    `📞 Liên hệ Admin: ${contact.phone} (Zalo)`,
  ].join("\n");
}

// Dữ liệu mẫu, chỉ dùng khi chưa nối Supabase hoặc giỏ hàng còn trống.
export function sampleUnits() {
  let seed = 9; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const out = [];
  ZONES.forEach(z => z.towers.forEach(t => {
    if (rnd() < .45) return;                       // không phải toà nào cũng có hàng
    const n = 1 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const ty = pick(TYPES), area = +(ty.a[0] + rnd() * (ty.a[1] - ty.a[0])).toFixed(1);
      const floor = 3 + Math.floor(rnd() * (z.tf[t][0] - 3)), no = 1 + Math.floor(rnd() * 20);
      const ppm = z.ppm[0] + rnd() * (z.ppm[1] - z.ppm[0]);
      const r = rnd(), status = r < .6 ? "ok" : r < .82 ? "hold" : "sold";
      out.push({ code:`${t}-${String(floor).padStart(2,"0")}${String(no).padStart(2,"0")}`, zone:z.id, tower:t, type:ty.n, area,
        floor, dir:pick(DIRS), view:pick(VIEWS), price:Math.round(area * ppm / 10) * 10 / 1000, status,
        furnish: rnd() < .5 ? "Bàn giao cơ bản" : "Full nội thất" });
    }
  }));
  return out;
}

// Đọc tin nhắn dán từ nhóm Zalo nguồn hàng → danh sách căn (cần người kiểm tra lại trước khi nhập).
const DIR_WORDS = [["đông nam","Đông Nam"],["đông bắc","Đông Bắc"],["tây nam","Tây Nam"],["tây bắc","Tây Bắc"],["đn","Đông Nam"],["đb","Đông Bắc"],["tn","Tây Nam"],["tb","Tây Bắc"],["đông","Đông"],["tây","Tây"],["nam","Nam"],["bắc","Bắc"]];
function zoneOfTower(t){
  const u=t.toUpperCase(), n=parseInt(u.replace(/^S/,""));
  if (/^S\d/.test(u)) return n<=5 ? "rainbow" : "origami";
  if (/^GH/.test(u)) return "glory"; if (/^O[PS]/.test(u)) return "opus"; if (/^BS/.test(u)) return "solari"; if (/^B/.test(u)) return "beverly";
  return null;
}
export function parseZalo(text){
  // Tách từng tin: theo dòng trống, hoặc dòng bắt đầu bằng giờ / tên người gửi kiểu Zalo ("10:32"), hoặc từ khoá bán/cho thuê.
  const blocks = text.replace(/\r/g,"").split(/\n\s*\n|\n(?=\s*(?:\[?\d{1,2}:\d{2}|[-•*🔥🏢✅📣]|bán|cần bán|chính chủ|giỏ hàng)\b)/i).map(b=>b.trim()).filter(b=>b.length>10);
  const out = [];
  for (const raw of blocks) {
    const b = raw.toLowerCase();
    if (/cho thuê|thuê\b/.test(b) && !/bán/.test(b)) continue;                 // tạm bỏ tin cho thuê
    const tm = raw.match(/\b(S\s?\d{1,2}\.\d{2}|GH\s?\d{1,2}|O[PS]\s?\d|BS\s?\d{1,2}|BE\s?\d{1,2}|B\s?\d{1,2})\b/i);
    if (!tm) continue;
    let tower = tm[1].replace(/\s/g,"").toUpperCase().replace(/^OP/,"OS").replace(/^B(\d)/,"BE$1");
    const zone = zoneOfTower(tower) || zoneOfTower(tower);
    const after = raw.slice(tm.index + tm[0].length);
    const num = (after.match(/^\s*[-.\s]\s*(\d{3,4})\b/) || raw.match(/căn\s*(?:số\s*)?(\d{3,4})\b/i) || [])[1];
    let floor = (b.match(/tầng\s*(\d{1,2})\b/) || [])[1]; floor = floor ? +floor : (num ? Math.floor(+num/100) : null);
    const ty = (b.match(/studio|[123]\s?pn\s?\+?\s?1?|[123]\s?(?:phòng ngủ|pn)/) || [""])[0];
    const type = /studio/.test(ty) ? "Studio" : ty ? `${ty.match(/\d/)[0]}PN${/\+|\d\s?pn\s?1/.test(ty.replace(/^\d/,""))?"+":""}` : "";
    const area = (b.match(/(\d{2,3}(?:[.,]\d{1,2})?)\s*(?:m2|m²|m\b|met)/) || [])[1];
    let price = null, pm;
    if ((pm = b.match(/(\d+(?:[.,]\d+)?)\s*(?:tỷ|tỉ|ty|ti)\s*(\d{1,3})?/))) price = parseFloat(pm[1].replace(",",".")) + (pm[2] ? +pm[2] / Math.pow(10, pm[2].length) : 0);
    else if ((pm = b.match(/(\d{3,5})\s*(?:tr|triệu)\b/))) price = +pm[1] / 1000;
    const dm = b.match(/(?:bc|ban công|hướng|h\.)\s*:?\s*(đông nam|đông bắc|tây nam|tây bắc|đn|đb|tn|tb|đông|tây|nam|bắc)\b/);
    const dir = dm ? DIR_WORDS.find(([k])=>k===dm[1])[1] : "";
    const vm = b.match(/view\s*:?\s*(công viên|hồ bơi|nội khu|sông|thành phố|landmark|trực diện[^,.\n]*)/);
    const view = vm ? vm[1].replace(/^./, c => c.toUpperCase()) : "";
    const furnish = /full|nội thất đầy đủ|ntđđ/.test(b) ? "Full nội thất" : "Bàn giao cơ bản";
    const status = /đã bán|đã cọc|đã chốt|out\b/.test(b) ? (/cọc/.test(b) ? "hold" : "sold") : "ok";
    const phone = (raw.match(/(?:\+?84|0)[\s.]?\d{2,3}[\s.]?\d{3}[\s.]?\d{3,4}/) || [""])[0].replace(/[\s.]/g,"");
    const code = num ? `${tower}-${String(num).padStart(4,"0")}` : `${tower}-??`;
    out.push({ code, zone, tower, type, area: area ? area.replace(".",",") : "", floor: floor ?? "", dir, view,
      price: price ? String(Math.round(price*100)/100).replace(".",",") : "", status: ST[status], furnish, holder: phone, raw });
  }
  return out;
}

/* ---------- Chia sẻ căn qua Zalo / Messenger ---------- */
// Link mở thẳng căn đó trên web (người nhận phải đăng ký tài khoản mới xem được)
export function unitLink(code) {
  const base = location.href.split("#")[0].split("?")[0].replace(/[^/]*$/, "");
  return base + "index.html#can=" + encodeURIComponent(code);
}
export function shareText(u, contact) {
  return postText(u, contact) + "\n👉 Xem ảnh và thông tin căn: " + unitLink(u.code);
}
const onPhone = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || matchMedia("(max-width:860px)").matches;
export async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; }
  catch {
    const ta = document.createElement("textarea"); ta.value = t; ta.style.cssText = "position:fixed;opacity:0;top:0";
    document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch {} ta.remove(); return ok;
  }
}
// via: "zalo" | "messenger" | "native" | "copy"
export async function shareUnit(u, contact, via, toast) {
  const text = shareText(u, contact), link = unitLink(u.code);
  if (via === "native" && navigator.share) { try { await navigator.share({ title: "Căn " + u.code, text }); } catch {} return; }
  if (via === "zalo" && onPhone() && navigator.share) {
    try { await navigator.share({ title: "Căn " + u.code, text }); return; } catch (e) { if (e.name === "AbortError") return; }
  }
  const ok = await copyText(text);
  const pasted = ok ? "Đã chép bài đăng kèm link." : "Trình duyệt chưa cho chép, anh bấm Chép bài đăng thử lại.";
  if (via === "zalo") { window.open("https://chat.zalo.me/", "_blank", "noopener"); toast(pasted + " Mở Zalo, chọn người nhận rồi dán vào."); }
  else if (via === "messenger") {
    if (onPhone()) { location.href = "fb-messenger://share/?link=" + encodeURIComponent(link); toast(pasted + " Có thể dán thêm nội dung vào tin nhắn."); }
    else { window.open("https://www.messenger.com/", "_blank", "noopener"); toast(pasted + " Mở Messenger, chọn người nhận rồi dán vào."); }
  } else toast(pasted);
}

/* ---------- Thanh thả xuống (menu) dùng chung ---------- */
// <details class="dd"><summary>Tên nút</summary><div class="dd-menu">...các nút...</div></details>
function placeMenu(d) {
  const m = d.querySelector(".dd-menu"), r = d.querySelector("summary").getBoundingClientRect();
  m.style.minWidth = Math.max(200, r.width) + "px";
  const w = m.offsetWidth, h = m.offsetHeight;
  const left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8, r.left > innerWidth / 2 ? r.right - w : r.left));
  let top = r.bottom + 4; if (top + h > innerHeight - 8) top = Math.max(8, r.top - h - 4);
  m.style.left = left + "px"; m.style.top = top + "px";
}
export function initMenus() {
  const closeAll = except => document.querySelectorAll("details.dd[open]").forEach(d => d !== except && (d.open = false));
  document.addEventListener("toggle", e => { const d = e.target; if (d.matches?.("details.dd") && d.open) { closeAll(d); placeMenu(d); } }, true);
  document.addEventListener("click", e => {
    document.querySelectorAll("details.dd[open]").forEach(d => {
      if (!d.contains(e.target)) d.open = false;
      else if (e.target.closest(".dd-menu button, .dd-menu a") && !e.target.closest('[data-confirm="1"]')) d.open = false;
    });
  });
  addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });
  addEventListener("resize", () => closeAll());
  // Cuộn trang thì menu chạy theo nút; nút ra khỏi màn hình thì đóng menu
  addEventListener("scroll", () => document.querySelectorAll("details.dd[open]").forEach(d => {
    const r = d.querySelector("summary").getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) d.open = false; else placeMenu(d);
  }), { passive: true, capture: true });
}
