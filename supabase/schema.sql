-- ============================================================================
-- ECOMMERCE FULLSTACK — SUPABASE SCHEMA
-- ============================================================================
-- HOW TO USE:
-- 1. Open your Supabase project -> SQL Editor -> New query
-- 2. Paste this entire file and click "Run"
-- 3. It is safe to re-run (uses IF NOT EXISTS / DROP IF EXISTS guards)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES  (extends Supabase auth.users with app-specific fields)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are editable by owner" on public.profiles;
create policy "Profiles are editable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ----------------------------------------------------------------------------
-- 2. CATEGORIES
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "Categories are viewable by everyone" on public.categories;
create policy "Categories are viewable by everyone"
  on public.categories for select
  using (true);

drop policy if exists "Categories are editable by admins" on public.categories;
create policy "Categories are editable by admins"
  on public.categories for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));


-- ----------------------------------------------------------------------------
-- 3. PRODUCTS
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2),       -- original/"was" price for showing a discount
  image_url text,
  category_id uuid references public.categories(id) on delete set null,
  brand text default '',
  features text[] default '{}',         -- e.g. {"Metallic","8GB Ram"}
  stock int not null default 0 check (stock >= 0),
  rating numeric(2,1) default 4.5,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- Safe to re-run on a project created before brand/features existed:
alter table public.products add column if not exists brand text default '';
alter table public.products add column if not exists features text[] default '{}';

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_name_idx on public.products using gin (to_tsvector('english', name));

alter table public.products enable row level security;

drop policy if exists "Products are viewable by everyone" on public.products;
create policy "Products are viewable by everyone"
  on public.products for select
  using (true);

drop policy if exists "Products are editable by admins" on public.products;
create policy "Products are editable by admins"
  on public.products for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));


-- ----------------------------------------------------------------------------
-- 4. CART ITEMS (persisted server-side per user)
-- ----------------------------------------------------------------------------
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  saved_for_later boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.cart_items enable row level security;

drop policy if exists "Users manage their own cart" on public.cart_items;
create policy "Users manage their own cart"
  on public.cart_items for all
  using (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 5. ORDERS + ORDER ITEMS  (created at checkout)
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total numeric(10,2) not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "Users view their own orders" on public.orders;
create policy "Users view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Users create their own orders" on public.orders;
create policy "Users create their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admins view all orders" on public.orders;
create policy "Admins view all orders"
  on public.orders for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,    -- snapshot, in case product is later edited/deleted
  price numeric(10,2) not null,
  quantity int not null
);

alter table public.order_items enable row level security;

drop policy if exists "Users view their own order items" on public.order_items;
create policy "Users view their own order items"
  on public.order_items for select
  using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

drop policy if exists "Users create their own order items" on public.order_items;
create policy "Users create their own order items"
  on public.order_items for insert
  with check (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));


-- ----------------------------------------------------------------------------
-- 6. STORAGE BUCKET for product images
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Product images are publicly readable" on storage.objects;
create policy "Product images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );


-- ----------------------------------------------------------------------------
-- 7. SEED DATA — categories + sample products so the app isn't empty
-- ----------------------------------------------------------------------------
insert into public.categories (name, slug) values
  ('Electronics', 'electronics'),
  ('Clothing', 'clothing'),
  ('Home & Outdoor', 'home-outdoor'),
  ('Accessories', 'accessories'),
  ('Sports & Outdoor', 'sports-outdoor'),
  ('Toys & Games', 'toys-games'),
  ('Beauty & Personal Care', 'beauty-personal-care'),
  ('Office Supplies', 'office-supplies')
on conflict (slug) do nothing;

insert into public.products (name, description, price, compare_at_price, image_url, category_id, brand, features, stock, rating, is_featured)
select
  v.name, v.description, v.price, v.compare_at_price, v.image_url,
  (select id from public.categories where slug = v.cat_slug),
  v.brand, v.features, v.stock, v.rating, v.is_featured
from (values
  -- ELECTRONICS (8)
  ('Wireless Headphones Pro', 'Over-ear wireless headphones with active noise cancellation and 30hr battery life.', 89.50, 119.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 'electronics', 'Sony', array['Bluetooth 5.0','Noise Cancelling','30hr Battery'], 42, 4.6, true),
  ('Smart Watch Series X', 'Fitness tracking smart watch with heart-rate monitor and AMOLED display.', 99.50, 149.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', 'electronics', 'Apple', array['AMOLED Display','Heart Rate Monitor','Water Resistant'], 30, 4.4, true),
  ('4K Action Camera', 'Waterproof 4K action camera with image stabilization, includes mounting kit.', 129.00, 168.00, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600', 'electronics', 'GoPro', array['4K Recording','Waterproof','Image Stabilization'], 18, 4.5, true),
  ('Slim Laptop 14"', 'Lightweight 14-inch laptop, 16GB RAM, ideal for work and everyday use.', 549.00, 699.00, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600', 'electronics', 'Apple', array['16GB Ram','Metallic','Large Memory'], 12, 4.7, true),
  ('Android Smartphone 128GB', 'Edge-to-edge display smartphone with triple camera and fast charging.', 249.00, 329.00, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600', 'electronics', 'Samsung', array['128GB Storage','Fast Charging','Triple Camera'], 35, 4.3, true),
  ('Wireless Gaming Headset', 'Surround-sound gaming headset with noise-cancelling mic and RGB lighting.', 59.00, 79.00, 'https://images.unsplash.com/photo-1599669454699-248893623440?w=600', 'electronics', 'Lenovo', array['Surround Sound','Plastic Cover','RGB Lighting'], 26, 4.2, false),
  ('Bluetooth Portable Speaker', 'Compact waterproof speaker with 12-hour playtime and deep bass.', 39.99, 54.00, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600', 'electronics', 'Sony', array['Bluetooth 5.0','Waterproof','12hr Battery'], 48, 4.4, false),
  ('Tablet 10" 64GB', 'Slim 10-inch tablet with vivid display, great for media and browsing.', 199.00, 249.00, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600', 'electronics', 'Huawei', array['64GB Storage','Metallic','Large Memory'], 20, 4.3, false),

  -- CLOTHING (6)
  ('Classic Polo Shirt', 'Soft cotton polo shirt, available in multiple colors, regular fit.', 19.99, 28.00, 'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=600', 'clothing', 'Uniqlo', array['100% Cotton','Regular Fit','Machine Washable'], 80, 4.2, false),
  ('Denim Jacket', 'Mid-wash denim jacket with classic button front and chest pockets.', 39.00, 55.00, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600', 'clothing', 'Levi''s', array['Denim','Button Front','Classic Fit'], 25, 4.3, false),
  ('Slim Fit Chinos', 'Comfortable stretch chinos, tapered fit, machine washable.', 29.50, null, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600', 'clothing', 'H&M', array['Stretch Fabric','Tapered Fit','Machine Washable'], 60, 4.1, false),
  ('Winter Puffer Coat', 'Insulated puffer coat with hood, built for cold-weather comfort.', 64.00, 89.00, 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600', 'clothing', 'Zara', array['Insulated','Hooded','Water Resistant'], 18, 4.5, true),
  ('Crew Neck Sweater', 'Soft knit crew neck sweater, lightweight and breathable for layering.', 34.00, 45.00, 'https://images.unsplash.com/photo-1614975059251-992f11792b9f?w=600', 'clothing', 'Uniqlo', array['Knit Fabric','Lightweight','Breathable'], 40, 4.2, false),
  ('Classic Denim Jeans', 'Straight-fit denim jeans in a versatile mid-wash, durable stitching.', 44.00, 60.00, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', 'clothing', 'Levi''s', array['Denim','Straight Fit','Durable'], 55, 4.4, false),

  -- HOME & OUTDOOR (6)
  ('Ceramic Coffee Mug Set', 'Set of 2 handcrafted ceramic mugs, microwave and dishwasher safe.', 18.00, null, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600', 'home-outdoor', 'IKEA', array['Dishwasher Safe','Microwave Safe','Set of 2'], 35, 4.5, false),
  ('Indoor Plant Pot Set', 'Set of 3 minimalist ceramic plant pots with drainage holes.', 22.50, 30.00, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600', 'home-outdoor', 'IKEA', array['Ceramic','Drainage Holes','Set of 3'], 28, 4.3, false),
  ('Stainless Steel Kettle', '1.7L electric kettle with auto shut-off and boil-dry protection.', 34.99, 45.00, 'https://images.unsplash.com/photo-1622220822304-6cdb01b86a73?w=600', 'home-outdoor', 'Philips', array['1.7L Capacity','Auto Shut-off','Stainless Steel'], 22, 4.4, true),
  ('Throw Pillow Set', 'Set of 2 soft woven throw pillows, adds texture to any sofa or bed.', 26.00, 34.00, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=600', 'home-outdoor', 'IKEA', array['Woven Fabric','Set of 2','Machine Washable'], 32, 4.1, false),
  ('Outdoor Camping Lantern', 'Rechargeable LED lantern with 3 brightness modes, water resistant.', 21.00, 28.00, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600', 'home-outdoor', 'Philips', array['Rechargeable','Water Resistant','3 Brightness Modes'], 24, 4.3, false),
  ('Non-Stick Cooking Pan Set', 'Set of 3 non-stick frying pans, even heat distribution, oven safe.', 48.00, 65.00, 'https://images.unsplash.com/photo-1584990347449-a8b1605c2bf6?w=600', 'home-outdoor', 'Philips', array['Non-Stick','Oven Safe','Set of 3'], 16, 4.5, true),

  -- ACCESSORIES (4)
  ('Leather Backpack', 'Genuine leather backpack with padded laptop sleeve and multiple compartments.', 79.00, 99.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', 'accessories', 'Fossil', array['Genuine Leather','Laptop Sleeve','Multiple Compartments'], 20, 4.6, true),
  ('Minimalist Wallet', 'Slim bifold leather wallet with RFID-blocking card slots.', 24.00, 32.00, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600', 'accessories', 'Fossil', array['RFID Blocking','Slim Bifold','Genuine Leather'], 50, 4.4, false),
  ('Polarized Sunglasses', 'UV400 polarized sunglasses with lightweight frame, unisex design.', 29.00, 39.00, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', 'accessories', 'Ray-Ban', array['UV400 Protection','Polarized','Lightweight Frame'], 38, 4.5, false),
  ('Stainless Steel Watch', 'Classic analog watch with stainless steel band and scratch-resistant face.', 69.00, 95.00, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600', 'accessories', 'Fossil', array['Stainless Steel','Scratch Resistant','Water Resistant'], 27, 4.4, true)
) as v(name, description, price, compare_at_price, image_url, cat_slug, brand, features, stock, rating, is_featured)
where not exists (select 1 from public.products where products.name = v.name);

-- If you ran an earlier version of this script (before brand/features existed),
-- this backfills those two columns on the products that were already seeded:
update public.products set brand = 'Sony', features = array['Bluetooth 5.0','Noise Cancelling','30hr Battery'] where name = 'Wireless Headphones Pro' and brand = '';
update public.products set brand = 'Apple', features = array['AMOLED Display','Heart Rate Monitor','Water Resistant'] where name = 'Smart Watch Series X' and brand = '';
update public.products set brand = 'GoPro', features = array['4K Recording','Waterproof','Image Stabilization'] where name = '4K Action Camera' and brand = '';
update public.products set brand = 'Apple', features = array['16GB Ram','Metallic','Large Memory'] where name = 'Slim Laptop 14"' and brand = '';
update public.products set brand = 'Uniqlo', features = array['100% Cotton','Regular Fit','Machine Washable'] where name = 'Classic Polo Shirt' and brand = '';
update public.products set brand = 'Levi''s', features = array['Denim','Button Front','Classic Fit'] where name = 'Denim Jacket' and brand = '';
update public.products set brand = 'H&M', features = array['Stretch Fabric','Tapered Fit','Machine Washable'] where name = 'Slim Fit Chinos' and brand = '';
update public.products set brand = 'Fossil', features = array['Genuine Leather','Laptop Sleeve','Multiple Compartments'] where name = 'Leather Backpack' and brand = '';
update public.products set brand = 'Fossil', features = array['RFID Blocking','Slim Bifold','Genuine Leather'] where name = 'Minimalist Wallet' and brand = '';
update public.products set brand = 'IKEA', features = array['Dishwasher Safe','Microwave Safe','Set of 2'] where name = 'Ceramic Coffee Mug Set' and brand = '';
update public.products set brand = 'IKEA', features = array['Ceramic','Drainage Holes','Set of 3'] where name = 'Indoor Plant Pot Set' and brand = '';
update public.products set brand = 'Philips', features = array['1.7L Capacity','Auto Shut-off','Stainless Steel'] where name = 'Stainless Steel Kettle' and brand = '';

-- ----------------------------------------------------------------------------
-- 8. MAKE YOURSELF AN ADMIN (run this manually AFTER you sign up in the app)
-- ----------------------------------------------------------------------------
-- 1. Sign up for an account in the running app first.
-- 2. Then come back here, uncomment the line below, replace the email, and run it:
--
-- update public.profiles set is_admin = true
-- where id = (select id from auth.users where email = 'your-email@example.com');

