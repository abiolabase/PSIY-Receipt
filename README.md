# Masjid Receipt Management System
*Digital Accountability & Financial Transparency*

[![CI - Masjid Receipt System](https://github.com/abiolabase/PSIY-Receipt/actions/workflows/ci.yml/badge.svg)](https://github.com/abiolabase/PSIY-Receipt/actions)

A professional-grade backend for digitizing and securing Masjid expense tracking. Built with scalability, performance, and auditability in mind.

## 🚀 Interviewer Quick Start

If you're reviewing this project, here are the highlights:
- **Architecture**: Many-to-Many role system allowing flexible staff permissions.
- **Reporting**: Advanced SQL aggregations and professional **Excel exports** using `ExcelJS`.
- **Quality**: 100% pass-rate testing suite (16 tests) across Auth, Receipts, and Reports.
- **Orchestration**: Fully automated CI/CD pipeline via GitHub Actions.

## 🛠 Tech Stack

- **Runtime**: Node.js (Express)
- **Database**: PostgreSQL with Prisma ORM
- **Security**: JWT Authentication, Bcrypt password hashing
- **Automation**: GitHub Actions (CI), Jest/Supertest (QA)
- **Features**: ExcelJS (Spreadsheet generation), Multer (Image processing)

## 📖 Features

- **Multi-Role RBAC**: Users can hold multiple roles simultaneously (e.g., Imam + Finance).
- **Audit-Trail Receipts**: Every expense requires a photographic receipt upload.
- **Smart Tagging**: Group receipts by event (e.g., "Renovation 2024") or month.
- **One-Click Exports**: Generate board-ready Excel reports for monthly or yearly audits.

## ⚙️ Setup Instructions

### 1. Installation
```bash
npm install
```

### 2. Environment (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/receipt_db"
JWT_SECRET="secure_secret"
PORT=3000
```

### 3. Initialize & Seed
```bash
npx prisma db push
node prisma/seed.js
```

### 4. Run Tests
```bash
npm test
```

## 🧪 Testing Coverage

The system includes comprehensive integration tests for:
1.  **Authentication**: Role-based access validation and token lifecycle.
2.  **Receipts**: Secure multipart uploads and state management.
3.  **Reporting**: Aggregation accuracy and Excel generation headers.

## 🛡 Security & Production Roadmap

- **Storage**: Migrate local `uploads/` to AWS S3 / Cloudinary for horizontal scaling.
- **Monitoring**: Integration of Winston logging and Sentry for error tracking.
- **Rate Limiting**: Protection against brute-force/DoS via `express-rate-limit`.
- **Secrets**: Transition from `.env` to AWS Secrets Manager.
