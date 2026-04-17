import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const brands = [
  { name: "Bento", slug: "bento", priority: 1, logo: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/bento-logo.png" },
  { name: "Jele", slug: "jele", priority: 2, logo: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/jele-logo.png" },
  { name: "Lotus", slug: "lotus", priority: 3, logo: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/lotus-logo.png" },
  { name: "Squidy", slug: "squidy", priority: 4, logo: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/squidy-logo.png" },
];

const products = [
  // Bento
  {
    brandSlug: "bento",
    name: "เบนโตะ ปลาหมึกอบทรงเครื่อง (สีแดง) 20ก.",
    slug: "bento-squid-spicy-red-20g",
    description: "ขนมปลาหมึกอบกรอบ รสทรงเครื่อง กลิ่นหอม รสจัดจ้าน จาก SNNP เบนโตะ",
    price: 25,
    discount: 30,
    stock: 200,
    image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/bento-red.png",
  },
  {
    brandSlug: "bento",
    name: "เบนโตะ ปลาหมึกอบรสชีส (สีเหลือง) 20ก.",
    slug: "bento-squid-cheese-yellow-20g",
    description: "ขนมปลาหมึกอบกรอบ รสชีสเข้มข้น เด็กๆ ชอบ",
    price: 25,
    discount: 30,
    stock: 150,
    image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/bento-yellow.png",
  },
  {
    brandSlug: "bento",
    name: "เบนโตะ ปลาหมึกอบรสดั้งเดิม (สีน้ำเงิน) 20ก.",
    slug: "bento-squid-original-blue-20g",
    description: "ขนมปลาหมึกอบรสดั้งเดิม รสชาติคลาสสิกที่ทุกคนรัก",
    price: 25,
    discount: null,
    stock: 180,
    image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/bento-blue.png",
  },
  {
    brandSlug: "bento",
    name: "เบนโตะ แพ็ค 6 ชิ้น รสทรงเครื่อง",
    slug: "bento-squid-spicy-pack6",
    description: "เบนโตะปลาหมึกอบรสทรงเครื่อง แพ็คคุ้มค่า 6 ชิ้น",
    price: 139,
    discount: 150,
    stock: 80,
    image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/bento-red.png",
  },
  // Jele
  {
    brandSlug: "jele",
    name: "เจเล่ บิวตี้ รสแอปเปิ้ล (สีเขียว) 150ก.",
    slug: "jele-beauty-apple-green-150g",
    description: "เยลลี่วุ้นกลุ่มผลิตภัณฑ์ดูแลผิว รสแอปเปิ้ล ผสมคอลลาเจนและวิตามินซี",
    price: 10,
    discount: null,
    stock: 300,
    image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/jele-green.png",
  },
  {
    brandSlug: "jele",
    name: "เจเล่ บิวตี้ รสแบล็คเคอร์แรนท์ (สีม่วง) 150ก.",
    slug: "jele-beauty-blackcurrant-purple-150g",
    description: "เยลลี่วุ้นรสแบล็คเคอร์แรนท์ หวานอมเปรี้ยว กินแล้วสดชื่น",
    price: 10,
    discount: null,
    stock: 280,
    image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/jele-purple.png",
  },
  {
    brandSlug: "jele",
    name: "เจเล่ บิวตี้ รสส้ม (สีส้ม) 150ก.",
    slug: "jele-beauty-orange-150g",
    description: "เยลลี่วุ้นรสส้ม วิตามินซีสูง ผิวใส",
    price: 10,
    discount: null,
    stock: 250,
    image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/jele-orange.png",
  },
  {
    brandSlug: "jele",
    name: "เจเล่ บิวตี้ แพ็ค 24 ชิ้น คละรส",
    slug: "jele-beauty-mixed-pack24",
    description: "เจเล่บิวตี้แพ็คคุ้มค่า 24 ชิ้นคละรส",
    price: 220,
    discount: 240,
    stock: 60,
    image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/jele-green.png",
  },
  // Lotus
  {
    brandSlug: "lotus",
    name: "โลตัส ขนมรูปน่องไก่ รสทรงเครื่อง 55ก.",
    slug: "lotus-chicken-leg-spicy-55g",
    description: "ขนมข้าวโพดทอดกรอบ รูปน่องไก่ รสทรงเครื่องเข้มข้น อร่อยไม่หยุด",
    price: 20,
    discount: null,
    stock: 200,
    image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/lotus-original.png",
  },
  {
    brandSlug: "lotus",
    name: "โลตัส ขนมรูปน่องไก่ รสบาร์บีคิว 55ก.",
    slug: "lotus-chicken-leg-bbq-55g",
    description: "ขนมรูปน่องไก่รสบาร์บีคิวหอมควัน",
    price: 20,
    discount: null,
    stock: 170,
    image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/lotus-original.png",
  },
  {
    brandSlug: "lotus",
    name: "โลตัส แพ็ค 6 ชิ้น รสทรงเครื่อง",
    slug: "lotus-chicken-leg-spicy-pack6",
    description: "แพ็คคุ้มค่า 6 ชิ้นรสทรงเครื่อง",
    price: 109,
    discount: 120,
    stock: 90,
    image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/lotus-original.png",
  },
  // Squidy
  {
    brandSlug: "squidy",
    name: "สควิดดี้ ปลาหมึกกรอบ รสออริจินัล 20ก.",
    slug: "squidy-original-20g",
    description: "ปลาหมึกกรอบแบบดั้งเดิม หอม อร่อย กินเพลิน",
    price: 15,
    discount: null,
    stock: 220,
    image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/squidy.png",
  },
  {
    brandSlug: "squidy",
    name: "สควิดดี้ ปลาหมึกกรอบ รสเผ็ด 20ก.",
    slug: "squidy-spicy-20g",
    description: "ปลาหมึกกรอบรสเผ็ดจัดจ้าน สำหรับคนชอบเผ็ด",
    price: 15,
    discount: null,
    stock: 190,
    image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/squidy.png",
  },
  {
    brandSlug: "squidy",
    name: "สควิดดี้ แพ็ค 12 ชิ้น คละรส",
    slug: "squidy-mixed-pack12",
    description: "สควิดดี้แพ็คคุ้มค่า 12 ชิ้นคละรส",
    price: 165,
    discount: 180,
    stock: 70,
    image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/squidy.png",
  },
];

const promotions = [
  {
    title: "ดีลพิเศษส่งตรงถึงบ้าน",
    description: "ช้อปสินค้าขายดีจากเครือ SNNP ในราคาพิเศษ พร้อมโปรโมชันประจำเดือนที่คัดมาเพื่อสายตุนและสายกินเล่นโดยเฉพาะ",
    imageUrl: "/images/logo.png",
    sortOrder: 1,
  },
  {
    title: "แพ็กคุ้ม ซื้อเยอะยิ่งคุ้ม",
    description: "รวมสินค้ารูปแบบแพ็กและลังในราคาสุดคุ้ม เหมาะสำหรับซื้อเข้าบ้าน ซื้อฝาก หรือสต็อกไว้ได้ยาวๆ แบบไม่ต้องกังวล",
    imageUrl: "/images/logo.png",
    sortOrder: 2,
  },
  {
    title: "โปรโมชันอัปเดตตลอด",
    description: "ติดตามโปรโมชันใหม่ได้ที่หน้านี้ ทั้งสินค้าราคาพิเศษ โปรฯ ตามฤดูกาล และข้อเสนอสำหรับสมาชิก SNNP AT HOME",
    imageUrl: "/images/logo.png",
    sortOrder: 3,
  },
];

const coupons = [
  {
    code: "SNNP10",
    name: "โค้ดต้อนรับ SNNP",
    description: "ส่วนลดเริ่มต้นสำหรับลูกค้าที่สั่งซื้อผ่าน SNNP AT HOME",
    type: "FIXED",
    value: 10,
    minSubtotal: 100,
    maxDiscount: null,
    isActive: true,
    startsAt: null,
    endsAt: null,
  },
];

async function main() {
  console.log("🌱 Seeding brands...");

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name, logo: brand.logo, priority: brand.priority },
      create: brand,
    });
  }

  console.log("✅ Brands seeded");
  console.log("🌱 Seeding products...");

  for (const product of products) {
    const { brandSlug, ...productData } = product;
    const brand = await prisma.brand.findUnique({ where: { slug: brandSlug } });
    if (!brand) continue;

    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: { ...productData, brandId: brand.id },
      create: { ...productData, brandId: brand.id },
    });
  }

  console.log(`✅ ${products.length} products seeded`);
  console.log("🌱 Seeding promotions...");

  for (const promotion of promotions) {
    await prisma.promotion.upsert({
      where: { title: promotion.title },
      update: promotion,
      create: promotion,
    });
  }

  console.log(`✅ ${promotions.length} promotions seeded`);
  console.log("🌱 Seeding coupons...");

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: coupon,
      create: coupon,
    });
  }

  console.log(`✅ ${coupons.length} coupons seeded`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
