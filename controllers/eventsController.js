import { getDBConnection } from "../db/db.js";

export async function postEvent(req, res) {
    // Capture the POST parameters from the payload
    let {
            time, 
            jetson_id, 
            camera_id, 
            session_id, 
            track_id, 
            entity_id,
            entity_type,
            event_type,
            event_kind,
            current_count,
            cumulative_count,
            dwell_ms,
            coords
        } 
        = req.body;

    // Allowed Events So Far
    const eventTypes = ["zone_enter", "zone_exit", "line_cross"];

    // Basic required fields (adjust as needed)
    if (!time || !jetson_id || !camera_id || !session_id || !track_id || !entity_id || !event_type || !event_kind) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    // Check if event type exists or if valid event type
    if (!event_type || !eventTypes.includes(event_type)) {
        return res.status(400).json({ error: `Invalid event type ${event_type}.` });
    }

    try {
        // Connect to the sqlite DB
        const db = await getDBConnection();

        const result = await db.run(`
            INSERT INTO events (
                time, 
                jetson_id, 
                camera_id, 
                session_id, 
                track_id, 
                entity_id,
                entity_type,
                event_type,
                event_kind,
                current_count,
                cumulative_count,
                dwell_ms,
                coords
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                time, 
                jetson_id, 
                camera_id, 
                session_id ?? null, 
                track_id, 
                entity_id,
                entity_type ?? null,
                event_type,
                event_kind,
                current_count ?? null,
                cumulative_count ?? null,
                dwell_ms ?? null,
                coords ?? null
            ]
        );

        return res.status(201).json(
            { 
                message: `${event_type} event successfully inserted into the sqlite DB.`, 
                id: result?.lastID
            }
        );

        
    } catch (error) {
        console.error("Error posting Event: ", error.message);
        return res.status(500).json({ error: 'Posting event to sqlite failed.'});
    }
}

export async function getEvents(req, res) {
    try {
        const db = await getDBConnection();

        const { start, end, event_kind, event_type } = req.query;

        const where = [];
        const params =[];

        // Time range 
        if (start) {
            const startDate = new Date(start);
            if (Number.isNaN(startDate.getTime())) {
                return res.status(400).json({ error: "Invalid start format. Use ISO 8601."});
            }
            where.push("time >= ?");
            params.push(start);
        }

        if (end) {
            const endDate = new Date(end);
            if (Number.isNaN(endDate.getTime())) {
                return res.status(400).json({ error: "Invalid end format. Use ISO 8601."});
            }
            where.push("time <= ?");
            params.push(end)
        }

        if (start && end && new Date(start) > new Date(end)) {
            return res.status(400).json({ error: "start must be <= end." });
        }


        // Filters
        if (event_kind) {
            where.push("event_kind = ?");
            params.push(event_kind);
        }

        if (event_type) {
            where.push("event_type = ?");
            params.push(event_type);
        }

        const sql = `
            SELECT *
            FROM events
            ${where.length ? "WHERE " + where.join(" AND ") : ""}
            ORDER BY time DESC`
        ;

        const events = await db.all(sql, params);

        return res.status(200).json({
            message: "Successfully got events.",
            count: events.length,
            filters: { start, end, event_kind, event_type },
            events
        });


    } catch (error) {
        console.error("Error getting Event: ", error.message);
        return res.status(500).json({ error: 'Getting events from sqlite failed.'});
    }
}
