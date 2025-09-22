import { NextRequest, NextResponse } from 'next/server';

// Simulação de cache em memória para jogos
let gamesCache: any[] = [];
let lastUpdate = 0;

// Função para atualizar status dos jogos automaticamente
function updateGameStatuses() {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  
  gamesCache = gamesCache.map(game => {
    const gameDate = game.date;
    const gameTime = game.time;
    
    // Se é hoje e passou da hora do jogo
    if (gameDate === currentDate) {
      const gameDateTime = new Date(`${gameDate}T${gameTime}`);
      const timeDiff = now.getTime() - gameDateTime.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      // Jogo começa automaticamente na hora marcada
      if (minutesDiff >= 0 && minutesDiff <= 120 && game.status === 'upcoming') {
        return { ...game, status: 'live' };
      }
      
      // Jogo termina 10 minutos após o tempo regulamentar (90 + 10 = 100 minutos)
      if (minutesDiff > 100 && game.status === 'live') {
        return { ...game, status: 'finished' };
      }
    }
    
    return game;
  }).filter(game => {
    // Remover jogos antigos (mais de 1 dia após finalizar)
    if (game.status === 'finished') {
      const gameDate = new Date(game.date);
      const daysDiff = (now.getTime() - gameDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 1; // Manter por 1 dia após finalizar
    }
    return true;
  });
  
  lastUpdate = now.getTime();
}

// GET - Endpoint para atualização automática (pode ser chamado por cron job)
export async function GET() {
  try {
    updateGameStatuses();
    
    return NextResponse.json({
      message: 'Status dos jogos atualizado com sucesso',
      totalGames: gamesCache.length,
      liveGames: gamesCache.filter(g => g.status === 'live').length,
      upcomingGames: gamesCache.filter(g => g.status === 'upcoming').length,
      finishedGames: gamesCache.filter(g => g.status === 'finished').length,
      lastUpdate: new Date(lastUpdate).toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar status dos jogos' },
      { status: 500 }
    );
  }
}

// POST - Sincronizar cache com dados externos
export async function POST(request: NextRequest) {
  try {
    const { games } = await request.json();
    
    if (Array.isArray(games)) {
      gamesCache = games;
      updateGameStatuses();
    }
    
    return NextResponse.json({
      message: 'Cache de jogos sincronizado com sucesso',
      totalGames: gamesCache.length
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao sincronizar cache' },
      { status: 500 }
    );
  }
}