const { DataSource } = require('typeorm');
require('dotenv').config();

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
    migrations: [path.join(__dirname, '../seeds/*.js')], 
    subscribers: [],
    migrationsTableName: "seeds_metadata",
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = SeedDataSource;