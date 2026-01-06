const request = require('supertest');
const app = require('../src/app');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Report API', () => {
    let financeToken;
    let receiptId;
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    beforeAll(async () => {
        // Login as Finance
        const financeRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'finance@masjid.com',
                password: 'password123'
            });
        financeToken = financeRes.body.token;

        // Login as Buyer to create test data
        const buyerRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'buyer@masjid.com',
                password: 'password123'
            });
        const buyerToken = buyerRes.body.token;

        // Create a receipt to report on
        const res = await request(app)
            .post('/api/receipts')
            .set('Authorization', `Bearer ${buyerToken}`)
            .field('amount', '500.00')
            .field('category', 'Construction')
            .field('note', 'Report test receipt')
            .attach('image', path.join(__dirname, 'test-receipt.jpg'));

        receiptId = res.body.id;

        // Tag it for event report
        await request(app)
            .post(`/api/receipts/${receiptId}/tag`)
            .set('Authorization', `Bearer ${financeToken}`)
            .send({
                tagName: 'Renovation2023',
                month: '2023-10'
            });
    });

    afterAll(async () => {
        if (receiptId) {
            await prisma.receiptTag.deleteMany({ where: { receipt_id: receiptId } });
            await prisma.receipt.delete({ where: { id: receiptId } });
        }
        await prisma.$disconnect();
    });

    describe('GET /api/reports/month/:month', () => {
        it('should get monthly report for Finance', async () => {
            const res = await request(app)
                .get(`/api/reports/month/${currentMonth}`)
                .set('Authorization', `Bearer ${financeToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('totalAmount');
            expect(res.body.count).toBeGreaterThan(0);
        });

        it('should fail with invalid month format', async () => {
            const res = await request(app)
                .get('/api/reports/month/2023-13')
                .set('Authorization', `Bearer ${financeToken}`);

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('GET /api/reports/year/:year', () => {
        it('should get yearly report for Finance', async () => {
            const currentYear = new Date().getFullYear().toString();
            const res = await request(app)
                .get(`/api/reports/year/${currentYear}`)
                .set('Authorization', `Bearer ${financeToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.year).toEqual(currentYear);
            expect(res.body.totalAmount).toBeGreaterThan(0);
        });
    });

    describe('Excel Exports', () => {
        it('should export monthly Excel report', async () => {
            const res = await request(app)
                .get(`/api/reports/export/month/${currentMonth}`)
                .set('Authorization', `Bearer ${financeToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.headers['content-type']).toContain('spreadsheetml.sheet');
        });

        it('should export yearly Excel report', async () => {
            const currentYear = new Date().getFullYear().toString();
            const res = await request(app)
                .get(`/api/reports/export/year/${currentYear}`)
                .set('Authorization', `Bearer ${financeToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.headers['content-type']).toContain('spreadsheetml.sheet');
        });
    });

    describe('GET /api/reports/event/:eventName', () => {
        it('should get event report for Finance', async () => {
            const res = await request(app)
                .get('/api/reports/event/Renovation2023')
                .set('Authorization', `Bearer ${financeToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.event).toEqual('Renovation2023');
        });
    });

    describe('Multi-Role Access', () => {
        let multiToken;

        beforeAll(async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'multi@masjid.com',
                    password: 'password123'
                });
            multiToken = res.body.token;
        });

        it('should allow multi-role user to upload (Buyer role)', async () => {
            const res = await request(app)
                .post('/api/receipts')
                .set('Authorization', `Bearer ${multiToken}`)
                .field('amount', '10.00')
                .field('category', 'Test')
                .attach('image', path.join(__dirname, 'test-receipt.jpg'));

            expect(res.statusCode).toEqual(201);
            // Cleanup
            await prisma.receipt.delete({ where: { id: res.body.id } });
        });

        it('should allow multi-role user to view reports (Finance role)', async () => {
            const res = await request(app)
                .get('/api/reports/dashboard')
                .set('Authorization', `Bearer ${multiToken}`);

            expect(res.statusCode).toEqual(200);
        });
    });

    describe('GET /api/reports/dashboard', () => {
        it('should get dashboard stats for Finance', async () => {
            const res = await request(app)
                .get('/api/reports/dashboard')
                .set('Authorization', `Bearer ${financeToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('monthTotal');
            expect(res.body).toHaveProperty('categoryStats');
        });
    });
});

