const { Receipt, Tag, ReceiptTag } = require('../models');

exports.createReceipt = async (req, res) => {
    try {
        const { amount, category, payment_mode, note } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Receipt image is required' });
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount)) {
            return res.status(400).json({ error: 'Invalid amount format' });
        }

        // Normalize payment mode to uppercase for enum compatibility
        const normalizedMode = payment_mode ? payment_mode.toUpperCase() : 'CASH';

        const receipt = await Receipt.create({
            data: {
                amount: parsedAmount,
                category: category || 'General',
                payment_mode: normalizedMode,
                note: note || '',
                image_url: req.file.path,
                uploaded_by: req.user.id,
            },
        });

        res.status(201).json(receipt);
    } catch (error) {
        console.error('SERVER ERROR [createReceipt]:', error);
        res.status(500).json({
            error: 'Failed to upload receipt',
            details: error.message
        });
    }
};

exports.getAllReceipts = async (req, res) => {
    try {
        const { search } = req.query;

        let whereClause = {};
        if (search) {
            whereClause = {
                OR: [
                    { note: { contains: search, mode: 'insensitive' } },
                    { category: { contains: search, mode: 'insensitive' } },
                    {
                        tags: {
                            some: {
                                tag: {
                                    name: { contains: search, mode: 'insensitive' }
                                }
                            }
                        }
                    }
                ]
            };
        }

        const receipts = await Receipt.findMany({
            where: whereClause,
            include: {
                uploader: {
                    select: { name: true, email: true }
                },
                tags: {
                    include: {
                        tag: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(receipts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch receipts' });
    }
};

exports.getReceiptById = async (req, res) => {
    try {
        const receipt = await Receipt.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                uploader: { select: { name: true, email: true } },
                tags: { include: { tag: true } }
            }
        });

        if (!receipt) return res.status(404).json({ error: 'Receipt not found' });
        res.json(receipt);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch receipt' });
    }
};

exports.tagReceipt = async (req, res) => {
    const { tagName, month } = req.body;
    const receiptId = parseInt(req.params.id);

    try {
        // Find or create tag
        let tag = await Tag.findFirst({
            where: { name: tagName, month: month || null }
        });

        if (!tag) {
            tag = await Tag.create({
                data: { name: tagName, month: month || null }
            });
        }

        // Link tag to receipt
        // Use upsert or ignore if already exists, but prisma 'create' on relation with @@id will throw if exists.
        // Better to check existence or use connectOrCreate if simple.
        // Assuming we want to just add it.

        // Check if relation exists
        const existing = await ReceiptTag.findUnique({
            where: {
                receipt_id_tag_id: {
                    receipt_id: receiptId,
                    tag_id: tag.id
                }
            }
        });

        if (!existing) {
            await ReceiptTag.create({
                data: {
                    receipt_id: receiptId,
                    tag_id: tag.id
                }
            });
        }

        res.json({ message: 'Receipt tagged successfully', tag });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to tag receipt' });
    }
};
