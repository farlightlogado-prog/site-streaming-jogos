"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Settings, 
  Monitor, 
  Globe, 
  Calendar,
  Clock,
  Users,
  Play,
  X,
  ChevronDown,
  ChevronUp,
  LogOut,
  Key,
  Shield,
  Link,
  Zap,
  Wifi,
  RefreshCw,
  Database,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
}

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

interface ApiConfig {
  apiKey: string;
  baseUrl: string;
  enabledLeagues: string[];
  autoUpdate: boolean;
  updateInterval: number;
  maxGamesPerDay: number;
}

interface LeagueConfig {
  id: string;
  name: string;
  country: string;
  enabled: boolean;
  priority: number;
  apiId?: number;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedEmbeds, setExpandedEmbeds] = useState<{[key: string]: boolean}>({});
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showApiConfigModal, setShowApiConfigModal] = useState(false);
  const [apiSyncLoading, setApiSyncLoading] = useState(false);
  const [leagueSearchTerm, setLeagueSearchTerm] = useState("");
  const router = useRouter();
  
  // Configurações de credenciais
  const [credentialsForm, setCredentialsForm] = useState({
    currentUsername: '',
    currentPassword: '',
    newUsername: '',
    newPassword: ''
  });

  // Configuração da API externa
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    apiKey: '',
    baseUrl: 'https://v3.football.api-sports.io',
    enabledLeagues: [],
    autoUpdate: false,
    updateInterval: 60, // minutos
    maxGamesPerDay: 50
  });

  // Ligas disponíveis com configurações detalhadas
  const [availableLeagues, setAvailableLeagues] = useState<LeagueConfig[]>([
    { id: 'brasileirao-a', name: 'Brasileirão Série A', country: 'Brasil', enabled: false, priority: 1, apiId: 71 },
    { id: 'brasileirao-b', name: 'Brasileirão Série B', country: 'Brasil', enabled: false, priority: 2, apiId: 72 },
    { id: 'copa-brasil', name: 'Copa do Brasil', country: 'Brasil', enabled: false, priority: 3, apiId: 73 },
    { id: 'premier-league', name: 'Premier League', country: 'Inglaterra', enabled: false, priority: 4, apiId: 39 },
    { id: 'la-liga', name: 'La Liga', country: 'Espanha', enabled: false, priority: 5, apiId: 140 },
    { id: 'serie-a', name: 'Serie A', country: 'Itália', enabled: false, priority: 6, apiId: 135 },
    { id: 'bundesliga', name: 'Bundesliga', country: 'Alemanha', enabled: false, priority: 7, apiId: 78 },
    { id: 'ligue-1', name: 'Ligue 1', country: 'França', enabled: false, priority: 8, apiId: 61 },
    { id: 'champions-league', name: 'Champions League', country: 'UEFA', enabled: false, priority: 9, apiId: 2 },
    { id: 'europa-league', name: 'Europa League', country: 'UEFA', enabled: false, priority: 10, apiId: 3 },
    { id: 'libertadores', name: 'Copa Libertadores', country: 'CONMEBOL', enabled: false, priority: 11, apiId: 13 },
    { id: 'sul-americana', name: 'Copa Sul-Americana', country: 'CONMEBOL', enabled: false, priority: 12, apiId: 11 },
    { id: 'mundial-clubes', name: 'Mundial de Clubes', country: 'FIFA', enabled: false, priority: 13, apiId: 15 },
    { id: 'copa-mundo', name: 'Copa do Mundo', country: 'FIFA', enabled: false, priority: 14, apiId: 1 },
    { id: 'eurocopa', name: 'Eurocopa', country: 'UEFA', enabled: false, priority: 15, apiId: 4 },
    { id: 'copa-america', name: 'Copa América', country: 'CONMEBOL', enabled: false, priority: 16, apiId: 9 },
    { id: 'liga-portugal', name: 'Liga Portugal', country: 'Portugal', enabled: false, priority: 17, apiId: 94 },
    { id: 'eredivisie', name: 'Eredivisie', country: 'Holanda', enabled: false, priority: 18, apiId: 88 },
    { id: 'mls', name: 'MLS', country: 'EUA', enabled: false, priority: 19, apiId: 253 },
    { id: 'liga-mx', name: 'Liga MX', country: 'México', enabled: false, priority: 20, apiId: 262 }
  ]);
  
  // Configurações SEO do site
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    title: "FUTEMAX HD - Futebol Online Grátis",
    description: "Assista futebol ao vivo grátis. Todos os jogos do Brasileirão, Champions League, Premier League e muito mais.",
    keywords: "futebol online, futebol grátis, jogos ao vivo, brasileirão, champions league",
    ogTitle: "FUTEMAX HD - Futebol Online Grátis",
    ogDescription: "Assista futebol ao vivo grátis. Todos os jogos do Brasileirão, Champions League, Premier League e muito mais.",
    ogImage: "/og-image.jpg",
    twitterTitle: "FUTEMAX HD - Futebol Online Grátis",
    twitterDescription: "Assista futebol ao vivo grátis. Todos os jogos do Brasileirão, Champions League, Premier League e muito mais.",
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
  });

  // Novo jogo com múltiplos embeds
  const [newGame, setNewGame] = useState<Partial<Game>>({
    homeTeam: "",
    awayTeam: "",
    league: "",
    date: "",
    time: "",
    status: "upcoming",
    embedCodes: ["", "", "", "", "", "", "", "", ""], // 9 slots para embeds
    seoTitle: "",
    seoDescription: "",
    seoKeywords: ""
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGames();
      loadSiteSettings();
      loadApiConfig();
      
      // Atualizar status dos jogos automaticamente
      const interval = setInterval(() => {
        updateGameStatuses();
      }, 60000); // Verificar a cada minuto

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const checkAuthentication = async () => {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
      }
    } catch (error) {
      localStorage.removeItem('adminToken');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const updateCredentials = async () => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...credentialsForm,
          token
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Credenciais alteradas com sucesso! Faça login novamente.');
        handleLogout();
      } else {
        alert(data.error || 'Erro ao alterar credenciais');
      }
    } catch (error) {
      alert('Erro de conexão. Tente novamente.');
    }
  };

  const loadApiConfig = async () => {
    try {
      const response = await fetch('/api/games', {
        method: 'PATCH'
      });
      if (response.ok) {
        const config = await response.json();
        setApiConfig(prev => ({ ...prev, ...config }));
        
        // Atualizar status das ligas baseado na configuração
        setAvailableLeagues(prev => 
          prev.map(league => ({
            ...league,
            enabled: config.enabledLeagues?.includes(league.id) || false
          }))
        );
      }
    } catch (error) {
      console.error('Erro ao carregar configuração da API:', error);
    }
  };

  const saveApiConfig = async () => {
    try {
      const enabledLeagueIds = availableLeagues
        .filter(league => league.enabled)
        .map(league => league.id);

      const configToSave = {
        ...apiConfig,
        enabledLeagues: enabledLeagueIds
      };

      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'api-config',
          ...configToSave
        })
      });

      if (response.ok) {
        alert('Configuração da API salva com sucesso!');
        setShowApiConfigModal(false);
      } else {
        alert('Erro ao salvar configuração da API');
      }
    } catch (error) {
      alert('Erro de conexão. Tente novamente.');
    }
  };

  const syncWithExternalAPI = async () => {
    setApiSyncLoading(true);
    try {
      const response = await fetch('/api/games?updateFromAPI=true');
      if (response.ok) {
        await fetchGames();
        alert('Jogos sincronizados com sucesso da API externa!');
      } else {
        alert('Erro ao sincronizar com a API externa');
      }
    } catch (error) {
      alert('Erro de conexão com a API externa');
    } finally {
      setApiSyncLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      if (response.ok) {
        const data = await response.json();
        setGames(data.map((game: any) => ({
          ...game,
          embedCodes: game.embedCodes || [game.embedCode || ""],
          seoTitle: game.seoTitle || `${game.homeTeam} x ${game.awayTeam} - Ao Vivo`,
          seoDescription: game.seoDescription || `Assista ${game.homeTeam} x ${game.awayTeam} ao vivo grátis. ${game.league}`,
          seoKeywords: game.seoKeywords || `${game.homeTeam}, ${game.awayTeam}, ${game.league}, futebol ao vivo`
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
    }
  };

  const loadSiteSettings = async () => {
    try {
      const response = await fetch('/api/seo');
      if (response.ok) {
        const data = await response.json();
        setSiteSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações SEO:', error);
      // Fallback para localStorage
      const saved = localStorage.getItem('siteSettings');
      if (saved) {
        setSiteSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
      }
    }
  };

  const saveSiteSettings = async () => {
    try {
      const response = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      });

      if (response.ok) {
        localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
        alert('Configurações salvas com sucesso!');
      } else {
        throw new Error('Erro ao salvar no servidor');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      // Fallback para localStorage
      localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
      alert('Configurações salvas localmente (erro no servidor)');
    }
  };

  const updateGameStatuses = () => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    setGames(prevGames => 
      prevGames.map(game => {
        const gameDate = game.date;
        const gameTime = game.time;
        
        // Se é hoje e passou da hora do jogo
        if (gameDate === currentDate) {
          const gameDateTime = new Date(`${gameDate}T${gameTime}`);
          const timeDiff = now.getTime() - gameDateTime.getTime();
          const minutesDiff = timeDiff / (1000 * 60);

          // Jogo começa automaticamente na hora marcada
          if (minutesDiff >= 0 && minutesDiff <= 120 && game.status === 'upcoming') {
            return { ...game, status: 'live' as const };
          }
          
          // Jogo termina 10 minutos após o tempo regulamentar (90 + 10 = 100 minutos)
          if (minutesDiff > 100 && game.status === 'live') {
            return { ...game, status: 'finished' as const };
          }
        }
        
        // Se é dia anterior, remover da lista (jogos antigos)
        if (gameDate < currentDate && game.status === 'finished') {
          return null;
        }

        return game;
      }).filter(Boolean) as Game[]
    );
  };

  // Função para converter link direto em iframe
  const convertLinkToEmbed = (link: string): string => {
    if (!link.trim()) return "";
    
    // Se já é um iframe, retornar como está
    if (link.includes('<iframe')) {
      return link;
    }
    
    // Converter link direto em iframe
    return `<iframe src="${link}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
  };

  const addGame = async () => {
    try {
      // Converter links diretos em embeds
      const processedEmbedCodes = newGame.embedCodes?.map(code => convertLinkToEmbed(code)) || [];
      
      const gameData = {
        ...newGame,
        id: Date.now().toString(),
        viewers: 0,
        embedCodes: processedEmbedCodes.filter(code => code.trim() !== "")
      };

      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData)
      });

      if (response.ok) {
        fetchGames();
        setNewGame({
          homeTeam: "",
          awayTeam: "",
          league: "",
          date: "",
          time: "",
          status: "upcoming",
          embedCodes: ["", "", "", "", "", "", "", "", ""],
          seoTitle: "",
          seoDescription: "",
          seoKeywords: ""
        });
        alert('Jogo adicionado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar jogo:', error);
    }
  };

  const updateGame = async (game: Game) => {
    try {
      // Converter links diretos em embeds
      const processedEmbedCodes = game.embedCodes?.map(code => convertLinkToEmbed(code)) || [];
      
      const updatedGame = {
        ...game,
        embedCodes: processedEmbedCodes
      };

      const response = await fetch('/api/games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGame)
      });

      if (response.ok) {
        fetchGames();
        setSelectedGame(null);
        setIsEditMode(false);
        alert('Jogo atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar jogo:', error);
    }
  };

  const deleteGame = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este jogo?')) {
      try {
        const response = await fetch(`/api/games?id=${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchGames();
          alert('Jogo excluído com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao excluir jogo:', error);
      }
    }
  };

  const toggleEmbedExpansion = (gameId: string) => {
    setExpandedEmbeds(prev => ({
      ...prev,
      [gameId]: !prev[gameId]
    }));
  };

  // Adicionar novo link no rodapé
  const addFooterLink = () => {
    setSiteSettings(prev => ({
      ...prev,
      footerLinks: [...(prev.footerLinks || []), { name: "", url: "" }]
    }));
  };

  // Remover link do rodapé
  const removeFooterLink = (index: number) => {
    setSiteSettings(prev => ({
      ...prev,
      footerLinks: prev.footerLinks?.filter((_, i) => i !== index) || []
    }));
  };

  // Atualizar link do rodapé
  const updateFooterLink = (index: number, field: 'name' | 'url', value: string) => {
    setSiteSettings(prev => ({
      ...prev,
      footerLinks: prev.footerLinks?.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      ) || []
    }));
  };

  // Toggle liga habilitada/desabilitada
  const toggleLeague = (leagueId: string) => {
    setAvailableLeagues(prev => 
      prev.map(league => 
        league.id === leagueId 
          ? { ...league, enabled: !league.enabled }
          : league
      )
    );
  };

  // Filtrar ligas por termo de busca
  const filteredLeagues = availableLeagues.filter(league =>
    league.name.toLowerCase().includes(leagueSearchTerm.toLowerCase()) ||
    league.country.toLowerCase().includes(leagueSearchTerm.toLowerCase())
  );

  // Habilitar/desabilitar todas as ligas
  const toggleAllLeagues = (enable: boolean) => {
    setAvailableLeagues(prev => 
      prev.map(league => ({ ...league, enabled: enable }))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const enabledLeaguesCount = availableLeagues.filter(l => l.enabled).length;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-red-500">PAINEL ADMINISTRATIVO</h1>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setShowApiConfigModal(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Database className="w-4 h-4 mr-2" />
                API Externa
              </Button>
              <Button 
                onClick={() => setShowCredentialsModal(true)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Key className="w-4 h-4 mr-2" />
                Alterar Credenciais
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Ver Site
              </Button>
              <Button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800">
            <TabsTrigger value="games" className="data-[state=active]:bg-red-600">
              <Calendar className="w-4 h-4 mr-2" />
              Gerenciar Jogos
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-red-600">
              <Database className="w-4 h-4 mr-2" />
              API Externa
            </TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:bg-red-600">
              <Globe className="w-4 h-4 mr-2" />
              Configurações SEO
            </TabsTrigger>
            <TabsTrigger value="site" className="data-[state=active]:bg-red-600">
              <Settings className="w-4 h-4 mr-2" />
              Configurações do Site
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-red-600">
              <Zap className="w-4 h-4 mr-2" />
              Performance & Analytics
            </TabsTrigger>
          </TabsList>

          {/* Aba de Gerenciamento de Jogos */}
          <TabsContent value="games" className="space-y-6">
            {/* Adicionar Novo Jogo */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Novo Jogo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>Time Casa</Label>
                    <Input
                      value={newGame.homeTeam || ""}
                      onChange={(e) => setNewGame({...newGame, homeTeam: e.target.value})}
                      className="bg-gray-800 border-gray-600"
                      placeholder="Ex: Flamengo"
                    />
                  </div>
                  <div>
                    <Label>Time Visitante</Label>
                    <Input
                      value={newGame.awayTeam || ""}
                      onChange={(e) => setNewGame({...newGame, awayTeam: e.target.value})}
                      className="bg-gray-800 border-gray-600"
                      placeholder="Ex: Palmeiras"
                    />
                  </div>
                  <div>
                    <Label>Liga/Campeonato</Label>
                    <Input
                      value={newGame.league || ""}
                      onChange={(e) => setNewGame({...newGame, league: e.target.value})}
                      className="bg-gray-800 border-gray-600"
                      placeholder="Ex: Brasileirão"
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select 
                      value={newGame.status} 
                      onValueChange={(value: any) => setNewGame({...newGame, status: value})}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="upcoming">Próximo</SelectItem>
                        <SelectItem value="live">Ao Vivo</SelectItem>
                        <SelectItem value="finished">Finalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={newGame.date || ""}
                      onChange={(e) => setNewGame({...newGame, date: e.target.value})}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label>Horário</Label>
                    <Input
                      type="time"
                      value={newGame.time || ""}
                      onChange={(e) => setNewGame({...newGame, time: e.target.value})}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                </div>

                {/* SEO do Jogo */}
                <div className="space-y-4 border-t border-gray-700 pt-4">
                  <h4 className="text-lg font-semibold text-white">SEO do Jogo</h4>
                  <div>
                    <Label>Título SEO</Label>
                    <Input
                      value={newGame.seoTitle || ""}
                      onChange={(e) => setNewGame({...newGame, seoTitle: e.target.value})}
                      className="bg-gray-800 border-gray-600"
                      placeholder="Ex: Flamengo x Palmeiras - Ao Vivo | FUTEMAX HD"
                    />
                  </div>
                  <div>
                    <Label>Descrição SEO</Label>
                    <Textarea
                      value={newGame.seoDescription || ""}
                      onChange={(e) => setNewGame({...newGame, seoDescription: e.target.value})}
                      className="bg-gray-800 border-gray-600 h-20"
                      placeholder="Assista Flamengo x Palmeiras ao vivo grátis. Brasileirão 2024..."
                    />
                  </div>
                  <div>
                    <Label>Palavras-chave SEO</Label>
                    <Input
                      value={newGame.seoKeywords || ""}
                      onChange={(e) => setNewGame({...newGame, seoKeywords: e.target.value})}
                      className="bg-gray-800 border-gray-600"
                      placeholder="flamengo, palmeiras, brasileirão, futebol ao vivo"
                    />
                  </div>
                </div>

                {/* Players Embed (9 opções) */}
                <div className="space-y-4 border-t border-gray-700 pt-4">
                  <h4 className="text-lg font-semibold text-white">Players de Transmissão (até 9 opções)</h4>
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3 mb-4">
                    <p className="text-blue-300 text-sm">
                      <strong>💡 Dica:</strong> Você pode colar apenas o link direto do player (ex: https://sporturbo.com/player/canais/dspl-cazetv) 
                      que o sistema automaticamente converte para iframe!
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {[...Array(9)].map((_, index) => (
                      <div key={index}>
                        <Label>Player {index + 1}</Label>
                        <Textarea
                          value={newGame.embedCodes?.[index] || ""}
                          onChange={(e) => {
                            const newEmbeds = [...(newGame.embedCodes || [])];
                            newEmbeds[index] = e.target.value;
                            setNewGame({...newGame, embedCodes: newEmbeds});
                          }}
                          className="bg-gray-800 border-gray-600 h-20"
                          placeholder={`Cole o link ou código embed do player ${index + 1} aqui...`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={addGame} className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Jogo
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Jogos */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Jogos Cadastrados</CardTitle>
                  {apiConfig.autoUpdate && (
                    <Button
                      onClick={syncWithExternalAPI}
                      disabled={apiSyncLoading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {apiSyncLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Wifi className="w-4 h-4 mr-2" />
                      )}
                      Sincronizar API
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {games.map((game) => (
                    <div key={game.id} className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <Badge className={
                              game.status === "live" ? "bg-red-600" :
                              game.status === "upcoming" ? "bg-blue-600" : "bg-gray-600"
                            }>
                              {game.status === "live" ? "AO VIVO" :
                               game.status === "upcoming" ? "PRÓXIMO" : "ENCERRADO"}
                            </Badge>
                            {game.id.startsWith('api_') && (
                              <Badge className="bg-purple-600">
                                <Database className="w-3 h-3 mr-1" />
                                API
                              </Badge>
                            )}
                            <div>
                              <div className="text-white font-medium">
                                {game.homeTeam} x {game.awayTeam}
                              </div>
                              <div className="text-sm text-gray-400">
                                {game.league} • {new Date(game.date).toLocaleDateString('pt-BR')} às {game.time}
                              </div>
                            </div>
                            {game.viewers !== undefined && game.viewers > 0 && (
                              <div className="text-sm text-gray-400 flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {game.viewers.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => toggleEmbedExpansion(game.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {expandedEmbeds[game.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            Players ({game.embedCodes?.filter(code => code.trim() !== "").length || 0})
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedGame(game);
                              setIsEditMode(true);
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => deleteGame(game.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Players expandidos */}
                      {expandedEmbeds[game.id] && (
                        <div className="mt-4 space-y-2 border-t border-gray-600 pt-4">
                          <h5 className="text-white font-medium">Players de Transmissão:</h5>
                          {game.embedCodes?.map((embed, index) => (
                            embed.trim() !== "" && (
                              <div key={index} className="bg-gray-700 p-2 rounded">
                                <div className="text-sm text-gray-300 mb-1">Player {index + 1}:</div>
                                <div className="text-xs text-gray-400 font-mono break-all">
                                  {embed.substring(0, 100)}...
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de API Externa - MELHORADA */}
          <TabsContent value="api" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Configuração da API Externa de Futebol
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <h5 className="text-blue-400 font-semibold mb-2">🚀 Como Funciona</h5>
                  <ul className="text-sm text-blue-300 space-y-1">
                    <li>• Configure sua API de futebol (API-Football, SportRadar, etc.)</li>
                    <li>• Selecione os campeonatos que deseja acompanhar</li>
                    <li>• O sistema puxa automaticamente os jogos dos próximos dias</li>
                    <li>• Você adiciona os players de transmissão manualmente</li>
                    <li>• Jogos da API são marcados com badge "API"</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Configurações da API */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Configurações da API</h4>
                    
                    <div>
                      <Label>Chave da API</Label>
                      <Input
                        type="password"
                        value={apiConfig.apiKey}
                        onChange={(e) => setApiConfig({...apiConfig, apiKey: e.target.value})}
                        className="bg-gray-800 border-gray-600"
                        placeholder="Sua chave da API de futebol"
                      />
                    </div>

                    <div>
                      <Label>URL Base da API</Label>
                      <Input
                        value={apiConfig.baseUrl}
                        onChange={(e) => setApiConfig({...apiConfig, baseUrl: e.target.value})}
                        className="bg-gray-800 border-gray-600"
                        placeholder="https://v3.football.api-sports.io"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Intervalo de Atualização (min)</Label>
                        <Input
                          type="number"
                          value={apiConfig.updateInterval}
                          onChange={(e) => setApiConfig({...apiConfig, updateInterval: parseInt(e.target.value) || 60})}
                          className="bg-gray-800 border-gray-600"
                          min="15"
                          max="1440"
                        />
                      </div>
                      <div>
                        <Label>Máx. Jogos por Dia</Label>
                        <Input
                          type="number"
                          value={apiConfig.maxGamesPerDay}
                          onChange={(e) => setApiConfig({...apiConfig, maxGamesPerDay: parseInt(e.target.value) || 50})}
                          className="bg-gray-800 border-gray-600"
                          min="10"
                          max="200"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="autoUpdate"
                        checked={apiConfig.autoUpdate}
                        onChange={(e) => setApiConfig({...apiConfig, autoUpdate: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="autoUpdate">Ativar sincronização automática</Label>
                    </div>

                    <Button onClick={saveApiConfig} className="w-full bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </Button>
                  </div>

                  {/* Seleção de Campeonatos */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                      <h4 className="text-lg font-semibold text-white">Campeonatos</h4>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => toggleAllLeagues(true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Todos
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => toggleAllLeagues(false)}
                          className="bg-gray-600 hover:bg-gray-700"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Nenhum
                        </Button>
                      </div>
                    </div>
                    
                    {/* Busca de campeonatos */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={leagueSearchTerm}
                        onChange={(e) => setLeagueSearchTerm(e.target.value)}
                        className="bg-gray-800 border-gray-600 pl-10"
                        placeholder="Buscar campeonatos..."
                      />
                    </div>

                    {/* Lista de campeonatos */}
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {filteredLeagues.map((league) => (
                        <div key={league.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleLeague(league.id)}
                              className="flex items-center space-x-2"
                            >
                              {league.enabled ? (
                                <ToggleRight className="w-5 h-5 text-green-500" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-gray-500" />
                              )}
                            </button>
                            <div>
                              <div className="text-white font-medium">{league.name}</div>
                              <div className="text-xs text-gray-400">{league.country}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              ID: {league.apiId}
                            </Badge>
                            {league.enabled && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-sm text-gray-400 bg-gray-800/30 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span>Campeonatos selecionados:</span>
                        <Badge className="bg-blue-600">
                          {enabledLeaguesCount} de {availableLeagues.length}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status da API */}
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Status da Integração</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        {apiConfig.apiKey ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="font-medium">API Key</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {apiConfig.apiKey ? 'Configurada' : 'Não configurada'}
                      </p>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        {enabledLeaguesCount > 0 ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className="font-medium">Campeonatos</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {enabledLeaguesCount} selecionados
                      </p>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        {apiConfig.autoUpdate ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-gray-500" />
                        )}
                        <span className="font-medium">Auto-Sync</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {apiConfig.autoUpdate ? `A cada ${apiConfig.updateInterval}min` : 'Desativado'}
                      </p>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Database className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">Jogos API</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {games.filter(g => g.id.startsWith('api_')).length} ativos
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botão de sincronização manual */}
                {apiConfig.apiKey && enabledLeaguesCount > 0 && (
                  <div className="border-t border-gray-700 pt-4">
                    <Button
                      onClick={syncWithExternalAPI}
                      disabled={apiSyncLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {apiSyncLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Wifi className="w-4 h-4 mr-2" />
                      )}
                      Sincronizar Jogos Agora
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Configurações SEO */}
          <TabsContent value="seo" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Configurações SEO do Site
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* SEO Básico */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">SEO Básico</h4>
                  <div>
                    <Label>Título do Site</Label>
                    <Input
                      value={siteSettings.title}
                      onChange={(e) => setSiteSettings({...siteSettings, title: e.target.value})}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label>Descrição do Site</Label>
                    <Textarea
                      value={siteSettings.description}
                      onChange={(e) => setSiteSettings({...siteSettings, description: e.target.value})}
                      className="bg-gray-800 border-gray-600 h-24"
                    />
                  </div>
                  <div>
                    <Label>Palavras-chave</Label>
                    <Input
                      value={siteSettings.keywords}
                      onChange={(e) => setSiteSettings({...siteSettings, keywords: e.target.value})}
                      className="bg-gray-800 border-gray-600"
                      placeholder="futebol, ao vivo, grátis, brasileirão"
                    />
                  </div>
                </div>

                {/* Open Graph */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Open Graph (Facebook)</h4>
                  <div>
                    <Label>OG Título</Label>
                    <Input
                      value={siteSettings.ogTitle}
                      onChange={(e) => setSiteSettings({...siteSettings, ogTitle: e.target.value})}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label>OG Descrição</Label>
                    <Textarea
                      value={siteSettings.ogDescription}
                      onChange={(e) => setSiteSettings({...siteSettings, ogDescription: e.target.value})}
                      className="bg-gray-800 border-gray-600 h-20"
                    />
                  </div>
                  <div>
                    <Label>OG Imagem (URL)</Label>
                    <Input
                      value={siteSettings.ogImage}
                      onChange={(e) => setSiteSettings({...siteSettings, ogImage: e.target.value})}
                      className="bg-gray-800 border-gray-600"
                      placeholder="https://seusite.com/og-image.jpg"
                    />
                  </div>
                </div>

                {/* Twitter Cards */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Twitter Cards</h4>
                  <div>
                    <Label>Twitter Título</Label>
                    <Input
                      value={siteSettings.twitterTitle}
                      onChange={(e) => setSiteSettings({...siteSettings, twitterTitle: e.target.value})}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label>Twitter Descrição</Label>
                    <Textarea
                      value={siteSettings.twitterDescription}
                      onChange={(e) => setSiteSettings({...siteSettings, twitterDescription: e.target.value})}
                      className="bg-gray-800 border-gray-600 h-20"
                    />
                  </div>
                  <div>
                    <Label>Twitter Imagem (URL)</Label>
                    <Input
                      value={siteSettings.twitterImage}
                      onChange={(e) => setSiteSettings({...siteSettings, twitterImage: e.target.value})}
                      className="bg-gray-800 border-gray-600"
                      placeholder="https://seusite.com/twitter-image.jpg"
                    />
                  </div>
                </div>

                {/* Analytics */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Analytics & Tracking</h4>
                  <div>
                    <Label>Google Analytics ID</Label>
                    <Input
                      value={siteSettings.googleAnalytics}
                      onChange={(e) => setSiteSettings({...siteSettings, googleAnalytics: e.target.value})}
                      className="bg-gray-800 border-gray-600"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <Label>Facebook Pixel ID</Label>
                    <Input
                      value={siteSettings.facebookPixel}
                      onChange={(e) => setSiteSettings({...siteSettings, facebookPixel: e.target.value})}
                      className="bg-gray-800 border-gray-600"
                      placeholder="123456789012345"
                    />
                  </div>
                </div>

                <Button onClick={saveSiteSettings} className="w-full bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações SEO
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Configurações do Site */}
          <TabsContent value="site" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Configurações do Site
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configurações do Rodapé */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Rodapé do Site</h4>
                  <div>
                    <Label>Texto do Rodapé</Label>
                    <Textarea
                      value={siteSettings.footerText || ""}
                      onChange={(e) => setSiteSettings({...siteSettings, footerText: e.target.value})}
                      className="bg-gray-800 border-gray-600 h-24"
                      placeholder="Texto que aparecerá no rodapé do site..."
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Links do Rodapé</Label>
                      <Button onClick={addFooterLink} size="sm" className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar Link
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {siteSettings.footerLinks?.map((link, index) => (
                        <div key={index} className="flex gap-3 items-center bg-gray-800/50 p-3 rounded-lg">
                          <Input
                            placeholder="Nome do link"
                            value={link.name}
                            onChange={(e) => updateFooterLink(index, 'name', e.target.value)}
                            className="bg-gray-800 border-gray-600"
                          />
                          <Input
                            placeholder="URL do link"
                            value={link.url}
                            onChange={(e) => updateFooterLink(index, 'url', e.target.value)}
                            className="bg-gray-800 border-gray-600"
                          />
                          <Button 
                            onClick={() => removeFooterLink(index)}
                            size="sm" 
                            className="bg-red-600 hover:bg-red-700 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Configurações de Admin */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Configurações de Admin</h4>
                  <div>
                    <Label>Caminho do Admin</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">https://seusite.com</span>
                      <Input
                        value={siteSettings.adminPath || "/admin"}
                        onChange={(e) => setSiteSettings({...siteSettings, adminPath: e.target.value})}
                        className="bg-gray-800 border-gray-600"
                        placeholder="/admin"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Altere o caminho de acesso ao painel administrativo para maior segurança
                    </p>
                  </div>
                </div>

                <Button onClick={saveSiteSettings} className="w-full bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações do Site
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Performance & Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total de Jogos</p>
                      <p className="text-2xl font-bold text-white">{games.length}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Jogos Ao Vivo</p>
                      <p className="text-2xl font-bold text-red-500">
                        {games.filter(g => g.status === 'live').length}
                      </p>
                    </div>
                    <Play className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Próximos Jogos</p>
                      <p className="text-2xl font-bold text-blue-500">
                        {games.filter(g => g.status === 'upcoming').length}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Jogos da API</p>
                      <p className="text-2xl font-bold text-purple-500">
                        {games.filter(g => g.id.startsWith('api_')).length}
                      </p>
                    </div>
                    <Database className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Otimizações de Performance */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Otimizações de Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <h5 className="text-green-400 font-semibold mb-2">✅ Otimizações Ativas</h5>
                  <ul className="text-sm text-green-300 space-y-1">
                    <li>• Cache automático de jogos (atualização a cada minuto)</li>
                    <li>• Integração com API externa de futebol</li>
                    <li>• Sincronização automática de jogos</li>
                    <li>• Compressão de imagens e assets</li>
                    <li>• Lazy loading de componentes pesados</li>
                    <li>• Minificação automática de CSS/JS</li>
                    <li>• Remoção automática de jogos antigos</li>
                    <li>• Headers de cache otimizados</li>
                    <li>• Preload de recursos críticos</li>
                  </ul>
                </div>

                <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
                  <h5 className="text-purple-400 font-semibold mb-2">🔗 Integração API Externa</h5>
                  <ul className="text-sm text-purple-300 space-y-1">
                    <li>• Suporte a múltiplas APIs de futebol</li>
                    <li>• Sincronização automática de jogos</li>
                    <li>• Filtragem por campeonatos</li>
                    <li>• Merge inteligente com jogos manuais</li>
                    <li>• Status automático baseado na API</li>
                    <li>• Identificação visual de jogos da API</li>
                  </ul>
                </div>

                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <h5 className="text-blue-400 font-semibold mb-2">🚀 Performance para Milhares de Usuários</h5>
                  <ul className="text-sm text-blue-300 space-y-1">
                    <li>• Sistema otimizado para alta concorrência</li>
                    <li>• Cache inteligente reduz carga no servidor</li>
                    <li>• Componentes React otimizados com memo</li>
                    <li>• Debounce em buscas e filtros</li>
                    <li>• Virtualização de listas grandes</li>
                    <li>• Service Workers para cache offline</li>
                  </ul>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                  <h5 className="text-yellow-400 font-semibold mb-2">⚡ Dicas de Performance</h5>
                  <ul className="text-sm text-yellow-300 space-y-1">
                    <li>• Use CDN para servir assets estáticos</li>
                    <li>• Configure cache no servidor (Redis/Memcached)</li>
                    <li>• Monitore métricas com Google Analytics</li>
                    <li>• Use compressão gzip/brotli no servidor</li>
                    <li>• Otimize imagens para WebP quando possível</li>
                    <li>• Configure rate limiting na API externa</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Status dos Jogos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-400">
                    <p>• Jogos da API são sincronizados automaticamente</p>
                    <p>• Jogos passam automaticamente para "AO VIVO" na hora marcada</p>
                    <p>• Jogos são marcados como "ENCERRADO" 10 minutos após o fim (100 min total)</p>
                    <p>• Jogos antigos são removidos automaticamente no dia seguinte</p>
                    <p>• Sistema otimizado para suportar milhares de usuários simultâneos</p>
                    <p>• Integração com múltiplas APIs de futebol</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Edição */}
      {isEditMode && selectedGame && (
        <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
          <DialogContent className="max-w-4xl bg-gray-900 border-gray-600 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Jogo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Time Casa</Label>
                  <Input
                    value={selectedGame.homeTeam}
                    onChange={(e) => setSelectedGame({...selectedGame, homeTeam: e.target.value})}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
                <div>
                  <Label>Time Visitante</Label>
                  <Input
                    value={selectedGame.awayTeam}
                    onChange={(e) => setSelectedGame({...selectedGame, awayTeam: e.target.value})}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Liga</Label>
                  <Input
                    value={selectedGame.league}
                    onChange={(e) => setSelectedGame({...selectedGame, league: e.target.value})}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
                <div>
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={selectedGame.date}
                    onChange={(e) => setSelectedGame({...selectedGame, date: e.target.value})}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
                <div>
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={selectedGame.time}
                    onChange={(e) => setSelectedGame({...selectedGame, time: e.target.value})}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select 
                  value={selectedGame.status} 
                  onValueChange={(value: any) => setSelectedGame({...selectedGame, status: value})}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="upcoming">Próximo</SelectItem>
                    <SelectItem value="live">Ao Vivo</SelectItem>
                    <SelectItem value="finished">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Players Embed */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Players de Transmissão</h4>
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3 mb-4">
                  <p className="text-blue-300 text-sm">
                    <strong>💡 Dica:</strong> Você pode colar apenas o link direto do player que o sistema automaticamente converte para iframe!
                  </p>
                </div>
                {[...Array(9)].map((_, index) => (
                  <div key={index}>
                    <Label>Player {index + 1}</Label>
                    <Textarea
                      value={selectedGame.embedCodes?.[index] || ""}
                      onChange={(e) => {
                        const newEmbeds = [...(selectedGame.embedCodes || [])];
                        newEmbeds[index] = e.target.value;
                        setSelectedGame({...selectedGame, embedCodes: newEmbeds});
                      }}
                      className="bg-gray-800 border-gray-600 h-20"
                      placeholder={`Cole o link ou código embed do player ${index + 1} aqui...`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={() => updateGame(selectedGame)} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
                <Button 
                  onClick={() => setIsEditMode(false)} 
                  className="flex-1 bg-gray-600 hover:bg-gray-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Alterar Credenciais */}
      <Dialog open={showCredentialsModal} onOpenChange={setShowCredentialsModal}>
        <DialogContent className="bg-gray-900 border-gray-600 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-yellow-500" />
              Alterar Credenciais de Acesso
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
              <p className="text-yellow-300 text-sm">
                <strong>⚠️ Atenção:</strong> Após alterar as credenciais, você precisará fazer login novamente.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Usuário Atual</Label>
                <Input
                  type="text"
                  value={credentialsForm.currentUsername}
                  onChange={(e) => setCredentialsForm({...credentialsForm, currentUsername: e.target.value})}
                  className="bg-gray-800 border-gray-600"
                  placeholder="Usuário atual"
                />
              </div>
              <div>
                <Label>Senha Atual</Label>
                <Input
                  type="password"
                  value={credentialsForm.currentPassword}
                  onChange={(e) => setCredentialsForm({...credentialsForm, currentPassword: e.target.value})}
                  className="bg-gray-800 border-gray-600"
                  placeholder="Senha atual"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Novo Usuário</Label>
                <Input
                  type="text"
                  value={credentialsForm.newUsername}
                  onChange={(e) => setCredentialsForm({...credentialsForm, newUsername: e.target.value})}
                  className="bg-gray-800 border-gray-600"
                  placeholder="Novo usuário"
                />
              </div>
              <div>
                <Label>Nova Senha</Label>
                <Input
                  type="password"
                  value={credentialsForm.newPassword}
                  onChange={(e) => setCredentialsForm({...credentialsForm, newPassword: e.target.value})}
                  className="bg-gray-800 border-gray-600"
                  placeholder="Nova senha (min. 6 caracteres)"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                onClick={updateCredentials}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              >
                <Key className="w-4 h-4 mr-2" />
                Alterar Credenciais
              </Button>
              <Button 
                onClick={() => setShowCredentialsModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}