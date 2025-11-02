export interface Plan {
  _id: string;
  name: 'STARTER' | 'PRO' | 'ENTERPRISE';
  displayName: string;
  price: number;
  monthlyPrice: number; // Preço mensal de referência
  currency: 'BRL';
  billingCycle: 'monthly' | 'yearly';
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

// Preços mensais de referência
const STARTER_MONTHLY = 29.90;
const PRO_MONTHLY = 47.00;

// Cálculo de preços anuais: 12 meses - 2 meses de desconto = 10 meses
const STARTER_YEARLY = STARTER_MONTHLY * 10; // 299.00
const PRO_YEARLY = PRO_MONTHLY * 10; // 470.00

export const PLANS: Plan[] = [
  // STARTER Mensal
  {
    _id: 'plan-starter-monthly',
    name: 'STARTER',
    displayName: 'Plano Starter',
    price: STARTER_MONTHLY,
    monthlyPrice: STARTER_MONTHLY,
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
  // STARTER Anual
  {
    _id: 'plan-starter-yearly',
    name: 'STARTER',
    displayName: 'Plano Starter',
    price: STARTER_YEARLY,
    monthlyPrice: STARTER_MONTHLY,
    currency: 'BRL',
    billingCycle: 'yearly',
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
  // PRO Mensal
  {
    _id: 'plan-pro-monthly',
    name: 'PRO',
    displayName: 'Plano Pro',
    price: PRO_MONTHLY,
    monthlyPrice: PRO_MONTHLY,
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
  // PRO Anual
  {
    _id: 'plan-pro-yearly',
    name: 'PRO',
    displayName: 'Plano Pro',
    price: PRO_YEARLY,
    monthlyPrice: PRO_MONTHLY,
    currency: 'BRL',
    billingCycle: 'yearly',
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
  // ENTERPRISE Mensal
  {
    _id: 'plan-enterprise-monthly',
    name: 'ENTERPRISE',
    displayName: 'Plano Enterprise',
    price: 0, // Contato telefônico
    monthlyPrice: 0,
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
  },
  // ENTERPRISE Anual
  {
    _id: 'plan-enterprise-yearly',
    name: 'ENTERPRISE',
    displayName: 'Plano Enterprise',
    price: 0, // Contato telefônico
    monthlyPrice: 0,
    currency: 'BRL',
    billingCycle: 'yearly',
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

// Helper function para obter plano por name e billingCycle
export function getPlanByNameAndBilling(name: 'STARTER' | 'PRO' | 'ENTERPRISE', billingCycle: 'monthly' | 'yearly'): Plan | undefined {
  return PLANS.find(p => p.name === name && p.billingCycle === billingCycle);
}

// Helper function para obter preço equivalente mensal (útil para cálculos)
export function getMonthlyEquivalent(plan: Plan): number {
  if (plan.billingCycle === 'monthly') {
    return plan.price;
  }
  // Para anual, dividir por 12 para mostrar economia
  return plan.price / 12;
}

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
