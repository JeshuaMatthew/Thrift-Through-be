const { MigrationInterface, QueryRunner } = require("typeorm");
const bcrypt = require("bcrypt");

module.exports = class SeedInitialData1710470000001 {
    async up(queryRunner) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('password123', saltRounds);

        // ==========================================
        // 1. SEED USERS (15 Users)
        // ==========================================
        const users = [
            { name: 'Budi Santoso', username: 'budisantoso', email: 'budi@mail.com', phone: '081234567890', rank: 'Gold', point: 150 },
            { name: 'Asep Supriatna', username: 'aseps', email: 'asep@mail.com', phone: '081234567891', rank: 'Silver', point: 80 },
            { name: 'Nita Wenas', username: 'nitawenas', email: 'nita@mail.com', phone: '081234567892', rank: 'Platinum', point: 300 },
            { name: 'Ridel Sumual', username: 'ridels', email: 'ridel@mail.com', phone: '081234567893', rank: 'Bronze', point: 20 },
            { name: 'Siti Aminah', username: 'sitiaminah', email: 'siti@mail.com', phone: '081234567894', rank: 'Silver', point: 95 },
            { name: 'Andi Makassar', username: 'andimks', email: 'andi@mail.com', phone: '081234567895', rank: 'Gold', point: 120 },
            { name: 'Dewi Sartika', username: 'dewis', email: 'dewi@mail.com', phone: '081234567896', rank: 'Platinum', point: 500 },
            { name: 'Eko Bandung', username: 'ekobdg', email: 'eko@mail.com', phone: '081234567897', rank: 'Bronze', point: 10 },
            { name: 'Maria Tomohon', username: 'mariatom', email: 'maria@mail.com', phone: '081234567898', rank: 'Silver', point: 60 },
            { name: 'Ferry Bitung', username: 'ferryb', email: 'ferry@mail.com', phone: '081234567899', rank: 'Gold', point: 210 },
            { name: 'Indah Lestari', username: 'indahl', email: 'indah@mail.com', phone: '081234567810', rank: 'Silver', point: 45 },
            { name: 'Yusuf Gowa', username: 'yusufg', email: 'yusuf@mail.com', phone: '081234567811', rank: 'Bronze', point: 30 },
            { name: 'Meiske Manado', username: 'meiskem', email: 'meiske@mail.com', phone: '081234567812', rank: 'Platinum', point: 400 },
            { name: 'Dadang Lembang', username: 'dadangl', email: 'dadang@mail.com', phone: '081234567813', rank: 'Gold', point: 180 },
            { name: 'Rina Dago', username: 'rinad', email: 'rina@mail.com', phone: '081234567814', rank: 'Silver', point: 75 },
        ];

        for (const user of users) {
            await queryRunner.query(
                `INSERT INTO users (full_name, user_name, profile_pict_url, banner_img_url, email, phone_num, password, user_rank, user_point) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [user.name, user.username, `https://i.pravatar.cc/150?u=${user.username}`, 'https://dummyimage.com/800x200/2c3e50/fff', user.email, user.phone, hashedPassword, user.rank, user.point]
            );
        }

        // ==========================================
        // 2. SEED COMMUNITIES (Tema Elektronik & Gadget)
        // ==========================================
        const communities = [
            // BANDUNG AREA
            { name: 'PC Master Race Bandung', desc: 'Komunitas rakit PC dan jual beli komponen Bandung.', lat: -6.8146, lng: 107.6185, type: 'Teknologi', public: true },
            { name: 'Jual Beli HP Bekas Jabar', desc: 'Pusat barter dan jual gadget second area Jawa Barat.', lat: -7.1009, lng: 107.4468, type: 'Perdagangan', public: true },
            { name: 'Bandung Audiophile', desc: 'Pecinta perangkat audio, headphone, dan speaker.', lat: -6.9175, lng: 107.6191, type: 'Hobi', public: true },
            { name: 'Teknisi Elektronik Cibaduyut', desc: 'Forum berbagi tips service TV, Kulkas, dll.', lat: -6.9475, lng: 107.5936, type: 'Teknologi', public: false },

            // SULAWESI AREA
            { name: 'Makassar Gadget Mania', desc: 'Tukar tambah dan review smartphone di Makassar.', lat: -5.1476, lng: 119.4327, type: 'Perdagangan', public: true },
            { name: 'Home Appliance Second Minahasa', desc: 'Lapak jual beli perangkat rumah tangga second.', lat: 1.3228, lng: 124.8398, type: 'Perdagangan', public: true },
            { name: 'Sulawesi Visual Tech', desc: 'Komunitas pengguna TV 4K, Proyektor, & Monitor.', lat: 1.4450, lng: 125.1887, type: 'Teknologi', public: false },
            { name: 'Pasar Aksesoris & Lainnya', desc: 'Grup khusus kabel, charger, router, dan powerbank.', lat: 1.5833, lng: 124.7667, type: 'Perdagangan', public: true }
        ];

        for (const comm of communities) {
            await queryRunner.query(
                `INSERT INTO communities (community_name, description, profile_pict_url, banner_img_url, latitude, longitude, community_type, is_public) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [comm.name, comm.desc, 'https://dummyimage.com/200x200/3498db/fff', 'https://dummyimage.com/1200x400/3498db/fff', comm.lat, comm.lng, comm.type, comm.public]
            );
        }

        // ==========================================
        // 3. SEED COMMUNITY MEMBERS
        // ==========================================
        const members = [
            { comm_id: 1, user_id: 14, role: 'Admin', status: 'Active' },
            { comm_id: 1, user_id: 2, role: 'Member', status: 'Active' },
            { comm_id: 3, user_id: 8, role: 'Admin', status: 'Active' },
            { comm_id: 5, user_id: 3, role: 'Admin', status: 'Active' },
            { comm_id: 5, user_id: 9, role: 'Member', status: 'Active' },
            { comm_id: 6, user_id: 10, role: 'Admin', status: 'Active' },
            { comm_id: 7, user_id: 6, role: 'Admin', status: 'Active' },
            { comm_id: 7, user_id: 12, role: 'Member', status: 'Active' }
        ];

        for (const m of members) {
            await queryRunner.query(
                `INSERT INTO community_members (community_id, member_id, role, status) VALUES ($1, $2, $3, $4)`,
                [m.comm_id, m.user_id, m.role, m.status]
            );
        }

        // ==========================================
        // 4. SEED CHATS
        // ==========================================
        const chats = [
            { comm_id: 1, user_id: 14, text: 'Ada yang jual monitor 144hz bekas area Lembang?' },
            { comm_id: 5, user_id: 3, text: 'Tukar tambah iPhone 11 ke 12 daerah Makassar dong, siap nambah.' },
            { comm_id: 7, user_id: 6, text: 'Minta rekomendasi tempat service Smart TV yang aman.' }
        ];

        for (const chat of chats) {
            await queryRunner.query(
                `INSERT INTO chats (community_id, user_id, chat_text, date_sent, is_deleted) VALUES ($1, $2, $3, NOW(), false)`,
                [chat.comm_id, chat.user_id, chat.text]
            );
        }

        // ==========================================
        // 5. SEED ITEMS (20 Items: Kategori Elektronik)
        // ==========================================
        const items = [
            // Bandung Items
            { name: 'Laptop Bekas Dell XPS 13', price: 8000000, market: 8500000, cat: 'Gadget', lat: -6.9175, lng: 107.6191, user_id: 8, type: 'Jual' },
            { name: 'Monitor LED LG 24 Inch', price: 1200000, market: 1500000, cat: 'Perangkat visual', lat: -6.8146, lng: 107.6185, user_id: 14, type: 'Jual' },
            { name: 'Speaker Bluetooth JBL Charge 4', price: 1100000, market: 1300000, cat: 'Perangkat Audio', lat: -6.9575, lng: 107.6236, user_id: 2, type: 'Barter' },
            { name: 'Microwave Sharp Second', price: 650000, market: 850000, cat: 'Perangkat Rumah Tangga', lat: -6.9475, lng: 107.5936, user_id: 15, type: 'Jual' },
            { name: 'Smartphone Samsung S21', price: 6000000, market: 6500000, cat: 'Gadget', lat: -6.8222, lng: 107.6333, user_id: 14, type: 'Barter' },
            { name: 'Proyektor Epson Mini', price: 2500000, market: 3000000, cat: 'Perangkat visual', lat: -6.8900, lng: 107.6100, user_id: 1, type: 'Jual' },
            { name: 'Headphone Sony WH-1000XM4', price: 3200000, market: 3800000, cat: 'Perangkat Audio', lat: -7.1009, lng: 107.4468, user_id: 2, type: 'Jual' },
            { name: 'Kipas Angin Berdiri Miyako', price: 150000, market: 250000, cat: 'Perangkat Rumah Tangga', lat: -6.9000, lng: 107.6000, user_id: 7, type: 'Jual' },
            { name: 'Tablet iPad Pro 2020', price: 9500000, market: 10500000, cat: 'Gadget', lat: -6.8100, lng: 107.6200, user_id: 14, type: 'Barter' },
            { name: 'Kabel HDMI 5 Meter & Adaptor', price: 75000, market: 100000, cat: 'lainnya', lat: -7.1500, lng: 107.4500, user_id: 5, type: 'Jual' },

            // Sulawesi Items
            { name: 'iPhone 13 Pro Max 256GB', price: 14000000, market: 15500000, cat: 'Gadget', lat: -5.1333, lng: 119.4167, user_id: 12, type: 'Jual' },
            { name: 'Smart TV Samsung 43 Inch', price: 4200000, market: 4800000, cat: 'Perangkat visual', lat: 1.4450, lng: 125.1887, user_id: 10, type: 'Jual' },
            { name: 'Home Theater Polytron', price: 1500000, market: 1900000, cat: 'Perangkat Audio', lat: 1.3228, lng: 124.8398, user_id: 3, type: 'Jual' },
            { name: 'Kulkas 2 Pintu LG', price: 2800000, market: 3500000, cat: 'Perangkat Rumah Tangga', lat: -5.1476, lng: 119.4327, user_id: 6, type: 'Jual' },
            { name: 'Smartwatch Garmin Fenix', price: 6500000, market: 7500000, cat: 'Gadget', lat: 1.4748, lng: 124.8421, user_id: 13, type: 'Jual' },
            { name: 'Kamera Mirrorless Sony A6000', price: 5000000, market: 5500000, cat: 'Perangkat visual', lat: 1.4500, lng: 125.1900, user_id: 10, type: 'Barter' },
            { name: 'Earphone TWS Apple AirPods Pro', price: 2200000, market: 2800000, cat: 'Perangkat Audio', lat: 1.5800, lng: 124.7600, user_id: 4, type: 'Jual' },
            { name: 'Mesin Cuci Front Load Samsung', price: 3500000, market: 4200000, cat: 'Perangkat Rumah Tangga', lat: -5.1600, lng: 119.4500, user_id: 11, type: 'Jual' },
            { name: 'Powerbank Anker 20000mAh', price: 450000, market: 600000, cat: 'lainnya', lat: 1.4600, lng: 124.8300, user_id: 13, type: 'Jual' },
            { name: 'Router WiFi TP-Link', price: 250000, market: 350000, cat: 'lainnya', lat: 1.4400, lng: 125.1800, user_id: 10, type: 'Jual' }
        ];

        for (const item of items) {
            // Semua field terkait AI di-set menjadi NULL sesuai request
            await queryRunner.query(
                `INSERT INTO items (
                    item_name, price, item_pict_url, market_price, 
                    category, latitude, longitude, user_id, item_status, 
                    item_description, item_quantity, transaction_type, 
                    ai_price_analysis, ai_price_analysis_text, last_price_analysis,
                    ai_carbon_analysis, ai_carbon_analysis_text, last_carbon_analysis
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NULL, NULL, NULL, NULL, NULL, NULL)`,
                [
                    item.name, item.price, 'https://dummyimage.com/400x400/34495e/fff', item.market,
                    item.cat, item.lat, item.lng, item.user_id, 'Available',
                    `Kondisi masih sangat bagus, pemakaian wajar. Cocok untuk kebutuhan Anda.`, 1, item.type
                ]
            );
        }

        // ==========================================
        // 6. SEED TRANSACTIONS
        // ==========================================
        const transactions = [
            { item_id: 2, buyer_id: 1, seller_id: 14, price: 1200000, type: 'Jual' },
            { item_id: 14, buyer_id: 13, seller_id: 6, price: 2800000, type: 'Jual' },
            { item_id: 19, buyer_id: 4, seller_id: 13, price: 450000, type: 'Jual' }
        ];

        for (const trx of transactions) {
            await queryRunner.query(
                `INSERT INTO transactions (item_id, buyer_id, seller_id, transaction_date, final_price, transaction_type, status) 
                 VALUES ($1, $2, $3, NOW(), $4, $5, 'Completed')`,
                [trx.item_id, trx.buyer_id, trx.seller_id, trx.price, trx.type]
            );
        }
    }

    async down(queryRunner) {
        // Urutan drop harus benar karena adanya Foreign Key Constraints
        await queryRunner.query(`TRUNCATE TABLE transactions RESTART IDENTITY CASCADE;`);
        await queryRunner.query(`TRUNCATE TABLE items RESTART IDENTITY CASCADE;`);
        await queryRunner.query(`TRUNCATE TABLE chats RESTART IDENTITY CASCADE;`);
        await queryRunner.query(`TRUNCATE TABLE community_members RESTART IDENTITY CASCADE;`);
        await queryRunner.query(`TRUNCATE TABLE communities RESTART IDENTITY CASCADE;`);
        await queryRunner.query(`TRUNCATE TABLE users RESTART IDENTITY CASCADE;`);
    }
}