# Portal do Romeiro - Configuração do Ambiente Local

Este guia explica como configurar e rodar o projeto completo em sua máquina local.

---

## Requisitos do Sistema

### Windows
- Windows 10/11 (64-bit)
- WSL2 (Windows Subsystem for Linux) - Recomendado
- Git for Windows
- Node.js 20 LTS

### macOS
- macOS 12 (Monterey) ou superior
- Xcode Command Line Tools
- Homebrew

### Linux
- Ubuntu 22.04 LTS, Debian 12, ou similar
- Git, curl, build-essential

---

## Passo 1: Instalar Node.js 20

### Windows (via instalador)
1. Acesse https://nodejs.org
2. Baixe a versão LTS (20.x)
3. Execute o instalador
4. Marque a opção "Automatically install necessary tools"
5. Reinicie o terminal

### macOS (via Homebrew)
```bash
# Instalar Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js
brew install node@20
```

### Linux (Ubuntu/Debian)
```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalação
node --version   # Deve mostrar v20.x.x
npm --version    # Deve mostrar 10.x.x
```

---

## Passo 2: Instalar PostgreSQL

### Windows
1. Baixe o instalador em https://www.postgresql.org/download/windows/
2. Execute e siga o assistente
3. Anote a senha do usuário "postgres"
4. Porta padrão: 5432

### macOS
```bash
# Via Homebrew
brew install postgresql@15
brew services start postgresql@15

# Criar usuário e banco
createuser -s portal_romeiro
createdb portal_romeiro -O portal_romeiro
```

### Linux
```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar usuário e banco
sudo -u postgres psql << EOF
CREATE USER portal_romeiro WITH PASSWORD 'senha123';
CREATE DATABASE portal_romeiro OWNER portal_romeiro;
GRANT ALL PRIVILEGES ON DATABASE portal_romeiro TO portal_romeiro;
\q
EOF
```

---

## Passo 3: Instalar Git

### Windows
Baixe em https://git-scm.com/download/win

### macOS
```bash
xcode-select --install
```

### Linux
```bash
sudo apt install -y git
```

---

## Passo 4: Baixar o Projeto

### Opção A: Clonar do Repositório
```bash
git clone SEU_REPOSITORIO portal-do-romeiro
cd portal-do-romeiro
```

### Opção B: Extrair do Backup
```bash
# Copie o arquivo de backup para sua máquina
tar -xzf portal_romeiro_backup_XXXXXXXX.tar.gz
cd portal_romeiro_backup_XXXXXXXX
```

### Opção C: Baixar do Replit
1. No Replit, clique nos 3 pontos ao lado do nome do projeto
2. Selecione "Download as zip"
3. Extraia o arquivo ZIP
4. Abra o terminal na pasta extraída

---

## Passo 5: Instalar Dependências

```bash
# Navegar para a pasta do projeto
cd portal-do-romeiro

# Instalar todas as dependências
npm install

# Isso pode levar alguns minutos na primeira vez
```

---

## Passo 6: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

### Windows (PowerShell)
```powershell
New-Item -Path ".env" -ItemType "file"
notepad .env
```

### macOS/Linux
```bash
touch .env
nano .env   # ou use seu editor preferido
```

### Conteúdo do arquivo .env
```env
# Banco de Dados
DATABASE_URL=postgresql://portal_romeiro:senha123@localhost:5432/portal_romeiro

# Segurança
SESSION_SECRET=minha_chave_secreta_desenvolvimento_local

# Ambiente
NODE_ENV=development
PORT=5000

# Mercado Pago (Sandbox - para testes)
MERCADOPAGO_ACCESS_TOKEN=TEST-sua-chave-sandbox
MERCADOPAGO_PUBLIC_KEY=TEST-sua-chave-publica

# Domínio (para desenvolvimento local)
REPLIT_DEV_DOMAIN=localhost
```

---

## Passo 7: Configurar o Banco de Dados

```bash
# Executar migrações para criar as tabelas
npm run db:push

# Você verá uma saída como:
# [✓] Changes applied
```

---

## Passo 8: Rodar a Aplicação

### Terminal 1 - Servidor Backend
```bash
npm run server:dev
```

Você verá:
```
Server running on port 5000
Database connected successfully
```

### Terminal 2 - App Expo (Frontend)
```bash
npm run expo:dev
```

Você verá:
```
Starting Metro Bundler
Web: http://localhost:8081
```

---

## Passo 9: Acessar a Aplicação

| Recurso | URL |
|---------|-----|
| App Web (Expo) | http://localhost:8081 |
| Painel Admin | http://localhost:5000/admin |
| Portal do Proprietário | http://localhost:5000/minha-conta |
| API | http://localhost:5000/api |

### Testar no Celular (Expo Go)
1. Instale o app "Expo Go" no seu celular
2. Certifique-se que celular e computador estão na mesma rede Wi-Fi
3. Escaneie o QR Code que aparece no terminal

---

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run server:dev` | Inicia servidor backend em modo desenvolvimento |
| `npm run expo:dev` | Inicia app Expo em modo desenvolvimento |
| `npm run all:dev` | Inicia backend e Expo juntos |
| `npm run db:push` | Aplica alterações no banco de dados |
| `npm run db:studio` | Abre interface visual do banco |
| `npm run server:build` | Compila servidor para produção |

---

## Estrutura do Projeto

```
portal-do-romeiro/
├── client/                 # App React Native (Expo)
│   ├── app/               # Telas do app
│   ├── components/        # Componentes reutilizáveis
│   ├── constants/         # Cores, espaçamentos, tema
│   └── lib/               # Utilitários e API client
├── server/                 # Servidor Express
│   ├── admin/             # Páginas do painel admin
│   ├── public/            # Páginas públicas (cadastro, minha-conta)
│   ├── templates/         # Templates HTML
│   ├── uploads/           # Arquivos enviados
│   └── index.ts           # Entrada do servidor
├── shared/                 # Código compartilhado
│   └── schema.ts          # Esquema do banco de dados
├── scripts/                # Scripts de backup e utilitários
├── docs/                   # Documentação
├── app.json               # Configuração do Expo
├── package.json           # Dependências e scripts
└── .env                   # Variáveis de ambiente (criar manualmente)
```

---

## Criando Usuário Admin

Após rodar o projeto pela primeira vez, acesse o banco para criar um admin:

```bash
# Conectar ao PostgreSQL
psql postgresql://portal_romeiro:senha123@localhost/portal_romeiro

# Inserir admin (substitua a senha)
INSERT INTO admins (username, password_hash, name, role, created_at)
VALUES (
  'admin',
  '$2b$10$exemplo_hash_senha',  -- Use bcrypt para gerar
  'Administrador',
  'super_admin',
  NOW()
);
```

Ou use a rota de criação inicial (se disponível):
```
POST http://localhost:5000/api/admin/setup
{
  "username": "admin",
  "password": "sua_senha_segura",
  "name": "Administrador"
}
```

---

## Problemas Comuns

### Erro: "ECONNREFUSED" ao conectar no banco
```bash
# Verificar se PostgreSQL está rodando
# Windows (PowerShell como Admin)
Get-Service postgresql*

# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Se não estiver rodando, inicie:
# macOS: brew services start postgresql@15
# Linux: sudo systemctl start postgresql
```

### Erro: "Port 5000 already in use"
```bash
# Encontrar processo usando a porta
# macOS/Linux
lsof -i :5000
kill -9 PID_DO_PROCESSO

# Windows
netstat -ano | findstr :5000
taskkill /PID NUMERO_PID /F
```

### Erro: "Module not found"
```bash
# Reinstalar dependências
rm -rf node_modules
npm install
```

### Expo não abre no celular
1. Verifique se está na mesma rede Wi-Fi
2. Desative firewall temporariamente
3. No Windows, permita Node.js no firewall
4. Tente usar túnel: `npx expo start --tunnel`

---

## Editor de Código Recomendado

### Visual Studio Code
1. Baixe em https://code.visualstudio.com
2. Instale as extensões:
   - ESLint
   - Prettier
   - TypeScript
   - React Native Tools
   - PostgreSQL

### Abrindo o projeto
```bash
code portal-do-romeiro
```

---

## Próximos Passos

1. **Testar localmente**: Acesse http://localhost:5000/admin
2. **Fazer alterações**: Edite os arquivos e veja as mudanças em tempo real
3. **Testar no celular**: Use o Expo Go para testar o app móvel
4. **Deploy**: Veja `docs/DEPLOY_LINUX.md` para publicar em servidor
5. **Build mobile**: Veja `docs/BUILD_MOBILE.md` para gerar APK/iOS

---

## Suporte

Se tiver dúvidas:
1. Verifique os logs no terminal
2. Consulte a documentação em `/docs`
3. Verifique se todas as variáveis de ambiente estão configuradas
