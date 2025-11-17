#!/bin/bash

# E-commerce Platform Database Acceptance Test
# This script verifies all acceptance criteria for the Prisma schema

set -e

echo "============================================"
echo "Database Schema Acceptance Tests"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function
test_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $1"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $1"
        ((TESTS_FAILED++))
    fi
}

echo "1. Testing Prisma Migration..."
cd /home/engine/project/packages/database
pnpm prisma migrate status > /dev/null 2>&1
test_result "Prisma migrations are up to date"

echo ""
echo "2. Testing Prisma Client Generation..."
[ -f "node_modules/.prisma/client/index.d.ts" ]
test_result "Prisma client is generated"

echo ""
echo "3. Testing Database Connection..."
node -e "const { PrismaClient } = require('.prisma/client'); const p = new PrismaClient(); p.\$connect().then(() => { console.log('Connected'); process.exit(0); }).catch(() => process.exit(1));" > /dev/null 2>&1
test_result "Database connection successful"

echo ""
echo "4. Testing Tables Creation..."
TABLE_COUNT=$(node -e "const { PrismaClient } = require('.prisma/client'); const p = new PrismaClient(); p.\$queryRaw\`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name != '_prisma_migrations'\`.then(r => { console.log(r[0].count); process.exit(0); });" 2>/dev/null)
[ "$TABLE_COUNT" -eq "18" ]
test_result "All 18 tables created (users, accounts, sessions, verification_tokens, categories, products, product_images, product_categories, inventory, reviews, carts, cart_items, orders, order_items, payments, addresses, audit_logs, stripe_payment_intents)"

echo ""
echo "5. Testing Enums Creation..."
ENUM_COUNT=$(node -e "const { PrismaClient } = require('.prisma/client'); const p = new PrismaClient(); p.\$queryRaw\`SELECT COUNT(*) as count FROM pg_type WHERE typtype = 'e'\`.then(r => { console.log(r[0].count); process.exit(0); });" 2>/dev/null)
[ "$ENUM_COUNT" -eq "4" ]
test_result "All 4 enums created (UserRole, OrderStatus, PaymentStatus, InventoryStatus)"

echo ""
echo "6. Testing Seed Data..."
USER_COUNT=$(node -e "const { PrismaClient } = require('.prisma/client'); const p = new PrismaClient(); p.user.count().then(c => { console.log(c); process.exit(0); });" 2>/dev/null)
[ "$USER_COUNT" -ge "3" ]
test_result "Users seeded (count: $USER_COUNT)"

CATEGORY_COUNT=$(node -e "const { PrismaClient } = require('.prisma/client'); const p = new PrismaClient(); p.category.count().then(c => { console.log(c); process.exit(0); });" 2>/dev/null)
[ "$CATEGORY_COUNT" -ge "7" ]
test_result "Categories seeded with hierarchical structure (count: $CATEGORY_COUNT)"

PRODUCT_COUNT=$(node -e "const { PrismaClient } = require('.prisma/client'); const p = new PrismaClient(); p.product.count().then(c => { console.log(c); process.exit(0); });" 2>/dev/null)
[ "$PRODUCT_COUNT" -ge "5" ]
test_result "Products seeded (count: $PRODUCT_COUNT)"

IMAGE_COUNT=$(node -e "const { PrismaClient } = require('.prisma/client'); const p = new PrismaClient(); p.productImage.count().then(c => { console.log(c); process.exit(0); });" 2>/dev/null)
[ "$IMAGE_COUNT" -ge "5" ]
test_result "Product images seeded (count: $IMAGE_COUNT)"

ORDER_COUNT=$(node -e "const { PrismaClient } = require('.prisma/client'); const p = new PrismaClient(); p.order.count().then(c => { console.log(c); process.exit(0); });" 2>/dev/null)
[ "$ORDER_COUNT" -ge "2" ]
test_result "Orders seeded (count: $ORDER_COUNT)"

echo ""
echo "7. Testing Hierarchical Categories..."
node -e "const { PrismaClient } = require('.prisma/client'); const p = new PrismaClient(); p.category.findMany({ where: { parentId: { not: null } } }).then(children => { if (children.length > 0) process.exit(0); else process.exit(1); });" > /dev/null 2>&1
test_result "Hierarchical categories with parent-child relationships"

echo ""
echo "8. Testing Inventory Tracking..."
node -e "const { PrismaClient } = require('.prisma/client'); const p = new PrismaClient(); p.inventory.findMany().then(inv => { if (inv.length > 0 && inv[0].quantity !== undefined) process.exit(0); else process.exit(1); });" > /dev/null 2>&1
test_result "Inventory tracking configured"

echo ""
echo "9. Testing Review Aggregation..."
node -e "const { PrismaClient } = require('.prisma/client'); const p = new PrismaClient(); p.product.findFirst({ where: { reviewCount: { gt: 0 } } }).then(prod => { if (prod && prod.averageRating !== undefined) process.exit(0); else process.exit(1); });" > /dev/null 2>&1
test_result "Review aggregation fields (averageRating, reviewCount)"

echo ""
echo "10. Testing Indexes..."
INDEX_COUNT=$(node -e "const { PrismaClient } = require('.prisma/client'); const p = new PrismaClient(); p.\$queryRaw\`SELECT COUNT(*) as count FROM pg_indexes WHERE schemaname = 'public'\`.then(r => { console.log(r[0].count); process.exit(0); });" 2>/dev/null)
[ "$INDEX_COUNT" -gt "30" ]
test_result "Indexes created on frequently queried fields (count: $INDEX_COUNT)"

echo ""
echo "11. Testing Prisma Client Import in Apps..."
cd /home/engine/project/apps/api
node -e "try { require('@ecommerce/database'); console.log('success'); } catch(e) { console.error(e); process.exit(1); }" > /dev/null 2>&1
test_result "Prisma client importable from API app"

echo ""
echo "12. Testing Shared Typings..."
cd /home/engine/project/apps/api
node -e "const { UserRole, OrderStatus, PaymentStatus, InventoryStatus } = require('@ecommerce/database'); if (UserRole && OrderStatus) process.exit(0); else process.exit(1);" > /dev/null 2>&1
test_result "Shared typings available (enums exported)"

echo ""
echo "============================================"
echo "Test Results Summary"
echo "============================================"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All acceptance criteria met!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review.${NC}"
    exit 1
fi
