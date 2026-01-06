const ExcelJS = require('exceljs');

class ExcelService {
    static async generateReceiptReport(title, receipts) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Receipts Report');

        // Define columns
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Mode', key: 'mode', width: 15 },
            { header: 'Uploader', key: 'uploader', width: 25 },
            { header: 'Note', key: 'note', width: 40 },
        ];

        // Format header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Add data
        receipts.forEach(receipt => {
            worksheet.addRow({
                id: receipt.id,
                date: new Date(receipt.created_at).toLocaleDateString(),
                category: receipt.category,
                amount: parseFloat(receipt.amount),
                mode: receipt.payment_mode,
                uploader: receipt.uploader?.name || 'Unknown',
                note: receipt.note || ''
            });
        });

        // Add total row
        const totalAmount = receipts.reduce((sum, r) => sum + parseFloat(r.amount), 0);
        worksheet.addRow({}); // Empty row
        const totalRow = worksheet.addRow({
            category: 'TOTAL',
            amount: totalAmount
        });
        totalRow.font = { bold: true };

        // Formatting
        worksheet.getColumn('amount').numFmt = '#,##0.00';

        return workbook;
    }
}

module.exports = ExcelService;
