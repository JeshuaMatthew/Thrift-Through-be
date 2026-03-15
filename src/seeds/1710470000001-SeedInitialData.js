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
                `INSERT INTO users (full_name, user_name, profile_pict_url, banner_img_url, email, phone_num, password, user_rank, user_point) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [user.name, user.username, 'https://dummyimage.com/150x150/000/fff', 'https://dummyimage.com/800x200/000/fff', user.email, user.phone, hashedPassword, user.rank, user.point]
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
            { name: 'Samsung Galaxy S21', price: 5500000, market: 6000000, cat: 'Gadget', lat: -6.814631, lng: 107.618585, user_id: 2, status: 'Available', desc: 'Smartphone flagship kondisi mulus', qty: 1, type: 'Jual' },
            { name: 'Monitor LG 24 Inch', price: 1200000, market: 1500000, cat: 'Perangkat Visual', lat: -7.100918, lng: 107.446864, user_id: 5, status: 'Available', desc: 'Monitor IPS Full HD', qty: 1, type: 'Jual' },
            { name: 'Headphone Sony WH-1000XM4', price: 3200000, market: 3500000, cat: 'Perangkat Audio', lat: 1.322830, lng: 124.839819, user_id: 3, status: 'Available', desc: 'Noise cancelling headphone terbaik', qty: 1, type: 'Barter' },
            { name: 'Air Fryer Philips', price: 800000, market: 1000000, cat: 'Perangkat Rumah Tangga', lat: 1.445050, lng: 125.188785, user_id: 4, status: 'Available', desc: 'Memasak tanpa minyak lebih sehat', qty: 1, type: 'Jual' },
            { name: 'Vase Bunga Estetik', price: 50000, market: 75000, cat: 'Lainnya', lat: 1.474830, lng: 124.842079, user_id: 3, status: 'Sold Out', desc: 'Pajangan dekorasi rumah', qty: 0, type: 'Jual' }
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
            { item_id: 1, buyer_id: 1, seller_id: 2, final_price: 15000, type: 'Jual', status: 'Completed' },
            { item_id: 3, buyer_id: 1, seller_id: 3, final_price: 130000, type: 'Barter', status: 'Completed' },
            { item_id: 5, buyer_id: 2, seller_id: 3, final_price: 12000, type: 'Jual', status: 'Completed' }
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
        // PERUBAHAN DI SINI: Menambahkan "RESTART IDENTITY" agar ID kembali mulai dari 1 setiap di-revert
        await queryRunner.query(`TRUNCATE TABLE transactions RESTART IDENTITY CASCADE;`);
        await queryRunner.query(`TRUNCATE TABLE items RESTART IDENTITY CASCADE;`);
        await queryRunner.query(`TRUNCATE TABLE chats RESTART IDENTITY CASCADE;`);
        await queryRunner.query(`TRUNCATE TABLE community_members RESTART IDENTITY CASCADE;`);
        await queryRunner.query(`TRUNCATE TABLE communities RESTART IDENTITY CASCADE;`);
        await queryRunner.query(`TRUNCATE TABLE users RESTART IDENTITY CASCADE;`);
    }
}