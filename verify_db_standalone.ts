
import { db } from './src/lib/db';

async function verify() {
    console.log("Verifying Database Access...");
    try {
        console.log("Fetching Requests...");
        const requests = await db.getAllRequests();
        console.log(`Success! Fetched ${requests.length} requests.`);
    } catch (error) {
        console.error("FATAL: Failed to fetch requests via db.getAllRequests()");
        console.error(error);
    }

    try {
        console.log("Fetching Resources...");
        const resources = await db.getAllResources();
        console.log(`Success! Fetched ${resources.length} resources.`);
    } catch (error) {
        console.error("FATAL: Failed to fetch resources via db.getAllResources()");
        console.error(error);
    }
}

verify();
