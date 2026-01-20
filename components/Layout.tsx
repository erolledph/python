'use client';

import { useState } from 'react';
import { Menu, X, Mail, BarChart3, Users, Settings, Home, FileText } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'compose', label: 'Compose', icon: Mail },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'recipients', label: 'Recipients', icon: Users },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={` 
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Email Campaign</h1>
                <p className="text-xs text-gray-400">Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={` 
                    w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-gray-400">admin@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Home className="w-4 h-4" />
              <span>/</span>
              <span className="text-white capitalize">{currentPage}</span>
            </div>

            <div className="text-sm text-gray-400">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
