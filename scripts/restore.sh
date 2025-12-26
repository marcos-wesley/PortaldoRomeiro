#!/bin/bash
# ============================================================
# Portal do Romeiro - Script de Restauração
# ============================================================
# Uso: ./scripts/restore.sh <arquivo_backup.tar.gz>
# ============================================================

set -e

if [ -z "$1" ]; then
    echo "Uso: ./scripts/restore.sh <arquivo_backup.tar.gz>"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Erro: Arquivo não encontrado: $BACKUP_FILE"
    exit 1
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Portal do Romeiro - Restauração${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# Extrair backup
TEMP_DIR="./restore_temp"
mkdir -p "$TEMP_DIR"
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"
BACKUP_NAME=$(ls "$TEMP_DIR")
BACKUP_PATH="$TEMP_DIR/$BACKUP_NAME"

echo -e "${YELLOW}[1/3]${NC} Restaurando banco de dados..."
if [ -f "$BACKUP_PATH/database.dump" ] && [ -n "$DATABASE_URL" ]; then
    pg_restore --clean --if-exists -d "$DATABASE_URL" "$BACKUP_PATH/database.dump" 2>/dev/null && \
    echo -e "  ${GREEN}✓${NC} Banco restaurado" || \
    echo -e "  ${RED}✗${NC} Erro ao restaurar banco (pode ser primeira execução)"
else
    echo -e "  ${YELLOW}!${NC} Sem backup de banco ou DATABASE_URL não configurada"
fi

echo -e "${YELLOW}[2/3]${NC} Restaurando uploads..."
if [ -d "$BACKUP_PATH/uploads" ]; then
    mkdir -p server/uploads
    cp -r "$BACKUP_PATH/uploads"/* server/uploads/ 2>/dev/null || true
    echo -e "  ${GREEN}✓${NC} Uploads restaurados"
fi

echo -e "${YELLOW}[3/3]${NC} Limpando arquivos temporários..."
rm -rf "$TEMP_DIR"
echo -e "  ${GREEN}✓${NC} Limpeza concluída"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Restauração concluída!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
