const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receipt.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public/Protected Routes
// Upload: Imam Only
router.post(
    '/',
    authenticateToken,
    authorizeRole(['IMAM']),
    upload.single('image'),
    receiptController.createReceipt
);

// View: Finance, Auditor
router.get(
    '/',
    authenticateToken,
    authorizeRole(['FINANCE', 'AUDITOR']),
    receiptController.getAllReceipts
);

router.get(
    '/:id',
    authenticateToken,
    authorizeRole(['FINANCE', 'AUDITOR']),
    receiptController.getReceiptById
);

// Tag: Finance Only
router.post(
    '/:id/tag',
    authenticateToken,
    authorizeRole(['FINANCE']),
    receiptController.tagReceipt
);

module.exports = router;
