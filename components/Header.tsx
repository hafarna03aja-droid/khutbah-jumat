import React from 'react';
import { LogoIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-3">
          <LogoIcon />
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Asistan Khutbah Jumat
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;