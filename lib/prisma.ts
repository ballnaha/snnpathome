import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const cachedPrisma = globalThis.prismaGlobal;

const prisma = cachedPrisma && "promotion" in cachedPrisma && "coupon" in cachedPrisma
  ? cachedPrisma
  : prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
