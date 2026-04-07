import React from 'react'
import { auth } from '@/auth';
import HomeClient from '@/components/HomeClient';

export default async function Home() {
  const session = await auth();

  return (
    <main>
      <HomeClient session={session} />
    </main>
  );
}
