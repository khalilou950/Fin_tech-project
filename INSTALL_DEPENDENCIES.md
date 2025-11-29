# 📦 Install Backend Dependencies

## Required Packages

Install these packages for the backend to work:

```bash
npm install mongoose bcryptjs jsonwebtoken zod csv-parse
npm install -D @types/bcryptjs @types/jsonwebtoken
```

## Or use this command:

```bash
npm install mongoose bcryptjs jsonwebtoken zod csv-parse @types/bcryptjs @types/jsonwebtoken --save-dev
```

---

## Package Descriptions

- **mongoose**: MongoDB ODM for Node.js
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token generation and verification
- **zod**: Schema validation
- **csv-parse**: CSV file parsing
- **@types/bcryptjs**: TypeScript types for bcryptjs
- **@types/jsonwebtoken**: TypeScript types for jsonwebtoken

---

## After Installation

1. Create `.env.local` file (copy from `.env.local.example`)
2. Run seed script: `npx tsx scripts/seed.ts`
3. Start dev server: `npm run dev`

---

**All backend dependencies will be installed!** ✅

