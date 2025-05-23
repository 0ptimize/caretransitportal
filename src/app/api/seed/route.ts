import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@caretransit.com' },
      update: {},
      create: {
        email: 'admin@caretransit.com',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      admin: {
        email: admin.email,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    );
  }
} 