const { MigrationInterface, QueryRunner } = require("typeorm");
const bcrypt = require("bcrypt");

module.exports = class SeedInitialData1710470000001 {
    async up(queryRunner) {
        // ==========================================
        // 1. SEED USERS
        // ==========================================
        const users = [
            { name: 'Budi Santoso', username: 'budisantoso', email: 'budi@mail.com', phone: '081234567890', rank: 'Gold', point: 150 },
            { name: 'Asep Supriatna', username: 'aseps', email: 'asep@mail.com', phone: '081234567891', rank: 'Silver', point: 80 },
            { name: 'Nita Wenas', username: 'nitawenas', email: 'nita@mail.com', phone: '081234567892', rank: 'Platinum', point: 300 },
            { name: 'Ridel Sumual', username: 'ridels', email: 'ridel@mail.com', phone: '081234567893', rank: 'Bronze', point: 20 },
            { name: 'Siti Aminah', username: 'sitiaminah', email: 'siti@mail.com', phone: '081234567894', rank: 'Silver', point: 95 }
        ];

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('password123', saltRounds);

        for (const user of users) {
            await queryRunner.query(
                `INSERT INTO users (full_name, user_name, profile_pict_url, email, phone_num, password, user_rank, user_point) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [user.name, user.username, 'https://dummyimage.com/150x150/000/fff', user.email, user.phone, hashedPassword, user.rank, user.point]
            );
        }

        // ==========================================
        // 2. SEED COMMUNITIES
        // ==========================================
        const communities = [
            { name: 'Petani Lembang', desc: 'Komunitas petani sayur organik daerah Lembang.', lat: -6.814631, lng: 107.618585, type: 'Pertanian', public: true },
            { name: 'Pecinta Kopi Ciwidey', desc: 'Komunitas petani dan penyeduh kopi Ciwidey.', lat: -7.100918, lng: 107.446864, type: 'Perkebunan', public: true },
            { name: 'Kawanua Bakobong', desc: 'Komunitas pekebun cengkeh dan pala Minahasa.', lat: 1.322830, lng: 124.839819, type: 'Perkebunan', public: true },
            { name: 'Nelayan Bitung', desc: 'Serikat nelayan tangkap dan pengolah ikan tuna/roa.', lat: 1.445050, lng: 125.188785, type: 'Perikanan', public: false }
        ];

        for (const comm of communities) {
            await queryRunner.query(
                `INSERT INTO communities (community_name, description, profile_pict_url, latitude, longitude, community_type, is_public) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [comm.name, comm.desc, 'https://dummyimage.com/200x200/000/fff', comm.lat, comm.lng, comm.type, comm.public]
            );
        }

        // ==========================================
        // 3. SEED COMMUNITY MEMBERS
        // ==========================================
        const members = [
            { comm_id: 1, user_id: 2, role: 'Admin', status: 'Active' },
            { comm_id: 2, user_id: 5, role: 'Member', status: 'Active' },
            { comm_id: 3, user_id: 3, role: 'Admin', status: 'Active' },
            { comm_id: 4, user_id: 4, role: 'Member', status: 'Active' },
            { comm_id: 1, user_id: 1, role: 'Member', status: 'Active' }
        ];

        for (const member of members) {
            await queryRunner.query(
                `INSERT INTO community_members (community_id, member_id, role, status) VALUES ($1, $2, $3, $4)`,
                [member.comm_id, member.user_id, member.role, member.status]
            );
        }

        // ==========================================
        // 4. SEED CHATS
        // ==========================================
        const chats = [
            { comm_id: 1, user_id: 2, text: 'Gimana panen kol minggu ini kang?' },
            { comm_id: 1, user_id: 1, text: 'Aman kang, cuaca lagi bagus.' },
            { comm_id: 3, user_id: 3, text: 'Harga cengkeh skarang brpa di pasar Beriman?' },
            { comm_id: 4, user_id: 4, text: 'Tangkapan tuna hari ini lumayan banyak kapten!' }
        ];

        for (const chat of chats) {
            await queryRunner.query(
                `INSERT INTO chats (community_id, user_id, chat_text, date_sent, is_deleted) VALUES ($1, $2, $3, NOW(), false)`,
                [chat.comm_id, chat.user_id, chat.text]
            );
        }

        // ==========================================
        // 5. SEED ITEMS
        // ==========================================
        const items = [
            { name: 'Sayur Kol Organik', price: 15000, market: 16000, cat: 'Sayuran', lat: -6.814631, lng: 107.618585, user_id: 2, status: 'Available', desc: 'Kol segar dari Lembang', qty: 50, type: 'Uang' },
            { name: 'Kopi Arabica Ciwidey', price: 85000, market: 90000, cat: 'Kopi', lat: -7.100918, lng: 107.446864, user_id: 5, status: 'Available', desc: 'Biji kopi arabica green bean', qty: 20, type: 'Uang' },
            { name: 'Cengkeh Kering Minahasa', price: 135000, market: 140000, cat: 'Rempah', lat: 1.322830, lng: 124.839819, user_id: 3, status: 'Available', desc: 'Cengkeh super kering matahari', qty: 100, type: 'Barter' },
            { name: 'Ikan Roa Asap', price: 45000, market: 50000, cat: 'Perikanan', lat: 1.445050, lng: 125.188785, user_id: 4, status: 'Available', desc: 'Ikan roa jepit asli Bitung', qty: 30, type: 'Uang' },
            { name: 'Kopra Putih', price: 12000, market: 12500, cat: 'Komoditas', lat: 1.474830, lng: 124.842079, user_id: 3, status: 'Sold Out', desc: 'Kopra kualitas ekspor', qty: 0, type: 'Uang' }
        ];

        for (const item of items) {
            await queryRunner.query(
                `INSERT INTO items (item_name, price, item_pict_url, market_price, last_price_analysis, category, latitude, longitude, user_id, item_status, item_description, item_quantity, transaction_type) 
                 VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9, $10, $11, $12)`,
                [item.name, item.price, 'https://dummyimage.com/300x300/000/fff', item.market, item.cat, item.lat, item.lng, item.user_id, item.status, item.desc, item.qty, item.type]
            );
        }

        // ==========================================
        // 6. SEED TRANSACTIONS
        // ==========================================
        const transactions = [
            { item_id: 1, buyer_id: 1, seller_id: 2, final_price: 15000, type: 'Uang', status: 'Completed' },
            { item_id: 3, buyer_id: 1, seller_id: 3, final_price: 130000, type: 'Barter', status: 'Completed' },
            { item_id: 5, buyer_id: 2, seller_id: 3, final_price: 12000, type: 'Uang', status: 'Completed' }
        ];

        for (const trx of transactions) {
            await queryRunner.query(
                `INSERT INTO transactions (item_id, buyer_id, seller_id, transaction_date, final_price, transaction_type, status) 
                 VALUES ($1, $2, $3, NOW(), $4, $5, $6)`,
                [trx.item_id, trx.buyer_id, trx.seller_id, trx.final_price, trx.type, trx.status]
            );
        }
    }

    async down(queryRunner) {
        await queryRunner.query(`TRUNCATE TABLE transactions CASCADE;`);
        await queryRunner.query(`TRUNCATE TABLE items CASCADE;`);
        await queryRunner.query(`TRUNCATE TABLE chats CASCADE;`);
        await queryRunner.query(`TRUNCATE TABLE community_members CASCADE;`);
        await queryRunner.query(`TRUNCATE TABLE communities CASCADE;`);
        await queryRunner.query(`TRUNCATE TABLE users CASCADE;`);
    }
}