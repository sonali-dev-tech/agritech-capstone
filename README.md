# 🌾 AgriTech – Empowering Farmers Through Digital Technology

A full-stack MERN application that helps farmers monitor crops, check weather and soil health, buy farm resources and track orders. Admins manage users, products and order fulfilment.

## Portal Epics → Features

| # | Epic | Where |
|---|------|-------|
| 1 | Authentication & role-based access (Farmer / Admin, JWT, bcrypt) | `/login`, `/register`, `middleware/auth.js` |
| 2 | Farm & soil health management | `/farms`, Farm model |
| 3 | Crop monitoring (health metrics, growth stage, pest alerts) | `/crops`, Crop model |
| 4 | Weather forecast & soil reports (simulated weather + advisory) | `/weather`, WeatherData model |
| 5 | Marketplace – resource purchasing (stock-safe checkout) | `/marketplace`, Product & Order models |
| 6 | Order tracking & admin management (status flow, stats, users) | `/orders`, `/admin` |

## Tech Stack
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs
- **Frontend:** React 18 (Vite), React Router 6, Axios, Bootstrap 5

## Project Structure
```
agritech/
├── backend/
│   ├── server.js            # Express app, port 5000
│   ├── seed.js              # demo data
│   ├── config/db.js
│   ├── middleware/          # auth (protect, authorize), error handler
│   ├── models/              # User, Farm, Crop, Product, Order, WeatherData
│   ├── controllers/
│   ├── routes/
│   └── utils/
└── frontend/
    ├── index.html
    └── src/
        ├── api/axios.js     # Axios instance + JWT interceptor
        ├── context/         # AuthContext
        ├── components/      # NavBar, ProtectedRoute, Feedback
        └── pages/           # Login, Register, dashboards, Farms, CropMonitoring,
                             # WeatherSoil, Marketplace, Orders
```

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env      # then edit values (see below)
npm run seed              # optional: demo admin, farmer, farm, crop, products
npm run dev               # http://localhost:5000  (use `npm start` for production)
```
Check: http://localhost:5000/api/health

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev               # http://localhost:5173
```

### Demo accounts (after `npm run seed`)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@agritech.com | admin123 |
| Farmer | farmer@agritech.com | farmer123 |

> Public registration only creates **Farmer** accounts. Admins are created by seed script or directly in the database.

## Environment Variables

**backend/.env**
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/agritech
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
**frontend/.env**
```env
VITE_API_URL=http://localhost:5000/api
```
`CLIENT_URL` accepts a comma-separated list of allowed origins (CORS).

## API Reference
All routes except `/auth/register` and `/auth/login` require `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register farmer |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Any | Current user |
| GET/POST | `/api/farms` | Any | List (own; admin: all) / create |
| GET/PUT/DELETE | `/api/farms/:id` | Owner/Admin | Farm detail / update / delete |
| GET/POST | `/api/crops` | Any | List / create (`?farm=<id>` filter) |
| GET/PUT/DELETE | `/api/crops/:id` | Owner/Admin | Crop detail / update / delete |
| POST | `/api/crops/:id/alerts` | Owner/Admin | Report pest alert |
| PATCH | `/api/crops/:id/alerts/:alertId/resolve` | Owner/Admin | Resolve alert |
| GET | `/api/products` | Any | Browse (`?category=&search=`) |
| POST/PUT/DELETE | `/api/products[/:id]` | Admin | Manage catalogue |
| POST | `/api/orders` | Farmer | Place order `{items:[{productId,quantity}],shippingAddress,paymentMethod}` |
| GET | `/api/orders/my` | Any | My orders |
| GET | `/api/orders` | Admin | All orders |
| GET | `/api/orders/:id` | Owner/Admin | Order detail |
| PATCH | `/api/orders/:id/status` | Admin | Placed → Confirmed → Shipped → Delivered / Cancelled |
| PATCH | `/api/orders/:id/cancel` | Farmer | Cancel own order (only while Placed) |
| GET | `/api/weather?location=Pune` | Any | Simulated forecast + advisory (cached 1h per location) |
| GET | `/api/weather/history` | Admin | Recent weather lookups |
| GET | `/api/admin/stats` | Admin | Platform statistics |
| GET | `/api/admin/users` | Admin | All users |
| DELETE | `/api/admin/users/:id` | Admin | Delete farmer + their data |

## Design Notes
- Passwords hashed with bcrypt (pre-save hook); never returned (`select: false`).
- Ownership checks on farms, crops and orders; admin can access all.
- Stock reserved atomically per item (`findOneAndUpdate` with `$gte`) and restored on failure or cancellation – works on standalone MongoDB.
- Weather is **simulated** (seeded by location + hour). To use a real provider, replace `simulate()` in `controllers/weatherController.js`.

## Production Build
```bash
cd frontend && npm run build      # outputs frontend/dist
```
Deploy `backend` (Render, Railway, etc.) with the env vars above and MongoDB Atlas; deploy `frontend/dist` (Netlify, Vercel) with `VITE_API_URL` pointing to the deployed API. Set backend `CLIENT_URL` to the frontend URL.

## Links
- **GitHub Repository:** `https://github.com/<your-username>/agritech`  ← _add your link_
- **Live Demo (Frontend):** `https://<your-app>.netlify.app`  ← _add your link_
- **Live API (Backend):** `https://<your-api>.onrender.com/api/health`  ← _add your link_

## License
MIT
