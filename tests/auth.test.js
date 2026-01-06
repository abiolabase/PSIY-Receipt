const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Auth API', () => {
    beforeAll(async () => {
        console.log("Starting beforeAll...");
        // Ensure test data exists (can reuse seed or create specific test user)
        // For simplicity, we assume seed has been run.
        console.log("beforeAll finished.");
    });

    afterAll(async () => {
        console.log("Starting afterAll...");
        await prisma.$disconnect();
        console.log("afterAll finished.");
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'buyer@psiy.fi',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.roles).toContain('BUYER');
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('email', 'buyer@psiy.fi');
            expect(res.body.user).toHaveProperty('role', 'BUYER');
        });

        it('should fail with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'buyer@psiy.fi',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('error', 'Invalid email or password');
        });

        it('should fail with non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@psiy.fi',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('error', 'Invalid email or password');
        });
    });
});
