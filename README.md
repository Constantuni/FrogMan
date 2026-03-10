FrogMan - SaaS Task Management Platform
FrogMan is a high-performance, real-time task management solution built with a focus on scalability, maintainability, and modern architectural principles.


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


Getting Started (MacBook/VS Code)
1. Database & Services
Ensure Docker Desktop is running, then spin up the infrastructure:

Bash
docker-compose up -d

2. Backend Setup
Navigate to the API directory and apply migrations:

Bash
cd backend/FrogMan.Api
dotnet ef database update
dotnet watch run

3. Frontend Setup
Bash
cd frontend
npm install
npm run dev


Security & Principles
SOLID: Each class has a single responsibility.

DRY: Logic is centralized in the Application layer.

JWT: Stateless authentication for scalability.