import { getDBConnection } from "./db/db.js";

async function createEventsTable() {
    const db = await getDBConnection();

    await db.exec(`
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            time TEXT NOT NULL,             -- ISO timestamp
            jetson_id INTEGER NOT NULL,
            camera_id TEXT NOT NULL,

            session_id TEXT,
            track_id INTEGER NOT NULL,

            entity_id TEXT NOT NULL,        -- zone_id or line_id (generic)
            entity_type TEXT,               -- zone_type for zones; Null for lines
            event_type TEXT NOT NULL,       -- zone_enter | zone_exit | line_cross
            event_kind TEXT NOT NULL,       -- zone | line

            current_count INTEGER,
            cumulative_count INTEGER,
            dwell_ms INTEGER,

            coords TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_events_time
            ON events(time);

        CREATE INDEX IF NOT EXISTS idx_events_jetson
            ON events(jetson_id);

        CREATE INDEX IF NOT EXISTS idx_events_camera
            ON events(camera_id);

        CREATE INDEX IF NOT EXISTS idx_events_entity
            ON events(entity_id, event_kind);

        CREATE INDEX IF NOT EXISTS idx_events_session
            ON events(session_id);
    `);

    await db.close();
    console.log('Events table created successfully');
}

async function createPolygonsTable() {
    const db = await getDBConnection();

    await db.exec(`
        
    `);

    await db.close();
    console.log('Polygons table created successfully');
}

createEventsTable();