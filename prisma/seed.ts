import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  try {
    // Create Organization
    const org = await prisma.organization.upsert({
      where: { name: 'Network PCB' },
      update: {},
      create: { name: 'Network PCB', isActive: true },
    });
    console.log('✅ Organization Seeded:', org);

    // Create Roles
    const adminRole = await prisma.role.upsert({
      where: { name: 'Admin' },
      update: {},
      create: {
        name: 'Admin',
        description: 'Administrator role',
        isActive: true,
        organization: { connect: { id: org.id } },
      },
    });
    console.log('✅ Admin Role Seeded:', adminRole);

    const employeeRole = await prisma.role.upsert({
      where: { name: 'Employee' },
      update: {},
      create: {
        name: 'Employee',
        description: 'Employee role',
        isActive: true,
        organization: { connect: { id: org.id } },
      },
    });

    const customerRole = await prisma.role.upsert({
      where: { name: 'Customer' },
      update: {},
      create: {
        name: 'Customer',
        description: 'Customer role',
        isActive: true,
        organization: { connect: { id: org.id } },
      },
    });

    // Create Permissions
    const readPermission = await prisma.permission.upsert({
      where: { name: 'READ_DATA' },
      update: {},
      create: { name: 'READ_DATA', description: 'Permission to read data', isActive: true },
    });

    const writePermission = await prisma.permission.upsert({
      where: { name: 'WRITE_DATA' },
      update: {},
      create: { name: 'WRITE_DATA', description: 'Permission to write data', isActive: true },
    });

    // Assign permissions to Employee role
    try {
      await prisma.rolePermission.createMany({
        data: [
          { roleId: employeeRole.id, permissionId: readPermission.id },
          { roleId: employeeRole.id, permissionId: writePermission.id },
        ],
        skipDuplicates: true,
      });
      console.log('✅ Permissions assigned to Employee role');
    } catch (error) {
      console.warn('⚠️ Error assigning permissions (likely already assigned):', error.message);
    }

    // Create Users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@networkpcb.com' },
      update: {},
      create: {
        fullname: 'Admin User',
        username: 'admin',
        mobile: '88884255540',
        email: 'admin@networkpcb.com',
        password: hashedPassword,
        roleId: adminRole.id,
        isActive: true,
      },
    });

    const employeePassword = await bcrypt.hash('employee123', 10);
    await prisma.user.upsert({
      where: { email: 'employee@networkpcb.com' },
      update: {},
      create: {
        fullname: 'Krishtopher Lee',
        username: 'kris',
        email: 'kris@networkpcb.com',
        mobile: '88884255541',
        password: employeePassword,
        roleId: employeeRole.id,
        isActive: true,
      },
    });

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
