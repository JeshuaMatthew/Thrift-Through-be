const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inisialisasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzePrice = async (req, res) => {
    try {
        const { item_name, longitude, latitude, transaction_type, current_price } = req.body;

        const prompt = `Lakukan analisis harga untuk barang berikut:
        Nama Barang: ${item_name}
        Lokasi: ${latitude}, ${longitude}
        Tipe Transaksi: ${transaction_type}
        Harga Saat Ini: ${current_price}
        
        Berikan respon dalam format JSON:
        {
            "analysis_result": "Stable/High/Low",
            "suggested_price_range": "e.g. 50000 - 70000",
            "market_trend": "Penjelasan singkat tren pasar",
            "ai_price_analysis_text": "Penjelasan mendalam dalam bentuk teks"
        }`;

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const responseText = JSON.parse(result.response.text());

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
        const { item_name, longitude, latitude, transaction_type, current_price } = req.body;

        const prompt = `Lakukan analisis jejak karbon (carbon footprint) jika seseorang membeli barang bekas ini daripada barang baru:
        Nama Barang: ${item_name}
        Lokasi: ${latitude}, ${longitude}
        Tipe Transaksi: ${transaction_type}
        
        Berikan respon dalam format JSON:
        {
            "carbon_saved_kg": "Jumlah perkiraan CO2 yang dihemat dalam kg",
            "environmental_impact_rating": "Skala 1-10",
            "ai_carbon_analysis_text": "Penjelasan mendalam tentang dampak lingkungan positif dari thrifting barang ini"
        }`;

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const responseText = JSON.parse(result.response.text());

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
