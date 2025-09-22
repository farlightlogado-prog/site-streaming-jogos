import { NextRequest, NextResponse } from 'next/server';
import { sign, verify } from 'jsonwebtoken';

// Credenciais padrão (em produção, use variáveis de ambiente)
const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: '123456'
};

// Chave secreta para JWT (em produção, use variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'futemax-admin-secret-key-2024';

// Função para verificar credenciais
function checkCredentials(username: string, password: string) {
  // Verificar se existem credenciais customizadas no localStorage (simulado)
  const customCreds = getCustomCredentials();
  
  if (customCreds) {
    return username === customCreds.username && password === customCreds.password;
  }
  
  // Usar credenciais padrão
  return username === DEFAULT_CREDENTIALS.username && password === DEFAULT_CREDENTIALS.password;
}

// Simular localStorage no servidor (em produção, use banco de dados)
let customCredentials: { username: string; password: string } | null = null;

function getCustomCredentials() {
  return customCredentials;
}

function setCustomCredentials(username: string, password: string) {
  customCredentials = { username, password };
}

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (!checkCredentials(username, password)) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Gerar token JWT
    const token = sign(
      { username, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      token,
      message: 'Login realizado com sucesso'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Alterar credenciais
export async function PUT(request: NextRequest) {
  try {
    const { currentUsername, currentPassword, newUsername, newPassword, token } = await request.json();

    // Verificar token
    try {
      verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar credenciais atuais
    if (!checkCredentials(currentUsername, currentPassword)) {
      return NextResponse.json(
        { error: 'Credenciais atuais incorretas' },
        { status: 401 }
      );
    }

    // Validar novas credenciais
    if (!newUsername || !newPassword) {
      return NextResponse.json(
        { error: 'Novo usuário e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Salvar novas credenciais
    setCustomCredentials(newUsername, newPassword);

    return NextResponse.json({
      success: true,
      message: 'Credenciais alteradas com sucesso'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Verificar token
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const decoded = verify(token, JWT_SECRET);
    
    return NextResponse.json({
      valid: true,
      user: decoded
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    );
  }
}