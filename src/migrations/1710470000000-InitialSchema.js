const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class InitialSchema1710470000000 {
    async up(queryRunner) {
        // 1. users
        await queryRunner.query(`
            CREATE TABLE users (
                user_id SERIAL PRIMARY KEY,
                full_name VARCHAR(255),
                user_name VARCHAR(255) UNIQUE,
                profile_pict_url TEXT,
                banner_img_url TEXT,
                email VARCHAR(100) UNIQUE,
                phone_num VARCHAR(100),
                password VARCHAR(100),
                user_rank VARCHAR(100),
                user_point INT DEFAULT 0
            );
        `);

        // 2. communities
        await queryRunner.query(`
            CREATE TABLE communities (
                community_id SERIAL PRIMARY KEY,
                description TEXT,
                profile_pict_url TEXT,
                banner_img_url TEXT,
                community_name VARCHAR(255),
                longitude DECIMAL,
                latitude DECIMAL,
                community_type VARCHAR(255),
                is_public BOOLEAN
            );
        `);

        // 3. community_members
        await queryRunner.query(`
            CREATE TABLE community_members (
                community_member_id SERIAL PRIMARY KEY,
                community_id INT REFERENCES communities(community_id),
                member_id INT REFERENCES users(user_id),
                role VARCHAR(255),
                status VARCHAR(255)
            );
        `);

        // 4. chats
        await queryRunner.query(`
            CREATE TABLE chats (
                chat_id SERIAL PRIMARY KEY,
                community_id INT REFERENCES communities(community_id),
                user_id INT REFERENCES users(user_id),
                chat_text TEXT,
                date_sent TIMESTAMP,
                is_deleted BOOLEAN DEFAULT false
            );
        `);

        // 5. items
        await queryRunner.query(`
            CREATE TABLE items (
                item_id SERIAL PRIMARY KEY,
                item_name VARCHAR(255),
                price BIGINT,
                item_pict_url TEXT,
                market_price BIGINT,
                last_price_analysis TIMESTAMP,
                category VARCHAR(255),
                longitude DECIMAL,
                latitude DECIMAL,
                user_id INT REFERENCES users(user_id),
                item_status VARCHAR(255),
                item_description TEXT,
                item_quantity INT,
                transaction_type VARCHAR(255) DEFAULT 'Jual',
                ai_price_analysis JSONB,
                ai_price_analysis_text TEXT,
                ai_carbon_analysis JSONB,
                ai_carbon_analysis_text TEXT,
                last_carbon_analysis TIMESTAMP
            );
        `);

        // 6. transactions
        await queryRunner.query(`
            CREATE TABLE transactions (
                transaction_id SERIAL PRIMARY KEY,
                item_id INT REFERENCES items(item_id),
                buyer_id INT REFERENCES users(user_id),
                seller_id INT REFERENCES users(user_id),
                transaction_date TIMESTAMP,
                final_price BIGINT,
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
