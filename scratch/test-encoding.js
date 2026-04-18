const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const encSlug = "%E0%B8%AA%E0%B8%84%E0%B8%A7%E0%B8%B4%E0%B8%94%E0%B8%94%E0%B8%B5%E0%B9%89";
  const decSlug = decodeURIComponent(encSlug);
  
  console.log("Encoded:", encSlug);
  console.log("Decoded:", decSlug);
  
  const p1 = await prisma.product.findFirst({ where: { slug: encSlug } });
  console.log("Querying with ENCODED:", p1 ? "found" : "null");

  const p2 = await prisma.product.findFirst({ where: { slug: decSlug } });
  console.log("Querying with DECODED:", p2 ? "found" : "null");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
