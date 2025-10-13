import { PlanType, PageType } from '@/types';

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function getPageLimit(planType: PlanType | null): number {
  switch (planType) {
    case 'MONTHLY':
      return 5;
    case 'YEARLY':
      return 10;
    default:
      return 0;
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function generateSubdomain(name: string): string {
  const slug = generateSlug(name);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${slug}-${randomSuffix}`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getPageTypeLabel(type: PageType): string {
  switch (type) {
    case 'PRESELL':
      return 'Página de Presell';
    case 'PREVIEW':
      return 'Página de Prévia';
    case 'POST_SALE_X':
      return 'Pós-venda Produto X';
    case 'DELIVERY':
      return 'Entrega do Produto';
    case 'POST_SALE_Y':
      return 'Pós-venda Produto Y';
    default:
      return 'Página';
  }
}

export function getPlanTypeLabel(type: PlanType): string {
  switch (type) {
    case 'MONTHLY':
      return 'Plano Mensal';
    case 'YEARLY':
      return 'Plano Anual';
    default:
      return 'Sem Plano';
  }
}

export function calculatePlanPrice(planType: PlanType): number {
  switch (planType) {
    case 'MONTHLY':
      return 97; // R$ 97/mês
    case 'YEARLY':
      return 970; // R$ 970/ano (2 meses grátis)
    default:
      return 0;
  }
}
