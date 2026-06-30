FrogMan - SaaS Task Management Platform
FrogMan is a high-performance task management solution built with a focus on scalability, maintainability, and modern architectural principles.

---

TECH STACK

Frontend
Core: React 18 + TypeScript - (Deployed on Vercel)

Build Tool: Vite (for ultra-fast HMR)

Styling: Tailwind CSS (Utility-first CSS)

Backend
Framework: ASP.NET Core 10 (C#) - (Deployed on Render)

Architecture: Clean Architecture (Domain, Application, Infrastructure, Api)

ORM: Entity Framework Core

Database: PostgreSQL - (Deployed on Neon)

Auth: JWT (JSON Web Tokens) and Secure Password Hashing with BCrypt.Net-Next/4.1.0

Infrastructure & DevOps
Containerization: Docker & Docker Compose

---

Getting Started
For Development:
1. Database & Services
Ensure Docker Desktop is running.

Bash
cd backend/FrogMan.Api
docker-compose up -d

2. Backend Setup
Navigate to the API directory and apply migrations:

Bash
cd backend/FrogMan.Api
dotnet ef database update
dotnet run dev

API URL: http://localhost:10000
Swagger UI: http://localhost:10000/swagger/index.html

3. Frontend Setup
Bash
cd frontend
npm install
npm run dev

Frontend URL: http://localhost:5173/

For Production:
1. Frontend
FrogMan on Vercel: https://frog-man.vercel.app/

2. Backend
Swagger UI on Render: https://frogman-0vvh.onrender.com/swagger/index.html

---

File Tree:

FrogMan % tree -I 'bin|obj|debug|Migrations|node_modules' -L 4
.
├── README.md
├── backend
│   ├── Dockerfile
│   ├── FrogMan.Api
│   │   ├── Common
│   │   │   └── ClaimsPrincipalExtensions.cs
│   │   ├── Controllers
│   │   │   ├── AuthController.cs
│   │   │   ├── ProjectsController.cs
│   │   │   ├── TasksController.cs
│   │   │   └── WorkspaceController.cs
│   │   ├── FrogMan.Api.csproj
│   │   ├── FrogMan.Api.http
│   │   ├── Program.cs
│   │   ├── Properties
│   │   │   └── launchSettings.json
│   │   ├── appsettings.Development.json
│   │   └── appsettings.json
│   ├── FrogMan.Application
│   │   ├── DTOs
│   │   │   ├── Auth
│   │   │   ├── Projects
│   │   │   ├── Tasks
│   │   │   └── Workspaces
│   │   ├── DependencyInjection.cs
│   │   ├── FrogMan.Application.csproj
│   │   ├── IApplicationAssemblyMarker.cs
│   │   ├── Interfaces
│   │   │   ├── Auth
│   │   │   ├── Repositories
│   │   │   └── Security
│   │   ├── Services
│   │   │   └── AuthService.cs
│   │   └── Validators
│   │       ├── Auth
│   │       ├── Projects
│   │       ├── Tasks
│   │       └── Workspaces
│   ├── FrogMan.Domain
│   │   ├── Constants
│   │   │   ├── TaskPriorities.cs
│   │   │   ├── TaskStatuses.cs
│   │   │   └── WorkspaceRoles.cs
│   │   ├── Entities
│   │   │   ├── Project.cs
│   │   │   ├── TaskItem.cs
│   │   │   ├── User.cs
│   │   │   ├── Workspace.cs
│   │   │   └── WorkspaceMember.cs
│   │   ├── FrogMan.Domain.csproj
│   │   └── Rules
│   ├── FrogMan.Infrastructure
│   │   ├── DependencyInjection.cs
│   │   ├── FrogMan.Infrastructure.csproj
│   │   ├── Persistence
│   │   │   ├── ApplicationDbContext.cs
│   │   │   ├── Configurations
│   │   │   └── UnitOfWork.cs
│   │   ├── Repositories
│   │   │   ├── UserRepository.cs
│   │   │   └── WorkspaceRepository.cs
│   │   └── Security
│   │       ├── BcryptPasswordHasher.cs
│   │       ├── JwtSettings.cs
│   │       └── JwtTokenGenerator.cs
│   ├── FrogMan.slnx
│   ├── build.log
│   ├── pp.xml
│   └── tests
│       ├── FrogMan.IntegrationTests
│       │   └── FrogMan.IntegrationTests.csproj
│       └── FrogMan.UnitTests
│           ├── FrogMan.UnitTests.csproj
│           └── Validators
├── docker-compose.yml
└── frontend
    ├── README.md
    ├── dist
    │   ├── assets
    │   │   ├── index-Ce860NeA.js
    │   │   └── index-DQRMgR4v.css
    │   ├── frogicon.png
    │   ├── index.html
    │   └── vite.svg
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── public
    │   ├── frogicon.png
    │   └── vite.svg
    ├── src
    │   ├── App.css
    │   ├── App.tsx
    │   ├── api
    │   │   ├── auth.ts
    │   │   ├── axios.ts
    │   │   ├── projects.ts
    │   │   ├── tasks.ts
    │   │   └── workspaces.ts
    │   ├── components
    │   │   ├── layout
    │   │   ├── projects
    │   │   ├── tasks
    │   │   └── workspaces
    │   ├── index.css
    │   ├── main.tsx
    │   ├── pages
    │   │   ├── Dashboard.tsx
    │   │   ├── LoginPage.tsx
    │   │   ├── ProjectPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   └── WorkspacePage.tsx
    │   ├── routes
    │   │   ├── ProtectedRoute.tsx
    │   │   └── PublicRoute.tsx
    │   ├── store
    │   │   ├── authStore.ts
    │   │   ├── projectStore.ts
    │   │   ├── taskStore.ts
    │   │   └── workspaceStore.ts
    │   └── types
    │       ├── auth.ts
    │       ├── project.ts
    │       ├── task.ts
    │       ├── taskEnums.ts
    │       └── workspace.ts
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    └── vite.config.ts

---