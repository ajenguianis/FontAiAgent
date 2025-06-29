#!/bin/bash

BACKUP_DIR=".agent_backups"
MANIFEST_FILE="$BACKUP_DIR/backup-manifest.json"

# Vérifier les arguments
TIMESTAMP="$1"
TECH="$2"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "⚠️ Aucun dossier de sauvegarde trouvé"
  exit 0
fi

if [ -z "$TIMESTAMP" ]; then
  echo "⚠️ Confirmation requise pour supprimer toutes les sauvegardes"
  read -p "Voulez-vous supprimer toutes les sauvegardes ? (y/N) : " confirm
  if [ "$confirm" != "y" ]; then
    echo "❌ Suppression annulée"
    exit 0
  fi
  rm -rf "$BACKUP_DIR"
  echo "✅ Toutes les sauvegardes supprimées"
  exit 0
fi

# Filtrer par timestamp et technologie
FILTER=".backups[] | select(.timestamp == \"$TIMESTAMP\")"
if [ -n "$TECH" ]; then
  FILTER="$FILTER | select(.file | endswith(\".twig\") or endswith(\".css\") or endswith(\".scss\") or endswith(\".js\") or endswith(\".ts\"))"
fi

BACKUPS=$(jq -r "$FILTER | .backup" "$MANIFEST_FILE")
if [ -z "$BACKUPS" ]; then
  echo "⚠️ Aucune sauvegarde trouvée pour les critères spécifiés"
  exit 0
fi

while IFS= read -r BACKUP_FILE; do
  if [ -f "$BACKUP_FILE" ]; then
    rm "$BACKUP_FILE"
    echo "✅ Suppression de $BACKUP_FILE"
  fi
done <<< "$BACKUPS"

# Nettoyer les dossiers vides
find "$BACKUP_DIR/$TIMESTAMP" -type d -empty -delete

# Mettre à jour le manifeste
jq "del(.backups[] | select(.timestamp == \"$TIMESTAMP\"))" "$MANIFEST_FILE" > "$MANIFEST_FILE.tmp" && mv "$MANIFEST_FILE.tmp" "$MANIFEST_FILE"

echo "✅ Suppression des sauvegardes terminée"