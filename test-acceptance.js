const { PrismaClient } = require('./packages/database/node_modules/.prisma/client');

const prisma = new PrismaClient();

let passed = 0;
let failed = 0;

function pass(msg) {
  console.log('✓ PASSED:', msg);
  passed++;
}

function fail(msg) {
  console.log('✗ FAILED:', msg);
  failed++;
}

async function runTests() {
  console.log('============================================');
  console.log('Database Schema Acceptance Tests');
  console.log('============================================\n');

  try {
    // Test 1: Database Connection
    console.log('1. Testing Database Connection...');
    await prisma.$connect();
    pass('Database connection successful');

    // Test 2: Tables Count
    console.log('\n2. Testing Tables Creation...');
    const tables = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name != '_prisma_migrations'
    `;
    if (Number(tables[0].count) === 18) {
      pass(`All 18 tables created (count: ${tables[0].count})`);
    } else {
      fail(`Expected 18 tables, found ${tables[0].count}`);
    }

    // Test 3: Enums
    console.log('\n3. Testing Enums Creation...');
    const enums = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM pg_type 
      WHERE typtype = 'e'
    `;
    if (Number(enums[0].count) === 4) {
      pass(`All 4 enums created (UserRole, OrderStatus, PaymentStatus, InventoryStatus)`);
    } else {
      fail(`Expected 4 enums, found ${enums[0].count}`);
    }

    // Test 4: Users
    console.log('\n4. Testing Seed Data - Users...');
    const userCount = await prisma.user.count();
    if (userCount >= 3) {
      pass(`Users seeded (count: ${userCount})`);
    } else {
      fail(`Expected at least 3 users, found ${userCount}`);
    }

    // Test 5: Admin User
    const adminUser = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });
    if (adminUser) {
      pass(`Admin user created (${adminUser.email})`);
    } else {
      fail('Admin user not found');
    }

    // Test 6: Categories
    console.log('\n5. Testing Seed Data - Categories...');
    const categoryCount = await prisma.category.count();
    if (categoryCount >= 7) {
      pass(`Categories seeded (count: ${categoryCount})`);
    } else {
      fail(`Expected at least 7 categories, found ${categoryCount}`);
    }

    // Test 7: Hierarchical Categories
    const childCategories = await prisma.category.findMany({
      where: { parentId: { not: null } }
    });
    if (childCategories.length > 0) {
      pass(`Hierarchical categories configured (${childCategories.length} child categories)`);
    } else {
      fail('No hierarchical categories found');
    }

    // Test 8: Products
    console.log('\n6. Testing Seed Data - Products...');
    const productCount = await prisma.product.count();
    if (productCount >= 5) {
      pass(`Products seeded (count: ${productCount})`);
    } else {
      fail(`Expected at least 5 products, found ${productCount}`);
    }

    // Test 9: Product Images
    const imageCount = await prisma.productImage.count();
    if (imageCount >= 5) {
      pass(`Product images seeded (count: ${imageCount})`);
    } else {
      fail(`Expected at least 5 images, found ${imageCount}`);
    }

    // Test 10: Inventory
    console.log('\n7. Testing Inventory Tracking...');
    const inventoryCount = await prisma.inventory.count();
    if (inventoryCount >= 5) {
      pass(`Inventory tracking configured (count: ${inventoryCount})`);
    } else {
      fail(`Expected at least 5 inventory records, found ${inventoryCount}`);
    }

    // Test 11: Reviews
    console.log('\n8. Testing Reviews...');
    const reviewCount = await prisma.review.count();
    if (reviewCount >= 5) {
      pass(`Reviews seeded (count: ${reviewCount})`);
    } else {
      fail(`Expected at least 5 reviews, found ${reviewCount}`);
    }

    // Test 12: Review Aggregation
    const productWithReviews = await prisma.product.findFirst({
      where: { reviewCount: { gt: 0 } }
    });
    if (productWithReviews && productWithReviews.averageRating > 0) {
      pass(`Review aggregation fields working (avg rating: ${productWithReviews.averageRating})`);
    } else {
      fail('Review aggregation fields not working');
    }

    // Test 13: Orders
    console.log('\n9. Testing Orders...');
    const orderCount = await prisma.order.count();
    if (orderCount >= 2) {
      pass(`Orders seeded (count: ${orderCount})`);
    } else {
      fail(`Expected at least 2 orders, found ${orderCount}`);
    }

    // Test 14: Payments
    const paymentCount = await prisma.payment.count();
    if (paymentCount >= 2) {
      pass(`Payments seeded (count: ${paymentCount})`);
    } else {
      fail(`Expected at least 2 payments, found ${paymentCount}`);
    }

    // Test 15: Addresses
    console.log('\n10. Testing Addresses...');
    const addressCount = await prisma.address.count();
    if (addressCount >= 2) {
      pass(`Addresses seeded (count: ${addressCount})`);
    } else {
      fail(`Expected at least 2 addresses, found ${addressCount}`);
    }

    // Test 16: Audit Logs
    console.log('\n11. Testing Audit Logs...');
    const auditLogCount = await prisma.auditLog.count();
    if (auditLogCount >= 3) {
      pass(`Audit logs seeded (count: ${auditLogCount})`);
    } else {
      fail(`Expected at least 3 audit logs, found ${auditLogCount}`);
    }

    // Test 17: Indexes
    console.log('\n12. Testing Indexes...');
    const indexes = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM pg_indexes 
      WHERE schemaname = 'public'
    `;
    if (indexes[0].count > 30) {
      pass(`Indexes created on frequently queried fields (count: ${indexes[0].count})`);
    } else {
      fail(`Expected more than 30 indexes, found ${indexes[0].count}`);
    }

    // Test 18: Product-Category Relations
    console.log('\n13. Testing Product-Category Relations...');
    const productCategoryCount = await prisma.productCategory.count();
    if (productCategoryCount >= 8) {
      pass(`Product-category relationships seeded (count: ${productCategoryCount})`);
    } else {
      fail(`Expected at least 8 product-category relations, found ${productCategoryCount}`);
    }

    // Test 19: Carts
    console.log('\n14. Testing Carts...');
    const cartCount = await prisma.cart.count();
    if (cartCount >= 1) {
      pass(`Carts seeded (count: ${cartCount})`);
    } else {
      fail(`Expected at least 1 cart, found ${cartCount}`);
    }

  } catch (error) {
    console.error('Error during tests:', error);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n============================================');
  console.log('Test Results Summary');
  console.log('============================================');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('');

  if (failed === 0) {
    console.log('✓ All acceptance criteria met!');
    process.exit(0);
  } else {
    console.log('✗ Some tests failed. Please review.');
    process.exit(1);
  }
}

runTests();
