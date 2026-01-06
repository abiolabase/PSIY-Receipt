# Presentation: Masjid Receipt Management System
*Digital Accountability & Financial Transparency*

---

## Slide 1: Project Overview
**Title: Masjid Receipt Management System**
![Title Slide](C:/Users/User/.gemini/antigravity/brain/b6aacd73-8b8d-4832-b78a-e5eeb44a8ca2/project_title_slide_1767698939857.png)

### The Objective
To digitize and secure the financial reporting of a Masjid, ensuring that every expense is documented with photographic evidence, tagged for specific events, and reportable to the community with professional transparency.

---

## Slide 2: Development Process
**Title: From Concept to Production-Ready**

1.  **Planning & Architecture**: Defined the many-to-many role system and receipt-tag relationship.
2.  **Core Backend Development**: Built a secure Node.js API with JWT authentication and Multer-based image storage.
3.  **Refinement & Refactoring**: Transitioned from a single-role system to a flexible multi-role architecture (e.g., a user can be both Imam and Finance).
4.  **Reporting & Automation**: Implemented SQL-based aggregations for monthly/yearly totals and added automated Excel exports for board meetings.
5.  **Quality Assurance**: Developed a 100% pass-rate testing suite using Jest and Supertest.

---

## Slide 3: The Technical Stack
**Title: Our Technical Foundation**
![Tech Stack](C:/Users/User/.gemini/antigravity/brain/b6aacd73-8b8d-4832-b78a-e5eeb44a8ca2/tech_stack_slide_1767698953040.png)

| Tool | Role | Description |
| :--- | :--- | :--- |
| **Node.js & Express** | Runtime & Framework | The engine powering our RESTful API endpoints. |
| **Prisma ORM** | Data Layer | Type-safe database client and migration manager. |
| **PostgreSQL** | Database | A robust, relational database for reliable storage. |
| **JWT** | Security | JSON Web Tokens for secure, stateless authentication. |
| **Multer** | File Handling | Middleware for secure multipart/form-data (image uploads). |
| **ExcelJS** | Reporting | Library used to generate professional .xlsx spreadsheets. |
| **Jest & Supertest** | Validation | Industry-standard tools for automated API testing. |

---

## Slide 4: API Usage Summary (Part 1)
**Title: Authentication & Receipts**

### 1. Security Check (Login)
- **Endpoint**: `POST /auth/login`
- **How to use**: Send your email and password.
- **Result**: You get a **JWT Token** and a list of your **Roles**.

### 2. Documenting Expenses (Upload)
- **Endpoint**: `POST /receipts`
- **Role**: `IMAM` or `FINANCE`
- **How to use**: Attach the receipt image using form-data.
- **Result**: Receipt is stored and linked to your account.

---

## Slide 5: API Usage Summary (Part 2)
**Title: Reporting & Transparency**

### 3. Financial Snapshots (JSON)
- **Monthly**: `GET /reports/month/2026-01`
- **Yearly**: `GET /reports/year/2026`
- **Benefit**: Instant aggregate totals and categorized lists.

### 4. Board-Ready Reports (Excel)
- **Export Month**: `GET /reports/export/month/2026-01`
- **Export Year**: `GET /reports/export/year/2026`
- **Result**: A professionally formatted Excel file (`.xlsx`) with bold headers and auto-summed totals.

---

## Slide 6: Summary of Success
- **16 Automated Tests** verifying every move.
- **Multi-Role Flexibility** for staff.
- **Image-Backed Transparency** for every cent spent.
- **One-Click Exports** for financial audits.
