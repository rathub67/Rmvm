import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

import { prisma } from "./db.js";

const email = String(process.env.ADMIN_EMAIL || "admin@rmvm.com")
  .trim()
  .toLowerCase();
const password = process.env.ADMIN_PASSWORD || "admin123";
const name = process.env.ADMIN_NAME || "Administrador RMVM";

export async function criarAdmin() {
  const existe = await prisma.user.findUnique({ where: { email } });

  if (existe) {
    return false;
  }

  await prisma.user.create({
    data: {
      id: `usr_${randomUUID()}`,
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: "admin",
      lastLoginAt: null,
      loginCount: 0,
    },
  });

  return true;
}
