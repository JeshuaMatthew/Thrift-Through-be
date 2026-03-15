const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class CreateInitialTables1710470000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE users (
                user_id SERIAL PRIMARY KEY,
                full_name VARCHAR(255),
                user_name VARCHAR(255),
                profile_pict_url TEXT,
                email VARCHAR(100),
                phone_num VARCHAR(100),
                password VARCHAR(100),
                user_rank VARCHAR(100),
                user_point INT
            );
        `);

        await queryRunner.query(`
            CREATE TABLE communities (
                community_id SERIAL PRIMARY KEY,
                description TEXT,
                profile_pict_url TEXT,
                community_name VARCHAR(255),
                longitude DECIMAL,
                latitude DECIMAL,
                community_type VARCHAR(255),
                is_public BOOLEAN
            );
        `);

        await queryRunner.query(`
            CREATE TABLE community_members (
                community_member_id SERIAL PRIMARY KEY,
                community_id INT REFERENCES communities(community_id),
                member_id INT REFERENCES users(user_id),
                role VARCHAR(255),
                status VARCHAR(255)
            );
        `);

        await queryRunner.query(`
            CREATE TABLE chats (
                chat_id SERIAL PRIMARY KEY,
                community_id INT REFERENCES communities(community_id),
                user_id INT REFERENCES users(user_id),
                chat_text TEXT,
                date_sent TIMESTAMP
            );
        `);

        await queryRunner.query(`
            CREATE TABLE items (
                item_id SERIAL PRIMARY KEY,
                item_name VARCHAR(255),
                price DECIMAL(100, 5),
                item_pict_url TEXT,
                market_price DECIMAL(100, 5),
                last_updated_price TIMESTAMP,
                category VARCHAR(255),
                longitude DECIMAL,
                latitude DECIMAL,
                user_id INT REFERENCES users(user_id),
                item_status VARCHAR(255),
                item_description TEXT,
                item_quantity INT
            );
        `);

        await queryRunner.query(`
            CREATE TABLE transactions (
                transaction_id SERIAL PRIMARY KEY,
                item_id INT REFERENCES items(item_id),
                buyer_id INT REFERENCES users(user_id),
                seller_id INT REFERENCES users(user_id),
                transaction_date TIMESTAMP,
                final_price DECIMAL(100, 5),
                transaction_type VARCHAR(255),
                status VARCHAR(255)
            );
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE transactions;`);
        await queryRunner.query(`DROP TABLE items;`);
        await queryRunner.query(`DROP TABLE chats;`);
        await queryRunner.query(`DROP TABLE community_members;`);
        await queryRunner.query(`DROP TABLE communities;`);
        await queryRunner.query(`DROP TABLE users;`);
    }
}
