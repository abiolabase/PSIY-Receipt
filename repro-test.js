const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        console.log("Testing Receipt creation...");

        // Find the seeded buyer user
        const user = await prisma.user.findFirst({ where: { email: 'buyer@psiy.fi' } });
        if (!user) {
            console.error("Test user not found. Please seed the database first.");
            return;
        }

        const data = {
            amount: 50.00,
            category: "Maintenance",
            payment_mode: "cash", // Testing lower case
            note: "Reproduction test - case sensitivity",
            image_url: "uploads/receipts/test.jpg",
            uploaded_by: user.id,
        };

        console.log("Attempting to create receipt with data:", data);
        const receipt = await prisma.receipt.create({ data });
        console.log("Success! Receipt created:", receipt);

    } catch (error) {
        console.error("Prisma error caught:");
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
