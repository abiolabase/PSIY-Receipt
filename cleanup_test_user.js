const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
    try {
        const user = await prisma.user.findUnique({ where: { email: 'changepass@psiy.fi' } });
        if (user) {
            await prisma.userRole.deleteMany({ where: { user_id: user.id } });
            await prisma.user.delete({ where: { id: user.id } });
        }
        console.log('Cleaned up changepass@psiy.fi');
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

clean();
