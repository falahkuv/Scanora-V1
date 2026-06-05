const offlineSuggestions = require('../config/offlineSuggestions.json');

const apiKey = process.env.OPENROUTER_API_KEY;

const getAISuggestion = async (fruitTypeEn, conditionEn, freshnessScore, language = 'id') => {
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
        return language === 'en'
            ? "Object not recognized as a target fruit. No AI suggestion available."
            : "Objek tidak dikenali sebagai buah target. Tidak ada saran AI.";
    }

    const isEn = language === 'en';

    let systemInstruction = isEn
        ? `You are "Scanora", a smart assistant and Zero Food Waste warrior.
Your task is to provide instant, friendly, and practical advice on managing Apples, Oranges, or Bananas based on scan results (fruit type, ripeness condition, and freshness score %) to keep them out of the trash.

Communication Style:
- Friendly, enthusiastic, and modern.
- No small talk or long greetings. Go straight to the solution.

Mandatory Formatting Rules:
- VERY CONCISE: Maximum 3 short sentences OR 2 brief bullet points.
- SPECIFIC: Advice must make sense for the scanned fruit (e.g., don't suggest banana peels for eco-enzyme if composting is easier).
- PRACTICAL: Give steps that can be done immediately in a home kitchen.
CRITICAL: You MUST write your entire response in English.`
        : `Anda adalah "Scanora", asisten cerdas dan pejuang Zero Food Waste.
Tugas Anda adalah memberikan saran instan, ramah, dan solutif untuk mengelola Apel, Jeruk, atau Pisang berdasarkan hasil scan (jenis buah, kondisi ripeness, dan tingkat kesegaran (%)) agar terhindar dari tempat sampah.

Gaya Komunikasi: 
- Ramah, bersemangat, dan kekinian (cocok untuk anak muda & keluarga di Indonesia).
- Tanpa basa-basi atau salam pembuka panjang. Langsung berikan solusi.

Aturan Format Wajib:
- SANGAT RINGKAS: Maksimal 3 kalimat pendek ATAU 2 poin ringkas.
- SPESIFIK: Saran harus masuk akal untuk jenis buah yang di-scan (misal: jangan sarankan kulit pisang untuk eco-enzyme jika kompos lebih mudah).
- PRAKTIS: Berikan langkah yang bisa langsung dilakukan di dapur rumah tangga saat itu juga.`;

    const prompt = isEn
        ? `Scanora Result:
- Fruit: ${fruitTypeEn}
- Condition: ${conditionEn}
- Freshness: ${freshnessScore}%

Based on the data above, give specific advice:
- If "Unripe" (unripe / 100%): Give 1 magic storage trick to ripen this fruit perfectly.
- If "Ripe" (ripe / 65-100%): 
  1. If score is high (>85%), suggest eating it fresh. 
  2. If score is low (<85%), give an urgent warning ("Eat it soon!") or suggest 1 quick rescue recipe.
- If "Rotten" (rotten / <50%): Don't judge. Give 1 practical way to process this fruit waste (like composting) to avoid the landfill.`
        : `Hasil Scanora:
- Buah: ${fruitTypeId}
- Kondisi: ${conditionId}
- Kesegaran: ${freshnessScore}%

Berdasarkan data di atas, berikan saran spesifik:
- Jika "Mentah" (mentah / 100%): Berikan 1 trik penyimpanan ajaib agar buah ini matang sempurna.
- Jika "Matang" (matang / 65-100%): 
  1. Jika skor masih tinggi (>85%), sarankan konsumsi segar. 
  2. Jika skor mulai rendah (<85%), berikan peringatan urgensi ("Segera habiskan!") atau sarankan 1 ide resep kilat.
- Jika "Busuk" (busuk / <50%): Jangan menghakimi. Berikan 1 cara praktis mengolah sisa buah ini agar tidak ke TPA.`;

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
