
import React from 'react';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => {
  const baseClasses = 'flex items-center space-x-2 whitespace-nowrap py-3 px-4 text-sm font-medium rounded-t-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500';
  const activeClasses = 'border-b-2 border-teal-600 text-teal-600 bg-teal-50';
  const inactiveClasses = 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-100';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      role="tab"
      aria-selected={isActive}
    >
      {children}
    </button>
  );
};

export default TabButton;
