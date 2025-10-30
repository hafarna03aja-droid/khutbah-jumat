import React, { useState, useRef, useCallback, useEffect } from 'react';
import { connectToLiveSession } from '../services/geminiService';
import { createPcmBlob } from '../utils/audioUtils';
import type { LiveSession, LiveServerMessage } from '@google/genai';
import { MicIcon } from './icons';

const TRANSCRIPTION_HISTORY_KEY = 'transcriptionHistory';

const Transcriber: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    const transcriptionRef = useRef('');
    useEffect(() => {
        transcriptionRef.current = transcription;
    }, [transcription]);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(TRANSCRIPTION_HISTORY_KEY);
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (e) {
            console.error("Gagal memuat riwayat transkripsi dari localStorage", e);
            setHistory([]);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(TRANSCRIPTION_HISTORY_KEY, JSON.stringify(history));
        } catch (e) {
            console.error("Gagal menyimpan riwayat transkripsi ke localStorage", e);
        }
    }, [history]);

    const stopRecording = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if(mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
            audioContextRef.current = null;
        }
        
        const finalTranscription = transcriptionRef.current.trim();
        if (finalTranscription) {
            setHistory(prev => [finalTranscription, ...prev]);
        }
        
        setTranscription('');
        setIsRecording(false);
    }, []);

    const startRecording = async () => {
        setIsRecording(true);
        setError(null);
        setTranscription('');

        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

            sessionPromiseRef.current = connectToLiveSession({
                onopen: () => {
                    console.log('Live session opened.');
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                    mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current!);
                    scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createPcmBlob(inputData);
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };

                    mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(audioContextRef.current.destination);
                },
                onmessage: (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        setTranscription(prev => prev + text);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    setError('Terjadi kesalahan koneksi.');
                    stopRecording();
                },
                onclose: () => {
                    console.log('Live session closed.');
                    stopRecording();
                },
            });

        } catch (err) {
            console.error('Error starting recording:', err);
            setError('Tidak dapat mengakses mikrofon. Pastikan Anda telah memberikan izin.');
            setIsRecording(false);
        }
    };
    
    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleClearHistory = () => {
        setHistory([]);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800">Transkripsi Audio</h2>
                <p className="mt-1 text-sm text-gray-600">Rekam suara Anda untuk mendapatkan transkripsi teks secara langsung. Riwayat akan tersimpan otomatis.</p>
            </div>
            
            <div className="text-center">
                <button
                    type="button"
                    onClick={handleToggleRecording}
                    className={`mx-auto flex items-center justify-center w-20 h-20 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isRecording ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500' : 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500'}`}
                >
                    <MicIcon />
                </button>
                <p className="text-sm font-medium mt-2">{isRecording ? 'Sedang merekam...' : 'Ketuk untuk mulai merekam'}</p>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <div className="w-full text-left p-4 min-h-[150px] border rounded-md bg-gray-50 whitespace-pre-wrap">
                <p className="text-gray-800">{transcription || <span className="text-gray-400">Hasil transkripsi akan muncul di sini...</span>}</p>
            </div>

            {history.length > 0 && (
                <div className="w-full text-left space-y-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-700">Riwayat Transkripsi</h3>
                        <button onClick={handleClearHistory} className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">
                            Hapus Riwayat
                        </button>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 border rounded-md p-3 bg-gray-50">
                        {history.map((item, index) => (
                            <div key={index} className="p-3 border-b border-gray-200 last:border-b-0 bg-white rounded-md shadow-sm">
                                <p className="text-sm text-gray-700">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transcriber;
