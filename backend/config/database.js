import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from './logger.js';
dotenv.config();

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'timber_mart_dev',
  process.env.DB_USER || 'hammadharahim',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    // Only log SQL queries in debug mode, suppress verbose Sequelize logs
    logging: process.env.LOG_SQL === 'true' ? (msg) => logger.debug(msg) : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error(`Unable to connect to database: ${error.message}`);
    return false;
  }
};

export {
  sequelize,
  testConnection
};
