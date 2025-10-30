import { GoogleGenAI, GenerateContentResponse, Chat, Modality, LiveCallbacks } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateSermon = async (topic: string, language: string): Promise<{ text: string }> => {
    try {
        const prompt = `Buatlah draf khutbah Jumat lengkap dalam ${language} dengan topik "${topic}". Khutbah harus memenuhi syarat dan rukun khutbah Jumat secara lengkap.

Khutbah harus terdiri dari dua bagian: khutbah pertama, jeda untuk duduk, dan khutbah kedua.

Isi Khutbah Pertama harus mencakup:
- Mukadimah dalam Bahasa Arab yang lengkap, mengandung pujian kepada Allah (hamdalah), syahadat, dan shalawat kepada Nabi Muhammad SAW.
- Wasiat takwa.
- Pembahasan topik "${topic}" secara mendalam dan relevan.
- Pembacaan satu atau beberapa ayat Al-Quran yang berkaitan dengan topik.

Setelah khutbah pertama, ada jeda untuk duduk.

Isi Khutbah Kedua harus mencakup:
- Mukadimah dalam Bahasa Arab yang mengandung pujian kepada Allah (hamdalah) dan shalawat.
- Mengulangi wasiat takwa.
- Membaca shalawat untuk Nabi Muhammad SAW.
- Doa untuk kaum mukminin dan mukminat.
- Doa penutup.

Pastikan panjang khutbah cukup untuk dibacakan dalam waktu sekitar 15 menit, dengan pembahasan yang mendalam dan komprehensif (sekitar 2000 kata).

PENTING: Hasilkan teks dalam format plain text saja. Jangan gunakan format Markdown seperti heading (#), bold (**), list (*), atau garis pemisah (---). Teks harus siap untuk disalin dan dibacakan langsung tanpa perlu diedit. Jangan sertakan judul atau keterangan seperti "Khutbah Pertama", "Khutbah Kedua", atau "Teks untuk duduk". Langsung berikan isi khutbah pertama, diikuti dengan doa singkat untuk jeda duduk (misal: "أَقُوْلُ قَوْلِيْ هَذَا وَأَسْتَغْفِرُ اللهَ لِيْ وَلَكُمْ..."), lalu langsung diikuti dengan isi khutbah kedua.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text;
        return { text };
    } catch (error) {
        console.error("Error generating sermon:", error);
        throw new Error("Gagal membuat khutbah. Silakan coba lagi.");
    }
};

export const startChat = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'Anda adalah asisten AI yang ramah dan membantu, menjawab pertanyaan dalam Bahasa Indonesia. Gunakan format Markdown untuk jawaban Anda, seperti tebal (**teks**), miring (*teks*), dan daftar berpoin (* item).',
        },
    });
};

export const generateTTS = async (text: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Ucapkan dengan jelas dan tenang: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A calm, clear male voice
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating TTS:", error);
        throw new Error("Gagal menghasilkan audio. Silakan coba lagi.");
    }
};

export const connectToLiveSession = (callbacks: LiveCallbacks) => {
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
        },
    });
};