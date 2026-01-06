const request = require('supertest');
const app = require('../src/app');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Receipt API', () => {
    let imamToken;
    let financeToken;
    let receiptId;

    beforeAll(async () => {
        // Login as Imam to upload
        const imamRes = await request(app)
            .post('/auth/login')
            .send({
                email: 'imam@masjid.com',
                password: 'password123'
            });
        imamToken = imamRes.body.token;

        // Login as Finance to view/tag
        const financeRes = await request(app)
            .post('/auth/login')
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

    describe('POST /receipts', () => {
        it('should create a new receipt with an image', async () => {
            const res = await request(app)
                .post('/receipts')
                .set('Authorization', `Bearer ${imamToken}`)
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

    describe('GET /receipts', () => {
        it('should list receipts for Finance', async () => {
            const res = await request(app)
                .get('/receipts')
                .set('Authorization', `Bearer ${financeToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
        });

        it('should deny access to Imam for listing', async () => {
            const res = await request(app)
                .get('/receipts')
                .set('Authorization', `Bearer ${imamToken}`);

            expect(res.statusCode).toEqual(403);
            expect(res.body.error).toContain('Insufficient permissions');
        });
    });

    describe('GET /receipts/:id', () => {
        it('should get receipt details for Finance', async () => {
            const res = await request(app)
                .get(`/receipts/${receiptId}`)
                .set('Authorization', `Bearer ${financeToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.id).toEqual(receiptId);
        });
    });

    describe('POST /receipts/:id/tag', () => {
        it('should tag a receipt for Finance', async () => {
            const res = await request(app)
                .post(`/receipts/${receiptId}/tag`)
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
                .post(`/receipts/${receiptId}/tag`)
                .set('Authorization', `Bearer ${imamToken}`)
                .send({
                    tagName: 'MonthlyReport'
                });

            expect(res.statusCode).toEqual(403);
        });
    });
});
