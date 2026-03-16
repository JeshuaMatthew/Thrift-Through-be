const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: 8080,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: true,
    entities: [],
    migrations: ['src/migrations/*.js'],
    subscribers: [],
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = AppDataSource;