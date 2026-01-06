const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
    prisma,
    User: prisma.user,
    Receipt: prisma.receipt,
    Tag: prisma.tag,
    ReceiptTag: prisma.receiptTag,
    Role: prisma.role,
    UserRole: prisma.userRole
};
