'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a página de login correta
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
}

