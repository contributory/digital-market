import { prisma, Product, Category } from '@ecommerce/database';

async function main() {
  console.log('Testing Prisma client in Web app...');
  
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { take: 1 },
      inventory: true,
    },
    take: 3,
  });
  
  console.log('Products:', products.length);
  console.log('First product:', products[0]?.name);
  
  await prisma.$disconnect();
}

main().catch(console.error);
