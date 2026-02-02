####
Why Do we Need Indexes in Our Table?
For example, the "events" table in sqlite?
####

Short answer: **indexes make your queries fast**.
Long answer (the useful one): they’re how SQLite avoids scanning your *entire* `events` table every time you ask a question.

Let’s break it down in plain English, tied to *your* use case 👇

---

## What an INDEX actually is (mental model)

Think of your `events` table like a huge CSV file.

Without an index:

* SQLite reads **every row**, one by one, to find matches
  👉 *full table scan* 😬

With an index:

* SQLite has a **sorted lookup table** that points directly to matching rows
  👉 *log-time lookup* ⚡

Indexes trade:

* ✅ **Much faster reads**
* ❌ Slightly **slower inserts** (SQLite updates the index too)
* ❌ A bit more disk space

For an **event log system**, this trade is 100% worth it.

---

## Your indexes, explained one by one

### 1️⃣ `idx_events_time`

```sql
CREATE INDEX IF NOT EXISTS idx_events_time ON events(time);
```

**Used when you query by time ranges**

Example:

```sql
SELECT *
FROM events
WHERE time BETWEEN '2025-12-09T03:00:00Z' AND '2025-12-09T04:00:00Z';
```

Without this:

* SQLite scans **every event ever recorded**

With this:

* SQLite jumps directly to that time window

🔥 Critical for:

* Dashboards
* Event timelines
* “Last 5 minutes / last hour” analytics

---

### 2️⃣ `idx_events_jetson`

```sql
CREATE INDEX IF NOT EXISTS idx_events_jetson ON events(jetson_id);
```

**Used when filtering per device**

Example:

```sql
SELECT *
FROM events
WHERE jetson_id = 1;
```

🔥 Critical for:

* Multi-Jetson setups
* Debugging one site
* Per-edge-device rollups

Without it → full scan
With it → instant lookup

---

### 3️⃣ `idx_events_camera`

```sql
CREATE INDEX IF NOT EXISTS idx_events_camera ON events(camera_id);
```

**Used when filtering per camera**

Example:

```sql
SELECT *
FROM events
WHERE camera_id = 'cam_front';
```

🔥 Critical for:

* Camera-level metrics
* “Which camera is causing delays?”
* Zone analytics tied to a camera

---

### 4️⃣ `idx_events_entity` (COMPOSITE index 👀)

```sql
CREATE INDEX IF NOT EXISTS idx_events_entity
ON events(entity_id, event_kind);
```

This is a **multi-column index**.

It helps when queries include:

```sql
WHERE entity_id = 'queue_line'
  AND event_kind = 'zone';
```

🔥 Critical for:

* Zone-specific metrics
* Line-crossing logic
* Aggregations per zone/line

Why both columns?

* Same `entity_id` could exist as both `zone` and `line`
* This avoids collisions and keeps lookups tight

---

### 5️⃣ `idx_events_session`

```sql
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
```

**Used for session-based analytics**

Example:

```sql
SELECT *
FROM events
WHERE session_id = '157d3c4460c745858dcd6e059a82d734'
ORDER BY time;
```

🔥 Critical for:

* Dwell time calculations
* Entry → exit pairing
* Event replay / audit trail

Without this:

* SQLite must scan the whole table to reconstruct one session 🤢

---

## What happens if you DON’T add indexes?

With a few hundred rows → you won’t notice.

With **hundreds of thousands / millions of events**:

* Dashboards get slow
* Queries spike CPU
* SQLite feels “randomly laggy”
* Aggregations become painful

Indexes are how SQLite scales **read-heavy workloads**, which is exactly what analytics is.

---

## One important rule (so you don’t over-index)

❌ Don’t index columns you never filter on
❌ Don’t index everything “just in case”

You did this *correctly*:

* Indexed **filter columns**
* Not indexed large text blobs (`coords`)
* No useless indexes

---

## TL;DR

Your indexes:

* Prevent full table scans
* Make time-range queries fast
* Enable per-Jetson, per-camera, per-zone analytics
* Are essential for event replay + aggregation

If you want, next we can:

* Design **minute-level rollups**
* Add a **partial index** for hot data
* Show **EXPLAIN QUERY PLAN** so you can *see* the speedup
* Decide which indexes should exist **only locally vs cloud**

Just say the word 🚀
