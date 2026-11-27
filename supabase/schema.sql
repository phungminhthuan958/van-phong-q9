-- Văn phòng Q9: tài khoản con + giỏ hàng.
-- Chạy 1 lần trong Supabase: SQL Editor → New query → dán toàn bộ → Run.

-- 1. Hồ sơ người dùng (mỗi tài khoản con một dòng)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  kind text not null default 'khach' check (kind in ('khach','ctv','nhanvien')),
  dept text check (dept in ('nguon','zalo','facebook','video','cskh')),
  role text not null default 'member' check (role in ('member','lead','admin')),
  status text not null default 'pending' check (status in ('pending','approved','blocked')),
  created_at timestamptz not null default now()
);

-- 2. Giỏ hàng (một bảng chuẩn duy nhất)
create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  zone text not null,
  tower text not null,
  type text not null,
  area numeric(6,1) not null,
  floor int,
  dir text,
  view text,
  price numeric(8,2) not null,          -- đơn vị: tỷ đồng
  status text not null default 'ok' check (status in ('ok','hold','sold')),
  furnish text,
  note text,                            -- ghi chú (mọi tài khoản đã duyệt đều xem được, đừng ghi thông tin chủ nhà)
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.profiles enable row level security;
alter table public.units enable row level security;

-- 3. Hàm kiểm tra quyền
create or replace function public.is_approved() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and status = 'approved')
$$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and status = 'approved' and role = 'admin')
$$;
create or replace function public.can_edit_units() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and status = 'approved'
                and (role = 'admin' or (kind = 'nhanvien' and dept = 'nguon')))
$$;

-- 4. Tự tạo hồ sơ khi có người đăng ký.
--    Người đăng ký ĐẦU TIÊN thành quản trị. Khách/CTV được duyệt ngay, nhân viên chờ quản trị duyệt.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  first_user boolean;
  k text := coalesce(new.raw_user_meta_data->>'kind', 'khach');
  d text := new.raw_user_meta_data->>'dept';
begin
  select not exists(select 1 from profiles) into first_user;
  if k not in ('khach','ctv','nhanvien') then k := 'khach'; end if;
  if k <> 'nhanvien' or d not in ('nguon','zalo','facebook','video','cskh') then d := null; end if;
  insert into profiles(id, email, full_name, phone, kind, dept, role, status)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone',
          case when first_user then 'nhanvien' else k end, d,
          case when first_user then 'admin' else 'member' end,
          case when first_user or k in ('khach','ctv') then 'approved' else 'pending' end);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_unit() returns trigger language plpgsql as $$
begin new.updated_at := now(); new.updated_by := auth.uid(); return new; end $$;
drop trigger if exists units_touch on public.units;
create trigger units_touch before insert or update on public.units
  for each row execute function public.touch_unit();

-- 5. Luật phân quyền
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;
drop policy if exists "profiles_admin_delete" on public.profiles;
create policy "profiles_select" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_admin_update" on public.profiles for update using (public.is_admin()) with check (public.is_admin());
create policy "profiles_admin_delete" on public.profiles for delete using (public.is_admin());

drop policy if exists "units_select" on public.units;
drop policy if exists "units_insert" on public.units;
drop policy if exists "units_update" on public.units;
drop policy if exists "units_delete" on public.units;
create policy "units_select" on public.units for select using (public.is_approved());           -- chỉ tài khoản đã duyệt mới xem
create policy "units_insert" on public.units for insert with check (public.can_edit_units());   -- quản trị + phòng Nguồn hàng
create policy "units_update" on public.units for update using (public.can_edit_units()) with check (public.can_edit_units());
create policy "units_delete" on public.units for delete using (public.can_edit_units());

-- 6. Thông tin NỘI BỘ của căn: ai nắm hàng, chủ nhà, số điện thoại chủ nhà.
--    Bảng riêng, chỉ quản trị và phòng Nguồn hàng xem được. Khách, cộng tác viên và các phòng khác KHÔNG thấy.
create table if not exists public.unit_private (
  unit_id uuid primary key references public.units(id) on delete cascade,
  holder text,        -- người nắm hàng
  owner_name text,    -- chủ nhà
  owner_phone text,   -- SĐT chủ nhà
  note text,          -- ghi chú nội bộ (giá chốt, hoa hồng...)
  updated_at timestamptz not null default now()
);
alter table public.unit_private enable row level security;
drop policy if exists "unit_private_all" on public.unit_private;
create policy "unit_private_all" on public.unit_private for all
  using (public.can_edit_units()) with check (public.can_edit_units());

-- Cấp quyền API cho người dùng đã đăng nhập (RLS ở trên vẫn quyết định ai thấy gì)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.units, public.unit_private to authenticated;
grant execute on function public.is_approved(), public.is_admin(), public.can_edit_units() to authenticated;

-- 7. Hình ảnh từng căn (thêm ngày 2026-11-27)
--    Ảnh nằm trong kho "unit-photos". Ai được cập nhật hàng (quản trị + phòng Nguồn hàng) thì được tải ảnh lên, xoá ảnh.
alter table public.units add column if not exists photos text[] not null default '{}';
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('unit-photos', 'unit-photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists "unit_photos_insert" on storage.objects;
drop policy if exists "unit_photos_update" on storage.objects;
drop policy if exists "unit_photos_delete" on storage.objects;
create policy "unit_photos_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'unit-photos' and public.can_edit_units());
create policy "unit_photos_update" on storage.objects for update to authenticated
  using (bucket_id = 'unit-photos' and public.can_edit_units()) with check (bucket_id = 'unit-photos' and public.can_edit_units());
create policy "unit_photos_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'unit-photos' and public.can_edit_units());
-- Cần quyền đọc danh sách file thì nút xoá ảnh mới xoá được file trong kho
drop policy if exists "unit_photos_select" on storage.objects;
create policy "unit_photos_select" on storage.objects for select to authenticated
  using (bucket_id = 'unit-photos' and public.can_edit_units());

-- 8. Căn "giá tốt": chỉ những căn này hiện ở giỏ hàng văn phòng 3D (thêm ngày 2026-11-27)
alter table public.units add column if not exists hot boolean not null default false;
-- Cập nhật tức thì: sửa/xoá căn ở trang Quản lý thì văn phòng 3D đổi ngay
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='units') then
    alter publication supabase_realtime add table public.units;
  end if;
end $$;

-- 9. Việc Zalo hằng ngày (thêm ngày 2026-11-27)
--    Căn cho thuê và căn bán dùng chung bảng units. Với căn cho thuê, cột price tính bằng TRIỆU/THÁNG; căn bán vẫn tính bằng TỶ.
alter table public.units add column if not exists deal text not null default 'ban' check (deal in ('ban','thue'));
alter table public.units add column if not exists tier text check (tier in ('tot','thitruong','cao'));   -- giá tốt / giá thị trường / giá cao
alter table public.units add column if not exists source text;                                         -- nhóm Zalo lấy tin
alter table public.units add column if not exists posted_at timestamptz not null default now();        -- ngày đăng tin
alter table public.units add column if not exists checked_at timestamptz;                              -- lần gần nhất hỏi người đăng còn/hết
-- Một mã căn có thể vừa cho thuê vừa bán
alter table public.units drop constraint if exists units_code_key;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'units_code_deal_key') then
    alter table public.units add constraint units_code_deal_key unique (code, deal);
  end if;
end $$;
-- Người đăng tin trong nhóm Zalo (nội bộ)
alter table public.unit_private add column if not exists poster_name text;
alter table public.unit_private add column if not exists poster_phone text;

-- Xếp mức giá: mỗi phân khu + loại căn + thuê/bán, 3 căn rẻ nhất theo giá/m² là "giá tốt" (hiện ở văn phòng 3D).
-- Căn còn lại: không quá 10% trên mức giữa là "giá thị trường", cao hơn là "giá cao". Căn đã bán không tính.
create or replace function public.recompute_tiers() returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.can_edit_units() then raise exception 'Không có quyền cập nhật giỏ hàng'; end if;
  with g as (
    select zone, type, deal, percentile_cont(0.5) within group (order by price / area) as med
    from units where status <> 'sold' and area > 0 group by zone, type, deal
  ), r as (
    select u.id, u.price / u.area as ppm, g.med,
           row_number() over (partition by u.zone, u.type, u.deal order by u.price / u.area, u.posted_at) as rn
    from units u join g using (zone, type, deal)
    where u.status <> 'sold' and u.area > 0
  )
  update units u set
    tier = case when r.rn <= 3 then 'tot' when r.ppm <= r.med * 1.1 then 'thitruong' else 'cao' end,
    hot  = (r.rn <= 3)
  from r where u.id = r.id;
  update units set hot = false where status = 'sold' and hot;
end $$;
grant execute on function public.recompute_tiers() to authenticated;

-- 10. Khách & chủ nhà cần khai thác (SĐT từ nhóm Zalo, từ phòng Facebook gửi về...)
create or replace function public.can_work_leads() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and status = 'approved'
                and (role = 'admin' or (kind = 'nhanvien' and dept in ('nguon','zalo','facebook','cskh'))))
$$;
grant execute on function public.can_work_leads() to authenticated;
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text,
  who text not null default 'chu' check (who in ('chu','khach','sales')),   -- chủ nhà / khách / sales
  source text,                       -- VD: Nhóm MTGroup TTM, Facebook
  need text,                         -- nhu cầu: cho thuê, bán, mua, thuê...
  note text,
  status text not null default 'moi' check (status in ('moi','da_nhan','dang_cham','co_nhu_cau','khong_nhu_cau')),
  contacted_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid()
);
alter table public.leads enable row level security;
drop policy if exists "leads_all" on public.leads;
create policy "leads_all" on public.leads for all using (public.can_work_leads()) with check (public.can_work_leads());
grant select, insert, update, delete on public.leads to authenticated;
