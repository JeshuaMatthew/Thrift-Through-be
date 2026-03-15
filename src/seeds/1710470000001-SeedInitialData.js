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
        // 2. SEED COMMUNITIES (Bandung & Sulawesi)
        // ==========================================
        const communities = [
            // BANDUNG AREA
            { name: 'Petani Organik Lembang', desc: 'Wadah berbagi ilmu tani organik Bandung Utara.', lat: -6.8146, lng: 107.6185, type: 'Pertanian', public: true },
            { name: 'Kopi Jabar Juara', desc: 'Komunitas pengolah kopi Gunung Halu dan Ciwidey.', lat: -7.1009, lng: 107.4468, type: 'Perkebunan', public: true },
            { name: 'Teknologi Bandung Digital', desc: 'Pegiat tech startup di area Bandung Kota.', lat: -6.9175, lng: 107.6191, type: 'Teknologi', public: true },
            { name: 'Pengerajin Sepatu Cibaduyut', desc: 'Kumpulan UMKM sepatu lokal legendaris.', lat: -6.9475, lng: 107.5936, type: 'Kerajinan', public: false },

            // SULAWESI AREA
            { name: 'Kawanua Bakobong (Manado)', desc: 'Komunitas pekebun cengkeh dan pala Minahasa.', lat: 1.3228, lng: 124.8398, type: 'Perkebunan', public: true },
            { name: 'Nelayan Tuna Bitung', desc: 'Persatuan nelayan ekspor tuna Bitung.', lat: 1.4450, lng: 125.1887, type: 'Perikanan', public: false },
            { name: 'Punggawa Dagang Makassar', desc: 'Jaringan pedagang pasar butung dan sekitarnya.', lat: -5.1476, lng: 119.4327, type: 'Perdagangan', public: true },
            { name: 'Wisata Bunaken Reborn', desc: 'Pemandu wisata dan pelestari lingkungan laut.', lat: 1.5833, lng: 124.7667, type: 'Pariwisata', public: true }
        ];

        for (const comm of communities) {
            await queryRunner.query(
                `INSERT INTO communities (community_name, description, profile_pict_url, banner_img_url, latitude, longitude, community_type, is_public) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [comm.name, comm.desc, 'https://dummyimage.com/200x200/27ae60/fff', 'https://dummyimage.com/1200x400/27ae60/fff', comm.lat, comm.lng, comm.type, comm.public]
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
            { comm_id: 1, user_id: 14, text: 'Bibit tomat sedang ready di gudang Lembang.' },
            { comm_id: 5, user_id: 3, text: 'Harga cengkeh jemur kering naik minggu ini.' },
            { comm_id: 7, user_id: 6, text: 'Ada info kontainer masuk ke pelabuhan Soekarno-Hatta?' }
        ];

        for (const chat of chats) {
            await queryRunner.query(
                `INSERT INTO chats (community_id, user_id, chat_text, date_sent, is_deleted) VALUES ($1, $2, $3, NOW(), false)`,
                [chat.comm_id, chat.user_id, chat.text]
            );
        }

        // ==========================================
        // 5. SEED ITEMS (20 Items: Bandung & Sulawesi)
        // ==========================================
        const items = [
            // Bandung Items
            { name: 'Sayur Kol Organik 1kg', price: 15000, market: 18000, cat: 'Pertanian', lat: -6.8146, lng: 107.6185, user_id: 14, type: 'Jual' },
            { name: 'Kopi Arabika Gunung Halu', price: 95000, market: 110000, cat: 'Perkebunan', lat: -7.1009, lng: 107.4468, user_id: 2, type: 'Jual' },
            { name: 'Sepatu Kulit Formal', price: 450000, market: 600000, cat: 'Fashion', lat: -6.9475, lng: 107.5936, user_id: 15, type: 'Jual' },
            { name: 'Laptop Bekas Dell XPS', price: 8000000, market: 8500000, cat: 'Elektronik', lat: -6.9175, lng: 107.6191, user_id: 8, type: 'Barter' },
            { name: 'Pupuk Kompos Premium', price: 25000, market: 30000, cat: 'Pertanian', lat: -6.8222, lng: 107.6333, user_id: 14, type: 'Jual' },
            { name: 'Kamera Sony A6000', price: 5000000, market: 5500000, cat: 'Elektronik', lat: -6.8900, lng: 107.6100, user_id: 1, type: 'Jual' },
            { name: 'Jersey Persib Original', price: 350000, market: 400000, cat: 'Fashion', lat: -6.9575, lng: 107.6236, user_id: 2, type: 'Jual' },
            { name: 'Meja Kayu Jati Minimalis', price: 1200000, market: 1500000, cat: 'Furniture', lat: -6.9000, lng: 107.6000, user_id: 7, type: 'Jual' },
            { name: 'Tanaman Hias Aglonema', price: 75000, market: 100000, cat: 'Hobi', lat: -6.8100, lng: 107.6200, user_id: 14, type: 'Barter' },
            { name: 'Madu Hutan Asli Ciwidey', price: 120000, market: 150000, cat: 'Makanan', lat: -7.1500, lng: 107.4500, user_id: 5, type: 'Jual' },

            // Sulawesi Items
            { name: 'Ikan Tuna Fresh 5kg', price: 250000, market: 300000, cat: 'Perikanan', lat: 1.4450, lng: 125.1887, user_id: 10, type: 'Jual' },
            { name: 'Cengkeh Kering 10kg', price: 1200000, market: 1350000, cat: 'Perkebunan', lat: 1.3228, lng: 124.8398, user_id: 3, type: 'Jual' },
            { name: 'Kain Sutra Bugis', price: 750000, market: 900000, cat: 'Fashion', lat: -5.1476, lng: 119.4327, user_id: 6, type: 'Jual' },
            { name: 'Sambal Roa Botol', price: 35000, market: 45000, cat: 'Makanan', lat: 1.4748, lng: 124.8421, user_id: 13, type: 'Jual' },
            { name: 'Smartphone Android 5G', price: 2800000, market: 3100000, cat: 'Elektronik', lat: -5.1333, lng: 119.4167, user_id: 12, type: 'Jual' },
            { name: 'Motor Honda Vario 2020', price: 14000000, market: 15500000, cat: 'Otomotif', lat: 1.4500, lng: 125.1900, user_id: 10, type: 'Jual' },
            { name: 'Alat Pancing Profesional', price: 850000, market: 1100000, cat: 'Hobi', lat: 1.5800, lng: 124.7600, user_id: 4, type: 'Barter' },
            { name: 'Kacang Mete Makassar', price: 150000, market: 180000, cat: 'Makanan', lat: -5.1600, lng: 119.4500, user_id: 11, type: 'Jual' },
            { name: 'Minyak Kayu Putih Ambon', price: 65000, market: 80000, cat: 'Kesehatan', lat: 1.4600, lng: 124.8300, user_id: 13, type: 'Jual' },
            { name: 'Perahu Nelayan Kecil', price: 7000000, market: 8500000, cat: 'Lainnya', lat: 1.4400, lng: 125.1800, user_id: 10, type: 'Jual' }
        ];

        for (const item of items) {
            const aiPrice = JSON.stringify({ analysis: "Harga stabil", trend: "Naik" });
            const aiCarbon = JSON.stringify({ carbon_score: 85, impact: "Low" });

            await queryRunner.query(
                `INSERT INTO items (
                    item_name, price, item_pict_url, market_price, last_price_analysis, 
                    category, latitude, longitude, user_id, item_status, 
                    item_description, item_quantity, transaction_type, 
                    ai_price_analysis, ai_price_analysis_text, ai_carbon_analysis, ai_carbon_analysis_text, last_carbon_analysis
                ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())`,
                [
                    item.name, item.price, 'https://dummyimage.com/400x400/34495e/fff', item.market,
                    item.cat, item.lat, item.lng, item.user_id, 'Available',
                    `Kondisi bagus, nego tipis untuk item ${item.name}`, 1, item.type,
                    aiPrice, "Berdasarkan tren pasar, harga ini sudah kompetitif.",
                    aiCarbon, "Produk ini memiliki jejak karbon rendah karena produksi lokal.",
                ]
            );
        }

        // ==========================================
        // 6. SEED TRANSACTIONS
        // ==========================================
        const transactions = [
            { item_id: 1, buyer_id: 1, seller_id: 14, price: 15000, type: 'Jual' },
            { item_id: 12, buyer_id: 13, seller_id: 3, price: 1200000, type: 'Jual' },
            { item_id: 14, buyer_id: 4, seller_id: 13, price: 35000, type: 'Jual' }
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