const { Receipt, Tag } = require('../models');
const ExcelService = require('../services/excel.service');

exports.getMonthlyReport = async (req, res) => {
    const { month } = req.params; // YYYY-MM

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
    }

    const [year, monthStr] = month.split('-').map(Number);
    const startDate = new Date(Date.UTC(year, monthStr - 1, 1));
    const endDate = new Date(Date.UTC(year, monthStr, 0, 23, 59, 59, 999));

    try {
        const aggregations = await Receipt.aggregate({
            _sum: { amount: true },
            where: { created_at: { gte: startDate, lte: endDate } },
        });

        const receipts = await Receipt.findMany({
            where: { created_at: { gte: startDate, lte: endDate } },
            include: {
                uploader: { select: { name: true } },
                tags: { include: { tag: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json({
            month: `${year}-${monthStr.toString().padStart(2, '0')}`,
            totalAmount: Number(aggregations._sum.amount) || 0,
            count: receipts.length,
            receipts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate monthly report' });
    }
};

exports.getYearlyReport = async (req, res) => {
    const { year } = req.params; // YYYY

    if (!/^\d{4}$/.test(year)) {
        return res.status(400).json({ error: 'Invalid year format. Use YYYY' });
    }

    const yr = parseInt(year);
    const startDate = new Date(Date.UTC(yr, 0, 1));
    const endDate = new Date(Date.UTC(yr, 11, 31, 23, 59, 59, 999));

    try {
        const aggregations = await Receipt.aggregate({
            _sum: { amount: true },
            where: { created_at: { gte: startDate, lte: endDate } },
        });

        const receipts = await Receipt.findMany({
            where: { created_at: { gte: startDate, lte: endDate } },
            include: {
                uploader: { select: { name: true } },
                tags: { include: { tag: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json({
            year,
            totalAmount: Number(aggregations._sum.amount) || 0,
            count: receipts.length,
            receipts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate yearly report' });
    }
};

exports.exportMonthlyExcel = async (req, res) => {
    const { month } = req.params;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
    }

    const [year, monthStr] = month.split('-').map(Number);
    const startDate = new Date(Date.UTC(year, monthStr - 1, 1));
    const endDate = new Date(Date.UTC(year, monthStr, 0, 23, 59, 59, 999));

    try {
        const receipts = await Receipt.findMany({
            where: { created_at: { gte: startDate, lte: endDate } },
            include: { uploader: { select: { name: true } } },
            orderBy: { created_at: 'asc' }
        });

        const workbook = await ExcelService.generateReceiptReport(`Report - ${month}`, receipts);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Report_${month}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to export monthly Excel' });
    }
};

exports.exportYearlyExcel = async (req, res) => {
    const { year } = req.params;
    if (!/^\d{4}$/.test(year)) {
        return res.status(400).json({ error: 'Invalid year format. Use YYYY' });
    }

    const yr = parseInt(year);
    const startDate = new Date(Date.UTC(yr, 0, 1));
    const endDate = new Date(Date.UTC(yr, 11, 31, 23, 59, 59, 999));

    try {
        const receipts = await Receipt.findMany({
            where: { created_at: { gte: startDate, lte: endDate } },
            include: { uploader: { select: { name: true } } },
            orderBy: { created_at: 'asc' }
        });

        const workbook = await ExcelService.generateReceiptReport(`Report - ${year}`, receipts);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Report_${year}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to export yearly Excel' });
    }
};

exports.getEventReport = async (req, res) => {
    const { eventName } = req.params;
    try {
        const whereClause = {
            tags: { some: { tag: { name: eventName } } },
        };

        const aggregations = await Receipt.aggregate({
            _sum: { amount: true },
            where: whereClause,
        });

        const receipts = await Receipt.findMany({
            where: whereClause,
            include: {
                uploader: { select: { name: true } },
                tags: { include: { tag: true } }
            },
            orderBy: { created_at: 'desc' },
        });

        res.json({
            event: eventName,
            totalAmount: Number(aggregations._sum.amount) || 0,
            count: receipts.length,
            receipts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate event report' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. All-time aggregates
        const totalStats = await Receipt.aggregate({
            _sum: { amount: true },
            _count: { id: true }
        });

        // 2. Category breakdown
        const categoryStats = await Receipt.groupBy({
            by: ['category'],
            _sum: { amount: true },
        });

        // 3. Recent activity
        const recentReceipts = await Receipt.findMany({
            take: 5,
            orderBy: { created_at: 'desc' },
            include: { uploader: { select: { name: true } } }
        });

        res.json({
            totalAmount: Number(totalStats._sum.amount) || 0,
            totalReceipts: totalStats._count.id || 0,
            categoryCounts: categoryStats.map(stat => ({
                category: stat.category,
                _sum: { amount: Number(stat._sum.amount) || 0 }
            })),
            recentReceipts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};
