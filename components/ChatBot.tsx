
import React, { useState, useEffect, useRef } from 'react';
import { startChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import { SendIcon } from './icons';
import Spinner from './Spinner';
import type { Chat } from '@google/genai';

// Add declaration for the 'marked' library loaded from CDN
declare global {
    interface Window {
        marked: {
            parse: (markdownString: string, options?: object) => string;
        };
    }
}


const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = startChat();
    setMessages([{ sender: 'bot', text: 'Assalamualaikum! Ada yang bisa saya bantu?' }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: ChatMessage = { sender: 'user', text: userInput };
    setMessages((prev) => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      if (chatRef.current) {
        const response = await chatRef.current.sendMessage({ message: userInput });
        const botMessage: ChatMessage = { sender: 'bot', text: response.text };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = { sender: 'bot', text: 'Maaf, terjadi kesalahan. Coba lagi nanti.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-[60vh]">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Tanya Jawab AI</h2>
        <div className="flex-grow bg-gray-50 rounded-lg p-4 overflow-y-auto mb-4 border">
            <div className="space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'bot' && <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full items-center justify-center bg-teal-100 text-teal-700">AI</span>}
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-teal-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                           {msg.sender === 'bot' ? (
                                <div
                                    className="prose prose-sm max-w-none text-gray-800"
                                    dangerouslySetInnerHTML={{ __html: window.marked.parse(msg.text, { breaks: true }) }}
                                />
                            ) : (
                                <p className="text-sm">{msg.text}</p>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                        <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full items-center justify-center bg-teal-100 text-teal-700">AI</span>
                        <div className="px-4 py-2 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                            <Spinner size="sm" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ketik pertanyaan Anda..."
                className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !userInput.trim()} className="p-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 transition-colors">
                <SendIcon />
            </button>
        </form>
    </div>
  );
};

export default ChatBot;