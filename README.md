FrogMan - SaaS Task Management Platform
FrogMan is a high-performance, real-time task management solution built with a focus on scalability, maintainability, and modern architectural principles.

---

TECH STACK

Frontend
Core: React 18 + TypeScript

Build Tool: Vite (for ultra-fast HMR)

Styling: Tailwind CSS (Utility-first CSS)

State & Real-time: SignalR Client + React Hooks

Backend
Framework: ASP.NET Core 10 (C#)

Architecture: Clean Architecture (Domain, Application, Infrastructure, WebApi)

ORM: Entity Framework Core

Database: PostgreSQL

Auth: JWT (JSON Web Tokens) and Secure Password Hashing with BCrypt.Net-Next/4.1.0

Real-time: SignalR Hubs

Infrastructure & DevOps
Containerization: Docker & Docker Compose

Caching: Redis (Distributed Cache)

Testing: xUnit for Unit and Integration testing

CI/CD: GitHub Actions

Security & Principles
SOLID: Each class has a single responsibility.

DRY: Logic is centralized in the Application layer.

JWT: Stateless authentication for scalability.

---

Getting Started (MacBook/VS Code)
1. Database & Services
Ensure Docker Desktop is running, then spin up the infrastructure:

Bash
cd backend/FrogMan.Api
docker-compose up -d

2. Backend Setup
Navigate to the API directory and apply migrations:

Bash
cd backend/FrogMan.Api
dotnet ef database update
dotnet run --launch-profile https

Base API: https://frogman-0vvh.onrender.com
Swagger UI: https://frogman-0vvh.onrender.com/swagger/index.html

3. Frontend Setup
Bash
cd frontend
npm install
npm run dev

FrogMan: https://frog-man.vercel.app

---

backend % tree -I 'bin|obj|debug'
.
├── Dockerfile
├── FrogMan.Api
│   ├── Common
│   │   └── ClaimsPrincipalExtensions.cs
│   ├── Controllers
│   │   ├── AuthController.cs
│   │   ├── ProjectsController.cs
│   │   ├── TasksController.cs
│   │   └── WorkspaceController.cs
│   ├── FrogMan.Api.csproj
│   ├── FrogMan.Api.http
│   ├── Program.cs
│   ├── Properties
│   │   └── launchSettings.json
│   ├── appsettings.Development.json
│   └── appsettings.json
├── FrogMan.Application
│   ├── DTOs
│   │   ├── Auth
│   │   │   ├── AuthResponse.cs
│   │   │   ├── LoginRequest.cs
│   │   │   └── RegisterRequest.cs
│   │   ├── Projects
│   │   │   ├── CreateProjectRequest.cs
│   │   │   ├── ProjectsResponse.cs
│   │   │   └── UpdateProjectRequest.cs
│   │   ├── Tasks
│   │   │   ├── CreateTaskRequest.cs
│   │   │   ├── TaskResponse.cs
│   │   │   └── UpdateTaskRequest.cs
│   │   └── Workspaces
│   │       ├── CreateWorkspaceRequest.cs
│   │       ├── UpdateWorkspaceRequest.cs
│   │       └── WorkspaceResponse.cs
│   ├── FrogMan.Application.csproj
│   ├── IApplicationAssemblyMarker.cs
│   ├── Interfaces
│   │   └── IAuthService.cs
│   ├── Security
│   │   └── JwtSettings.cs
│   └── Validators
│       ├── Auth
│       │   ├── LoginRequestValidator.cs
│       │   └── RegisterRequestValidator.cs
│       ├── Projects
│       │   ├── CreateProjectRequestValidator.cs
│       │   └── UpdateProjectRequestValidator.cs
│       ├── Tasks
│       │   ├── CreateTaskRequestValidator.cs
│       │   └── UpdateTaskRequestValidator.cs
│       └── Workspaces
│           ├── CreateWorkspaceRequestValidator.cs
│           └── UpdateWorkspaceRequestValidator.cs
├── FrogMan.Domain
│   ├── Constants
│   │   ├── TaskPriorities.cs
│   │   ├── TaskStatuses.cs
│   │   └── WorkspaceRoles.cs
│   ├── Entities
│   │   ├── Project.cs
│   │   ├── TaskItem.cs
│   │   ├── User.cs
│   │   ├── Workspace.cs
│   │   └── WorkspaceMember.cs
│   └── FrogMan.Domain.csproj
├── FrogMan.Infrastructure
│   ├── Auth
│   │   └── AuthService.cs
│   ├── FrogMan.Infrastructure.csproj
│   ├── Migrations
│   │   ├── 20260309233201_InitialPostgresCreate.Designer.cs
│   │   ├── 20260309233201_InitialPostgresCreate.cs
│   │   ├── 20260311145800_AddWorkspaceProjectTaskEntities.Designer.cs
│   │   ├── 20260311145800_AddWorkspaceProjectTaskEntities.cs
│   │   ├── 20260313170000_AddUpdatedAtToTaskItem.Designer.cs
│   │   ├── 20260313170000_AddUpdatedAtToTaskItem.cs
│   │   └── ApplicationDbContextModelSnapshot.cs
│   ├── Persistence
│   │   └── ApplicationDbContext.cs
│   └── Services
│       └── TaskService.cs
├── FrogMan.slnx
├── build.log
├── pp.xml
└── tests
    ├── FrogMan.IntegrationTests
    │   └── FrogMan.IntegrationTests.csproj
    └── FrogMan.UnitTests
        ├── FrogMan.UnitTests.csproj
        └── Validators
            ├── Auth
            │   └── RegisterRequestValidatorTests.cs
            ├── Projects
            ├── Tasks
            │   └── CreateTaskRequestValidatorTests.cs
            └── Workspaces
                └── CreateWorkspaceRequestValidatorTests.cs

---