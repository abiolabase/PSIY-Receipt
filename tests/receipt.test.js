const request = require('supertest');
const app = require('../src/app');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Receipt API', () => {
    let buyerToken;
    let financeToken;
    let receiptId;

    beforeAll(async () => {
        // Login as Imam to upload
        const buyerRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'buyer@masjid.com',
                password: 'password123'
            });
        buyerToken = buyerRes.body.token;

        // Login as Finance to view/tag
        const financeRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'finance@masjid.com',
                password: 'password123'
            });
        financeToken = financeRes.body.token;
    });

    afterAll(async () => {
        if (receiptId) {
            await prisma.receiptTag.deleteMany({ where: { receipt_id: receiptId } });
            await prisma.receipt.delete({ where: { id: receiptId } });
        }
        await prisma.$disconnect();
    });

    describe('POST /api/receipts', () => {
        it('should create a new receipt with an image', async () => {
            const res = await request(app)
                .post('/api/receipts')
                .set('Authorization', `Bearer ${buyerToken}`)
                .field('amount', '123.45')
                .field('category', 'Maintenance')
                .field('payment_mode', 'cash')
                .field('note', 'Test receipt note')
                .attach('image', path.join(__dirname, 'test-receipt.jpg'));

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            receiptId = res.body.id;
        });
    });

    describe('GET /api/receipts', () => {
        it('should list receipts for Finance', async () => {
            const res = await request(app)
                .get('/api/receipts')
                .set('Authorization', `Bearer ${financeToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
        });

        it('should deny access to Imam for listing', async () => {
            const res = await request(app)
                .get('/api/receipts')
                .set('Authorization', `Bearer ${buyerToken}`);

            expect(res.statusCode).toEqual(403);
            expect(res.body.error).toContain('Insufficient permissions');
        });
    });

    describe('GET /api/receipts/:id', () => {
        it('should get receipt details for Finance', async () => {
            const res = await request(app)
                .get(`/api/receipts/${receiptId}`)
                .set('Authorization', `Bearer ${financeToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.id).toEqual(receiptId);
        });
    });

    describe('POST /api/receipts/:id/tag', () => {
        it('should tag a receipt for Finance', async () => {
            const res = await request(app)
                .post(`/api/receipts/${receiptId}/tag`)
                .set('Authorization', `Bearer ${financeToken}`)
                .send({
                    tagName: 'MonthlyReport',
                    month: '2023-10'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Receipt tagged successfully');
        });

        it('should deny access to Imam for tagging', async () => {
            const res = await request(app)
                .post(`/api/receipts/${receiptId}/tag`)
                .set('Authorization', `Bearer ${buyerToken}`)
                .send({
                    tagName: 'MonthlyReport'
                });

            expect(res.statusCode).toEqual(403);
        });
    });
});
