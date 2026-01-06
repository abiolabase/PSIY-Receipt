# Masjid Receipt Management System

A production-quality backend for digitizing and managing Masjid expense receipts. This system provides a secure, role-based API for handling receipt uploads, financial tracking, and auditing.

## Project Overview

This application replaces physical receipt management with a digital auditable system. It supports three distinct roles:
- **Imam**: Uploads receipts.
- **Finance**: Manages tagging and reporting.
- **Auditor**: Read-only access for verification.

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT & Bcrypt
- **File Storage**: Local filesystem (Uploads directory)

### Why PostgreSQL?
PostgreSQL was chosen for its reliability, data integrity, and support for complex queries. For a financial system, ACID compliance and structured data relations (Users, Receipts, Tags) are critical. PostgreSQL acts as a single source of truth, ensuring that financial data is accurate and consistent, which is non-negotiable for auditability.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL running locally

### Installation

1.  **Clone/Open the project**
    ```bash
    cd receipt-system
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/receipt_db?schema=public"
    JWT_SECRET="your_secure_random_secret_here"
    PORT=3000
    ```
    *Note: Update `DATABASE_URL` with your local PostgreSQL credentials.*

4.  **Database Setup**
    Run the migrations to create tables:
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Seed Database**
    Populate the database with initial users:
    ```bash
    npm run prisma:seed
    # If the above script isn't defined in package.json yet, run:
    node prisma/seed.js
    ```

6.  **Run the Application**
    ```bash
    npm start
    # Or for development with auto-reload:
    npm run dev
    ```

## Usage & Testing

You can test the API using Postman, cURL, or any HTTP client.

### Users (Seeded)
| Role    | Email                | Password      | Capabilities |
|BC| | | |
| **Imam**    | `imam@masjid.com`    | `password123` | Upload Receipts |
| **Finance** | `finance@masjid.com` | `password123` | View All, Tag, Reports |
| **Auditor** | `auditor@masjid.com` | `password123` | View All, Reports (Read-Only) |

### Example Workflows

#### 1. Login
First, get a token for the user you want to act as.
```bash
POST /auth/login
{
  "email": "imam@masjid.com",
  "password": "password123"
}
# Response: { "token": "ey...", "role": "IMAM" }
```
*Copy the `token` from the response.*

#### 2. Upload Receipt (Imam)
Use the token as a Bearer token in the `Authorization` header.
```bash
POST /receipts
Headers: Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data
Body:
  amount: 50.00
  category: "Maintenance"
  payment_mode: "CASH"
  note: "Bought cleaning supplies"
  image: [Select File]
```

#### 3. View Receipts (Finance/Auditor)
```bash
GET /receipts
Headers: Authorization: Bearer <TOKEN>
```
*Bonus: Add `?search=clean` to search receipts.*

#### 4. Tag Receipt (Finance)
```bash
POST /receipts/:id/tag
Headers: Authorization: Bearer <TOKEN>
Body:
  { "tagName": "Feb 2026", "month": "2026-02" }
```

#### 5. Get Reports
```bash
GET /reports/month/2026-02
# OR
GET /reports/dashboard
```

## Security Considerations for Production

If deploying to production, the following steps must be taken:
1.  **HTTPS**: Enable TLS/SSL to encrypt traffic.
2.  **Cloud Storage**: Move file uploads to Amazon S3 or Google Cloud Storage instead of local disk to support scaling and backup.
3.  **Database**: Use a managed PostgreSQL instance (e.g., AWS RDS) with automated backups and restricted IP access.
4.  **Secrets**: Store `JWT_SECRET` and `DATABASE_URL` in a secure secret manager, not in `.env` files.
5.  **Rate Limiting**: Implement strict rate limiting (e.g., using `express-rate-limit`) to prevent brute-force attacks.
6.  **Logging**: enhanced logging using Winston or similar, piped to a monitoring service.
