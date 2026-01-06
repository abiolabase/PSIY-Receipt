const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('password123', 10);

    // 1. Seed Roles
    const roles = ['BUYER', 'FINANCE', 'AUDITOR', 'ADMIN'];
    const roleMap = {};
    for (const roleName of roles) {
        roleMap[roleName] = await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName },
        });
    }


    // Seed Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@psiy.fi' },
        update: {},
        create: {
            email: 'admin@psiy.fi',
            name: 'Admin',
            password_hash: password,
            roles: {
                create: [{ role_id: roleMap['ADMIN'].id }]
            }
        },
    });

    // 2. Seed Buyer User - DISABLED
    /*
    const buyer = await prisma.user.upsert({
        where: { email: 'buyer@psiy.fi' },
        update: {},
        create: {
            email: 'buyer@psiy.fi',
            name: 'Buyer',
            password_hash: password,
            roles: {
                create: [{ role_id: roleMap['BUYER'].id }]
            }
        },
    });

    // 3. Seed Finance User - DISABLED
    const finance = await prisma.user.upsert({
        where: { email: 'finance@psiy.fi' },
        update: {},
        create: {
            email: 'finance@psiy.fi',
            name: 'Finance',
            password_hash: password,
            roles: {
                create: [{ role_id: roleMap['FINANCE'].id }]
            }
        },
    });

    // 4. Seed Auditor User - DISABLED
    const auditor = await prisma.user.upsert({
        where: { email: 'auditor@psiy.fi' },
        update: {},
        create: {
            email: 'auditor@psiy.fi',
            name: 'Auditor',
            password_hash: password,
            roles: {
                create: [{ role_id: roleMap['AUDITOR'].id }]
            }
        },
    });

    // 6. Seed a Multi-Role User (Buyer + Finance) - DISABLED
    const multiRoleUser = await prisma.user.upsert({
        where: { email: 'multi@psiy.fi' },
        update: {},
        create: {
            email: 'multi@psiy.fi',
            name: 'Multi Role User',
            password_hash: password,
            roles: {
                create: [{ role_id: roleMap['BUYER'].id }, { role_id: roleMap['FINANCE'].id }]
            }
        },
    });
    */

    console.log("Seeding completed (Admin only)!");
    console.log({ admin });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
