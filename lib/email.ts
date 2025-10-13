import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `SexyFlow <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bem-vindo ao SexyFlow</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #ec4899); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔥 SexyFlow</h1>
            <p>Automatize suas vendas no nicho hot</p>
          </div>
          <div class="content">
            <h2>Olá, ${name}! 👋</h2>
            <p>Seja muito bem-vindo(a) ao <strong>SexyFlow</strong>!</p>
            <p>Você acabou de dar o primeiro passo para automatizar suas vendas no nicho hot/adulto. Agora você pode:</p>
            <ul>
              <li>✨ Criar páginas de vendas profissionais</li>
              <li>🎨 Personalizar templates com nosso editor visual</li>
              <li>📊 Acompanhar suas métricas em tempo real</li>
              <li>🚀 Hospedar suas páginas automaticamente</li>
            </ul>
            <p>Que tal começar criando sua primeira página?</p>
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Acessar Dashboard</a>
            <p>Se você tiver alguma dúvida, não hesite em nos contatar.</p>
            <p>Sucesso nas suas vendas! 💋</p>
            <p><strong>Equipe SexyFlow</strong></p>
          </div>
          <div class="footer">
            <p>Este é um email automático. Por favor, não responda.</p>
            <p>SexyFlow - Automatize suas vendas no nicho hot</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🔥 Bem-vindo ao SexyFlow! Sua jornada começa agora',
      html,
    });
  }

  async sendPlanUpgradeEmail(email: string, name: string, planType: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Upgrade realizado - SexyFlow</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #ec4899); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Upgrade Realizado!</h1>
            <p>SexyFlow</p>
          </div>
          <div class="content">
            <h2>Parabéns, ${name}! 🚀</h2>
            <p>Seu upgrade para o <strong>${planType}</strong> foi realizado com sucesso!</p>
            <p>Agora você tem acesso a:</p>
            <ul>
              <li>📄 Mais páginas para criar</li>
              <li>🎨 Recursos avançados do editor</li>
              <li>📊 Analytics detalhados</li>
              <li>💬 Suporte prioritário</li>
            </ul>
            <p>Explore todas as novas funcionalidades e maximize suas vendas!</p>
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Acessar Dashboard</a>
            <p>Obrigado por confiar no SexyFlow! 💋</p>
            <p><strong>Equipe SexyFlow</strong></p>
          </div>
          <div class="footer">
            <p>Este é um email automático. Por favor, não responda.</p>
            <p>SexyFlow - Automatize suas vendas no nicho hot</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🎉 Upgrade realizado com sucesso! - SexyFlow',
      html,
    });
  }

  async sendPageCreatedEmail(email: string, name: string, pageTitle: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nova página criada - SexyFlow</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #ec4899); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Nova Página Criada!</h1>
            <p>SexyFlow</p>
          </div>
          <div class="content">
            <h2>Ótimo trabalho, ${name}! 🎯</h2>
            <p>Sua página <strong>"${pageTitle}"</strong> foi criada com sucesso!</p>
            <p>Você pode:</p>
            <ul>
              <li>🎨 Personalizar ainda mais com o editor visual</li>
              <li>📊 Publicar e começar a receber visitas</li>
              <li>📈 Acompanhar as métricas em tempo real</li>
            </ul>
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Ver Minhas Páginas</a>
            <p>Continue criando páginas incríveis! 💋</p>
            <p><strong>Equipe SexyFlow</strong></p>
          </div>
          <div class="footer">
            <p>Este é um email automático. Por favor, não responda.</p>
            <p>SexyFlow - Automatize suas vendas no nicho hot</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '✨ Nova página criada com sucesso! - SexyFlow',
      html,
    });
  }
}

export const emailService = new EmailService();
