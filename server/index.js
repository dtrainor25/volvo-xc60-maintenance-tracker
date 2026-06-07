const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const db = new Database(path.join(__dirname, 'maintenance.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    mileage INTEGER NOT NULL,
    service_type TEXT NOT NULL,
    cost REAL DEFAULT 0,
    shop_name TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

const SCHEDULE = [
  { id: 1,  name: 'Oil & Filter Change',       interval_miles: 10000, interval_months: 12, phev: false },
  { id: 2,  name: 'Tire Rotation',              interval_miles: 7500,  interval_months: 6,  phev: false },
  { id: 3,  name: 'Cabin Air Filter',           interval_miles: 15000, interval_months: 12, phev: false },
  { id: 4,  name: 'Engine Air Filter',          interval_miles: 30000, interval_months: 24, phev: false },
  { id: 5,  name: 'Spark Plugs',                interval_miles: 60000, interval_months: 60, phev: false },
  { id: 6,  name: 'Brake Fluid Flush',          interval_miles: 30000, interval_months: 24, phev: false },
  { id: 7,  name: 'Coolant Flush',              interval_miles: 60000, interval_months: 60, phev: false },
  { id: 8,  name: 'Transmission Fluid',         interval_miles: 60000, interval_months: 48, phev: false },
  { id: 9,  name: 'Front Differential Fluid',   interval_miles: 45000, interval_months: 48, phev: false },
  { id: 10, name: 'Rear Differential Fluid',    interval_miles: 45000, interval_months: 48, phev: false },
  { id: 11, name: 'Brake Pad Inspection',       interval_miles: 20000, interval_months: 12, phev: false },
  { id: 12, name: 'Tire Inspection',            interval_miles: 12000, interval_months: 12, phev: false },
  { id: 13, name: 'Wheel Alignment',            interval_miles: 25000, interval_months: 24, phev: false },
  { id: 14, name: 'Wiper Blades',               interval_miles: null,  interval_months: 12, phev: false },
  { id: 15, name: '12V Battery Inspection',     interval_miles: null,  interval_months: 24, phev: false },
  { id: 16, name: 'PHEV Battery Check',         interval_miles: null,  interval_months: 12, phev: true  },
  { id: 17, name: 'EV Drive Motor Service',     interval_miles: 60000, interval_months: 60, phev: true  },
  { id: 18, name: 'Hybrid System Inspection',   interval_miles: null,  interval_months: 12, phev: true  },
  { id: 19, name: 'Charging System Check',      interval_miles: null,  interval_months: 12, phev: true  },
  { id: 20, name: 'Multi-Point Inspection',     interval_miles: null,  interval_months: 12, phev: false },
];

function addMonths(dateStr, months) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

const STATUS_ORDER = ['overdue', 'urgent', 'upcoming', 'ok'];

function worstStatus(a, b) {
  return STATUS_ORDER[Math.min(STATUS_ORDER.indexOf(a), STATUS_ORDER.indexOf(b))];
}

function computeSchedule() {
  const row = db.prepare('SELECT MAX(mileage) as m FROM services').get();
  const currentMileage = row?.m || 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return SCHEDULE.map(item => {
    const last = db.prepare(
      'SELECT MAX(mileage) as mileage, MAX(date) as date FROM services WHERE service_type = ?'
    ).get(item.name);

    const lastMileage = last?.mileage ?? null;
    const lastDate = last?.date ?? null;
    const neverServiced = lastMileage === null && lastDate === null;

    let nextDueMiles = null;
    if (item.interval_miles !== null) {
      nextDueMiles = (lastMileage ?? 0) + item.interval_miles;
    }

    let nextDueDate = null;
    if (item.interval_months !== null && lastDate) {
      nextDueDate = addMonths(lastDate, item.interval_months);
    }

    if (neverServiced) {
      return {
        ...item,
        last_mileage: null,
        last_date: null,
        next_due_miles: nextDueMiles,
        next_due_date: null,
        status: 'unknown',
        current_mileage: currentMileage,
      };
    }

    let mileStatus = 'ok';
    if (nextDueMiles !== null) {
      const milesLeft = nextDueMiles - currentMileage;
      if (milesLeft <= 0) mileStatus = 'overdue';
      else if (milesLeft <= 1000) mileStatus = 'urgent';
      else if (milesLeft <= 3000) mileStatus = 'upcoming';
    }

    let dateStatus = 'ok';
    if (nextDueDate !== null) {
      const dueDate = new Date(nextDueDate + 'T00:00:00');
      const daysLeft = Math.floor((dueDate - today) / 86400000);
      if (daysLeft <= 0) dateStatus = 'overdue';
      else if (daysLeft <= 30) dateStatus = 'urgent';
      else if (daysLeft <= 90) dateStatus = 'upcoming';
    }

    return {
      ...item,
      last_mileage: lastMileage,
      last_date: lastDate,
      next_due_miles: nextDueMiles,
      next_due_date: nextDueDate,
      status: worstStatus(mileStatus, dateStatus),
      current_mileage: currentMileage,
    };
  });
}

app.get('/api/services', (req, res) => {
  res.json(db.prepare('SELECT * FROM services ORDER BY date DESC, id DESC').all());
});

app.post('/api/services', (req, res) => {
  const records = Array.isArray(req.body) ? req.body : [req.body];
  const stmt = db.prepare(
    'INSERT INTO services (date, mileage, service_type, cost, shop_name, notes) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertAll = db.transaction(recs =>
    recs.map(r =>
      stmt.run(r.date, +r.mileage, r.service_type, +r.cost || 0, r.shop_name || '', r.notes || '').lastInsertRowid
    )
  );
  const ids = insertAll(records);
  res.status(201).json({ inserted: ids.length, ids });
});

app.delete('/api/services/:id', (req, res) => {
  const info = db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  info.changes ? res.json({ deleted: true }) : res.status(404).json({ error: 'Not found' });
});

app.get('/api/mileage', (req, res) => {
  const r = db.prepare('SELECT MAX(mileage) as current_mileage FROM services').get();
  res.json({ current_mileage: r?.current_mileage || 0 });
});

app.get('/api/schedule', (req, res) => {
  res.json(computeSchedule());
});

const dist = path.join(__dirname, '../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
