import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />
      <div id="page-content" className="flex-grow content-padding-top">
      <main>
        <Outlet />
      </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
