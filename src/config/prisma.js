import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import config from './index.js';

const { Pool } = pg;

// Initialize PostgreSQL connection pool using connection string
const pool = new Pool({ 
  connectionString: config.databaseUrl,
  max: 10,                 // Limit pool to max 10 connections
  idleTimeoutMillis: 30000 // Close idle connections after 30s
});

const adapter = new PrismaPg(pool);

// Initialize PrismaClient with pg adapter
const prisma = new PrismaClient({ adapter });

export default prisma;
