import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  Prisma,
  PrismaClient,
  RoleCode,
  UserStatus,
} from '@prisma/client';

const BCRYPT_ROUNDS = 12;

type DbClient = Prisma.TransactionClient | PrismaClient;

type RoleSeed = {
  code: RoleCode;
  name: string;
  description: string;
};

const ROLES: RoleSeed[] = [
  {
    code: RoleCode.SUPER_ADMIN,
    name: 'Super Admin',
    description: 'Full system access including role assignment',
  },
  {
    code: RoleCode.ADMIN,
    name: 'Admin',
    description: 'Dashboard administrator with catalog and order management',
  },
  {
    code: RoleCode.MANAGER,
    name: 'Manager',
    description: 'Operational dashboard access for catalog and orders',
  },
  {
    code: RoleCode.CUSTOMER,
    name: 'Customer',
    description: 'Storefront customer role (default for registration)',
  },
];

const CATEGORIES = [
  { name: "Men's Collection", description: 'Contemporary clothing designed for men' },
  { name: "Women's Collection", description: 'Elegant and luxury apparel for women' },
  { name: 'Casualwear', description: 'Everyday comfortable attire' },
  { name: 'Accessories', description: 'Luxury bags, belts, and fashion accessories' },
];

const STYLES = [
  { name: 'Modern Casual', description: 'Relaxed yet sophisticated everyday apparel' },
  { name: 'Formal Elegance', description: 'Crisp tailored fits and premium eveningwear' },
  { name: 'Summer Promotion', description: 'Lightweight linen and vibrant summer hues' },
  { name: 'Streetwear', description: 'Trendy urban fashion and denim outerwear' },
  { name: 'Luxury Wear', description: 'Handcrafted luxury pieces and high fashion' },
];

const SIZES = [
  { name: 'XS', sortOrder: 1 },
  { name: 'S', sortOrder: 2 },
  { name: 'M', sortOrder: 3 },
  { name: 'L', sortOrder: 4 },
  { name: 'XL', sortOrder: 5 },
  { name: 'XXL', sortOrder: 6 },
];

const PRODUCTS = [
  {
    name: 'Classic Tailored Blazer',
    description: 'Expertly structured wool-blend blazer with slim peak lapels and horn buttons. Designed for formal affairs and polished professional wear.',
    price: 189.99,
    categoryName: "Men's Collection",
    styleName: 'Formal Elegance',
    sizeNames: ['S', 'M', 'L', 'XL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80', sortOrder: 1, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80', sortOrder: 2, isPrimary: false },
    ],
  },
  {
    name: 'Elegance Evening Gown',
    description: 'Bespoke floor-length silk dress featuring a softly draped neckline and tailored waist. Perfect for gala evenings and high-profile events.',
    price: 249.50,
    categoryName: "Women's Collection",
    styleName: 'Luxury Wear',
    sizeNames: ['XS', 'S', 'M', 'L'],
    images: [
      { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80', sortOrder: 1, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80', sortOrder: 2, isPrimary: false },
    ],
  },
  {
    name: 'Casual Combed Cotton Crewneck',
    description: 'Ultra-soft 100% combed cotton crewneck sweater. Pre-shrunk fabric ensures long-lasting comfort and effortless casual style.',
    price: 34.99,
    categoryName: 'Casualwear',
    styleName: 'Modern Casual',
    sizeNames: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80', sortOrder: 1, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80', sortOrder: 2, isPrimary: false },
    ],
  },
  {
    name: 'Urban Street Denim Jacket',
    description: 'Heavyweight vintage wash denim jacket with silver button hardware and dual chest flap pockets. A timeless streetwear essential.',
    price: 119.00,
    categoryName: "Men's Collection",
    styleName: 'Streetwear',
    sizeNames: ['S', 'M', 'L', 'XL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80', sortOrder: 1, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', sortOrder: 2, isPrimary: false },
    ],
  },
  {
    name: 'Summer Linen Button-Down Shirt',
    description: 'Breathable European linen short-sleeve shirt crafted for warm weather elegance. Lightweight, airy, and softly textured.',
    price: 59.90,
    categoryName: "Men's Collection",
    styleName: 'Summer Promotion',
    sizeNames: ['S', 'M', 'L', 'XL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', sortOrder: 1, isPrimary: true },
    ],
  },
  {
    name: 'Luxury Leather Crossbody Bag',
    description: 'Full-grain Italian calfskin leather crossbody bag with brushed gold accents, internal card slots, and an adjustable shoulder strap.',
    price: 145.00,
    categoryName: 'Accessories',
    styleName: 'Luxury Wear',
    sizeNames: ['M'],
    images: [
      { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80', sortOrder: 1, isPrimary: true },
    ],
  },
  {
    name: 'Classic White T-Shirt',
    description: 'A wardrobe staple. 100% organic cotton, regular fit white t-shirt.',
    price: 25.00,
    categoryName: 'Casualwear',
    styleName: 'Modern Casual',
    sizeNames: ['S', 'M', 'L', 'XL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', sortOrder: 1, isPrimary: true },
    ],
  },
  {
    name: 'Slim Fit Chino Pants',
    description: 'Versatile slim-fit chinos crafted from stretch-cotton twill for all-day comfort.',
    price: 49.99,
    categoryName: "Men's Collection",
    styleName: 'Modern Casual',
    sizeNames: ['M', 'L', 'XL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80', sortOrder: 1, isPrimary: true },
    ],
  },
  {
    name: 'Floral Summer Dress',
    description: 'Lightweight chiffon dress with vibrant floral prints, featuring a wrap design and tie-waist.',
    price: 89.00,
    categoryName: "Women's Collection",
    styleName: 'Summer Promotion',
    sizeNames: ['XS', 'S', 'M', 'L'],
    images: [
      { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80', sortOrder: 1, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1596455607563-ad6193f76b17?w=800&q=80', sortOrder: 2, isPrimary: false },
    ],
  },
  {
    name: 'Oversized Vintage Hoodie',
    description: 'Heavyweight cotton-blend hoodie with a relaxed, oversized fit and dropped shoulders for maximum comfort.',
    price: 65.00,
    categoryName: 'Casualwear',
    styleName: 'Streetwear',
    sizeNames: ['M', 'L', 'XL', 'XXL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', sortOrder: 1, isPrimary: true },
    ],
  },
  {
    name: 'Silk Slip Midi Dress',
    description: 'Lustrous mulberry silk slip dress cut on the bias for a beautiful drape. Features delicate spaghetti straps.',
    price: 125.00,
    categoryName: "Women's Collection",
    styleName: 'Formal Elegance',
    sizeNames: ['XS', 'S', 'M', 'L'],
    images: [
      { url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80', sortOrder: 1, isPrimary: true },
    ],
  },
  {
    name: 'Leather Biker Jacket',
    description: 'Premium lambskin leather moto jacket with asymmetrical zip closure, notched lapels, and silver-tone hardware.',
    price: 299.99,
    categoryName: "Women's Collection",
    styleName: 'Streetwear',
    sizeNames: ['XS', 'S', 'M', 'L'],
    images: [
      { url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80', sortOrder: 1, isPrimary: true },
    ],
  },
  {
    name: 'Relaxed Fit Cargo Pants',
    description: 'Durable cotton canvas cargo pants with multiple utility pockets and adjustable drawstring cuffs.',
    price: 79.95,
    categoryName: "Men's Collection",
    styleName: 'Streetwear',
    sizeNames: ['S', 'M', 'L', 'XL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=800&q=80', sortOrder: 1, isPrimary: true },
    ],
  },
  {
    name: 'Cashmere V-Neck Sweater',
    description: 'Luxuriously soft 100% Mongolian cashmere v-neck sweater. A timeless layering piece for elegant warmth.',
    price: 159.00,
    categoryName: "Women's Collection",
    styleName: 'Modern Casual',
    sizeNames: ['XS', 'S', 'M', 'L'],
    images: [
      { url: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&q=80', sortOrder: 1, isPrimary: true },
    ],
  },
  {
    name: 'Oxford Button-Down Shirt',
    description: 'Classic Oxford cloth button-down shirt with a crisp collar and chest pocket. Essential for smart-casual wear.',
    price: 45.00,
    categoryName: "Men's Collection",
    styleName: 'Modern Casual',
    sizeNames: ['S', 'M', 'L', 'XL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80', sortOrder: 1, isPrimary: true },
    ],
  },
  {
    name: 'Pleated Midi Skirt',
    description: 'Elegant knife-pleated midi skirt that moves beautifully. Features a comfortable elasticated waistband.',
    price: 68.50,
    categoryName: "Women's Collection",
    styleName: 'Formal Elegance',
    sizeNames: ['S', 'M', 'L'],
    images: [
      { url: 'https://images.unsplash.com/photo-1582142407894-ec85a1260a46?w=800&q=80', sortOrder: 1, isPrimary: true },
    ],
  },
  {
    name: 'Designer Aviator Sunglasses',
    description: 'Premium aviator sunglasses with polarized lenses, UV400 protection, and lightweight metal frames.',
    price: 195.00,
    categoryName: 'Accessories',
    styleName: 'Luxury Wear',
    sizeNames: ['M'],
    images: [
      { url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', sortOrder: 1, isPrimary: true },
    ],
  },
  {
    name: 'Minimalist Leather Tote',
    description: 'Spacious unstructured leather tote bag with genuine saffiano leather and a magnetic closure.',
    price: 110.00,
    categoryName: 'Accessories',
    styleName: 'Modern Casual',
    sizeNames: ['L'],
    images: [
      { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80', sortOrder: 1, isPrimary: true },
    ],
  },
  {
    name: 'Wool Blend Overcoat',
    description: 'Refined single-breasted overcoat crafted from a warm wool blend. Perfect for sophisticated winter layering.',
    price: 215.00,
    categoryName: "Men's Collection",
    styleName: 'Formal Elegance',
    sizeNames: ['M', 'L', 'XL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80', sortOrder: 1, isPrimary: true },
    ],
  },
  {
    name: 'Cropped Denim Jacket',
    description: 'Classic denim jacket in a cropped silhouette with distressed detailing and raw hem.',
    price: 54.99,
    categoryName: "Women's Collection",
    styleName: 'Streetwear',
    sizeNames: ['XS', 'S', 'M'],
    images: [
      { url: 'https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=800&q=80', sortOrder: 1, isPrimary: true },
    ],
  },
  {
    name: 'Tapered Jogger Pants',
    description: 'Athleisure-inspired tapered joggers with an elastic drawstring waist and ribbed ankle cuffs.',
    price: 42.00,
    categoryName: 'Casualwear',
    styleName: 'Streetwear',
    sizeNames: ['S', 'M', 'L', 'XL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80', sortOrder: 1, isPrimary: true },
    ],
  },
];

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing required seed environment variable: ${name}. Set it in backend/.env (see .env.example).`,
    );
  }
  return value;
}

function createPrismaClient(): { prisma: PrismaClient; pool: Pool } {
  const databaseUrl = requireEnv('DATABASE_URL');
  const isSsl = databaseUrl.includes('sslmode=') || databaseUrl.includes('neon.tech');
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: isSsl ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  return { prisma, pool };
}

async function seedRoles(db: DbClient): Promise<Map<RoleCode, string>> {
  const roleIds = new Map<RoleCode, string>();

  for (const role of ROLES) {
    const record = await db.role.upsert({
      where: { code: role.code },
      update: {
        name: role.name,
        description: role.description,
      },
      create: {
        code: role.code,
        name: role.name,
        description: role.description,
      },
    });
    roleIds.set(role.code, record.id);
  }

  return roleIds;
}

async function seedSuperAdmin(
  db: DbClient,
  roleIds: Map<RoleCode, string>,
): Promise<void> {
  const email = requireEnv('SUPER_ADMIN_EMAIL').toLowerCase();
  const password = requireEnv('SUPER_ADMIN_PASSWORD');
  const fullName =
    process.env.SUPER_ADMIN_FULL_NAME?.trim() || 'System Super Admin';

  if (password.length < 8) {
    throw new Error('SUPER_ADMIN_PASSWORD must be at least 8 characters.');
  }

  const superAdminRoleId = roleIds.get(RoleCode.SUPER_ADMIN);
  if (!superAdminRoleId) {
    throw new Error('Super Admin role was not seeded.');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await db.user.upsert({
    where: { email },
    update: {
      fullName,
      passwordHash,
      roleId: superAdminRoleId,
      status: UserStatus.ACTIVE,
    },
    create: {
      fullName,
      email,
      passwordHash,
      roleId: superAdminRoleId,
      status: UserStatus.ACTIVE,
    },
  });
}

async function seedCatalog(db: DbClient) {
  const categoryMap = new Map<string, string>();
  const styleMap = new Map<string, string>();
  const sizeMap = new Map<string, string>();

  // Seed Categories
  for (const cat of CATEGORIES) {
    const record = await db.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description, isActive: true },
      create: { name: cat.name, description: cat.description, isActive: true },
    });
    categoryMap.set(cat.name, record.id);
  }

  // Seed Styles
  for (const st of STYLES) {
    const record = await db.style.upsert({
      where: { name: st.name },
      update: { description: st.description, isActive: true },
      create: { name: st.name, description: st.description, isActive: true },
    });
    styleMap.set(st.name, record.id);
  }

  // Seed Sizes
  for (const sz of SIZES) {
    const record = await db.size.upsert({
      where: { name: sz.name },
      update: { sortOrder: sz.sortOrder, isActive: true },
      create: { name: sz.name, sortOrder: sz.sortOrder, isActive: true },
    });
    sizeMap.set(sz.name, record.id);
  }

  // Seed Products
  for (const p of PRODUCTS) {
    const categoryId = categoryMap.get(p.categoryName);
    const styleId = styleMap.get(p.styleName);

    if (!categoryId || !styleId) {
      continue;
    }

    const existingProduct = await db.product.findFirst({
      where: { name: p.name },
    });

    let productId = existingProduct?.id;

    if (!existingProduct) {
      const created = await db.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          categoryId,
          styleId,
          isActive: true,
        },
      });
      productId = created.id;
    } else {
      await db.product.update({
        where: { id: productId },
        data: {
          description: p.description,
          price: p.price,
          categoryId,
          styleId,
          isActive: true,
        },
      });
    }

    if (productId) {
      // Connect sizes safely
      await db.productSize.deleteMany({ where: { productId } });
      const uniqueSizeNames = Array.from(new Set(p.sizeNames));
      for (const sizeName of uniqueSizeNames) {
        const sizeId = sizeMap.get(sizeName);
        if (sizeId) {
          await db.productSize.create({
            data: { productId, sizeId },
          });
        }
      }

      // Re-create images
      await db.productImage.deleteMany({ where: { productId } });
      for (const img of p.images) {
        await db.productImage.create({
          data: {
            productId,
            url: img.url,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          },
        });
      }
    }
  }
}

async function main() {
  const { prisma, pool } = createPrismaClient();

  try {
    const roleIds = await seedRoles(prisma);
    await seedSuperAdmin(prisma, roleIds);
    await seedCatalog(prisma);

    // eslint-disable-next-line no-console
    console.log(
      'Seed completed successfully: Roles, Super Admin, Categories, Styles, Sizes, and Products are ready.',
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
   
  console.error('Seed failed:', error);
  process.exit(1);
});
