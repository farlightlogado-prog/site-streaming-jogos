"use client";

import { useState, useEffect } from "react";
import { Play, Calendar, Clock, Search, Monitor, ChevronLeft, ChevronRight, Zap, Trophy, Globe, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface SiteSettings {
  footerText?: string;
  footerLinks?: { name: string; url: string }[];
  adminPath?: string;
}

export default function FutemaxPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});

  // Carregar jogos da API
  useEffect(() => {
    fetchGames();
    loadSiteSettings();
    
    // Atualizar jogos a cada minuto
    const interval = setInterval(fetchGames, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar jogos
  useEffect(() => {
    let filtered = games;
    
    if (searchTerm) {
      filtered = filtered.filter(game => 
        game.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.league.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(game => game.status === filterStatus);
    }
    
    setFilteredGames(filtered);
  }, [games, searchTerm, filterStatus]);

  const loadSiteSettings = async () => {
    try {
      const response = await fetch('/api/seo');
      if (response.ok) {
        const data = await response.json();
        setSiteSettings(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const fetchGames = async () => {
    try {
      // Buscar jogos com atualização da API
      const response = await fetch('/api/games?updateFromAPI=true');
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      }
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
      // Dados de exemplo para demonstração
      setGames([
        {
          id: "1",
          homeTeam: "Flamengo",
          awayTeam: "Palmeiras",
          league: "Brasileirão Série A",
          date: "2024-01-15",
          time: "16:00",
          status: "live",
          embedCodes: [
            'https://sporturbo.com/player/canais/dspl-cazetv',
            'https://sporturbo.com/player/canais/backup-1'
          ],
          seoTitle: "Flamengo x Palmeiras - Ao Vivo | FUTEMAX HD",
          seoDescription: "Assista Flamengo x Palmeiras ao vivo grátis",
          seoKeywords: "flamengo, palmeiras, brasileirão"
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
          seoTitle: "Real Madrid x Barcelona - El Clásico | FUTEMAX HD",
          seoDescription: "Assista Real Madrid x Barcelona ao vivo grátis",
          seoKeywords: "real madrid, barcelona, el clasico"
        },
        {
          id: "3",
          homeTeam: "Manchester City",
          awayTeam: "Liverpool",
          league: "Premier League",
          date: "2024-01-14",
          time: "14:00",
          status: "finished",
          embedCodes: [
            'https://sporturbo.com/player/canais/replay-1'
          ],
          seoTitle: "Manchester City x Liverpool - Replay | FUTEMAX HD",
          seoDescription: "Reveja Manchester City x Liverpool",
          seoKeywords: "manchester city, liverpool, premier league"
        }
      ]);
    }
  };

  const openGameModal = (game: Game) => {
    setSelectedGame(game);
    setCurrentPlayerIndex(0);
  };

  const switchPlayer = (direction: 'prev' | 'next') => {
    if (!selectedGame || !selectedGame.embedCodes.length) return;
    
    const availableEmbeds = selectedGame.embedCodes.filter(embed => embed.trim() !== "");
    
    if (direction === 'next') {
      setCurrentPlayerIndex((prev) => (prev + 1) % availableEmbeds.length);
    } else {
      setCurrentPlayerIndex((prev) => (prev - 1 + availableEmbeds.length) % availableEmbeds.length);
    }
  };

  const getCurrentEmbed = () => {
    if (!selectedGame || !selectedGame.embedCodes.length) return null;
    const availableEmbeds = selectedGame.embedCodes.filter(embed => embed.trim() !== "");
    const currentEmbed = availableEmbeds[currentPlayerIndex];
    
    // Se for um link direto, converter para iframe SEM RESTRIÇÕES
    if (currentEmbed && currentEmbed.startsWith('http')) {
      return `<iframe src="${currentEmbed}" width="100%" height="100%" frameborder="0" allowfullscreen allow="autoplay; encrypted-media; fullscreen; picture-in-picture; web-share" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
    }
    
    return currentEmbed || null;
  };

  const getAvailablePlayersCount = (game: Game) => {
    return game.embedCodes?.filter(embed => embed.trim() !== "").length || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header Moderno e Responsivo */}
      <header className="bg-gradient-to-r from-red-900/20 via-black to-red-900/20 backdrop-blur-sm border-b border-red-500/20 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 sm:w-6 sm:h-6 text-white fill-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                    FUTEMAX HD
                  </h1>
                  <span className="text-xs sm:text-sm text-gray-400 font-medium hidden sm:block">Futebol Online • Qualidade 4K</span>
                </div>
              </div>
              
              {/* Stats - Oculto em mobile muito pequeno */}
              <div className="hidden md:flex items-center space-x-3 lg:space-x-6 text-xs sm:text-sm">
                <div className="flex items-center space-x-1 sm:space-x-2 bg-red-500/10 px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-red-500/20">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 font-medium">{games.filter(g => g.status === 'live').length} AO VIVO</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 bg-blue-500/10 px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-blue-500/20">
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
                  <span className="text-blue-400 font-medium">{games.filter(g => g.status === 'upcoming').length} PRÓXIMOS</span>
                </div>
                <div className="hidden lg:flex items-center space-x-2 bg-green-500/10 px-3 py-2 rounded-full border border-green-500/20">
                  <Trophy className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 font-medium">{games.filter(g => g.status === 'finished').length} REPLAYS</span>
                </div>
                {/* Indicador API */}
                {games.some(g => g.isFromAPI) && (
                  <div className="hidden lg:flex items-center space-x-2 bg-yellow-500/10 px-3 py-2 rounded-full border border-yellow-500/20">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">API ATIVA</span>
                  </div>
                )}
              </div>
            </div>

            {/* Botões do Header */}
            <div className="flex items-center space-x-2">
              {/* Botão Jogos de Amanhã */}
              <Link href="/tomorrow">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border border-blue-500/50 hover:border-blue-400/50 transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl"
                  size="sm"
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Jogos de Amanhã</span>
                  <span className="sm:hidden">Amanhã</span>
                </Button>
              </Link>

              {/* Botão Admin */}
              <Link href="/admin">
                <Button 
                  className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl"
                  size="sm"
                >
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Painel Admin</span>
                  <span className="sm:hidden">Admin</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Banner API-Football */}
        {games.some(g => g.isFromAPI) && (
          <div className="mb-6 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/20 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">API-Football Integrada</h3>
                  <p className="text-sm text-gray-400">
                    Jogos atualizados automaticamente • {games.filter(g => g.isFromAPI).length} jogos da API
                  </p>
                </div>
              </div>
              <Link href="/tomorrow">
                <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
                  Ver Jogos de Amanhã
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Busca e filtros responsivos */}
        <div className="mb-6 sm:mb-10">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <Input
                placeholder="Buscar times, ligas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 pl-10 sm:pl-12 h-10 sm:h-12 rounded-xl backdrop-blur-sm focus:bg-gray-800/70 transition-all text-sm sm:text-base"
              />
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="flex-1 sm:w-48 bg-gray-800/50 border-gray-600/50 text-white h-10 sm:h-12 rounded-xl backdrop-blur-sm text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">🌐 Todos</SelectItem>
                  <SelectItem value="live">🔴 Ao Vivo</SelectItem>
                  <SelectItem value="upcoming">🕐 Próximos</SelectItem>
                  <SelectItem value="finished">✅ Finalizados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Jogos ao vivo em destaque - Responsivo */}
        {games.filter(g => g.status === 'live').length > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                AO VIVO AGORA
              </h2>
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {games.filter(g => g.status === 'live').slice(0, 3).map((game) => (
                <div key={game.id} className="group bg-gradient-to-br from-red-900/30 via-gray-900/50 to-black/50 border border-red-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:from-red-800/40 hover:border-red-400/50 transition-all duration-300 cursor-pointer backdrop-blur-sm shadow-2xl">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <Badge className="bg-red-500 text-white animate-pulse shadow-lg text-xs sm:text-sm">
                      🔴 AO VIVO
                    </Badge>
                    <div className="flex space-x-2">
                      {getAvailablePlayersCount(game) > 0 && (
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                          {getAvailablePlayersCount(game)} Players
                        </Badge>
                      )}
                      {game.isFromAPI && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs">
                          API
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center mb-3 sm:mb-4">
                    <div className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2 leading-tight">
                      {game.homeTeam} <span className="text-red-400 mx-1 sm:mx-2">×</span> {game.awayTeam}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 bg-gray-800/30 px-2 sm:px-3 py-1 rounded-full inline-block">
                      {game.league}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg group-hover:shadow-xl transition-all duration-300 text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3"
                          onClick={() => openGameModal(game)}
                        >
                          <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          ASSISTIR AGORA
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista completa de jogos - Responsiva */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-4 sm:mb-6">
            {filterStatus === "all" ? "Todos os Jogos" :
             filterStatus === "live" ? "Jogos ao Vivo" :
             filterStatus === "upcoming" ? "Próximos Jogos" : "Jogos Finalizados"}
          </h2>
          
          {filteredGames.map((game) => (
            <div key={game.id} className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-all rounded-xl sm:rounded-2xl backdrop-blur-sm shadow-lg hover:shadow-xl">
              <div className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                      {/* Status */}
                      <div className="flex-shrink-0 flex items-center space-x-2">
                        {game.status === "live" && (
                          <Badge className="bg-red-500 text-white animate-pulse shadow-lg text-xs sm:text-sm">
                            🔴 AO VIVO
                          </Badge>
                        )}
                        {game.status === "upcoming" && (
                          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs sm:text-sm">
                            🕐 {game.time}
                          </Badge>
                        )}
                        {game.status === "finished" && (
                          <Badge className="bg-gray-600/20 text-gray-400 border border-gray-600/30 text-xs sm:text-sm">
                            ✅ ENCERRADO
                          </Badge>
                        )}
                        {game.isFromAPI && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs">
                            API
                          </Badge>
                        )}
                      </div>
                      
                      {/* Jogo */}
                      <div className="flex-1">
                        <div className="text-white font-bold text-sm sm:text-lg lg:text-xl mb-1 leading-tight">
                          {game.homeTeam} <span className="text-red-400 mx-1 sm:mx-3">×</span> {game.awayTeam}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400 flex flex-wrap items-center gap-2 sm:gap-4">
                          <span className="bg-gray-800/50 px-2 py-1 rounded-lg">{game.league}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{new Date(game.date).toLocaleDateString('pt-BR')}</span>
                          {getAvailablePlayersCount(game) > 0 && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="text-green-400 font-medium">{getAvailablePlayersCount(game)} Players</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botão assistir */}
                  <div className="flex-shrink-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className={`w-full sm:w-auto ${
                            game.status === "live" 
                              ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" 
                              : game.status === "upcoming"
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                              : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                          } text-white shadow-lg transition-all duration-300 text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3`}
                          onClick={() => openGameModal(game)}
                          disabled={getAvailablePlayersCount(game) === 0 && game.status !== "live"}
                        >
                          <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          {game.status === "live" ? "ASSISTIR" : 
                           game.status === "upcoming" ? "AGUARDAR" : "REPLAY"}
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12 sm:py-20">
            <div className="text-gray-400 text-lg sm:text-xl mb-2">
              {searchTerm || filterStatus !== "all" 
                ? "Nenhum jogo encontrado com os filtros aplicados" 
                : "Nenhum jogo disponível no momento"}
            </div>
            <div className="text-gray-500 text-sm">
              Tente ajustar os filtros ou volte mais tarde
            </div>
          </div>
        )}
      </div>

      {/* Modal do Player - Responsivo */}
      {selectedGame && (
        <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-6xl bg-gradient-to-br from-gray-900 to-black border-gray-700 p-0 rounded-xl sm:rounded-2xl max-h-[95vh] overflow-y-auto">
            <DialogHeader className="p-4 sm:p-6 pb-0">
              <DialogTitle className="text-white text-lg sm:text-2xl font-bold leading-tight">
                {selectedGame.homeTeam} × {selectedGame.awayTeam}
              </DialogTitle>
              <div className="text-gray-400 text-xs sm:text-sm">
                {selectedGame.league} • {new Date(selectedGame.date).toLocaleDateString('pt-BR')} às {selectedGame.time}
                {selectedGame.isFromAPI && (
                  <Badge className="ml-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs">
                    API-Football
                  </Badge>
                )}
              </div>
            </DialogHeader>
            
            <div className="p-4 sm:p-6">
              {/* Controles do Player */}
              {getAvailablePlayersCount(selectedGame) > 1 && (
                <div className="flex items-center justify-between mb-4 sm:mb-6 bg-gray-800/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                  <Button
                    onClick={() => switchPlayer('prev')}
                    className="bg-gray-700 hover:bg-gray-600 rounded-xl"
                    size="sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="text-center">
                    <div className="text-white font-bold text-sm sm:text-base">
                      Player {currentPlayerIndex + 1} de {getAvailablePlayersCount(selectedGame)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Use as setas para trocar de player
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => switchPlayer('next')}
                    className="bg-gray-700 hover:bg-gray-600 rounded-xl"
                    size="sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Player de Vídeo */}
              <div className="aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                {getCurrentEmbed() ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: getCurrentEmbed()! }}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center px-4">
                      <Monitor className="w-12 h-12 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 opacity-50" />
                      <p className="text-lg sm:text-xl mb-2">Transmissão não disponível</p>
                      <p className="text-sm">
                        {selectedGame.status === "upcoming" 
                          ? "Aguarde o início do jogo" 
                          : "Nenhum player configurado"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Informações adicionais */}
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  <Badge className={
                    selectedGame.status === "live" ? "bg-red-500" :
                    selectedGame.status === "upcoming" ? "bg-blue-500" : "bg-gray-600"
                  }>
                    {selectedGame.status === "live" ? "🔴 AO VIVO" :
                     selectedGame.status === "upcoming" ? "🕐 PRÓXIMO" : "✅ ENCERRADO"}
                  </Badge>
                  {selectedGame.isFromAPI && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
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

      {/* Footer Responsivo e Configurável */}
      <footer className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t border-gray-800/50 mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Logo e Descrição */}
            <div className="sm:col-span-2">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
                </div>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                  FUTEMAX HD
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {siteSettings.footerText || "A melhor plataforma para assistir futebol online gratuitamente. Transmissões em alta qualidade, múltiplos players e cobertura completa dos principais campeonatos mundiais."}
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Globe className="w-3 h-3" />
                  <span>Disponível 24/7</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3" />
                  <span>Qualidade 4K</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="w-3 h-3" />
                  <span>Todos os Campeonatos</span>
                </div>
              </div>
            </div>

            {/* Links Rápidos */}
            <div>
              <h3 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Campeonatos</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-red-400 cursor-pointer transition-colors">Brasileirão Série A</li>
                <li className="hover:text-red-400 cursor-pointer transition-colors">Champions League</li>
                <li className="hover:text-red-400 cursor-pointer transition-colors">Premier League</li>
                <li className="hover:text-red-400 cursor-pointer transition-colors">La Liga</li>
                <li className="hover:text-red-400 cursor-pointer transition-colors">Copa do Brasil</li>
              </ul>
            </div>

            {/* Informações */}
            <div>
              <h3 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Plataforma</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-red-400 cursor-pointer transition-colors">Jogos ao Vivo</li>
                <li className="hover:text-red-400 cursor-pointer transition-colors">Replays HD</li>
                <li className="hover:text-red-400 cursor-pointer transition-colors">Múltiplos Players</li>
                <li className="hover:text-red-400 cursor-pointer transition-colors">Mobile Friendly</li>
                <li className="hover:text-red-400 cursor-pointer transition-colors">Sem Cadastro</li>
                {/* Links customizáveis do rodapé */}
                {siteSettings.footerLinks?.map((link, index) => (
                  <li key={index} className="hover:text-red-400 cursor-pointer transition-colors">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Linha divisória */}
          <div className="border-t border-gray-800/50 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-gray-400 text-sm">
                  © 2024 <span className="text-red-400 font-medium">FUTEMAX HD</span> - Todos os direitos reservados
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Futebol Online Grátis • Transmissões em Alta Qualidade
                </p>
              </div>
              
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex items-center space-x-2 bg-green-500/10 px-2 sm:px-3 py-1 rounded-full border border-green-500/20">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs font-medium">Online</span>
                </div>
                <div className="text-xs text-gray-500">
                  Servidor: Brasil 🇧🇷
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}