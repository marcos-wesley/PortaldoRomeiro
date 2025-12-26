#!/bin/bash
# ============================================================
# Portal do Romeiro - Script de Backup Completo
# ============================================================
# Uso: ./scripts/backup.sh
# Este script cria um backup completo do sistema incluindo:
# - Banco de dados PostgreSQL
# - Arquivos de upload
# - Configurações do servidor
# ============================================================

set -e

# Configurações
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="portal_romeiro_backup_$DATE"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Portal do Romeiro - Backup Completo${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# Criar diretório de backup
mkdir -p "$BACKUP_PATH"
echo -e "${YELLOW}[1/5]${NC} Criando diretório: $BACKUP_PATH"

# Backup do banco de dados PostgreSQL
echo -e "${YELLOW}[2/5]${NC} Fazendo backup do banco de dados..."
if [ -n "$DATABASE_URL" ]; then
    pg_dump "$DATABASE_URL" --format=custom --file="$BACKUP_PATH/database.dump" 2>/dev/null && \
    echo -e "  ${GREEN}✓${NC} Banco de dados exportado com sucesso" || \
    echo -e "  ${RED}✗${NC} Erro ao exportar banco de dados"
else
    echo -e "  ${RED}✗${NC} DATABASE_URL não configurada"
fi

# Backup dos arquivos de upload
echo -e "${YELLOW}[3/5]${NC} Copiando arquivos de upload..."
if [ -d "server/uploads" ]; then
    cp -r server/uploads "$BACKUP_PATH/uploads"
    echo -e "  ${GREEN}✓${NC} Uploads do servidor copiados"
else
    mkdir -p "$BACKUP_PATH/uploads"
    echo -e "  ${YELLOW}!${NC} Diretório server/uploads não existe"
fi

if [ -d "uploads" ]; then
    cp -r uploads "$BACKUP_PATH/uploads_root"
    echo -e "  ${GREEN}✓${NC} Uploads da raiz copiados"
fi

# Backup das configurações
echo -e "${YELLOW}[4/5]${NC} Copiando arquivos de configuração..."
CONFIG_FILES=(
    "app.json"
    "drizzle.config.ts"
    "package.json"
    "tsconfig.json"
    ".replit"
    "replit.nix"
)

mkdir -p "$BACKUP_PATH/config"
for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_PATH/config/"
        echo -e "  ${GREEN}✓${NC} $file"
    fi
done

# Backup das variáveis de ambiente (apenas nomes, não valores)
echo -e "${YELLOW}[5/5]${NC} Documentando variáveis de ambiente..."
cat > "$BACKUP_PATH/config/env_template.txt" << EOF
# Variáveis de ambiente necessárias para o Portal do Romeiro
# IMPORTANTE: Preencha com seus próprios valores

DATABASE_URL=postgresql://usuario:senha@host:5432/database
SESSION_SECRET=sua_chave_secreta_aqui
MERCADOPAGO_ACCESS_TOKEN=seu_token_mercadopago
MERCADOPAGO_PUBLIC_KEY=sua_chave_publica
NODE_ENV=production
PORT=5000
EOF
echo -e "  ${GREEN}✓${NC} Template de variáveis criado"

# Criar arquivo compactado
echo ""
echo -e "${YELLOW}Compactando backup...${NC}"
cd "$BACKUP_DIR"
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"
cd ..

# Calcular tamanho
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Backup concluído com sucesso!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e "  Arquivo: ${YELLOW}$BACKUP_DIR/$BACKUP_NAME.tar.gz${NC}"
echo -e "  Tamanho: ${YELLOW}$BACKUP_SIZE${NC}"
echo ""
echo -e "Para restaurar o backup, veja: ${YELLOW}docs/RESTORE.md${NC}"
echo ""
