const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkSeedData() {
  try {
    console.log('Checking existing data...\n');
    
    // Check Clubs
    const clubs = await prisma.club.findMany({
      select: { name: true, description: true }
    });
    
    console.log(`Clubs (${clubs.length} found):`);
    clubs.forEach(club => {
      console.log(`  - ${club.name}: ${club.description}`);
    });
    
    // Check Users
    const users = await prisma.user.findMany({
      select: { email: true, name: true }
    });
    
    console.log(`\nUsers (${users.length} found):`);
    users.forEach(user => {
      console.log(`  - ${user.name || 'No name'} (${user.email || 'No email'})`);
    });
    
    // Check RingGameTables
    const tables = await prisma.ringGameTable.findMany({
      select: { name: true, smallBlind: true, bigBlind: true }
    });
    
    console.log(`\nRing Game Tables (${tables.length} found):`);
    tables.forEach(table => {
      console.log(`  - ${table.name} (${table.smallBlind}/${table.bigBlind})`);
    });
    
  } catch (error) {
    console.error('Error checking data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSeedData();