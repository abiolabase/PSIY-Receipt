const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles.map(ur => ur.role.name),
            created_at: user.created_at
        }));

        res.json(formattedUsers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

exports.createUser = async (req, res) => {
    const { name, email, password, roles } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Find role IDs
        const rolesData = await prisma.role.findMany({
            where: { name: { in: roles } }
        });

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password_hash: hashedPassword,
                roles: {
                    create: rolesData.map(role => ({
                        role: { connect: { id: role.id } }
                    }))
                }
            },
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles.map(ur => ur.role.name),
            created_at: user.created_at
        });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Failed to create user' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        // Delete user roles first
        await prisma.userRole.deleteMany({
            where: { user_id: parseInt(id) }
        });

        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
