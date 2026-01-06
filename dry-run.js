try {
    console.log("Starting dry run...");
    console.log("Node version:", process.version);

    const supertest = require('supertest');
    console.log("Supertest loaded successfully");

    const app = require('./src/app');
    console.log("App loaded successfully");

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    console.log("PrismaClient instantiated");

    prisma.$connect().then(() => {
        console.log("Prisma connected successfully");
        process.exit(0);
    }).catch(err => {
        console.error("Prisma connection error:", err);
        process.exit(1);
    });

} catch (err) {
    console.error("CRITICAL ERROR during load:");
    console.error(err.message);
    console.error(err.stack);
    process.exit(1);
}
