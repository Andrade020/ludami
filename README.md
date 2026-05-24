# LinkSpot

Sua curadoria de links em espaços compartilhados. Salve vídeos do YouTube (e qualquer link) em espaços temáticos, adicione notas e compartilhe com quem quiser.

## Funcionalidades

- **Espaços temáticos** — crie áreas como "Dicas de Trabalho", "Dieta", "Séries", etc.
- **Salvar links** — cole qualquer URL; o título e thumbnail do YouTube são buscados automaticamente
- **Notas por link** — adicione observações, lembretes ou contexto a cada link
- **Rede social** — espaços públicos podem ser encontrados e seguidos por outros usuários
- **Compartilhar do YouTube** — no celular, compartilhe diretamente do app do YouTube para o LinkSpot
- **PWA** — instale na tela inicial do iPhone ou Android sem App Store

## Instalar no celular

**iPhone (Safari):**
1. Abra o link do app no Safari
2. Toque em Compartilhar (ícone de quadrado com seta)
3. Role até "Adicionar à Tela de Início"
4. Toque em Adicionar

**Android (Chrome):**
1. Abra o link no Chrome
2. Toque nos três pontos (menu)
3. Toque em "Adicionar à tela inicial"

## Como compartilhar do YouTube

Após instalar o app no celular:
1. Abra qualquer vídeo no YouTube
2. Toque em **Compartilhar**
3. Selecione **LinkSpot** na lista
4. Escolha o espaço e adicione uma nota

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React + TypeScript |
| Build | Vite |
| Estilo | Tailwind CSS |
| PWA | vite-plugin-pwa |
| Backend | Supabase (Auth + PostgreSQL) |
| Hospedagem | Vercel |

## Configuração local

```bash
# Clone o repositório
git clone https://github.com/Andrade020/linkspot.git
cd linkspot

# Instale as dependências
npm install

# Copie e preencha as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Rode o banco de dados (execute supabase-schema.sql no painel do Supabase)

# Inicie o servidor de desenvolvimento
npm run dev
```

## Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Acesse **SQL Editor** e execute o conteúdo de `supabase-schema.sql`
3. Copie a **URL** e a **anon key** do projeto
4. Adicione ao `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

## Deploy (Vercel)

1. Faça push para o GitHub
2. Importe o repositório no [vercel.com](https://vercel.com)
3. Adicione as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
4. Deploy automático a cada push

---

Feito por [Lucas Rafael de Andrade](https://github.com/Andrade020)
