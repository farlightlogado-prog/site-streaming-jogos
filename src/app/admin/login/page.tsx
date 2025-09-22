"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Salvar token no localStorage
        localStorage.setItem('adminToken', data.token);
        router.push('/admin');
      } else {
        setError(data.error || 'Erro ao fazer login');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-500">
              PAINEL ADMIN
            </CardTitle>
          </div>
          <p className="text-gray-400">Faça login para acessar o painel administrativo</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white">Usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white pl-10"
                  placeholder="Digite seu usuário"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-white">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white pl-10 pr-10"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h4 className="text-white font-medium mb-2">Credenciais Padrão:</h4>
            <p className="text-gray-400 text-sm">Usuário: <span className="text-white">admin</span></p>
            <p className="text-gray-400 text-sm">Senha: <span className="text-white">123456</span></p>
            <p className="text-xs text-gray-500 mt-2">
              Altere essas credenciais após o primeiro acesso
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}