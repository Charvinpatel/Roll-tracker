# 🎯 RollTrack — Roll Inventory Management System

A full MERN stack app to manage filled roll dispatches to vendors and track empty roll returns.

---

## 📁 Project Structure

```
roll-manager/
├── server/                  # Express + MongoDB backend
│   ├── models/
│   │   ├── Vendor.js
│   │   ├── Dispatch.js
│   │   ├── Return.js
│   │   └── Inventory.js
│   ├── routes/
│   │   ├── vendors.js
│   │   ├── dispatches.js
│   │   ├── returns.js
│   │   └── inventory.js
│   ├── index.js
│   ├── .env
│   └── package.json
│
├── client/                  # React frontend
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx      ← Live stats + vendor overview
│       │   ├── Vendors.jsx        ← Manage vendors
│       │   ├── Dispatches.jsx     ← Track filled roll dispatches
│       │   ├── Returns.jsx        ← Track empty roll returns
│       │   └── StockSettings.jsx  ← Set total stock count
│       ├── components/
│       │   ├── VendorModal.jsx
│       │   ├── DispatchModal.jsx
│       │   ├── ReturnModal.jsx
│       │   └── DateEditModal.jsx  ← Inline date edit
│       └── utils/
│           └── api.js             ← Axios API calls
│
└── package.json             # Root: runs both together
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js (v16+)
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI

### 1. Install dependencies
```bash
npm run install-all
```

### 2. Configure environment
Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/roll-manager
```
For MongoDB Atlas, replace with your Atlas connection string.

### 3. Run development servers
```bash
npm run dev
```
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

---

## ✅ Features

| Feature | Description |
|---|---|
| **Dashboard** | Live stats: total stock, rolls with vendors, available, total returns |
| **Vendor Management** | Add/edit/delete vendors with per-vendor roll stats |
| **Dispatch Tracking** | Record filled rolls sent to each vendor with date & quantity |
| **Return Tracking** | Record empty rolls returned, validates against vendor balance |
| **Date Editing** | Click any date in tables to manually edit dispatch/return date |
| **Vendor Filter** | Filter dispatches & returns by vendor |
| **Quick Dispatch** | Dispatch directly from Dashboard or Vendor card |
| **Auto Calculation** | Available rolls = Total Stock − (Total Dispatched − Total Returned) |
| **Vendor Balance** | Each vendor shows: sent, returned, currently holding |
| **Return Validation** | Cannot return more rolls than vendor currently holds |
| **Stock Settings** | Update total roll stock count anytime |

---

## 🔌 API Endpoints

### Vendors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/vendors` | Get all vendors |
| GET | `/api/vendors/:id` | Get vendor with stats |
| POST | `/api/vendors` | Create vendor |
| PUT | `/api/vendors/:id` | Update vendor |
| DELETE | `/api/vendors/:id` | Delete vendor |

### Dispatches
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dispatches?vendor=id` | Get all (filter by vendor) |
| POST | `/api/dispatches` | Create dispatch |
| PUT | `/api/dispatches/:id` | Update dispatch / edit date |
| DELETE | `/api/dispatches/:id` | Delete dispatch |

### Returns
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/returns?vendor=id` | Get all (filter by vendor) |
| POST | `/api/returns` | Record return |
| PUT | `/api/returns/:id` | Update return / edit date |
| DELETE | `/api/returns/:id` | Delete return |

### Inventory
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/inventory/summary` | Full dashboard stats |
| GET | `/api/inventory` | Current stock setting |
| POST | `/api/inventory` | Set total stock count |

---

## 🧮 Core Logic

```
Available Rolls = Total Stock − (Total Dispatched − Total Returned)
Vendor Holding  = Vendor Total Dispatched − Vendor Total Returned
```

All calculations are **dynamic** — updating any dispatch or return immediately recalculates all stats.
