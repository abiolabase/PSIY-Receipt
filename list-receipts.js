const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function list() {
    const receipts = await prisma.receipt.findMany();
    console.log('Total Receipts:', receipts.length);
    receipts.forEach(r => {
        console.log(`ID: ${r.id}, Date: ${r.created_at.toISOString()}, Amount: ${r.amount}`);
    });
    await prisma.$disconnect();
}

list();
