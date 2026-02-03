# XCyber Insurance Portal

A comprehensive insurance lead management portal with multi-role authentication, dynamic forms, and bulk question upload capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

---

## 📦 Backend Setup

### 1. Navigate to Backend
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

**Required .env configuration:**
```env
PORT=3001
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/xcyber
JWT_SECRET=your-super-secret-key-at-least-64-characters-long
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### 4. Setup Database
```bash
psql -U postgres -c "CREATE DATABASE xcyber;"
psql -U postgres -d xcyber -f database/schema.sql
```

### 5. Start Backend
```bash
npm run dev
```
Server runs on: `http://localhost:3001`

---

## 🎨 Frontend Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API URL
Create `.env` in project root:
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Start Frontend
```bash
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 🔐 Test Credentials

| Role   | Email              | Password   |
|--------|-------------------|------------|
| Admin  | admin@xcyber.com  | Admin@123  |
| Agent  | agent@xcyber.com  | Agent@123  |

---

## 📋 Features

### ✅ Bulk Question Upload (Admin)
- Upload questions via CSV or Excel
- Preview data before upload
- Transaction-based insert (rollback on failure)
- Download sample templates

### ✅ Dynamic Form Builder
- Multiple question types: text, textarea, mcq, checkbox, dropdown, number, date, email, phone
- Section-based organization
- Per insurance company forms

### ✅ Role-Based Access
- **Admin**: Full system access, manage companies/sections/questions/users
- **Agent**: View leads for their assigned insurance company
- **User**: Fill and submit forms

---

## 📤 Bulk Upload Format

### Required Columns
| Column | Description |
|--------|-------------|
| question_text | Question label (required) |
| question_type | text, textarea, mcq, checkbox, dropdown, number, date, email, phone |
| options | Comma-separated for mcq/checkbox/dropdown |
| required | true or false |
| placeholder | Placeholder text |

### Sample CSV
```csv
question_text,question_type,options,required,placeholder
"Full Name",text,,true,"Enter name"
"Gender",mcq,"Male,Female,Other",true,""
```

---

## 🔧 API Endpoints

### Questions
- `POST /api/questions/bulk-upload` - Bulk upload (CSV/Excel)
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `GET /api/questions/template/csv` - CSV template
- `GET /api/questions/template/excel` - Excel template

### Sections
- `GET /api/sections?bankId=` - List sections
- `POST /api/sections` - Create section
- `PUT /api/sections/:id` - Update section
- `POST /api/sections/:id/questions` - Add question

---

## 🔒 Security
- JWT authentication
- Role-based access control
- Bcrypt password hashing
- Parameterized SQL queries
- CORS protection
- Input validation

---

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── questions.ts    # Bulk upload + CRUD
│   │   │   ├── sections.ts
│   │   │   └── ...
│   │   └── index.ts
│   └── database/
│       └── schema.sql
├── src/
│   ├── pages/admin/
│   │   ├── AdminBulkUpload.tsx
│   │   └── AdminSections.tsx
│   └── services/api.ts
└── public/samples/
    └── questions_template.csv
```

---

## 🐛 Troubleshooting

### 404 Errors
- Verify backend running on port 3001
- Check VITE_API_URL in frontend .env

### 500 Errors
- Check backend console for details
- Verify DATABASE_URL is correct
- Ensure schema.sql was executed

### CORS Issues
- Update FRONTEND_URL in backend .env
