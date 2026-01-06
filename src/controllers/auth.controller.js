const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findUnique({
            where: { email },
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const roleNames = user.roles.map(ur => ur.role.name);

        const token = jwt.sign(
            { id: user.id, email: user.email, roles: roleNames },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, roles: roleNames });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
