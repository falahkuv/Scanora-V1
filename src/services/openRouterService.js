const offlineSuggestions = require('../config/offlineSuggestions.json');

const apiKey = process.env.OPENROUTER_API_KEY;

const getAISuggestion = async (fruitTypeEn, conditionEn, freshnessScore) => {
    // 1. Translasi Label (If-Else)
    let fruitTypeId = fruitTypeEn;
    if (fruitTypeEn.toLowerCase() === 'apple') fruitTypeId = 'Apel';
    else if (fruitTypeEn.toLowerCase() === 'banana') fruitTypeId = 'Pisang';
    else if (fruitTypeEn.toLowerCase() === 'orange') fruitTypeId = 'Jeruk';

    let conditionId = conditionEn;
    if (conditionEn.toLowerCase() === 'unripe') conditionId = 'Mentah';
    else if (conditionEn.toLowerCase() === 'ripe') conditionId = 'Matang';
    else if (conditionEn.toLowerCase() === 'rotten') conditionId = 'Busuk';

    // 2. Early Return for "Others" class
    if (fruitTypeEn.toLowerCase() === 'others' || fruitTypeId.toLowerCase() === 'others') {
        return "Objek tidak dikenali sebagai buah target. Tidak ada saran AI.";
    }

    // 3. Setup Prompt & System Instruction
    const systemInstruction = `Anda adalah "Scanora", asisten cerdas dan pejuang Zero Food Waste.
Tugas Anda adalah memberikan saran instan, ramah, dan solutif untuk mengelola Apel, Jeruk, atau Pisang berdasarkan hasil scan (jenis buah, kondisi ripeness, dan tingkat kesegaran (%)) agar terhindar dari tempat sampah.

Gaya Komunikasi: 
- Ramah, bersemangat, dan kekinian (cocok untuk anak muda & keluarga di Indonesia).
- Tanpa basa-basi atau salam pembuka panjang. Langsung berikan solusi.

Aturan Format Wajib:
- SANGAT RINGKAS: Maksimal 3 kalimat pendek ATAU 2 poin ringkas.
- SPESIFIK: Saran harus masuk akal untuk jenis buah yang di-scan (misal: jangan sarankan kulit pisang untuk eco-enzyme jika kompos lebih mudah).
- PRAKTIS: Berikan langkah yang bisa langsung dilakukan di dapur rumah tangga saat itu juga.`;

    const prompt = `Hasil Scanora:
- Buah: ${fruitTypeId}
- Kondisi: ${conditionId}
- Kesegaran: ${freshnessScore}%

Berdasarkan data di atas, berikan saran spesifik:
- Jika "Mentah" (mentah / 100%): Berikan 1 trik penyimpanan ajaib agar buah ini matang sempurna (Catatan: Jeruk umumnya tidak matang setelah dipetik, berikan saran penanganan alternatif).
- Jika "Matang" (matang / 65-100%): 
  1. Jika skor masih tinggi (>85%), sarankan konsumsi segar. 
  2. Jika skor mulai rendah (<85%), berikan peringatan urgensi ("Segera habiskan!") atau sarankan untuk dimakan langsung dan 1 ide resep penyelamat kilat (misal: smoothies/olahan lainnya).
- Jika "Busuk" (busuk / <50%): Jangan menghakimi. Berikan 1 cara praktis mengolah sisa buah ini (seperti kompos atau pupuk tanaman) agar tidak berujung di TPA (Tempat Pembuangan Akhir).`;

    // 4. Offline Fallback Logic (if API fails or no key)
    const getOfflineFallback = () => {
        const fruitObj = offlineSuggestions[fruitTypeId] || offlineSuggestions['Others'];
        if (fruitObj && fruitObj[conditionId]) {
            return fruitObj[conditionId];
        }
        return "Terjadi kendala pada sistem. Harap simpan buah Anda di tempat yang sejuk.";
    };

    if (!apiKey) {
        console.warn('[openRouterService] OPENROUTER_API_KEY tidak ditemukan. Menggunakan fallback offline.');
        return getOfflineFallback();
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Pilihan model gratis di OpenRouter (pilih salah satu):
                // model: "deepseek/deepseek-v4-flash:free",     // DeepSeek V4 Flash (cepat)
                // model: "google/gemma-3-27b-it:free",          // Google Gemma 3
                // model: "openai/gpt-oss-20b:free",             // OpenAI GPT OSS 20B
                model: "openrouter/auto",                         // Auto-pilih model terbaik yang tersedia
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('[openRouterService] HTTP', response.status, '-', JSON.stringify(data.error || data));
            throw new Error(data.error?.message || `HTTP ${response.status}`);
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error('[openRouterService] Error saat memanggil OpenRouter API:', error.message);
        return getOfflineFallback();
    }
};

module.exports = { getAISuggestion };
