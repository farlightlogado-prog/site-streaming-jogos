"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Play, ArrowLeft, Zap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";

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

export default function TomorrowGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  useEffect(() => {
    fetchTomorrowGames();
  }, []);

  const fetchTomorrowGames = async () => {
    try {
      setLoading(true);
      
      // Calcular data de amanhã
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      // Buscar jogos de amanhã, forçando atualização da API
      const response = await fetch(`/api/games?updateFromAPI=true&date=${tomorrowStr}`);
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      }
    } catch (error) {
      console.error('Erro ao carregar jogos de amanhã:', error);
    } finally {
      setLoading(false);
    }
  };

  const openGameModal = (game: Game) => {
    setSelectedGame(game);
    setCurrentPlayerIndex(0);
  };

  const getAvailablePlayersCount = (game: Game) => {
    return game.embedCodes?.filter(embed => embed.trim() !== "").length || 0;
  };

  const getCurrentEmbed = () => {
    if (!selectedGame || !selectedGame.embedCodes.length) return null;
    const availableEmbeds = selectedGame.embedCodes.filter(embed => embed.trim() !== "");
    const currentEmbed = availableEmbeds[currentPlayerIndex];
    
    if (currentEmbed && currentEmbed.startsWith('http')) {
      return `<iframe src="${currentEmbed}" width="100%" height="100%" frameborder="0" allowfullscreen allow="autoplay; encrypted-media; fullscreen; picture-in-picture; web-share" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
    }
    
    return currentEmbed || null;
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const groupGamesByLeague = (games: Game[]) => {
    const grouped = games.reduce((acc, game) => {
      if (!acc[game.league]) {
        acc[game.league] = [];
      }
      acc[game.league].push(game);
      return acc;
    }, {} as Record<string, Game[]>);

    // Ordenar jogos dentro de cada liga por horário
    Object.keys(grouped).forEach(league => {
      grouped[league].sort((a, b) => {
        const timeA = new Date(`${a.date}T${a.time}`);
        const timeB = new Date(`${b.date}T${b.time}`);
        return timeA.getTime() - timeB.getTime();
      });
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-900/20 via-black to-blue-900/20 backdrop-blur-sm border-b border-blue-500/20 shadow-2xl">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-6">
                <Link href="/">
                  <Button className="bg-gray-700 hover:bg-gray-600 text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </Link>
                <div>
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    Jogos de Amanhã
                  </h1>
                  <span className="text-xs sm:text-sm text-gray-400 font-medium">
                    Carregando jogos...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Loading */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Buscando jogos de amanhã...</p>
          </div>
        </div>
      </div>
    );
  }

  const groupedGames = groupGamesByLeague(games);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900/20 via-black to-blue-900/20 backdrop-blur-sm border-b border-blue-500/20 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link href="/">
                <Button className="bg-gray-700 hover:bg-gray-600 text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    Jogos de Amanhã
                  </h1>
                  <span className="text-xs sm:text-sm text-gray-400 font-medium capitalize">
                    {getTomorrowDate()}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-500/10 px-3 py-2 rounded-full border border-blue-500/20">
                <Clock className="w-3 h-3 text-blue-400" />
                <span className="text-blue-400 font-medium text-sm">{games.length} Jogos</span>
              </div>
              <div className="flex items-center space-x-2 bg-green-500/10 px-3 py-2 rounded-full border border-green-500/20">
                <Zap className="w-3 h-3 text-green-400" />
                <span className="text-green-400 font-medium text-sm">
                  {games.filter(g => g.isFromAPI).length} da API
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {games.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <div className="text-gray-400 text-xl mb-2">
              Nenhum jogo encontrado para amanhã
            </div>
            <div className="text-gray-500 text-sm mb-6">
              Verifique novamente mais tarde ou configure a API-Football no painel admin
            </div>
            <Link href="/admin">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Configurar API
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Resumo */}
            <div className="bg-gradient-to-r from-blue-900/30 to-gray-900/30 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Resumo dos Jogos</h2>
                <Button 
                  onClick={fetchTomorrowGames}
                  className="bg-blue-600 hover:bg-blue-700 text-sm"
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{games.length}</div>
                  <div className="text-sm text-gray-400">Total de Jogos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{Object.keys(groupedGames).length}</div>
                  <div className="text-sm text-gray-400">Campeonatos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{games.filter(g => g.isFromAPI).length}</div>
                  <div className="text-sm text-gray-400">Da API-Football</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{games.filter(g => getAvailablePlayersCount(g) > 0).length}</div>
                  <div className="text-sm text-gray-400">Com Players</div>
                </div>
              </div>
            </div>

            {/* Jogos agrupados por liga */}
            {Object.entries(groupedGames).map(([league, leagueGames]) => (
              <div key={league} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-bold text-white">{league}</h3>
                  <Badge className="bg-gray-600/20 text-gray-300">
                    {leagueGames.length} {leagueGames.length === 1 ? 'jogo' : 'jogos'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leagueGames.map((game) => (
                    <div key={game.id} className="group bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 hover:border-blue-500/50 transition-all rounded-xl backdrop-blur-sm shadow-lg hover:shadow-xl">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {game.time}
                          </Badge>
                          {game.isFromAPI && (
                            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                              API
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-center mb-4">
                          <div className="text-base font-bold text-white mb-2 leading-tight">
                            {game.homeTeam} <span className="text-blue-400 mx-2">×</span> {game.awayTeam}
                          </div>
                          {getAvailablePlayersCount(game) > 0 && (
                            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                              {getAvailablePlayersCount(game)} Players
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex justify-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg group-hover:shadow-xl transition-all duration-300 text-sm px-4 py-2"
                                onClick={() => openGameModal(game)}
                                disabled={getAvailablePlayersCount(game) === 0}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                {getAvailablePlayersCount(game) > 0 ? 'ASSISTIR' : 'SEM PLAYER'}
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal do Player */}
      {selectedGame && (
        <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-6xl bg-gradient-to-br from-gray-900 to-black border-gray-700 p-0 rounded-2xl max-h-[95vh] overflow-y-auto">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-white text-2xl font-bold leading-tight">
                {selectedGame.homeTeam} × {selectedGame.awayTeam}
              </DialogTitle>
              <div className="text-gray-400 text-sm">
                {selectedGame.league} • {new Date(selectedGame.date).toLocaleDateString('pt-BR')} às {selectedGame.time}
              </div>
            </DialogHeader>
            
            <div className="p-6">
              {/* Player de Vídeo */}
              <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                {getCurrentEmbed() ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: getCurrentEmbed()! }}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center px-4">
                      <Calendar className="w-20 h-20 mx-auto mb-6 opacity-50" />
                      <p className="text-xl mb-2">Jogo de Amanhã</p>
                      <p className="text-sm">
                        Player será disponibilizado próximo ao horário do jogo
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Informações adicionais */}
              <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  <Badge className="bg-blue-500">
                    🕐 AMANHÃ
                  </Badge>
                  {selectedGame.isFromAPI && (
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                      API-Football
                    </Badge>
                  )}
                </div>
                
                {getAvailablePlayersCount(selectedGame) > 0 && (
                  <div className="text-green-400 font-medium">
                    {getAvailablePlayersCount(selectedGame)} players disponíveis
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}