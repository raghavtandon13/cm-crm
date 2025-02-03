import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { db } from "../../lib/db.ts";
const csvFilePath = path.join(__dirname, "../lib/Attendance.csv");

async function addAttendance() {
    const attendanceData = [];

    // Read and parse the CSV file
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on("data", async (row) => {
            attendanceData.push(row);
        })
        .on("end", async () => {
            console.log("CSV file successfully processed");
            await processAttendanceData(attendanceData);
        });
}

async function processAttendanceData(data) {
    for (const row of data) {
        const agentId = row["Agent ID"];
        if (!agentId) continue;

        for (const [date, status] of Object.entries(row)) {
            if (date === "Name" || date === "Agent ID" || !status) continue;

            const attendanceDate = new Date(new Date(date.split("-").reverse().join("-")).getTime() + 5.5 * 60 * 60 * 1000); // Convert date to YYYY-MM-DD format and add 5.30 hrs to make IST

            try {
                await db.agentAttendance.deleteMany({
                    where: {
                        agentId: agentId,
                        date: attendanceDate,
                    },
                });
                await db.agentAttendance.create({
                    data: {
                        agentId: agentId,
                        date: attendanceDate,
                        type: status,
                    },
                });
                console.log(`Attendance for agent ${row["Name"]} on ${attendanceDate} added successfully.`);
            } catch (error) {
                console.error(`Error adding attendance for agent ${row["Name"]} on ${attendanceDate}:`, error);
            }
        }
    }
}

addAttendance().catch((error) => {
    console.error("Error processing attendance data:", error);
});
