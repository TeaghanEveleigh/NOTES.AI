'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function Logout() {
  useEffect(() => {
    signOut({ callbackUrl: '/login' });
  }, []);

  return (
    <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
      <p>Logging out...</p>
    </div>
  );
}
