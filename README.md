# E-commerce Platform

A full-stack e-commerce platform built with modern technologies, featuring authentication, product catalog, shopping cart, and order management.

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Database**: PostgreSQL with Prisma ORM
- **Backend**: Express.js (API server)
- **Frontend**: Next.js 14 (React)
- **Language**: TypeScript

## Project Structure

```
├── apps/
│   ├── api/          # Express.js API server
│   └── web/          # Next.js web application
├── packages/
│   └── database/     # Shared Prisma schema and client
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       └── src/
│           └── index.ts
└── package.json
```

## Database Schema

### Authentication Entities

- **User**: User accounts with role-based access control (CUSTOMER, ADMIN, SUPER_ADMIN)
- **Account**: OAuth provider accounts (for third-party authentication)
- **Session**: User session management
- **VerificationToken**: Email verification and password reset tokens

### Catalog Entities

- **Category**: Hierarchical product categories with parent-child relationships
- **Product**: Product information with pricing, SKU, and metadata
- **ProductImage**: Multiple images per product with sort ordering
- **ProductCategory**: Many-to-many relationship between products and categories
- **Inventory**: Stock tracking with quantity, reserved quantity, and status
- **Review**: Customer reviews with ratings and verified purchase status

### Commerce Entities

- **Cart**: Shopping cart for users
- **CartItem**: Individual items in a cart
- **Order**: Customer orders with status tracking
- **OrderItem**: Line items in an order
- **Payment**: Payment processing with Stripe integration
- **Address**: Shipping and billing addresses

### Operational Entities

- **AuditLog**: Admin action tracking for compliance and debugging
- **StripePaymentIntent**: Stripe payment intent details and metadata

## Schema Design Rationale

### Hierarchical Categories

Categories support parent-child relationships, enabling flexible taxonomy:
- Root categories (e.g., "Electronics")
- Subcategories (e.g., "Smartphones" under "Electronics")
- Multiple levels of nesting

### Product-Category Relationship

Uses a pivot table (`ProductCategory`) to support:
- Products in multiple categories
- Flexible categorization without duplication
- Easy category reorganization

### Inventory Tracking

Separate `Inventory` table provides:
- Real-time stock levels
- Reserved quantity for pending orders
- Low stock alerts with configurable thresholds
- Status tracking (IN_STOCK, LOW_STOCK, OUT_OF_STOCK, DISCONTINUED)

### Review Aggregation

Products store aggregate fields for performance:
- `averageRating`: Pre-calculated average rating
- `reviewCount`: Total number of reviews
- Eliminates need for expensive aggregation queries
- Updated when reviews are added/modified

### Indexes and Performance

Strategic indexes on frequently queried fields:
- Product slug, SKU (for lookups)
- Category slug (for navigation)
- Order status, creation date (for filtering/sorting)
- User email (for authentication)
- Review ratings and timestamps (for sorting)

### Full-Text Search

Schema configured for PostgreSQL full-text search on:
- Product names
- Product descriptions
- Enables fast, relevant product search

### Cascading Deletes

Proper cascade rules maintain referential integrity:
- User deletion cascades to sessions, reviews, carts
- Product deletion cascades to images, inventory, cart items
- Order deletion cascades to order items and payments
- Category deletion sets parent to null (preserves structure)

### Audit Trail

`AuditLog` tracks all admin actions:
- Who performed the action
- What entity was affected
- What changes were made (JSON)
- When the action occurred
- IP address and user agent for security

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 14

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd <project-directory>
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
cd packages/database
cp .env.example .env
```

Edit `.env` with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

For local development:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_dev?schema=public"
```

## Database Setup

### Run Migrations

Create database tables and enums:

```bash
pnpm db:migrate
```

This command:
- Creates a new migration based on the schema
- Applies the migration to the database
- Generates the Prisma client

### Seed the Database

Populate the database with sample data:

```bash
pnpm db:seed
```

The seed script creates:
- **3 users**: 1 admin, 2 customers
- **7 categories**: Including hierarchical structure (Electronics > Smartphones, etc.)
- **5 products**: With images, inventory, and various statuses
- **5 reviews**: Customer reviews with ratings
- **1 cart**: Sample shopping cart
- **2 orders**: Complete orders with payments
- **2 addresses**: Shipping/billing addresses
- **3 audit logs**: Sample admin actions

#### Test Credentials

After seeding, you can use these credentials:

- **Admin**: `admin@ecommerce.com` / `Admin123!`
- **Customer 1**: `john.doe@example.com` / `Customer123!`
- **Customer 2**: `jane.smith@example.com` / `Customer123!`

### Other Database Commands

```bash
# Open Prisma Studio (visual database editor)
pnpm db:studio

# Push schema changes without migrations (dev only)
pnpm db:push

# Reset database (drop all data and re-run migrations)
pnpm db:reset

# Generate Prisma client only
pnpm db:generate
```

## Using Prisma Client

### In Express API (apps/api)

```typescript
import { prisma, User, Product } from '@ecommerce/database';

// Find all products
const products = await prisma.product.findMany({
  where: { isActive: true },
  include: {
    images: true,
    inventory: true,
    categories: {
      include: { category: true }
    }
  }
});

// Create a new user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    role: 'CUSTOMER'
  }
});
```

### In Next.js (apps/web)

```typescript
import { prisma } from '@ecommerce/database';

// Server component or API route
export async function getProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });
  
  return products;
}
```

### Type-Safe Queries

The Prisma client provides full TypeScript support:

```typescript
import type { Product, Prisma } from '@ecommerce/database';

// Type-safe where clause
const where: Prisma.ProductWhereInput = {
  isActive: true,
  price: { gte: 100, lte: 1000 },
  categories: {
    some: {
      category: { slug: 'electronics' }
    }
  }
};

const products = await prisma.product.findMany({ where });
```

## Schema Migrations

### Creating a Migration

After modifying `schema.prisma`:

```bash
cd packages/database
pnpm prisma migrate dev --name description_of_changes
```

### Applying Migrations in Production

```bash
pnpm prisma migrate deploy
```

## Common Queries

### Hierarchical Categories

```typescript
// Get root categories with children
const rootCategories = await prisma.category.findMany({
  where: { parentId: null },
  include: {
    children: {
      include: {
        children: true // For deeper nesting
      }
    }
  }
});
```

### Products with Reviews

```typescript
// Get products with review aggregates
const products = await prisma.product.findMany({
  where: { isActive: true },
  select: {
    id: true,
    name: true,
    price: true,
    averageRating: true,
    reviewCount: true,
    reviews: {
      where: { isPublished: true },
      take: 5,
      orderBy: { createdAt: 'desc' }
    }
  }
});
```

### Order with Full Details

```typescript
// Get order with all related data
const order = await prisma.order.findUnique({
  where: { id: orderId },
  include: {
    user: { select: { id: true, name: true, email: true } },
    items: {
      include: {
        product: {
          include: { images: { take: 1 } }
        }
      }
    },
    payment: true,
    shippingAddress: true,
    billingAddress: true
  }
});
```

### Inventory Management

```typescript
// Update inventory after order
await prisma.inventory.update({
  where: { productId: productId },
  data: {
    quantity: { decrement: orderQuantity },
    reservedQuantity: { decrement: orderQuantity },
    status: quantity - orderQuantity <= lowStockThreshold 
      ? 'LOW_STOCK' 
      : 'IN_STOCK'
  }
});
```

## Development Workflow

1. **Start development servers**

```bash
pnpm dev
```

2. **Make schema changes**

Edit `packages/database/prisma/schema.prisma`

3. **Create and apply migration**

```bash
pnpm db:migrate
```

4. **Import in your code**

```typescript
import { prisma } from '@ecommerce/database';
```

## Troubleshooting

### Migration Issues

If migrations fail:

```bash
# Reset database and start fresh
pnpm db:reset

# Or manually drop and recreate
dropdb ecommerce_dev
createdb ecommerce_dev
pnpm db:migrate
```

### Prisma Client Out of Sync

If you see "Prisma client is out of sync" errors:

```bash
pnpm db:generate
```

### Seed Script Errors

The seed script deletes all existing data. If you get foreign key errors:

```bash
# Reset database completely
pnpm db:reset
```

## Best Practices

1. **Always use transactions** for related operations:

```typescript
await prisma.$transaction([
  prisma.inventory.update(...),
  prisma.product.update(...),
]);
```

2. **Select only needed fields** for performance:

```typescript
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true }
});
```

3. **Use connection pooling** in production:

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public&connection_limit=10&pool_timeout=20"
```

4. **Implement soft deletes** for important data:

Add `deletedAt` field instead of hard deletes.

5. **Update aggregates** when data changes:

Update `averageRating`, `reviewCount`, etc. when reviews are added/removed.

## Contributing

1. Create a feature branch
2. Make your changes
3. Create migrations if schema changed
4. Test thoroughly
5. Submit a pull request

## License

MIT
