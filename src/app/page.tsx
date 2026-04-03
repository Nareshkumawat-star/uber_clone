'use client'
import React, { useState } from 'react'
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PublicHome from "@/components/PublicHome";
import Authmodel from "@/components/Authmodel";

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-black">
      <Navbar onLogin={() => setAuthOpen(true)} />
      <PublicHome setAuthOpen={setAuthOpen} />
      <Authmodel open={authOpen} onclose={() => setAuthOpen(false)} />
      <Footer />
    </div>
  );
}
