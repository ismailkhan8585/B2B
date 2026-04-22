import { PrismaClient, Role, UserStatus, CompanyVerificationStatus, ProductStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const DATABASE_URL = 'postgresql://neondb_owner:npg_crW6E8MaRQPk@ep-green-sea-anuex1fn-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new pg.Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.rFQResponse.deleteMany();
  await prisma.rFQProduct.deleteMany();
  await prisma.rFQ.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.companyDocument.deleteMany();
  await prisma.company.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Create password hash
  const passwordHash = await bcrypt.hash('password123', 12);

  // Create SUPER_ADMIN
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@b2bplatform.com',
      name: 'Super Admin',
      passwordHash,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  });
  console.log('✅ Created Super Admin:', superAdmin.email);

  // Create ADMIN
  const admin = await prisma.user.create({
    data: {
      email: 'admin@b2bplatform.com',
      name: 'Admin User',
      passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  });
  console.log('✅ Created Admin:', admin.email);

  // Create SELLER with Company
  const sellerUser = await prisma.user.create({
    data: {
      email: 'seller@techcorp.com',
      name: 'John Seller',
      passwordHash,
      role: Role.SELLER,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      company: {
        create: {
          name: 'TechCorp Industries',
          slug: 'techcorp-industries',
          description: 'Leading manufacturer of electronics and industrial components',
          website: 'https://techcorp.example.com',
          phone: '+1-555-0100',
          email: 'contact@techcorp.example.com',
          country: 'United States',
          city: 'San Francisco',
          address: '123 Tech Street, Silicon Valley, CA',
          employeeCount: '100-500',
          yearEstablished: 2010,
          businessType: 'Manufacturer',
          mainCategories: ['Electronics', 'Industrial'],
          verificationStatus: CompanyVerificationStatus.VERIFIED,
          verifiedAt: new Date(),
          isActive: true,
        },
      },
    },
  });
  console.log('✅ Created Seller:', sellerUser.email);

  // Create BUYER
  const buyerUser = await prisma.user.create({
    data: {
      email: 'buyer@retailco.com',
      name: 'Jane Buyer',
      passwordHash,
      role: Role.BUYER,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      company: {
        create: {
          name: 'RetailCo Trading',
          slug: 'retailco-trading',
          description: 'Retail chain specializing in electronics and consumer goods',
          website: 'https://retailco.example.com',
          phone: '+1-555-0200',
          email: 'procurement@retailco.example.com',
          country: 'United States',
          city: 'New York',
          address: '456 Commerce Ave, Manhattan, NY',
          employeeCount: '50-100',
          yearEstablished: 2015,
          businessType: 'Wholesaler',
          mainCategories: ['Electronics', 'Consumer Goods'],
          verificationStatus: CompanyVerificationStatus.VERIFIED,
          verifiedAt: new Date(),
          isActive: true,
        },
      },
    },
  });
  console.log('✅ Created Buyer:', buyerUser.email);

  // Get seller company
  const sellerCompany = await prisma.company.findUnique({
    where: { userId: sellerUser.id },
  });

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic components and devices',
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Industrial',
        slug: 'industrial',
        description: 'Industrial machinery and equipment',
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Consumer Goods',
        slug: 'consumer-goods',
        description: 'Consumer electronics and products',
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Office Supplies',
        slug: 'office-supplies',
        description: 'Office and business supplies',
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Packaging',
        slug: 'packaging',
        description: 'Packaging materials and solutions',
        sortOrder: 5,
      },
    }),
  ]);
  console.log('✅ Created', categories.length, 'categories');

  // Create Products for Seller
  if (sellerCompany) {
    await Promise.all([
      prisma.product.create({
        data: {
          companyId: sellerCompany.id,
          categoryId: categories[0].id,
          name: 'Smart PCB Board v2.0',
          slug: 'smart-pcb-board-v2',
          description: 'High-quality smart PCB board for IoT applications. Features advanced processing capabilities and low power consumption.',
          shortDesc: 'Advanced PCB for IoT devices',
          minOrderQty: 100,
          minOrderUnit: 'pieces',
          priceMin: 15.00,
          priceMax: 25.00,
          currency: 'USD',
          tags: ['PCB', 'IoT', 'Electronics'],
          status: ProductStatus.ACTIVE,
          isFeatured: true,
          viewCount: 150,
        },
      }),
      prisma.product.create({
        data: {
          companyId: sellerCompany.id,
          categoryId: categories[0].id,
          name: 'USB-C Connectors Pack',
          slug: 'usb-c-connectors-pack',
          description: 'Premium USB-C connectors in bulk. High durability and fast data transfer rates.',
          shortDesc: 'Bulk USB-C connectors',
          minOrderQty: 500,
          minOrderUnit: 'pieces',
          priceMin: 0.50,
          priceMax: 1.20,
          currency: 'USD',
          tags: ['USB-C', 'Connectors', 'Electronics'],
          status: ProductStatus.ACTIVE,
          viewCount: 80,
        },
      }),
      prisma.product.create({
        data: {
          companyId: sellerCompany.id,
          categoryId: categories[1].id,
          name: 'Industrial Servo Motor',
          slug: 'industrial-servo-motor',
          description: 'Heavy-duty servo motor for industrial automation. High torque and precision control.',
          shortDesc: 'Industrial automation motor',
          minOrderQty: 10,
          minOrderUnit: 'pieces',
          priceMin: 250.00,
          priceMax: 400.00,
          currency: 'USD',
          tags: ['Motor', 'Industrial', 'Automation'],
          status: ProductStatus.ACTIVE,
          isFeatured: true,
          viewCount: 200,
        },
      }),
      prisma.product.create({
        data: {
          companyId: sellerCompany.id,
          categoryId: categories[1].id,
          name: 'Hydraulic Pump Unit',
          slug: 'hydraulic-pump-unit',
          description: 'Reliable hydraulic pump for manufacturing equipment. Energy efficient design.',
          shortDesc: 'Industrial hydraulic pump',
          minOrderQty: 5,
          minOrderUnit: 'pieces',
          priceMin: 800.00,
          priceMax: 1200.00,
          currency: 'USD',
          tags: ['Hydraulic', 'Industrial', 'Pump'],
          status: ProductStatus.ACTIVE,
          viewCount: 65,
        },
      }),
      prisma.product.create({
        data: {
          companyId: sellerCompany.id,
          categoryId: categories[2].id,
          name: 'Wireless Earbuds Pro',
          slug: 'wireless-earbuds-pro',
          description: 'Premium wireless earbuds with noise cancellation. Perfect for B2B bulk orders.',
          shortDesc: 'Wireless earbuds bulk',
          minOrderQty: 50,
          minOrderUnit: 'pieces',
          priceMin: 35.00,
          priceMax: 55.00,
          currency: 'USD',
          tags: ['Audio', 'Consumer', 'Wireless'],
          status: ProductStatus.ACTIVE,
          viewCount: 120,
        },
      }),
    ]);
    console.log('✅ Created 5 products for seller');
  }

  // Get buyer company for RFQ
  const buyerCompany = await prisma.company.findUnique({
    where: { userId: buyerUser.id },
  });

  // Create sample RFQ
  if (buyerCompany) {
    const rfq = await prisma.rFQ.create({
      data: {
        buyerId: buyerUser.id,
        title: 'Bulk LED Displays Required',
        description: 'Looking for supplier for LED display panels for our retail stores. Need high quality displays with competitive pricing.',
        quantity: 500,
        unit: 'pieces',
        budget: 50000.00,
        currency: 'USD',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        deliveryCountry: 'United States',
        status: 'OPEN',
        isPublic: true,
      },
    });
    console.log('✅ Created sample RFQ');
  }

  // Create audit logs
  await prisma.auditLog.create({
    data: {
      actorId: superAdmin.id,
      action: 'SYSTEM_INIT',
      targetType: 'System',
      metadata: { message: 'Database initialized with seed data' },
    },
  });
  console.log('✅ Created audit log');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📧 Login credentials (password: password123):');
  console.log('   - Super Admin: superadmin@b2bplatform.com');
  console.log('   - Admin: admin@b2bplatform.com');
  console.log('   - Seller: seller@techcorp.com');
  console.log('   - Buyer: buyer@retailco.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
