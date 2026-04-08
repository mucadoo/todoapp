# TodoApp — Aplicação Full-Stack Python/React

Uma aplicação web de lista de tarefas com qualidade de produção, apresentando recursos avançados como compartilhamento de tarefas, categorias e estatísticas públicas.

**URL de Produção:** [http://18.117.222.176/](http://18.117.222.176/)

## 1. Visão Geral da Arquitetura

```mermaid
graph LR
    User[Usuário/Navegador] <--> Nginx[Nginx Reverse Proxy]
    Nginx <--> Frontend[React 18 / Vite / Static Assets]
    Nginx <--> Backend[Django 5 / DRF / Gunicorn]
    Backend <--> DB[(PostgreSQL 16)]
    ThirdParty[Integração de Terceiros] --> Backend
```

- **Infrastrutura de Produção**: 
  - **Nginx**: Atua como proxy reverso, servindo os arquivos estáticos do React e encaminhando requisições `/api/` para o backend.
  - **Gunicorn**: Servidor WSGI de produção para a aplicação Django.
  - **Docker Compose**: Orquestração de containers (Frontend, Backend, Banco de Dados) em rede isolada.
- **Backend**: Python 3.12, Django 5, Django REST Framework, SimpleJWT (Autenticação), PostgreSQL, drf-spectacular (OpenAPI).
- **Frontend**: React 18, TypeScript, Axios, React Query, Tailwind CSS, Lucide Icons, React Hook Form, i18next (Internacionalização).
- **Testes**: Pytest (Backend), Selenium + Pytest (Frontend E2E).
- **CI/CD**: GitHub Actions com deploy automatizado para AWS EC2.

## 2. Funcionalidades

- **Autenticação**: Login e registro seguros baseados em JWT.
- **Gerenciamento de Tarefas**: Criar, atualizar, excluir e alternar status das tarefas com **paginação infinite scroll**.
- **Categorias**: Organize tarefas com categorias personalizadas.
- **Compartilhamento de Tarefas**: Compartilhe tarefas com outros usuários do sistema.
- **Perfil do Usuário**: Atualize informações de perfil, mude o nome de usuário e a senha.
- **Busca**: Pesquise outros usuários para compartilhar tarefas.
- **Internacionalização (i18n)**: Suporte para Inglês e Português.
- **Suporte a Temas**: Opções de modo claro e escuro.
- **Documentação da API**: Swagger UI e ReDoc interativos.
- **Design Responsivo**: Construído com Tailwind CSS para dispositivos móveis e desktop.

## 3. Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)
- Python 3.12 (para desenvolvimento local)

## 4. Como Executar Localmente

### Usando Docker (Recomendado)

1. Clone o repositório.
2. Execute o seguinte comando:
   ```bash
   docker-compose up --build
   ```
   > **Nota**: Ao usar o `docker-compose.yml` padrão para desenvolvimento, **não é necessário configurar variáveis de ambiente manuais**, pois o arquivo já contém valores padrão seguros para o ambiente local.
3. Acesse o frontend em `http://localhost:3000` e o backend em `http://localhost:8000`.
   - **Swagger UI**: `http://localhost:8000/api/docs/swagger-ui/`
   - **ReDoc**: `http://localhost:8000/api/docs/redoc/`
   - **Login Padrão (Semeado automaticamente)**:
     - **Desenvolvedor**: `dev@example.com` / `password123`
     - **Tester**: `tester@example.com` / `password123`
     - **Gerente**: `manager@example.com` / `password123`
4. (Opcional) Semeie o banco de dados manualmente se necessário:
   ```bash
   docker-compose run --rm backend python manage.py seed_db
   ```

### Desenvolvimento Local (sem Docker)

Para desenvolvimento local sem Docker, você precisará configurar as variáveis de ambiente em um arquivo `.env` baseado no `.env.example`.

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 5. Como Executar os Testes

### Testes de Backend
```bash
cd backend
pytest --cov=apps
```

### Testes de Frontend E2E (Selenium)

Os testes de ponta a ponta podem ser executados de duas maneiras:

#### A. Dentro do Docker (Headless)
Os testes rodam automaticamente no container `backend` usando Chromium em modo headless.
```bash
docker exec todoapp_backend pytest /app/frontend_tests/test_e2e.py
```

#### B. Usando Ambiente Local (WSL/Desktop)
Para rodar os testes usando um navegador instalado no seu sistema (Chrome, Edge, Brave, etc.):

1. Instale as dependências:
   ```bash
   pip install selenium webdriver-manager pytest pytest-django
   ```
2. Configure as variáveis de ambiente (opcional):
   - `CHROME_BINARY_PATH`: Caminho para o executável do seu navegador.
   - `CHROME_HEADLESS`: Defina como `false` para visualizar a execução do navegador.
3. Execute o pytest:
   ```bash
   pytest frontend/tests/test_e2e.py -m e2e
   ```

## 6. Documentação da API

O projeto utiliza `drf-spectacular` para gerar esquemas OpenAPI 3.0. Com o backend em execução, você pode acessar a documentação interativa em:

- **Swagger UI**: /api/docs/swagger-ui
- **ReDoc**: /api/docs/redoc
- **Esquema (YAML)**: /api/schema

## 7. Estatísticas Públicas (API Aberta)

O sistema expõe um endpoint público para consumo de estatísticas globais, sem necessidade de autenticação.

**Endpoint:** `GET /api/external/stats/`

**Exemplo de Resposta:**
```json
{
  "total_tasks": 100,
  "completed_tasks": 45,
  "completion_rate": 45.0,
  "top_categories": [
    { "id": "uuid-1", "name": "Work", "task_count": 40 },
    { "id": "uuid-2", "name": "Personal", "task_count": 30 }
  ]
}
```

## 8. Variáveis de Ambiente (`.env.example`)

```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgres://todo_user:todo_password@db:5432/todoapp
ALLOWED_HOSTS=localhost,127.0.0.1,backend
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## 9. Pipeline CI/CD

O pipeline do GitHub Actions (`.github/workflows/ci.yml`) é acionado em cada push e PR para a branch `main`:

1. **Linting**: Verifica o estilo de código Python (ruff/black) e React (eslint/prettier).
2. **Testes de Backend**: Executa pytest com cobertura (deve ser > 80%).
3. **Testes de Frontend**: Executa testes Selenium E2E em um ambiente Docker Compose.
4. **Build & Push**: Constrói imagens Docker e as envia para o GHCR (somente em `push` para `main`).
5. **Deploy**: Implanta automaticamente a versão mais recente no AWS EC2 ao realizar o push para `main`.

## 10. Implantação (AWS EC2)

A aplicação está disponível em: [http://18.117.222.176/](http://18.117.222.176/)

### Infraestrutura
- **AWS EC2**: Instância t2.micro rodando Ubuntu.
- **Nginx**: Configurado como servidor web e proxy reverso dentro do container frontend.
- **Segurança**: Grupo de segurança permitindo portas 22 (SSH) e 80 (HTTP).

### Segredos do GitHub para Configurar
Defina estes segredos no seu repositório GitHub (Configurações > Segredos e variáveis > Actions):
- `EC2_USER`: O nome de usuário SSH (ex: `ubuntu`).
- `EC2_SSH_KEY`: O conteúdo da sua chave SSH privada.
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY`: Credenciais para deploy via CloudFormation/CLI.
- `POSTGRES_PASSWORD`: Senha de produção para o banco de dados.
- `SECRET_KEY`: Chave secreta de produção do Django.

## 11. Decisões de Design

- **Nginx como Proxy**: Utilizado para unificar o acesso ao frontend e backend sob a mesma porta (80), facilitando a configuração de CORS e roteamento.
- **Infinite Scrolling**: Implementado no frontend usando `useInfiniteQuery` do React Query para uma experiência de navegação fluida em vez de paginação tradicional por números de página.
- **Autenticação JWT**: Utilizada para autenticação sem estado, com `SimpleJWT` fornecendo a lógica de tokens de acesso e renovação.
- **UUID PKs**: Utilizados em todos os modelos (Usuário, Categoria, Tarefa) para segurança e melhor escalabilidade em sistemas distribuídos.
- **React Query**: Escolhido para um gerenciamento poderoso do estado do servidor, cache e atualizações otimistas para alternar a conclusão de tarefas.
- **Internacionalização (i18n)**: Implementada usando `i18next` e `react-i18next` com detecção de idioma do navegador.
- **Page Object Model (POM)**: Aplicado nos testes Selenium para melhor manutenção e legibilidade.
- **Docker de Múltiplos Estágios (Multi-stage Builds)**: Otimizado para desempenho e segurança em imagens de produção.
