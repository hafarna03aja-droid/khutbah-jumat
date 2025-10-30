import React, { useState, useCallback } from 'react';
import { generateSermon, generateTTS } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import Spinner from './Spinner';
import { PlayIcon, StopIcon, CopyIcon } from './icons';

// Define component outside to prevent re-creation on re-renders
const ActionButton: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode; }> = ({ onClick, disabled, children }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="inline-flex items-center justify-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
        {children}
    </button>
);


const KhutbahGenerator: React.FC = () => {
    const [topic, setTopic] = useState<string>('');
    const [language, setLanguage] = useState<string>('Bahasa Indonesia');
    const [sermon, setSermon] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);

    const exampleTopics = [
        'Pentingnya Sabar dalam Menghadapi Cobaan',
        'Keutamaan Shalat Berjamaah',
        'Meneladani Akhlak Rasulullah SAW',
        'Bahaya Riba di Zaman Modern',
    ];

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('Topik tidak boleh kosong.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSermon('');
        try {
            const result = await generateSermon(topic, language);
            setSermon(result.text);
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlayTTS = async () => {
        if (isPlaying && audioSource) {
            audioSource.stop();
            setIsPlaying(false);
            setAudioSource(null);
            return;
        }

        if (!sermon) return;
        setIsPlaying(true); // Indicate loading/playing starts
        try {
            const base64Audio = await generateTTS(sermon);
            if (base64Audio) {
                const audioData = decode(base64Audio);
                const audioBuffer = await decodeAudioData(audioData, audioContext, 24000, 1);
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.onended = () => {
                    setIsPlaying(false);
                    setAudioSource(null);
                };
                source.start(0);
                setAudioSource(source);
            } else {
                 setIsPlaying(false);
            }
        } catch (error) {
            console.error('Error playing TTS:', error);
            setError('Gagal memutar audio.');
            setIsPlaying(false);
        }
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(sermon);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-800">Buat Draf Khutbah Jumat</h2>
                <p className="mt-1 text-sm text-gray-600">Masukkan topik dan pilih bahasa untuk menghasilkan draf khutbah yang relevan dan terkini.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Topik Khutbah</label>
                    <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        placeholder="Contoh: Pentingnya menjaga silaturahmi"
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500">Saran topik:</span>
                        {exampleTopics.map((example) => (
                            <button
                                key={example}
                                type="button"
                                onClick={() => setTopic(example)}
                                className="px-2 py-1 text-xs bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-500"
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Bahasa</label>
                    <fieldset className="mt-2">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <input id="indonesia" name="language" type="radio" value="Bahasa Indonesia" checked={language === 'Bahasa Indonesia'} onChange={(e) => setLanguage(e.target.value)} className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"/>
                                <label htmlFor="indonesia" className="ml-2 block text-sm text-gray-900">Bahasa Indonesia</label>
                            </div>
                            <div className="flex items-center">
                                <input id="jawa" name="language" type="radio" value="Basa Jawi (Jawa)" checked={language === 'Basa Jawi (Jawa)'} onChange={(e) => setLanguage(e.target.value)} className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"/>
                                <label htmlFor="jawa" className="ml-2 block text-sm text-gray-900">Basa Jawi</label>
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>

            <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400"
            >
                {isLoading ? <Spinner size="sm" /> : 'Buat Khutbah'}
            </button>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {sermon && (
                <div className="space-y-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Hasil Draf Khutbah</h3>
                        <div className="flex space-x-2">
                            <ActionButton onClick={handlePlayTTS} disabled={!sermon}>
                                {isPlaying ? <StopIcon /> : <PlayIcon />}
                                <span>{isPlaying ? 'Hentikan' : 'Dengarkan'}</span>
                            </ActionButton>
                            <ActionButton onClick={handleCopyToClipboard} disabled={!sermon}>
                                <CopyIcon />
                                <span>Salin</span>
                            </ActionButton>
                        </div>
                    </div>
                    <div className="prose prose-sm max-w-none p-4 border rounded-md bg-gray-50 whitespace-pre-wrap font-serif">
                        {sermon}
                    </div>
                </div>
            )}
        </div>
    );
};

export default KhutbahGenerator;