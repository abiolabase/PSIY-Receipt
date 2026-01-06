import supertest from 'supertest';
import app from './src/app.js';
import { PrismaClient } from '@prisma/client';

console.log("Starting ESM dry run...");
console.log("Node version:", process.version);

try {
    console.log("Supertest loaded");
    console.log("App loaded");

    const prisma = new PrismaClient();
    console.log("Prisma instantiated");

    await prisma.$connect();
    console.log("Prisma connected");
    process.exit(0);
} catch (err) {
    console.error("ESM Dry Run Error:", err);
    process.exit(1);
}
