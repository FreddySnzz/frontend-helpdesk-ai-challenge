
# Helpdesk Inteligente com IA - Interface Web (Frontend)

Este é o repositório frontend do sistema de gerenciamento de chamados (Helpdesk) com triagem automatizada via Inteligência Artificial.

A interface foi projetada para ser ágil, responsiva e reativa, entregando uma experiência imersiva e atualizações em tempo real para a gestão de chamados.

## 🛠 Tecnologias Utilizadas

- Framework: Next.js 16 (App Router)
- Linguagem: TypeScript
- Estilização: Tailwind CSS
- Componentes UI: shadcn/ui (Radix Primitives)
- Gráficos: Recharts
- Comunicação em Tempo Real: Server-Sent Events (SSE) via `@microsoft/fetch-event-source`
- Gerenciamento de Estado/Auth: Context API e js-cookie

## 🌟 Principais Recursos

- Painel Administrativo Reativo: Conexão SSE mantida viva no cliente para receber atualizações e alertas de chamados de Alta Prioridade instantaneamente, sem necessidade de refresh (F5).
- Controle de Acesso (RBAC): Middleware no Next.js protegendo rotas privadas e Context API gerenciando as visões isoladas de `ADMIN` e `SOLICITANTE`.
- Gestão Completa de Chamados: Interações em modais modulares, incluindo visualização de histórico, adição de comentários e reatribuição de responsáveis.
- Gráficos Analíticos: Renderização de indicadores de prioridade (Alta, Média, Baixa) no painel do administrador.

## ⚙️ Pré-requisitos

Antes de iniciar o frontend, certifique-se de que:
1. Você possui o **Node.js** (versão 18 ou superior) instalado na sua máquina.
2. O **Backend do projeto (NestJS)** está rodando localmente, preferencialmente na porta `8080` (http://localhost:8080), pois o frontend fará as requisições para este endereço.

## 🚀 Como Executar o Projeto Localmente

1. Clone este repositório e acesse a pasta do projeto:
   ```bash
   git clone <url-do-repositorio-frontend>
   cd <nome-da-pasta>
   ```

2. Instale as dependências do projeto:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse a aplicação no seu navegador:
   Abra http://localhost:3000

## 🔐 Acesso ao Sistema

A autenticação consome os dados diretamente da API. Para testar as diferentes visões do sistema, utilize os usuários previamente populados no banco de dados do backend:

- Visão Administrador (Com métricas e SSE):
  > E-mail: admin@helpdesk.com
  Senha: senha123

- Visão Solicitante (Apenas abertura e acompanhamento):
  > E-mail: solicitante@helpdesk.com
  Senha: senha123

## 📂 Estrutura de Pastas

- `/src/app`: Rotas da aplicação (App Router) e Middleware de proteção.
- `/src/components`: Componentes visuais isolados (UI Base, Layouts, Modais).
- `/src/data/contexts`: Context API para gerenciamento do usuário logado.
- `/src/data/services`: Camada de abstração para chamadas HTTP (Fetch API e EventSource), isolando a regra de comunicação com o backend dos componentes React.
