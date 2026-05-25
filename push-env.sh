#!/bin/bash
set -e

while IFS='=' read -r key value; do
  [[ -z "$key" || "$key" == \#* ]] && continue
  echo "Adding $key..."
  echo "$value" | vercel env add "$key" production
done < .env

echo "Done! Redeploy with: vercel --prod"
