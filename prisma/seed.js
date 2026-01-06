const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('password123', 10);

    // 1. Seed Roles
    const roles = ['IMAM', 'FINANCE', 'AUDITOR'];
    const roleMap = {};
    for (const roleName of roles) {
        roleMap[roleName] = await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName },
        });
    }

    // 2. Seed Imam User
    const imam = await prisma.user.upsert({
        where: { email: 'imam@masjid.com' },
        update: {},
        create: {
            email: 'imam@masjid.com',
            name: 'Imam User',
            password_hash: password,
            roles: {
                create: [{ role_id: roleMap['IMAM'].id }]
            }
        },
    });

    // 3. Seed Finance User
    const finance = await prisma.user.upsert({
        where: { email: 'finance@masjid.com' },
        update: {},
        create: {
            email: 'finance@masjid.com',
            name: 'Finance User',
            password_hash: password,
            roles: {
                create: [{ role_id: roleMap['FINANCE'].id }]
            }
        },
    });

    // 4. Seed Auditor User
    const auditor = await prisma.user.upsert({
        where: { email: 'auditor@masjid.com' },
        update: {},
        create: {
            email: 'auditor@masjid.com',
            name: 'Auditor User',
            password_hash: password,
            roles: {
                create: [{ role_id: roleMap['AUDITOR'].id }]
            }
        },
    });

    // 5. Seed a Multi-Role User (Imam + Finance)
    const multiRoleUser = await prisma.user.upsert({
        where: { email: 'multi@masjid.com' },
        update: {},
        create: {
            email: 'multi@masjid.com',
            name: 'Multi Role User',
            password_hash: password,
            roles: {
                create: [
                    { role_id: roleMap['IMAM'].id },
                    { role_id: roleMap['FINANCE'].id }
                ]
            }
        },
    });

    console.log("Seeding completed!");
    console.log({ imam, finance, auditor, multiRoleUser });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
