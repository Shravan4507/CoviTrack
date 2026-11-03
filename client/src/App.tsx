import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Header />
      <main className="main-content">
        <AppRoutes />
      </main>
      <Footer />
    </AuthProvider>
  );
};

export default App;

