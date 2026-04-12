'use client'
import React, { useState } from 'react'
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PublicHome from "@/components/PublicHome";
import Authmodel from "@/components/Authmodel";
import PartnerDashboard from '@/components/PartnerDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import UserDashboard from '@/components/UserDashboard';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export default function HomeClient({ session }: { session: any }) {
  const [authOpen, setAuthOpen] = useState(false);
  const { userdata } = useSelector((state: RootState) => state.user);

  // Use role from Redux (latest from DB via usegetme) or fallback to session
  const userRole = userdata?.role || session?.user?.role;

  // If user is session-less and no userdata, show public home
  const renderDashboard = () => {
    if (!session && !userdata) return <PublicHome setAuthOpen={setAuthOpen} />;
    
    if (userRole === 'partner') {
      return <PartnerDashboard />;
    }
    
    if (userRole === 'admin') {
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
