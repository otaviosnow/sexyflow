#!/bin/bash

# Código OAuth que você copiou da URL
CODE="x1GiJJ1RTNEAAAAAAAAAJ5496ex133Y-4S-6q2uytfk"

# Suas credenciais
APP_KEY="bn28aobr2w4wi0r"
APP_SECRET="496krrnewavixib"

echo "🔑 Gerando refresh_token..."
echo ""

curl -X POST https://api.dropboxapi.com/oauth2/token \
  -u "$APP_KEY:$APP_SECRET" \
  -d "code=$CODE" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=https://localhost:10000/api/oauth/dropbox-callback"

echo ""
echo ""
echo "✅ Copie o valor de 'refresh_token' da resposta acima!"

