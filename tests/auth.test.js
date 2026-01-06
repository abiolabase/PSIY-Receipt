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
    describe('POST /api/auth/change-password', () => {
        let token;
        const testEmail = 'changepass@psiy.fi';
        const initialPassword = 'password123';

        beforeAll(async () => {
            // Clean up any existing user first
            const existingUser = await prisma.user.findUnique({ where: { email: testEmail } });
            if (existingUser) {
                await prisma.userRole.deleteMany({ where: { user_id: existingUser.id } });
                await prisma.user.delete({ where: { id: existingUser.id } });
            }

            // Create a dedicated user for password change tests
            const passwordHash = await require('bcryptjs').hash(initialPassword, 10);
            const user = await prisma.user.create({
                data: {
                    email: testEmail,
                    name: 'Change Pass User',
                    password_hash: passwordHash,
                    roles: {
                        create: {
                            role: {
                                connectOrCreate: {
                                    where: { name: 'BUYER' },
                                    create: { name: 'BUYER' }
                                }
                            }
                        }
                    }
                }
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testEmail,
                    password: initialPassword
                });
            token = res.body.token;
        });

        afterAll(async () => {
            const user = await prisma.user.findUnique({ where: { email: testEmail } });
            if (user) {
                await prisma.userRole.deleteMany({ where: { user_id: user.id } });
                await prisma.user.delete({ where: { id: user.id } });
            }
        });

        it('should change password successfully', async () => {
            const newPassword = 'newpassword123';
            const res = await request(app)
                .post('/api/auth/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: initialPassword,
                    newPassword: newPassword
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Password updated successfully');

            // Verify login with new password
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testEmail,
                    password: newPassword
                });
            expect(loginRes.statusCode).toEqual(200);

            // Revert password for cleanup/consistency (optional but good practice)
            // Actually cleanup deletes the user so it's fine.
        });

        it('should fail with invalid current password', async () => {
            const res = await request(app)
                .post('/api/auth/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: 'wrongpassword',
                    newPassword: 'newpassword123'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.error).toEqual('Invalid current password');
        });

        it('should fail with short new password', async () => {
            const res = await request(app)
                .post('/api/auth/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: initialPassword,
                    newPassword: 'short'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Password must be at least 6 characters long');
        });
    });
});
