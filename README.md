# ShopSphere — Full-Stack E-Commerce Management Platform

A complete, production-style e-commerce platform with customer shopping, vendor product
management, and an admin analytics dashboard. Built as a resume/portfolio project.

## Tech Stack

- **Frontend:** React 18 (Vite), React Router, Tailwind CSS, Recharts, Axios, lucide-react
- **Backend:** Node.js, Express
- **Database:** SQLite (via better-sqlite3) — zero external DB setup required
- **Auth:** JWT + bcrypt password hashing
- **Validation:** express-validator on every mutating endpoint

## Features

- Customer: browse/search/filter/sort products, product detail with reviews, cart,
  multi-step checkout (shipping + payment method), order history, ratings/reviews
  (restricted to verified purchasers)
- Vendor: manage their own product catalog (create/edit/soft-delete)
- Admin: full product & order management, order status pipeline, revenue/analytics
  dashboard with charts (14-day revenue trend, top products, low-stock alerts),
  customer/role management
- Security: JWT auth, bcrypt hashing, role-based route protection (customer/vendor/admin),
  server-side validation on every input, stock checks enforced at cart + checkout time,
  SQL parameterization throughout (no injection surface)

## Demo accounts (after seeding)

| Role     | Email                     | Password    |
|----------|---------------------------|-------------|
| Admin    | admin@shopsphere.com      | admin123    |
| Vendor   | vendor@shopsphere.com     | vendor123   |
| Customer | customer@shopsphere.com   | customer123 |

## Running locally

### 1. Backend

```bash
cd backend
npm install
npm run seed     # creates & populates store.db with demo accounts + 16 products
npm start         # runs on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev       # runs on http://localhost:5173
```

Open http://localhost:5173 in your browser. The frontend is pre-configured (see
`frontend/.env`) to talk to the backend at `http://localhost:4000/api`.

## Deploying for a live public URL

This project has no external dependencies beyond Node.js, so it deploys easily on free tiers:

**Backend (Render.com — free tier):**
1. Push this repo to GitHub.
2. On Render: New → Web Service → connect the repo → root directory `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add an environment variable `JWT_SECRET` with any long random string.
5. Render gives you a URL like `https://your-app.onrender.com`.

**Frontend (Vercel or Netlify — free tier):**
1. Import the same repo, set root directory to `frontend`.
2. Build command: `npm run build`, output directory: `dist`.
3. Add an environment variable `VITE_API_URL` = `https://your-app.onrender.com/api`
   (your Render backend URL from above, with `/api` appended).
4. Deploy — you'll get a live URL like `https://your-app.vercel.app`.

That's it — two free-tier deployments and you have a live, working, public URL.

## Project structure

```
ecommerce-platform/
├── backend/
│   ├── server.js          # Express app entry point
│   ├── seed.js            # Demo data seeder
│   ├── db/init.js         # SQLite schema
│   ├── middleware/auth.js # JWT auth + role guards
│   └── routes/            # auth, products, cart, orders, admin
└── frontend/
    └── src/
        ├── pages/         # Home, ProductDetail, Cart, Checkout, Orders, Login, Register, AdminDashboard
        ├── components/    # Navbar, ProductCard, ProtectedRoute
        ├── context/       # AuthContext, CartContext
        └── api.js         # Axios client
```
