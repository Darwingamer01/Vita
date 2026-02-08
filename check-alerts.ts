
import 'dotenv/config';
import { PrismaClient } from './src/generated/client/client';
const prisma = new PrismaClient();

async function check() {
    const alerts = await prisma.alert.findMany();
    console.log('Alerts:', JSON.stringify(alerts, null, 2));
    await prisma.$disconnect();
}

check().catch(console.error);
