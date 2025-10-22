export interface Plan {
  _id: string;
  name: 'STARTER' | 'PRO' | 'ENTERPRISE';
  displayName: string;
  price: number;
  currency: 'BRL';
  billingCycle: 'monthly';
  features: {
    subdomains: number;
    pagesPerSubdomain: number;
    customDomain: boolean;
    photos: number;
    videos: number;
    analytics: boolean;
    support: 'email' | 'whatsapp' | 'phone';
    templates: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const PLANS: Plan[] = [
  {
    _id: 'plan-starter',
    name: 'STARTER',
    displayName: 'Plano Starter',
    price: 29.90,
    currency: 'BRL',
    billingCycle: 'monthly',
    features: {
      subdomains: 1,
      pagesPerSubdomain: 3,
      customDomain: false,
      photos: 10,
      videos: 10,
      analytics: true,
      support: 'email',
      templates: false
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'plan-pro',
    name: 'PRO',
    displayName: 'Plano Pro',
    price: 47.00,
    currency: 'BRL',
    billingCycle: 'monthly',
    features: {
      subdomains: 3,
      pagesPerSubdomain: 8,
      customDomain: true,
      photos: 30,
      videos: 20,
      analytics: true,
      support: 'whatsapp',
      templates: true
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'plan-enterprise',
    name: 'ENTERPRISE',
    displayName: 'Plano Enterprise',
    price: 0, // Contato telefônico
    currency: 'BRL',
    billingCycle: 'monthly',
    features: {
      subdomains: -1, // Ilimitado
      pagesPerSubdomain: -1, // Ilimitado
      customDomain: true,
      photos: -1, // Ilimitado
      videos: -1, // Ilimitado
      analytics: true,
      support: 'phone',
      templates: true
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Palavras proibidas para subdomínios
export const FORBIDDEN_SUBDOMAIN_WORDS = [
  'admin', 'gay', 'viado', 'google', 'facebook', 'microsoft', 'apple', 'amazon',
  'netflix', 'youtube', 'instagram', 'twitter', 'linkedin', 'github', 'stackoverflow',
  'api', 'www', 'ftp', 'mail', 'email', 'blog', 'shop', 'store', 'app', 'mobile',
  'desktop', 'web', 'site', 'sites', 'test', 'testing', 'dev', 'development',
  'staging', 'production', 'prod', 'beta', 'alpha', 'demo', 'example', 'sample'
];

// Validação de subdomínio
export function validateSubdomain(subdomain: string): { valid: boolean; message?: string } {
  // Verificar se contém apenas letras e hífen
  if (!/^[a-zA-Z0-9-]+$/.test(subdomain)) {
    return { valid: false, message: 'Subdomínio deve conter apenas letras, números e hífen' };
  }

  // Verificar se não começa ou termina com hífen
  if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
    return { valid: false, message: 'Subdomínio não pode começar ou terminar com hífen' };
  }

  // Verificar se não contém palavras proibidas
  const lowerSubdomain = subdomain.toLowerCase();
  for (const word of FORBIDDEN_SUBDOMAIN_WORDS) {
    if (lowerSubdomain.includes(word.toLowerCase())) {
      return { valid: false, message: `Subdomínio não pode conter a palavra "${word}"` };
    }
  }

  // Verificar tamanho mínimo
  if (subdomain.length < 3) {
    return { valid: false, message: 'Subdomínio deve ter pelo menos 3 caracteres' };
  }

  return { valid: true };
}
