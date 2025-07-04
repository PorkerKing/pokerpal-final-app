const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function initDatabase() {
  console.log('Initializing database schema...\n');
  
  try {
    // Read migration files
    const fs = require('fs');
    const path = require('path');
    
    const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
    const migrations = fs.readdirSync(migrationsDir)
      .filter(dir => dir !== 'migration_lock.toml')
      .sort();
    
    for (const migration of migrations) {
      const migrationPath = path.join(migrationsDir, migration, 'migration.sql');
      if (fs.existsSync(migrationPath)) {
        console.log(`Applying migration: ${migration}`);
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await prisma.$executeRawUnsafe(statement);
            } catch (error) {
              // Ignore errors for already existing objects
              if (!error.message.includes('already exists')) {
                console.error(`Error in statement: ${error.message}`);
              }
            }
          }
        }
        console.log(`✓ Migration ${migration} applied`);
      }
    }
    
    console.log('\n✅ Database schema initialized successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase();