import { NextRequest, NextResponse } from 'next/server';

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;
  time: string;
  status: "live" | "upcoming" | "finished";
  embedCodes: string[];
  viewers?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  isFromAPI?: boolean;
}

interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      long: string;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
    };
    away: {
      id: number;
      name: string;
    };
  };
}

// Simulação de banco de dados em memória (em produção, use um banco real)
let games: Game[] = [
  {
    id: "1",
    homeTeam: "Flamengo",
    awayTeam: "Palmeiras",
    league: "Brasileirão",
    date: "2024-01-15",
    time: "16:00",
    status: "live",
    embedCodes: [
      'https://sporturbo.com/player/canais/dspl-cazetv',
      'https://sporturbo.com/player/canais/backup-1'
    ],
    seoTitle: "Flamengo x Palmeiras - Ao Vivo | FUTEMAX HD",
    seoDescription: "Assista Flamengo x Palmeiras ao vivo grátis. Brasileirão 2024 com a melhor qualidade.",
    seoKeywords: "flamengo, palmeiras, brasileirão, futebol ao vivo, grátis"
  },
  {
    id: "2",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    league: "La Liga",
    date: "2024-01-15",
    time: "18:30",
    status: "upcoming",
    embedCodes: [],
    seoTitle: "Real Madrid x Barcelona - El Clásico Ao Vivo | FUTEMAX HD",
    seoDescription: "Assista Real Madrid x Barcelona ao vivo grátis. El Clásico da La Liga com transmissão em HD.",
    seoKeywords: "real madrid, barcelona, el clasico, la liga, futebol ao vivo"
  }
];

// Função para buscar jogos da API-Football
async function fetchGamesFromApiFootball(): Promise<Game[]> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  const apiUrl = process.env.API_FOOTBALL_URL || 'https://v3.football.api-sports.io';

  if (!apiKey) {
    console.log('API_FOOTBALL_KEY não configurada');
    return [];
  }

  try {
    // Buscar jogos de hoje e amanhã
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`Buscando jogos para ${todayStr} e ${tomorrowStr}`);

    // Buscar jogos de hoje
    const todayResponse = await fetch(`${apiUrl}/fixtures?date=${todayStr}`, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      }
    });

    // Buscar jogos de amanhã
    const tomorrowResponse = await fetch(`${apiUrl}/fixtures?date=${tomorrowStr}`, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      }
    });

    const apiGames: Game[] = [];

    // Processar jogos de hoje
    if (todayResponse.ok) {
      const todayData = await todayResponse.json();
      if (todayData.response && Array.isArray(todayData.response)) {
        for (const fixture of todayData.response) {
          const game = convertApiFixtureToGame(fixture);
          if (game) apiGames.push(game);
        }
      }
    }

    // Processar jogos de amanhã
    if (tomorrowResponse.ok) {
      const tomorrowData = await tomorrowResponse.json();
      if (tomorrowData.response && Array.isArray(tomorrowData.response)) {
        for (const fixture of tomorrowData.response) {
          const game = convertApiFixtureToGame(fixture);
          if (game) apiGames.push(game);
        }
      }
    }

    console.log(`Encontrados ${apiGames.length} jogos da API-Football`);
    return apiGames;

  } catch (error) {
    console.error('Erro ao buscar jogos da API-Football:', error);
    return [];
  }
}

// Converter fixture da API-Football para formato interno
function convertApiFixtureToGame(fixture: ApiFootballFixture): Game | null {
  try {
    const gameDate = new Date(fixture.fixture.date);
    const status = getGameStatus(fixture.fixture.status.short);
    
    const game: Game = {
      id: `api_${fixture.fixture.id}`,
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      league: `${fixture.league.name} (${fixture.league.country})`,
      date: gameDate.toISOString().split('T')[0],
      time: gameDate.toTimeString().slice(0, 5),
      status: status,
      embedCodes: [], // Será preenchido manualmente no admin
      isFromAPI: true,
      seoTitle: `${fixture.teams.home.name} x ${fixture.teams.away.name} - Ao Vivo | FUTEMAX HD`,
      seoDescription: `Assista ${fixture.teams.home.name} x ${fixture.teams.away.name} ao vivo grátis. ${fixture.league.name}`,
      seoKeywords: `${fixture.teams.home.name.toLowerCase()}, ${fixture.teams.away.name.toLowerCase()}, ${fixture.league.name.toLowerCase()}, futebol ao vivo`
    };

    return game;
  } catch (error) {
    console.error('Erro ao converter fixture:', error);
    return null;
  }
}

// Converter status da API-Football para formato interno
function getGameStatus(apiStatus: string): "live" | "upcoming" | "finished" {
  switch (apiStatus) {
    case '1H':
    case '2H':
    case 'HT':
    case 'ET':
    case 'P':
    case 'LIVE':
      return 'live';
    case 'FT':
    case 'AET':
    case 'PEN':
      return 'finished';
    case 'NS':
    case 'TBD':
    case 'SUSP':
    case 'INT':
    case 'PST':
    case 'CANC':
    case 'ABD':
    case 'AWD':
    case 'WO':
    default:
      return 'upcoming';
  }
}

// Função para mesclar jogos manuais com jogos da API
async function mergeGamesWithAPI(): Promise<Game[]> {
  const apiGames = await fetchGamesFromApiFootball();
  
  // Remover jogos antigos da API
  const manualGames = games.filter(g => !g.isFromAPI);
  
  // Evitar duplicatas - verificar se já existe jogo manual similar
  const filteredApiGames = apiGames.filter(apiGame => {
    const exists = manualGames.some(manualGame => 
      manualGame.homeTeam === apiGame.homeTeam &&
      manualGame.awayTeam === apiGame.awayTeam &&
      manualGame.date === apiGame.date
    );
    return !exists;
  });

  // Combinar jogos manuais com jogos da API
  const allGames = [...manualGames, ...filteredApiGames];
  
  // Atualizar array global
  games = allGames;
  
  return allGames;
}

// Função para atualizar status dos jogos automaticamente
function updateGameStatuses() {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  
  games = games.map(game => {
    const gameDate = game.date;
    
    // Se é hoje e passou da hora do jogo
    if (gameDate === currentDate) {
      const gameDateTime = new Date(`${gameDate}T${game.time}`);
      const timeDiff = now.getTime() - gameDateTime.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      // Jogo começa automaticamente na hora marcada
      if (minutesDiff >= 0 && minutesDiff <= 120 && game.status === 'upcoming') {
        return { ...game, status: 'live' as const };
      }
      
      // Jogo termina 2 horas após o início
      if (minutesDiff > 120 && game.status === 'live') {
        return { ...game, status: 'finished' as const };
      }
    }

    return game;
  });
}

// GET - Listar todos os jogos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const updateFromAPI = searchParams.get('updateFromAPI') === 'true';
    const dateFilter = searchParams.get('date'); // Para filtrar por data específica
    
    if (updateFromAPI) {
      await mergeGamesWithAPI();
    }
    
    // Atualizar status automaticamente
    updateGameStatuses();
    
    let filteredGames = games;
    
    // Filtrar por data se especificado
    if (dateFilter) {
      filteredGames = games.filter(game => game.date === dateFilter);
    }
    
    // Ordenar jogos: ao vivo primeiro, depois próximos, depois finalizados
    const sortedGames = filteredGames.sort((a, b) => {
      const statusOrder = { live: 0, upcoming: 1, finished: 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      
      // Se mesmo status, ordenar por data/hora
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

    return NextResponse.json(sortedGames);
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar jogos' },
      { status: 500 }
    );
  }
}

// POST - Adicionar novo jogo manual
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newGame: Game = {
      id: body.id || Date.now().toString(),
      homeTeam: body.homeTeam,
      awayTeam: body.awayTeam,
      league: body.league,
      date: body.date,
      time: body.time,
      status: body.status || 'upcoming',
      embedCodes: body.embedCodes || [],
      isFromAPI: false,
      seoTitle: body.seoTitle || `${body.homeTeam} x ${body.awayTeam} - Ao Vivo | FUTEMAX HD`,
      seoDescription: body.seoDescription || `Assista ${body.homeTeam} x ${body.awayTeam} ao vivo grátis. ${body.league}`,
      seoKeywords: body.seoKeywords || `${body.homeTeam}, ${body.awayTeam}, ${body.league}, futebol ao vivo`
    };

    // Validação básica
    if (!newGame.homeTeam || !newGame.awayTeam || !newGame.league || !newGame.date || !newGame.time) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: homeTeam, awayTeam, league, date, time' },
        { status: 400 }
      );
    }

    games.push(newGame);

    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar jogo' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar jogo existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    const gameIndex = games.findIndex(game => game.id === id);
    
    if (gameIndex === -1) {
      return NextResponse.json(
        { error: 'Jogo não encontrado' },
        { status: 404 }
      );
    }

    games[gameIndex] = { ...games[gameIndex], ...body };

    return NextResponse.json(games[gameIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar jogo' },
      { status: 500 }
    );
  }
}

// DELETE - Remover jogo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID do jogo é obrigatório' },
        { status: 400 }
      );
    }

    const gameIndex = games.findIndex(game => game.id === id);
    
    if (gameIndex === -1) {
      return NextResponse.json(
        { error: 'Jogo não encontrado' },
        { status: 404 }
      );
    }

    games.splice(gameIndex, 1);

    return NextResponse.json({ message: 'Jogo removido com sucesso' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao remover jogo' },
      { status: 500 }
    );
  }
}