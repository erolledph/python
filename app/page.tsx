'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Compose from '@/components/Compose';
import Statistics from '@/components/Statistics';
import Recipients from '@/components/Recipients';
import Settings from '@/components/Settings';
import { Toaster } from 'sonner';
import AuthModal from '@/components/AuthModal';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('compose');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'compose':
        return <Compose />;
      case 'statistics':
        return <Statistics />;
      case 'recipients':
        return <Recipients />;
       case 'settings':
         return <Settings />;
      default:
        return <Compose />;
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </Layout>
      <Toaster />
    </>
  );
}
