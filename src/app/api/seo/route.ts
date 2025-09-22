import { NextRequest, NextResponse } from 'next/server';

interface SiteSettings {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  favicon: string;
  googleAnalytics: string;
  facebookPixel: string;
  footerText?: string;
  footerLinks?: { name: string; url: string }[];
  adminPath?: string;
}

// Configurações padrão
let siteSettings: SiteSettings = {
  title: "FUTEMAX HD - Futebol Online Grátis",
  description: "Assista futebol ao vivo grátis. Todos os jogos do Brasileirão, Champions League, Premier League e muito mais em alta qualidade.",
  keywords: "futebol online, futebol grátis, jogos ao vivo, brasileirão, champions league, premier league, la liga, bundesliga",
  ogTitle: "FUTEMAX HD - Futebol Online Grátis",
  ogDescription: "Assista futebol ao vivo grátis. Todos os jogos do Brasileirão, Champions League, Premier League e muito mais em alta qualidade.",
  ogImage: "/og-image.jpg",
  twitterTitle: "FUTEMAX HD - Futebol Online Grátis",
  twitterDescription: "Assista futebol ao vivo grátis. Todos os jogos do Brasileirão, Champions League, Premier League e muito mais em alta qualidade.",
  twitterImage: "/twitter-image.jpg",
  favicon: "/favicon.ico",
  googleAnalytics: "",
  facebookPixel: "",
  footerText: "A melhor plataforma para assistir futebol online gratuitamente. Transmissões em alta qualidade, múltiplos players e cobertura completa dos principais campeonatos mundiais.",
  footerLinks: [
    { name: "Termos de Uso", url: "/termos" },
    { name: "Política de Privacidade", url: "/privacidade" }
  ],
  adminPath: "/admin"
};

// GET - Obter configurações SEO
export async function GET() {
  try {
    return NextResponse.json(siteSettings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar configurações SEO' },
      { status: 500 }
    );
  }
}

// POST - Salvar configurações SEO
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Atualizar configurações
    siteSettings = {
      ...siteSettings,
      ...body
    };

    return NextResponse.json({
      message: 'Configurações SEO salvas com sucesso',
      settings: siteSettings
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao salvar configurações SEO' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar configurações específicas
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Atualizar apenas campos específicos
    Object.keys(body).forEach(key => {
      if (key in siteSettings) {
        (siteSettings as any)[key] = body[key];
      }
    });

    return NextResponse.json({
      message: 'Configurações atualizadas com sucesso',
      settings: siteSettings
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    );
  }
}