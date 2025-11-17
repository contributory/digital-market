# Prisma Query Examples

This document provides common query patterns for the e-commerce platform database.

## Table of Contents
- [Authentication](#authentication)
- [Categories](#categories)
- [Products](#products)
- [Cart Operations](#cart-operations)
- [Orders](#orders)
- [Reviews](#reviews)
- [Inventory Management](#inventory-management)
- [Search](#search)

## Authentication

### Create User with Password

```typescript
import { prisma } from '@ecommerce/database';
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 10);

const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    password: hashedPassword,
    role: 'CUSTOMER',
  },
});
```

### Find User by Email

```typescript
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: {
    cart: {
      include: {
        items: {
          include: { product: true },
        },
      },
    },
  },
});
```

### Create Session

```typescript
const session = await prisma.session.create({
  data: {
    userId: user.id,
    sessionToken: generateToken(),
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
});
```

## Categories

### Get Root Categories with Children

```typescript
const rootCategories = await prisma.category.findMany({
  where: {
    parentId: null,
    isActive: true,
  },
  include: {
    children: {
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    },
  },
  orderBy: { sortOrder: 'asc' },
});
```

### Get Category with All Products

```typescript
const category = await prisma.category.findUnique({
  where: { slug: 'electronics' },
  include: {
    productCategories: {
      include: {
        product: {
          where: { isActive: true },
          include: {
            images: { take: 1, orderBy: { sortOrder: 'asc' } },
            inventory: true,
          },
        },
      },
    },
    children: true,
  },
});
```

### Create Hierarchical Category

```typescript
const parentCategory = await prisma.category.create({
  data: {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices',
    isActive: true,
  },
});

const childCategory = await prisma.category.create({
  data: {
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Mobile phones',
    parentId: parentCategory.id,
    isActive: true,
  },
});
```

## Products

### Get Featured Products

```typescript
const featuredProducts = await prisma.product.findMany({
  where: {
    isActive: true,
    isFeatured: true,
  },
  include: {
    images: {
      orderBy: { sortOrder: 'asc' },
    },
    inventory: true,
  },
  orderBy: [
    { averageRating: 'desc' },
    { soldCount: 'desc' },
  ],
  take: 10,
});
```

### Get Product with Full Details

```typescript
const product = await prisma.product.findUnique({
  where: { slug: 'macbook-pro-16' },
  include: {
    images: {
      orderBy: { sortOrder: 'asc' },
    },
    categories: {
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    },
    inventory: true,
    reviews: {
      where: { isPublished: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    },
  },
});
```

### Create Product with Relations

```typescript
const product = await prisma.product.create({
  data: {
    name: 'iPhone 15 Pro',
    slug: 'iphone-15-pro',
    description: 'Latest iPhone with A17 Pro chip',
    price: 999.00,
    sku: 'IP15-PRO-128',
    isActive: true,
    isFeatured: true,
    images: {
      create: [
        {
          url: 'https://example.com/image1.jpg',
          alt: 'iPhone front',
          sortOrder: 1,
        },
        {
          url: 'https://example.com/image2.jpg',
          alt: 'iPhone back',
          sortOrder: 2,
        },
      ],
    },
    inventory: {
      create: {
        quantity: 100,
        lowStockThreshold: 20,
        status: 'IN_STOCK',
      },
    },
    categories: {
      create: [
        {
          category: {
            connect: { slug: 'smartphones' },
          },
        },
      ],
    },
  },
});
```

### Filter Products by Price Range

```typescript
const products = await prisma.product.findMany({
  where: {
    isActive: true,
    price: {
      gte: 100,
      lte: 1000,
    },
  },
  include: {
    images: { take: 1 },
    inventory: true,
  },
});
```

## Cart Operations

### Get or Create Cart

```typescript
let cart = await prisma.cart.findUnique({
  where: { userId: user.id },
  include: {
    items: {
      include: {
        product: {
          include: {
            images: { take: 1 },
            inventory: true,
          },
        },
      },
    },
  },
});

if (!cart) {
  cart = await prisma.cart.create({
    data: { userId: user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { take: 1 },
              inventory: true,
            },
          },
        },
      },
    },
  });
}
```

### Add Item to Cart

```typescript
const cartItem = await prisma.cartItem.upsert({
  where: {
    cartId_productId: {
      cartId: cart.id,
      productId: product.id,
    },
  },
  update: {
    quantity: { increment: 1 },
  },
  create: {
    cartId: cart.id,
    productId: product.id,
    quantity: 1,
    price: product.price,
  },
});
```

### Remove Item from Cart

```typescript
await prisma.cartItem.delete({
  where: {
    cartId_productId: {
      cartId: cart.id,
      productId: product.id,
    },
  },
});
```

### Clear Cart

```typescript
await prisma.cartItem.deleteMany({
  where: { cartId: cart.id },
});
```

## Orders

### Create Order from Cart

```typescript
const order = await prisma.$transaction(async (tx) => {
  // Get cart items
  const cart = await tx.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Calculate totals
  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const tax = subtotal * 0.09; // 9% tax
  const shippingCost = 15.00;
  const total = subtotal + tax + shippingCost;

  // Create order
  const order = await tx.order.create({
    data: {
      userId: user.id,
      orderNumber: `ORD-${Date.now()}`,
      status: 'PENDING',
      subtotal,
      tax,
      shippingCost,
      discount: 0,
      total,
      shippingAddressId: address.id,
      billingAddressId: address.id,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: Number(item.price) * item.quantity,
        })),
      },
    },
  });

  // Update inventory
  for (const item of cart.items) {
    await tx.inventory.update({
      where: { productId: item.productId },
      data: {
        quantity: { decrement: item.quantity },
        reservedQuantity: { increment: item.quantity },
      },
    });
  }

  // Clear cart
  await tx.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return order;
});
```

### Get User Orders

```typescript
const orders = await prisma.order.findMany({
  where: { userId: user.id },
  include: {
    items: {
      include: {
        product: {
          include: {
            images: { take: 1 },
          },
        },
      },
    },
    shippingAddress: true,
    payment: true,
  },
  orderBy: { createdAt: 'desc' },
});
```

### Update Order Status

```typescript
const order = await prisma.order.update({
  where: { id: orderId },
  data: {
    status: 'SHIPPED',
    shippedAt: new Date(),
    trackingNumber: 'TRK123456789',
    carrier: 'FedEx',
  },
});
```

## Reviews

### Create Review

```typescript
const review = await prisma.$transaction(async (tx) => {
  // Create review
  const review = await tx.review.create({
    data: {
      productId: product.id,
      userId: user.id,
      rating: 5,
      title: 'Great product!',
      comment: 'Highly recommended',
      isVerifiedPurchase: true,
      isPublished: true,
    },
  });

  // Update product aggregates
  const reviews = await tx.review.findMany({
    where: {
      productId: product.id,
      isPublished: true,
    },
    select: { rating: true },
  });

  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await tx.product.update({
    where: { id: product.id },
    data: {
      averageRating,
      reviewCount: reviews.length,
    },
  });

  return review;
});
```

### Get Product Reviews

```typescript
const reviews = await prisma.review.findMany({
  where: {
    productId: product.id,
    isPublished: true,
  },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        image: true,
      },
    },
  },
  orderBy: [
    { isVerifiedPurchase: 'desc' },
    { createdAt: 'desc' },
  ],
});
```

## Inventory Management

### Check Product Availability

```typescript
const inventory = await prisma.inventory.findUnique({
  where: { productId: product.id },
});

const availableQuantity = inventory.quantity - inventory.reservedQuantity;
const isAvailable = availableQuantity >= requestedQuantity;
```

### Update Inventory After Order

```typescript
await prisma.inventory.update({
  where: { productId: product.id },
  data: {
    quantity: { decrement: orderQuantity },
    reservedQuantity: { decrement: orderQuantity },
    lastRestockedAt: new Date(),
  },
});
```

### Get Low Stock Products

```typescript
const lowStockProducts = await prisma.product.findMany({
  where: {
    isActive: true,
    inventory: {
      status: 'LOW_STOCK',
    },
  },
  include: {
    inventory: true,
  },
});
```

### Restock Product

```typescript
const inventory = await prisma.inventory.update({
  where: { productId: product.id },
  data: {
    quantity: { increment: restockQuantity },
    status: 'IN_STOCK',
    lastRestockedAt: new Date(),
  },
});
```

## Search

### Search Products by Name

```typescript
const products = await prisma.product.findMany({
  where: {
    isActive: true,
    OR: [
      {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
    ],
  },
  include: {
    images: { take: 1 },
    inventory: true,
  },
});
```

### Advanced Product Filtering

```typescript
const products = await prisma.product.findMany({
  where: {
    isActive: true,
    price: {
      gte: minPrice,
      lte: maxPrice,
    },
    categories: {
      some: {
        categoryId: {
          in: categoryIds,
        },
      },
    },
    inventory: {
      status: {
        in: ['IN_STOCK', 'LOW_STOCK'],
      },
    },
    averageRating: {
      gte: minRating,
    },
  },
  include: {
    images: { take: 1 },
    inventory: true,
  },
  orderBy: sortBy === 'price' 
    ? { price: sortOrder }
    : sortBy === 'rating'
    ? { averageRating: sortOrder }
    : { createdAt: sortOrder },
  skip: (page - 1) * perPage,
  take: perPage,
});
```

## Audit Logging

### Create Audit Log

```typescript
await prisma.auditLog.create({
  data: {
    userId: admin.id,
    action: 'UPDATE',
    entity: 'Product',
    entityId: product.id,
    changes: {
      field: 'price',
      before: oldPrice,
      after: newPrice,
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  },
});
```

### Get Audit Logs for Entity

```typescript
const logs = await prisma.auditLog.findMany({
  where: {
    entity: 'Order',
    entityId: order.id,
  },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
  orderBy: { createdAt: 'desc' },
});
```

## Tips and Best Practices

1. **Always use transactions** for operations that modify multiple tables
2. **Select only needed fields** to improve performance
3. **Use indexes** - the schema has indexes on frequently queried fields
4. **Update aggregates** when creating/updating reviews
5. **Reserve inventory** when creating orders, release on cancellation
6. **Implement soft deletes** for important records
7. **Log admin actions** for audit trail
8. **Handle race conditions** with optimistic concurrency control
9. **Use connection pooling** in production
10. **Paginate large result sets** with skip/take
