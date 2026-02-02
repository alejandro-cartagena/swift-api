import fs from "fs";

const events = JSON.parse(fs.readFileSync("../events_100.json"));

for (const event of events) {
    await fetch("http://localhost:8000/api/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event)
    });
}

console.log("Events populated successfully")
