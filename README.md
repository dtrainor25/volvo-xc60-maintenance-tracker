# Volvo XC60 T8 Maintenance Tracker

Personal maintenance tracker for a 2021 Volvo XC60 T8 Recharge plug-in hybrid.

## Features

- **Dashboard** — current mileage, overdue/urgent alerts, upcoming maintenance, recent services
- **Service History** — full log with search, cost totals, delete
- **Add Service** — form with Volvo-specific service types; batch import via API
- **Maintenance Schedule** — 20 manufacturer-based intervals with overdue/urgent/upcoming/ok status, PHEV items tagged

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + React Router
- **Backend:** Node.js + Express + SQLite (better-sqlite3)

## Running locally

```bash
# Install dependencies
cd server && npm install && cd ..
cd client && npm install && cd ..

# Dev mode (backend :3001, frontend :5173 with proxy)
./start.sh

# Production build
./start.sh --prod
```

Open **http://localhost:5173** in your browser.

## Batch import

To import multiple service records at once:

```bash
curl -X POST http://localhost:3001/api/services \
  -H "Content-Type: application/json" \
  -d '[
    {"date":"2024-01-15","mileage":50000,"service_type":"Oil & Filter Change","cost":199,"shop_name":"Volvo Cars","notes":""},
    {"date":"2024-01-15","mileage":50000,"service_type":"Tire Rotation","cost":0,"shop_name":"Volvo Cars","notes":""}
  ]'
```
