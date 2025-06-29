#!/bin/bash

BACKUP_DIR=".agent_backups"
MANIFEST_FILE="$BACKUP_DIR/backup-manifest.json"

# Vérifier les arguments
if [ $# -lt 1 ]; then
  echo "❌ Erreur : Timestamp requis"
  echo "Usage : $0 timestamp [technologie] [fichier_spécifique]"
  exit 1
fi

TIMESTAMP="$1"
TECH="$2"
SPECIFIC_FILE="$3"

if [ ! -f "$MANIFEST_FILE" ]; then
  echo "❌ Erreur : Manifeste de sauvegarde introuvable"
  exit 1
fi

# Filtrer les sauvegardes
FILTER=".backups[] | select(.timestamp == \"$TIMESTAMP\")"
if [ -n "$TECH" ]; then
  FILTER="$FILTER | select(.file | endswith(\".twig\") or endswith(\".css\") or endswith(\".scss\") or endswith(\".js\") or endswith(\".ts\"))"
fi
if [ -n "$SPECIFIC_FILE" ]; then
  FILTER="$FILTER | select(.file == \"$SPECIFIC_FILE\")"
fi

# Restaurer les fichiers
BACKUPS=$(jq -r "$FILTER | .backup + \"|\" + .file" "$MANIFEST_FILE")
if [ -z "$BACKUPS" ]; then
  echo "⚠️ Aucune sauvegarde trouvée pour les critères spécifiés"
  exit 0
fi

while IFS='|' read -r BACKUP_FILE DEST_FILE; do
  if [ -f "$BACKUP_FILE" ]; then
    cp "$BACKUP_FILE" "$DEST_FILE"
    echo "✅ Restauration de $DEST_FILE depuis $BACKUP_FILE"
  else
    echo "⚠️ Sauvegarde introuvable : $BACKUP_FILE"
  fi
done <<< "$BACKUPS"

echo "✅ Restauration terminée"