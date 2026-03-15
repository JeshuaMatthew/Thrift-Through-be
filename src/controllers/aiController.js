const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../config/db');

// Inisialisasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const analyzePrice = async (req, res) => {
    try {
        const { item_id } = req.body;

        if (!item_id) {
            return res.status(400).json({ success: false, message: "Item ID diperlukan" });
        }

        // Fetch item details
        const itemResult = await pool.query('SELECT * FROM items WHERE item_id = $1', [item_id]);
        if (itemResult.length === 0) {
            return res.status(404).json({ success: false, message: "Item tidak ditemukan" });
        }

        const item = itemResult[0];
        const now = new Date();

        // Check 1-week rule
        if (item.last_price_analysis) {
            const lastAnalysis = new Date(item.last_price_analysis);
            if (now - lastAnalysis < ONE_WEEK_MS) {
                return res.status(400).json({
                    success: false,
                    message: "Analisis harga baru saja dilakukan dalam seminggu terakhir",
                    data: item.ai_price_analysis
                });
            }
        }

        const prompt = `Lakukan analisis harga untuk barang berikut:
        Nama Barang: ${item.item_name}
        Lokasi: ${item.latitude}, ${item.longitude}
        Tipe Transaksi: ${item.transaction_type}
        Harga Saat Ini: ${item.price}
        
        Berikan respon dalam format JSON:
        {
            "analysis_result": "Stable/High/Low",
            "suggested_price_range": "e.g. 50000 - 70000",
            "market_trend": "Penjelasan singkat tren pasar",
            "ai_price_analysis_text": "Penjelasan mendalam dalam bentuk teks"
        }`;

        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const responseText = JSON.parse(result.response.text());

        // Update database
        await pool.query(
            'UPDATE items SET ai_price_analysis = $1, ai_price_analysis_text = $2, last_price_analysis = $3, market_price = $4 WHERE item_id = $5',
            [JSON.stringify(responseText), responseText.ai_price_analysis_text, now, parseFloat(responseText.suggested_price_range.split('-')[0].replace(/[^0-9]/g, '') || 0), item_id]
        );

        res.status(200).json({
            success: true,
            data: responseText
        });
    } catch (error) {
        console.error("Error analyzePrice:", error);
        res.status(500).json({ success: false, message: "Gagal analisis harga" });
    }
};

const analyzeCarbon = async (req, res) => {
    try {
        const { item_id } = req.body;

        if (!item_id) {
            return res.status(400).json({ success: false, message: "Item ID diperlukan" });
        }

        // Fetch item details
        const itemResult = await pool.query('SELECT * FROM items WHERE item_id = $1', [item_id]);
        if (itemResult.length === 0) {
            return res.status(404).json({ success: false, message: "Item tidak ditemukan" });
        }

        const item = itemResult[0];
        const now = new Date();

        // Check 1-week rule
        if (item.last_carbon_analysis) {
            const lastAnalysis = new Date(item.last_carbon_analysis);
            if (now - lastAnalysis < ONE_WEEK_MS) {
                return res.status(400).json({
                    success: false,
                    message: "Analisis karbon baru saja dilakukan dalam seminggu terakhir",
                    data: item.ai_carbon_analysis
                });
            }
        }

        const prompt = `Lakukan analisis jejak karbon (carbon footprint) jika seseorang membeli barang bekas ini daripada barang baru:
        Nama Barang: ${item.item_name}
        Lokasi: ${item.latitude}, ${item.longitude}
        Tipe Transaksi: ${item.transaction_type}
        
        Berikan respon dalam format JSON:
        {
            "carbon_saved_kg": "Jumlah perkiraan CO2 yang dihemat dalam kg",
            "environmental_impact_rating": "Skala 1-10",
            "ai_carbon_analysis_text": "Penjelasan mendalam tentang dampak lingkungan positif dari thrifting barang ini"
        }`;

        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const responseText = JSON.parse(result.response.text());

        // Update database
        await pool.query(
            'UPDATE items SET ai_carbon_analysis = $1, ai_carbon_analysis_text = $2, last_carbon_analysis = $3 WHERE item_id = $4',
            [JSON.stringify(responseText), responseText.ai_carbon_analysis_text, now, item_id]
        );

        res.status(200).json({
            success: true,
            data: responseText
        });
    } catch (error) {
        console.error("Error analyzeCarbon:", error);
        res.status(500).json({ success: false, message: "Gagal analisis karbon" });
    }
};

module.exports = {
    analyzePrice,
    analyzeCarbon
};

