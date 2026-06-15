import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import config from './index.js';

const { Pool } = pg;

let prisma;

if (config.isProduction) {
  const pool = new Pool({ 
    connectionString: config.databaseUrl,
    max: 10,                 // Limit pool to max 10 connections
    idleTimeoutMillis: 30000 // Close idle connections after 30s
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  // In development, preserve client across hot reloads
  if (!global.prisma) {
    const pool = new Pool({ 
      connectionString: config.databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000
    });
    const adapter = new PrismaPg(pool);
    global.prisma = new PrismaClient({ adapter });
  }
  prisma = global.prisma;
}

export default prisma;
