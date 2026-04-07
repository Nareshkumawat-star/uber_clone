'use client'
import React, { useState } from 'react'
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PublicHome from "@/components/PublicHome";
import Authmodel from "@/components/Authmodel";
import PartnerDashboard from '@/components/PartnerDashboard';
import AdminDashboard from '@/components/AdminDashboard';

export default function HomeClient({ session }: { session: any }) {
  const [authOpen, setAuthOpen] = useState(false);

  // If user is session-less, show public home
  const renderDashboard = () => {
    if (!session) return <PublicHome setAuthOpen={setAuthOpen} />;
    
    if (session.user.role === 'partner') {
      return <PartnerDashboard />;
    }
    
    if (session.user.role === 'admin') {
      return <AdminDashboard />;
    }

    // Default to public home for general users or others
    return <PublicHome setAuthOpen={setAuthOpen} />;
  }

  return (
    <div className="w-full min-h-screen bg-black">
      <Navbar onLogin={() => setAuthOpen(true)} />
      
      {renderDashboard()}

      <Authmodel open={authOpen} onclose={() => setAuthOpen(false)} />
      <Footer />
    </div>
  );
}
