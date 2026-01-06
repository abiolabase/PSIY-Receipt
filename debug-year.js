const request = require('supertest');
const app = require('./src/app');

async function debug() {
    const login = await request(app)
        .post('/auth/login')
        .send({ email: 'finance@masjid.com', password: 'password123' });
    const token = login.body.token;

    const res = await request(app)
        .get('/reports/year/2026')
        .set('Authorization', `Bearer ${token}`);

    console.log('Report Body:', JSON.stringify(res.body, null, 2));
}

debug();
