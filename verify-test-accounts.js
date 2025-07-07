// Verify test accounts are properly set up
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verifyTestAccounts() {
  try {
    console.log('🔍 Verifying test accounts setup...\n');
    await prisma.$connect();
    
    const testEmails = [
      'owner@pokerpal.com',
      'admin@pokerpal.com', 
      'manager@pokerpal.com',
      'member1@pokerpal.com',
      'member2@pokerpal.com',
      'dealer@pokerpal.com',
      'receptionist@pokerpal.com',
      'vip@pokerpal.com'
    ];
    
    console.log('👤 Checking user accounts:');
    for (const email of testEmails) {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            clubMembers: {
              include: {
                club: true
              }
            }
          }
        });
        
        if (user) {
          console.log(`  ✅ ${email} - ${user.name}`);
          
          // Check club memberships
          if (user.clubMembers.length > 0) {
            user.clubMembers.forEach(membership => {
              console.log(`    🏢 ${membership.club.name} - Role: ${membership.role} - Balance: ¥${membership.balance}`);
            });
          } else {
            console.log(`    ⚠️  No club memberships found`);
          }
          
          // Verify password
          const passwordMatch = await bcrypt.compare('password123', user.password);
          console.log(`    🔐 Password verification: ${passwordMatch ? '✅' : '❌'}`);
          
        } else {
          console.log(`  ❌ ${email} - Not found`);
        }
        console.log('');
      } catch (error) {
        console.log(`  ❌ ${email} - Error: ${error.message}`);
      }
    }
    
    // Check role distribution
    console.log('📊 Role distribution:');
    const roleDistribution = await prisma.clubMember.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });
    
    roleDistribution.forEach(group => {
      console.log(`  ${group.role}: ${group._count.role} members`);
    });
    
    // Check clubs
    console.log('\n🏢 Available clubs:');
    const clubs = await prisma.club.findMany({
      include: {
        _count: {
          select: {
            members: true
          }
        }
      }
    });
    
    clubs.forEach(club => {
      console.log(`  - ${club.name}: ${club._count.members} members`);
    });
    
    console.log('\n✨ Verification complete!');
    
  } catch (error) {
    console.error('❌ Verification error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Test login simulation
async function testLoginFlow() {
  try {
    console.log('\n🧪 Testing login flow simulation...');
    await prisma.$connect();
    
    const testUser = await prisma.user.findUnique({
      where: { email: 'member1@pokerpal.com' },
      include: {
        clubMembers: {
          include: {
            club: true
          }
        }
      }
    });
    
    if (testUser) {
      console.log(`📝 Login simulation for: ${testUser.email}`);
      console.log(`  Name: ${testUser.name}`);
      console.log(`  Clubs: ${testUser.clubMembers.length}`);
      
      testUser.clubMembers.forEach(membership => {
        console.log(`    - ${membership.club.name} (${membership.role})`);
      });
      
      const passwordValid = await bcrypt.compare('password123', testUser.password);
      console.log(`  Password valid: ${passwordValid ? '✅' : '❌'}`);
      
      if (passwordValid) {
        console.log('  🎉 Login would succeed!');
      }
    }
    
  } catch (error) {
    console.error('❌ Login test error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await verifyTestAccounts();
  await testLoginFlow();
}

main();