import { PrismaClient, UserRole, OrderStatus, PaymentStatus, InventoryStatus } from '../node_modules/.prisma/client';
import { hash } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return hash('sha256', password).toString();
}

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Clean existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.stripePaymentIntent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // ============================================================================
  // USERS
  // ============================================================================
  console.log('👥 Creating users...');
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@ecommerce.com',
      name: 'Admin User',
      password: hashPassword('Admin123!'),
      role: UserRole.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      password: hashPassword('Customer123!'),
      role: UserRole.CUSTOMER,
      emailVerified: new Date(),
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      password: hashPassword('Customer123!'),
      role: UserRole.CUSTOMER,
      emailVerified: new Date(),
    },
  });

  console.log(`✓ Created ${3} users`);

  // ============================================================================
  // ADDRESSES
  // ============================================================================
  console.log('📍 Creating addresses...');

  const address1 = await prisma.address.create({
    data: {
      userId: customer1.id,
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'US',
      phone: '+1-555-0101',
      isDefault: true,
    },
  });

  const address2 = await prisma.address.create({
    data: {
      userId: customer2.id,
      firstName: 'Jane',
      lastName: 'Smith',
      address1: '456 Oak Avenue',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      phone: '+1-555-0102',
      isDefault: true,
    },
  });

  console.log(`✓ Created ${2} addresses`);

  // ============================================================================
  // CATEGORIES (Hierarchical)
  // ============================================================================
  console.log('📁 Creating categories...');

  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and accessories',
      sortOrder: 1,
    },
  });

  const computers = await prisma.category.create({
    data: {
      name: 'Computers & Laptops',
      slug: 'computers-laptops',
      description: 'Desktop computers, laptops, and accessories',
      parentId: electronics.id,
      sortOrder: 1,
    },
  });

  const smartphones = await prisma.category.create({
    data: {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Mobile phones and accessories',
      parentId: electronics.id,
      sortOrder: 2,
    },
  });

  const clothing = await prisma.category.create({
    data: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel',
      sortOrder: 2,
    },
  });

  const mensClothing = await prisma.category.create({
    data: {
      name: "Men's Clothing",
      slug: 'mens-clothing',
      description: "Clothing for men",
      parentId: clothing.id,
      sortOrder: 1,
    },
  });

  const womensClothing = await prisma.category.create({
    data: {
      name: "Women's Clothing",
      slug: 'womens-clothing',
      description: "Clothing for women",
      parentId: clothing.id,
      sortOrder: 2,
    },
  });

  const homeGarden = await prisma.category.create({
    data: {
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Home improvement and garden supplies',
      sortOrder: 3,
    },
  });

  console.log(`✓ Created ${7} categories`);

  // ============================================================================
  // PRODUCTS
  // ============================================================================
  console.log('📦 Creating products...');

  const product1 = await prisma.product.create({
    data: {
      name: 'MacBook Pro 16-inch',
      slug: 'macbook-pro-16',
      description: 'Powerful laptop with M3 Pro chip, stunning Liquid Retina XDR display, and all-day battery life. Perfect for professionals and creatives.',
      shortDescription: 'High-performance laptop for professionals',
      price: 2499.00,
      compareAtPrice: 2799.00,
      costPrice: 2000.00,
      sku: 'MBP-16-M3-256',
      trackInventory: true,
      isActive: true,
      isFeatured: true,
      metaTitle: 'MacBook Pro 16" - High Performance Laptop',
      metaDescription: 'Shop the latest MacBook Pro with M3 Pro chip',
      averageRating: 4.8,
      reviewCount: 0,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
            alt: 'MacBook Pro front view',
            sortOrder: 1,
          },
          {
            url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
            alt: 'MacBook Pro side view',
            sortOrder: 2,
          },
        ],
      },
      inventory: {
        create: {
          quantity: 50,
          lowStockThreshold: 10,
          status: InventoryStatus.IN_STOCK,
        },
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system. Features Action button and USB-C.',
      shortDescription: 'Premium smartphone with titanium design',
      price: 999.00,
      compareAtPrice: 1099.00,
      costPrice: 700.00,
      sku: 'IP15-PRO-128',
      trackInventory: true,
      isActive: true,
      isFeatured: true,
      metaTitle: 'iPhone 15 Pro - Premium Smartphone',
      metaDescription: 'Experience the latest iPhone with titanium design',
      averageRating: 4.9,
      reviewCount: 0,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1592286927505-c3c0dfe29f94',
            alt: 'iPhone Pro',
            sortOrder: 1,
          },
        ],
      },
      inventory: {
        create: {
          quantity: 100,
          lowStockThreshold: 20,
          status: InventoryStatus.IN_STOCK,
        },
      },
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Wireless Noise-Cancelling Headphones',
      slug: 'wireless-noise-cancelling-headphones',
      description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and exceptional sound quality.',
      shortDescription: 'Premium wireless headphones',
      price: 349.00,
      costPrice: 200.00,
      sku: 'WH-NC-BLK',
      trackInventory: true,
      isActive: true,
      isFeatured: false,
      metaTitle: 'Wireless Noise-Cancelling Headphones',
      metaDescription: 'Premium audio experience with active noise cancellation',
      averageRating: 4.7,
      reviewCount: 0,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
            alt: 'Wireless headphones',
            sortOrder: 1,
          },
        ],
      },
      inventory: {
        create: {
          quantity: 75,
          lowStockThreshold: 15,
          status: InventoryStatus.IN_STOCK,
        },
      },
    },
  });

  const product4 = await prisma.product.create({
    data: {
      name: 'Classic Cotton T-Shirt',
      slug: 'classic-cotton-tshirt',
      description: '100% organic cotton t-shirt with a comfortable fit. Available in multiple colors. Sustainable and eco-friendly.',
      shortDescription: 'Comfortable organic cotton t-shirt',
      price: 29.99,
      compareAtPrice: 39.99,
      costPrice: 15.00,
      sku: 'TSH-COT-BLK-M',
      trackInventory: true,
      isActive: true,
      isFeatured: false,
      metaTitle: 'Classic Cotton T-Shirt - Organic & Sustainable',
      metaDescription: 'Comfortable organic cotton t-shirt for everyday wear',
      averageRating: 4.5,
      reviewCount: 0,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
            alt: 'Cotton t-shirt',
            sortOrder: 1,
          },
        ],
      },
      inventory: {
        create: {
          quantity: 200,
          lowStockThreshold: 30,
          status: InventoryStatus.IN_STOCK,
        },
      },
    },
  });

  const product5 = await prisma.product.create({
    data: {
      name: 'Smart Watch Series 9',
      slug: 'smart-watch-series-9',
      description: 'Advanced smartwatch with health tracking, fitness monitoring, GPS, and seamless connectivity. Water resistant and stylish.',
      shortDescription: 'Advanced fitness and health smartwatch',
      price: 399.00,
      costPrice: 250.00,
      sku: 'SW-S9-BLK-44',
      trackInventory: true,
      isActive: true,
      isFeatured: true,
      metaTitle: 'Smart Watch Series 9 - Health & Fitness Tracker',
      metaDescription: 'Track your health and fitness with the latest smartwatch',
      averageRating: 4.6,
      reviewCount: 0,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
            alt: 'Smart watch',
            sortOrder: 1,
          },
        ],
      },
      inventory: {
        create: {
          quantity: 8,
          lowStockThreshold: 10,
          status: InventoryStatus.LOW_STOCK,
        },
      },
    },
  });

  console.log(`✓ Created ${5} products with images and inventory`);

  // ============================================================================
  // PRODUCT CATEGORIES
  // ============================================================================
  console.log('🔗 Creating product-category relationships...');

  await prisma.productCategory.createMany({
    data: [
      { productId: product1.id, categoryId: computers.id },
      { productId: product1.id, categoryId: electronics.id },
      { productId: product2.id, categoryId: smartphones.id },
      { productId: product2.id, categoryId: electronics.id },
      { productId: product3.id, categoryId: electronics.id },
      { productId: product4.id, categoryId: mensClothing.id },
      { productId: product4.id, categoryId: clothing.id },
      { productId: product5.id, categoryId: electronics.id },
    ],
  });

  console.log(`✓ Created product-category relationships`);

  // ============================================================================
  // REVIEWS
  // ============================================================================
  console.log('⭐ Creating reviews...');

  await prisma.review.createMany({
    data: [
      {
        productId: product1.id,
        userId: customer1.id,
        rating: 5,
        title: 'Excellent laptop!',
        comment: 'The MacBook Pro is amazing. Fast, beautiful display, and great battery life.',
        isVerifiedPurchase: true,
        isPublished: true,
      },
      {
        productId: product1.id,
        userId: customer2.id,
        rating: 4,
        title: 'Great but expensive',
        comment: 'Powerful machine but the price is quite high. Worth it for professionals.',
        isVerifiedPurchase: true,
        isPublished: true,
      },
      {
        productId: product2.id,
        userId: customer1.id,
        rating: 5,
        title: 'Best phone ever!',
        comment: 'The camera quality is incredible and the titanium design feels premium.',
        isVerifiedPurchase: true,
        isPublished: true,
      },
      {
        productId: product3.id,
        userId: customer2.id,
        rating: 5,
        title: 'Amazing sound quality',
        comment: 'Noise cancellation works perfectly. Great for flights and commuting.',
        isVerifiedPurchase: false,
        isPublished: true,
      },
      {
        productId: product4.id,
        userId: customer1.id,
        rating: 4,
        title: 'Comfortable and eco-friendly',
        comment: 'Nice quality cotton, fits well. Happy with this purchase.',
        isVerifiedPurchase: true,
        isPublished: true,
      },
    ],
  });

  // Update product review aggregates
  await prisma.product.update({
    where: { id: product1.id },
    data: { averageRating: 4.5, reviewCount: 2 },
  });

  await prisma.product.update({
    where: { id: product2.id },
    data: { averageRating: 5.0, reviewCount: 1 },
  });

  await prisma.product.update({
    where: { id: product3.id },
    data: { averageRating: 5.0, reviewCount: 1 },
  });

  await prisma.product.update({
    where: { id: product4.id },
    data: { averageRating: 4.0, reviewCount: 1 },
  });

  console.log(`✓ Created ${5} reviews`);

  // ============================================================================
  // CARTS
  // ============================================================================
  console.log('🛒 Creating carts...');

  const cart1 = await prisma.cart.create({
    data: {
      userId: customer1.id,
      items: {
        create: [
          {
            productId: product3.id,
            quantity: 1,
            price: product3.price,
          },
        ],
      },
    },
  });

  console.log(`✓ Created cart for customer`);

  // ============================================================================
  // ORDERS
  // ============================================================================
  console.log('📋 Creating orders...');

  const order1 = await prisma.order.create({
    data: {
      userId: customer1.id,
      orderNumber: 'ORD-2024-0001',
      status: OrderStatus.DELIVERED,
      subtotal: 999.00,
      tax: 89.91,
      shippingCost: 15.00,
      discount: 0,
      total: 1103.91,
      shippingAddressId: address1.id,
      billingAddressId: address1.id,
      trackingNumber: 'TRK123456789',
      carrier: 'FedEx',
      shippedAt: new Date('2024-01-15'),
      deliveredAt: new Date('2024-01-18'),
      items: {
        create: [
          {
            productId: product2.id,
            quantity: 1,
            price: 999.00,
            total: 999.00,
          },
        ],
      },
      payment: {
        create: {
          status: PaymentStatus.SUCCEEDED,
          method: 'card',
          amount: 1103.91,
          currency: 'USD',
          stripePaymentIntentId: 'pi_mock_123456',
          stripeChargeId: 'ch_mock_123456',
          transactionId: 'txn_mock_123456',
          paidAt: new Date('2024-01-14'),
        },
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: customer2.id,
      orderNumber: 'ORD-2024-0002',
      status: OrderStatus.PROCESSING,
      subtotal: 2528.00,
      tax: 227.52,
      shippingCost: 20.00,
      discount: 50.00,
      total: 2725.52,
      shippingAddressId: address2.id,
      billingAddressId: address2.id,
      trackingNumber: 'TRK987654321',
      carrier: 'UPS',
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 1,
            price: 2499.00,
            total: 2499.00,
          },
          {
            productId: product4.id,
            quantity: 1,
            price: 29.00,
            total: 29.00,
          },
        ],
      },
      payment: {
        create: {
          status: PaymentStatus.SUCCEEDED,
          method: 'card',
          amount: 2725.52,
          currency: 'USD',
          stripePaymentIntentId: 'pi_mock_789012',
          stripeChargeId: 'ch_mock_789012',
          transactionId: 'txn_mock_789012',
          paidAt: new Date('2024-01-20'),
        },
      },
    },
  });

  console.log(`✓ Created ${2} orders with payments`);

  // ============================================================================
  // AUDIT LOGS
  // ============================================================================
  console.log('📝 Creating audit logs...');

  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'CREATE',
        entity: 'Product',
        entityId: product1.id,
        changes: {
          name: 'MacBook Pro 16-inch',
          price: 2499.00,
        },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
      {
        userId: adminUser.id,
        action: 'UPDATE',
        entity: 'Order',
        entityId: order1.id,
        changes: {
          status: { from: 'PROCESSING', to: 'SHIPPED' },
        },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
      {
        userId: adminUser.id,
        action: 'UPDATE',
        entity: 'Order',
        entityId: order1.id,
        changes: {
          status: { from: 'SHIPPED', to: 'DELIVERED' },
        },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
    ],
  });

  console.log(`✓ Created audit logs`);

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n✅ Database seeding completed successfully!\n');
  console.log('Summary:');
  console.log('--------');
  console.log(`👥 Users: 3 (1 admin, 2 customers)`);
  console.log(`📁 Categories: 7 (including hierarchical structure)`);
  console.log(`📦 Products: 5 (with images and inventory)`);
  console.log(`⭐ Reviews: 5`);
  console.log(`🛒 Carts: 1`);
  console.log(`📋 Orders: 2 (with payments)`);
  console.log(`📍 Addresses: 2`);
  console.log(`📝 Audit Logs: 3\n`);
  console.log('Test Credentials:');
  console.log('-----------------');
  console.log('Admin: admin@ecommerce.com / Admin123!');
  console.log('Customer 1: john.doe@example.com / Customer123!');
  console.log('Customer 2: jane.smith@example.com / Customer123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
