# Manual de Deploy - Portal do Romeiro
## Servidor Linux (Ubuntu/Debian)

Este manual descreve como fazer o deploy completo do Portal do Romeiro em um servidor Linux.

---

## Requisitos do Servidor

### Hardware Mínimo
- **CPU:** 2 cores
- **RAM:** 4GB
- **Disco:** 20GB SSD
- **Sistema:** Ubuntu 22.04 LTS ou Debian 12

### Software Necessário
- Node.js 20 LTS
- PostgreSQL 14+
- Nginx
- PM2 (gerenciador de processos)
- Git
- Certbot (para SSL)

---

## Passo 1: Preparar o Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
sudo apt install -y curl git build-essential

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar versão
node --version  # Deve mostrar v20.x.x
npm --version
```

---

## Passo 2: Instalar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar usuário e banco de dados
sudo -u postgres psql << EOF
CREATE USER portal_romeiro WITH PASSWORD 'SUA_SENHA_SEGURA';
CREATE DATABASE portal_romeiro OWNER portal_romeiro;
GRANT ALL PRIVILEGES ON DATABASE portal_romeiro TO portal_romeiro;
EOF
```

---

## Passo 3: Clonar e Configurar o Projeto

```bash
# Criar diretório da aplicação
sudo mkdir -p /var/www/portal-romeiro
sudo chown $USER:$USER /var/www/portal-romeiro
cd /var/www/portal-romeiro

# Clonar repositório (ou copiar arquivos)
git clone SEU_REPOSITORIO .

# Ou extrair backup
tar -xzf portal_romeiro_backup_XXXXXXXX.tar.gz

# Instalar todas as dependências (necessário para compilação)
npm ci
```

---

## Passo 4: Configurar Variáveis de Ambiente

```bash
# Criar arquivo de ambiente
cat > /var/www/portal-romeiro/.env << EOF
NODE_ENV=production
PORT=5000

# Banco de dados
DATABASE_URL=postgresql://portal_romeiro:SUA_SENHA_SEGURA@localhost:5432/portal_romeiro

# Segurança
SESSION_SECRET=$(openssl rand -base64 32)

# Mercado Pago (produção)
MERCADOPAGO_ACCESS_TOKEN=seu_token_producao
MERCADOPAGO_PUBLIC_KEY=sua_chave_publica

# Domínio
REPLIT_DEV_DOMAIN=seudominio.com.br
EOF
```

---

## Passo 5: Compilar a Aplicação

```bash
cd /var/www/portal-romeiro

# Compilar servidor
npm run server:build

# Compilar app Expo para web (estático)
npm run expo:static:build

# Executar migrações do banco
npm run db:push

# (Opcional) Remover dependências de desenvolvimento após compilação
npm prune --production
```

---

## Passo 6: Configurar PM2 (Gerenciador de Processos)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Criar arquivo de configuração PM2
cat > /var/www/portal-romeiro/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'portal-romeiro',
    script: 'dist/index.js',
    cwd: '/var/www/portal-romeiro',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_file: '/var/www/portal-romeiro/.env'
  }]
};
EOF

# Iniciar aplicação
cd /var/www/portal-romeiro
pm2 start ecosystem.config.js

# Configurar para iniciar com o sistema
pm2 startup
pm2 save
```

---

## Passo 7: Configurar Nginx

```bash
# Instalar Nginx
sudo apt install -y nginx

# Criar configuração do site
sudo tee /etc/nginx/sites-available/portal-romeiro << EOF
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;

    # Logs
    access_log /var/log/nginx/portal-romeiro.access.log;
    error_log /var/log/nginx/portal-romeiro.error.log;

    # Tamanho máximo de upload
    client_max_body_size 50M;

    # Arquivos estáticos do Expo
    location / {
        root /var/www/portal-romeiro/dist/client;
        try_files \$uri \$uri/ /index.html;
    }

    # API e Admin
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /admin {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Uploads
    location /uploads {
        alias /var/www/portal-romeiro/server/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/portal-romeiro /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar Nginx
sudo nginx -t
sudo systemctl restart nginx
```

---

## Passo 8: Configurar SSL (HTTPS)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br

# Renovação automática (já configurada)
sudo certbot renew --dry-run
```

---

## Passo 9: Configurar Firewall

```bash
# Configurar UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Verificar status
sudo ufw status
```

---

## Passo 10: Backup Automático (Cron)

```bash
# Criar script de backup
chmod +x /var/www/portal-romeiro/scripts/backup.sh

# Configurar cron para backup diário às 3h
(crontab -l 2>/dev/null; echo "0 3 * * * cd /var/www/portal-romeiro && ./scripts/backup.sh >> /var/log/portal-backup.log 2>&1") | crontab -
```

---

## Comandos Úteis

### Gerenciamento da Aplicação
```bash
# Ver logs
pm2 logs portal-romeiro

# Reiniciar aplicação
pm2 restart portal-romeiro

# Ver status
pm2 status

# Monitorar recursos
pm2 monit
```

### Banco de Dados
```bash
# Conectar ao banco
psql postgresql://portal_romeiro:SENHA@localhost/portal_romeiro

# Backup manual
pg_dump postgresql://portal_romeiro:SENHA@localhost/portal_romeiro > backup.sql
```

### Nginx
```bash
# Verificar configuração
sudo nginx -t

# Reiniciar
sudo systemctl restart nginx

# Ver logs
sudo tail -f /var/log/nginx/portal-romeiro.error.log
```

---

## Atualizando a Aplicação

```bash
cd /var/www/portal-romeiro

# Parar aplicação
pm2 stop portal-romeiro

# Atualizar código
git pull origin main

# Instalar dependências (todas, para compilação)
npm ci

# Compilar
npm run server:build
npm run expo:static:build

# Executar migrações
npm run db:push

# Reiniciar
pm2 restart portal-romeiro
```

---

## Troubleshooting

### Aplicação não inicia
```bash
# Verificar logs
pm2 logs portal-romeiro --lines 50

# Verificar variáveis de ambiente
cat /var/www/portal-romeiro/.env
```

### Erro de conexão com banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql $DATABASE_URL -c "SELECT 1"
```

### Erro 502 Bad Gateway
```bash
# Verificar se a aplicação está rodando
pm2 status

# Verificar porta
netstat -tlnp | grep 5000
```

---

## Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato com o suporte técnico.
