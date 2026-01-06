const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Reports: Finance and Auditor Only
router.get(
    '/month/:month',
    authenticateToken,
    authorizeRole(['FINANCE', 'AUDITOR']),
    reportController.getMonthlyReport
);

router.get(
    '/year/:year',
    authenticateToken,
    authorizeRole(['FINANCE', 'AUDITOR']),
    reportController.getYearlyReport
);

router.get(
    '/export/month/:month',
    authenticateToken,
    authorizeRole(['FINANCE', 'AUDITOR']),
    reportController.exportMonthlyExcel
);

router.get(
    '/export/year/:year',
    authenticateToken,
    authorizeRole(['FINANCE', 'AUDITOR']),
    reportController.exportYearlyExcel
);

router.get(
    '/event/:eventName',
    authenticateToken,
    authorizeRole(['FINANCE', 'AUDITOR']),
    reportController.getEventReport
);

router.get(
    '/dashboard',
    authenticateToken,
    authorizeRole(['FINANCE', 'AUDITOR']),
    reportController.getDashboardStats
);

module.exports = router;
