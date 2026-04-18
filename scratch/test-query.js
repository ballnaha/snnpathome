const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slug = "สควิดดี้";
  console.log("Querying for slug:", slug);
  
  // Try findFirst (used in metadata)
  const p1 = await prisma.product.findFirst({
    where: { slug, isActive: true, brand: { isActive: true } },
    include: { brand: true },
  });
  console.log("findFirst result:", p1 ? "found" : "null");

  // Try findUnique (used in page body)
  try {
    const p2 = await prisma.product.findUnique({
      where: { slug, isActive: true, brand: { isActive: true } },
      include: { brand: true },
    });
    console.log("findUnique result:", p2 ? "found" : "null");
  } catch (e) {
    console.log("findUnique error:", e.message);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
