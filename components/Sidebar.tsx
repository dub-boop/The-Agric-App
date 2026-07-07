

import React, { useMemo } from 'react';
import { NAV_ITEMS, CloseIcon } from '../constants';
import type { NavItem, TeamMember } from '../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activePage: string;
  setActivePage: (page: string) => void;
  currentUser: TeamMember;
  onGoToLanding?: () => void;
}

const Sidebar = ({ isOpen, setIsOpen, activePage, setActivePage, currentUser, onGoToLanding }: SidebarProps) => {
  const accessibleNavItems = useMemo(() => {
    return NAV_ITEMS.filter(item => currentUser.permissions.includes(item.name));
  }, [currentUser]);

  return (
    <aside className={`bg-[#1E5631] text-white flex flex-col transition-transform duration-300 ease-in-out transform-gpu
      md:relative md:translate-x-0 md:w-64 md:flex-shrink-0
      fixed inset-y-0 left-0 z-40 w-64
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      aria-label="Sidebar"
    >
      <div className="p-6 flex items-center justify-between h-24 border-b border-white/10">
        <div 
          onClick={onGoToLanding}
          className={`flex items-center space-x-3 ${onGoToLanding ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        >
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                 <div className="w-6 h-6 bg-white/20 rounded-full"></div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-green-300 rounded-full shadow-[0_0_12px_4px] shadow-green-400/80"></div>
            </div>
            <h1 className="text-lg font-bold tracking-wider whitespace-nowrap">THE AGRIC APP</h1>
        </div>
        <button onClick={() => setIsOpen(false)} className="md:hidden text-white/80 hover:text-white" aria-label="Close sidebar">
            <CloseIcon />
        </button>
      </div>
      <nav className="flex-grow px-4 pt-4 overflow-y-auto">
        <ul>
          {accessibleNavItems.map((item: NavItem) => (
            <li key={item.name} className="my-1">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage(item.name);
                  if (window.innerWidth < 768) {
                     setIsOpen(false); // Close sidebar on mobile after click
                  }
                }}
                className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  activePage === item.name
                    ? 'bg-[#4C9A2A]/80 shadow-inner'
                    : 'hover:bg-white/10'
                }`}
              >
                <span className="mr-4 opacity-90">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-white/10">
          {/* Footer content can go here */}
      </div>
    </aside>
  );
};

export default Sidebar;
