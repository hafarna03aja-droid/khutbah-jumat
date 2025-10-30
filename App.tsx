import React, { useState } from 'react';
import Header from './components/Header';
import KhutbahGenerator from './components/KhutbahGenerator';
import ChatBot from './components/ChatBot';
import Transcriber from './components/Transcriber';
import TabButton from './components/TabButton';
import { CreateIcon, ChatIcon, MicIcon } from './components/icons';

type Tab = 'generator' | 'chat' | 'transcriber';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('generator');

  const renderContent = () => {
    switch (activeTab) {
      case 'generator':
        return <KhutbahGenerator />;
      case 'chat':
        return <ChatBot />;
      case 'transcriber':
        return <Transcriber />;
      default:
        return <KhutbahGenerator />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
              <TabButton
                isActive={activeTab === 'generator'}
                onClick={() => setActiveTab('generator')}
              >
                <CreateIcon />
                <span>Buat Khutbah</span>
              </TabButton>
              <TabButton
                isActive={activeTab === 'chat'}
                onClick={() => setActiveTab('chat')}
              >
                <ChatIcon />
                <span>Tanya Jawab</span>
              </TabButton>
              <TabButton
                isActive={activeTab === 'transcriber'}
                onClick={() => setActiveTab('transcriber')}
              >
                <MicIcon />
                <span>Transkripsi</span>
              </TabButton>
            </nav>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Asistan Khutbah Jumat. didukung 24 Learning Centre.</p>
      </footer>
    </div>
  );
};

export default App;