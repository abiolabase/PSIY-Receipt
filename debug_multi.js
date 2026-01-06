const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'multi@psiy.fi' },
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        });
        console.log('MULTI_USER_CHECK');
        console.log(JSON.stringify(user, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
