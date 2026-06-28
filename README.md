# Ecommerce Fullstack (React + Supabase)

A full eCommerce storefront — home page, product listing (grid/list + filters),
product details, cart, auth, order history, and an admin panel — built with
React (Vite) and Supabase (Postgres + Auth + Storage).

There is no separate Node/Express backend: Supabase **is** the backend.
The React app talks to it directly through `@supabase/supabase-js`, and
Postgres Row Level Security (RLS) policies enforce what each user/admin
is allowed to do.

---

## 1. One-time setup — connect your Supabase project

This is the only step required to make the app work end-to-end.

1. Open your Supabase project → **Project Settings (gear icon) → API**.
2. Copy the **Project URL** and the **anon public** key.
3. Open the `.env` file at the root of this project and paste them in:

   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. Save the file.

## 2. Run the database schema

1. In your Supabase project, go to **SQL Editor → New query**.
2. Open `supabase/schema.sql` from this project, copy the **entire file**,
   paste it into the SQL editor, and click **Run**.

This creates all tables (`profiles`, `categories`, `products`, `cart_items`,
`orders`, `order_items`), sets up Row Level Security policies, creates a
public `product-images` storage bucket, and seeds 24 sample products across
4 categories (with brand and feature tags) so the app isn't empty on first load.

**Already ran this before?** The script is safe to re-run — re-running it
will add any new sample products and backfill `brand`/`features` on existing
rows without duplicating anything or touching your own data.

> **Note on seed images:** the 24 sample products use Unsplash photo URLs.
> They should load correctly, but if any single product shows a plain "Image
> unavailable" placeholder instead of a photo, that just means that one
> Unsplash link went stale — it won't break the app (a fallback placeholder
> renders instead of a broken-image icon), and you can fix it permanently by
> opening that product in `/admin` → Edit → uploading any image of your own.

## 3. Install dependencies and run

```bash
npm install
npm run dev
```

Open the URL it prints (typically `http://localhost:5173`).

## 4. Make yourself an admin

The admin panel (`/admin`) is locked to users with `is_admin = true` in the
`profiles` table. To unlock it:

1. **Sign up** for an account from inside the running app (`/signup`).
2. Go back to Supabase **SQL Editor** and run:

   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'your-email@example.com');
   ```

3. Refresh the app — you'll now see an **Admin** link in the header, and
   `/admin` will let you create, edit, and delete products (including
   uploading product images, which are stored in Supabase Storage).

---

## What's implemented

**Storefront**
- Home page — hero banner, category rail, featured "Deals & offers", recommended grid, extra services section, shipping regions
- Product listing — category filter, **brand checkboxes**, **feature checkboxes**, price range slider, sort (newest / price / rating), grid/list view toggle, active-filter chips with "Clear all filters", search (via header search bar)
- Product detail — image, brand, feature tags, price (with compare-at/discount support), quantity stepper, add to cart, description/shipping tabs, related products
- Cart — quantity controls, remove, save for later / move to cart, coupon code (`SAVE10` for a working demo discount), order summary with tax + shipping, checkout
- Responsive down to mobile for every page above

**Auth**
- Email/password sign up and log in via Supabase Auth
- A `profiles` row is auto-created for every new user (via a Postgres trigger)
- Session persists across reloads

**Cart persistence**
- Cart is stored server-side per user in `cart_items`, not just localStorage — it follows the user across devices/browsers

**Checkout**
- Places an `orders` row + `order_items` rows, snapshotting product name/price at time of purchase, then clears the cart
- Order history visible at `/orders`

**Admin panel** (`/admin`, gated by `is_admin`)
- Full product CRUD: create, edit, delete
- Image upload to Supabase Storage with live preview
- Toggle "featured" status (controls homepage "Deals & offers" section)

**Security**
- Every table has Row Level Security enabled
- Users can only see/edit their own cart and orders
- Only admins can write to `products`/`categories` or upload to the
  `product-images` bucket — enforced at the database level, not just hidden
  in the UI

---

## Project structure

```
src/
  components/   Header, Footer, ProductCard, route guards, toast
  context/      AuthContext, CartContext, ToastContext (global state)
  lib/          supabaseClient.js, products.js, orders.js (all DB calls)
  pages/        Home, ProductListing, ProductDetail, Cart, Login, Signup,
                Orders, Admin, NotFound
supabase/
  schema.sql    Full DB schema + RLS policies + seed data — run once in Supabase
```

## Deploying

This is a static Vite app, so it deploys cleanly to **Vercel**, **Netlify**,
or **Render** (static site):

1. Push this repo to GitHub.
2. Import it into Vercel/Netlify.
3. Set the same two environment variables (`VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`) in the hosting platform's dashboard.
4. Build command: `npm run build` — Output directory: `dist`.
