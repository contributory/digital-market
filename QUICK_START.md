# Quick Start Guide

Get the e-commerce platform database up and running in 5 minutes.

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker (for PostgreSQL)

## Installation

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

Wait a few seconds for PostgreSQL to be ready.

### 3. Run Migrations

```bash
pnpm db:migrate
```

This creates all tables and enums in the database.

### 4. Seed Database (Optional)

```bash
pnpm db:seed
```

This populates the database with:
- 3 users (1 admin, 2 customers)
- 7 hierarchical categories
- 5 products with images
- Sample orders, reviews, and more

## Test Credentials

After seeding, you can use these accounts:

**Admin**:
- Email: `admin@ecommerce.com`
- Password: `Admin123!`

**Customers**:
- Email: `john.doe@example.com` / Password: `Customer123!`
- Email: `jane.smith@example.com` / Password: `Customer123!`

## Using the Database

### In Your Code

```typescript
import { prisma, User, Product } from '@ecommerce/database';

// Get all products
const products = await prisma.product.findMany({
  where: { isActive: true },
  include: {
    images: true,
    inventory: true,
  },
});

// Create a user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    role: 'CUSTOMER',
  },
});
```

### Prisma Studio (Visual Database Editor)

```bash
pnpm db:studio
```

Open http://localhost:5555 in your browser.

## Common Commands

```bash
# Database operations
pnpm db:migrate    # Run migrations
pnpm db:seed       # Seed database
pnpm db:studio     # Open Prisma Studio
pnpm db:reset      # Reset database (careful!)
pnpm db:generate   # Regenerate Prisma client

# Development
pnpm dev           # Start all dev servers
pnpm build         # Build all packages

# Docker
docker compose up -d      # Start PostgreSQL
docker compose down       # Stop PostgreSQL
docker compose logs -f    # View logs
```

## Verify Installation

Run the acceptance tests:

```bash
node test-acceptance.js
```

You should see:
```
✓ All acceptance criteria met!
Passed: 19
Failed: 0
```

## Project Structure

```
├── apps/
│   ├── api/              # Express backend
│   └── web/              # Next.js frontend
├── packages/
│   └── database/         # Shared Prisma package
│       ├── prisma/
│       │   ├── schema.prisma    # Database schema
│       │   └── seed.ts          # Seed script
│       └── src/
│           └── index.ts         # Exports Prisma client
└── docker-compose.yml    # PostgreSQL container
```

## Next Steps

1. **Read the Documentation**:
   - `README.md` - Full documentation
   - `QUERIES.md` - Query examples
   - `ACCEPTANCE_CRITERIA.md` - Feature verification

2. **Explore the Database**:
   - Open Prisma Studio: `pnpm db:studio`
   - Browse tables and relationships
   - Edit data visually

3. **Start Building**:
   - Import Prisma client in your code
   - Write queries
   - Build features

## Troubleshooting

### Database Connection Failed

Make sure PostgreSQL is running:
```bash
docker compose ps
```

If not running, start it:
```bash
docker compose up -d
```

### Migration Failed

Reset the database:
```bash
pnpm db:reset
```

### Prisma Client Not Found

Regenerate the client:
```bash
cd packages/database
pnpm prisma generate
```

### Port 5432 Already in Use

Another PostgreSQL instance is running. Either:
- Stop the other instance
- Change the port in `docker-compose.yml`

## Environment Variables

Create `packages/database/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_dev?schema=public"
```

For production, use a secure password and host.

## Database Schema Overview

**Authentication**: User, Account, Session, VerificationToken  
**Catalog**: Category, Product, ProductImage, ProductCategory, Inventory, Review  
**Commerce**: Cart, CartItem, Order, OrderItem, Payment, Address  
**Operations**: AuditLog, StripePaymentIntent

**Enums**: UserRole, OrderStatus, PaymentStatus, InventoryStatus

## Support

- Check `README.md` for detailed documentation
- Check `QUERIES.md` for query examples
- Check `ACCEPTANCE_CRITERIA.md` for feature details
- Open an issue for bugs or questions

---

**Ready to build something amazing! 🚀**
