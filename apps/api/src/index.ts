import { prisma, User, Product } from '@ecommerce/database';

async function main() {
  console.log('Testing Prisma client in API app...');
  
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });
  
  console.log('Users:', users.length);
  console.log('First user:', users[0]);
  
  await prisma.$disconnect();
}

main().catch(console.error);
