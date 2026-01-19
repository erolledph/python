'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import Compose from '@/components/Compose';
import Statistics from '@/components/Statistics';
import Recipients from '@/components/Recipients';
import Settings from '@/components/Settings';
import { Toaster } from 'sonner';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('compose');

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

  return (
    <>
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </Layout>
      <Toaster />
    </>
  );
}
