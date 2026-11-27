# Văn phòng 3D · Giỏ hàng Grand Park Q9

Web có đăng ký tài khoản con. Ai muốn xem giỏ hàng cũng phải đăng ký và đăng nhập.

## Các trang
- `login.html`: đăng ký, đăng nhập. Khi đăng ký, người dùng chọn Khách hàng, Cộng tác viên hoặc Nhân viên (kèm phòng ban).
- `index.html`: văn phòng 3D và giỏ hàng. Khách và CTV chỉ thấy giỏ hàng cùng số liên hệ chung, không thấy phòng ban nội bộ.
- `app.html`: trang quản lý cho nhân viên. Quản trị và phòng Nguồn hàng thêm, sửa căn và nhập thông tin nội bộ (người nắm hàng, chủ nhà). Quản trị duyệt, chặn tài khoản.

## Quyền
| | Xem giỏ hàng | Sửa giỏ hàng | Xem ai nắm hàng / chủ nhà | Duyệt tài khoản |
|---|---|---|---|---|
| Khách, CTV | ✓ (sau khi xác nhận email) | | | |
| Nhân viên các phòng | ✓ (sau khi quản trị duyệt) | | | |
| Nhân viên Nguồn hàng | ✓ | ✓ | ✓ | |
| Quản trị | ✓ | ✓ | ✓ | ✓ |

Người đăng ký **đầu tiên** sẽ tự thành quản trị, nên anh đăng ký ngay sau khi web lên mạng.

## Cài đặt (làm 1 lần)
1. Supabase → SQL Editor → dán `supabase/schema.sql` → Run.
2. Supabase → Authentication → URL Configuration → Site URL = link GitHub Pages của web.
3. Dán Project URL và khoá anon public vào `config.js`. Không bao giờ dán khoá service_role.
4. GitHub → Settings → Pages → Deploy from branch `main`, thư mục `/ (root)`.

Khi `config.js` chưa có khoá, web chạy ở chế độ xem thử với dữ liệu mẫu.
