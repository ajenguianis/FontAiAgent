#!/bin/bash

BACKUP_DIR=".agent_backups"
TIMESTAMP=$(date -u +%Y%m%d-%H%M%S)
MANIFEST_FILE="$BACKUP_DIR/backup-manifest.json"

# Vérifier les arguments
if [ $# -eq 0 ]; then
  echo "❌ Erreur : Aucun fichier spécifié pour la sauvegarde"
  echo "Usage : $0 fichier1 [fichier2 ...]"
  exit 1
fi

# Créer le dossier de sauvegarde
mkdir -p "$BACKUP_DIR"

# Initialiser le manifeste si nécessaire
if [ ! -f "$MANIFEST_FILE" ]; then
  echo '{"backups": []}' > "$MANIFEST_FILE"
fi

# Sauvegarder chaque fichier
for FILE in "$@"; do
  if [ -f "$FILE" ]; then
    REL_PATH=$(realpath --relative-to="$(pwd)" "$FILE")
    BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP/$(dirname "$REL_PATH")"
    mkdir -p "$BACKUP_PATH"
    cp "$FILE" "$BACKUP_PATH/$(basename "$FILE")"
    echo "✅ Sauvegarde de $REL_PATH vers $BACKUP_PATH/$(basename "$FILE")"

    # Mettre à jour le manifeste
    jq --arg timestamp "$TIMESTAMP" \
       --arg file "$REL_PATH" \
       --arg backup "$BACKUP_DIR/$TIMESTAMP/$REL_PATH" \
       '.backups += [{"timestamp": $timestamp, "file": $file, "backup": $backup}]' \
       "$MANIFEST_FILE" > "$MANIFEST_FILE.tmp" && mv "$MANIFEST_FILE.tmp" "$MANIFEST_FILE"
  else
    echo "⚠️ Fichier non trouvé : $FILE"
  fi
done

echo "✅ Sauvegarde terminée. Manifeste mis à jour : $MANIFEST_FILE"