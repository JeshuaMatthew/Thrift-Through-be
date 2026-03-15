const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: true,
    entities: [],
    migrations: ['src/migrations/*.js'],
    subscribers: [],
});

const SeedDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: true,
    entities: [],
    migrations: ['src/seeds/*.js'],
    subscribers: [],
    migrationsTableName: "seeds_metadata"
});

module.exports = { AppDataSource, SeedDataSource };
// CLI compatibility
// module.exports = AppDataSource;
