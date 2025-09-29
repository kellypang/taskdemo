# Task Management Application - High-Level Overview

## 🎯 **What Is This Application?**

A **full-stack task management system** that demonstrates modern software engineering practices with comprehensive testing, clean architecture, and robust documentation. Built with Spring Boot (backend) and React/Vite (frontend), it provides complete CRUD operations for task management with advanced search capabilities.

## 🏗️ **Architecture Overview**

### **Three-Tier Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                               │
│  React/Vite Application (Port 3000)                           │
│  • Task Dashboard & Management UI                             │
│  • Real-time Search with Server Fallback                     │
│  • Interactive Forms & Status Updates                         │
│  • Component-Based Architecture                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP REST API
                      │ (JSON/AJAX)
┌─────────────────────▼───────────────────────────────────────────┐
│                   BACKEND LAYER                                │
│  Spring Boot REST API (Port 4000)                            │
│  • Task Controller (REST Endpoints)                          │
│  • Task Service (Business Logic)                             │
│  • Task Repository (Data Access)                             │
│  • Entity Mapping & Validation                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │ JPA/Hibernate
                      │ JDBC
┌─────────────────────▼───────────────────────────────────────────┐
│                   DATABASE LAYER                               │
│  PostgreSQL (Production) / H2 (Development)                   │
│  • Task table with status enum                               │
│  • Flyway migrations for schema management                   │
│  • Connection pooling & transaction management               │
└─────────────────────────────────────────────────────────────────┘
```

### **Technology Stack**

| Layer    | Technology                   | Purpose                          |
| -------- | ---------------------------- | -------------------------------- |
| Frontend | React 18 + Vite + TypeScript | Modern, fast UI development      |
| Backend  | Spring Boot 3 + Java 21      | Enterprise-grade REST API        |
| Database | PostgreSQL 15 / H2           | Production DB / Development DB   |
| Testing  | Vitest, Playwright, JUnit 5  | Comprehensive test coverage      |
| Build    | Gradle, NPM, Docker Compose  | Build automation & orchestration |

## 📊 **Core Features**

### **Task Management (CRUD Operations)**

- ✅ **Create Tasks**: Add new tasks with validation (title, description, due date, status)
- ✅ **Read Tasks**: List all tasks, view individual task details, search by multiple criteria
- ✅ **Update Tasks**: Full task updates and status-only updates with optimistic UI
- ✅ **Delete Tasks**: Remove tasks with confirmation dialogs

### **Advanced Search & Filtering**

- 🔍 **Server-Backed Search**: Title substring, exact status match, due date filtering
- 📱 **Client Fallback**: Graceful degradation to client-side filtering on network issues
- 🎯 **Multi-Criteria**: Combine title, status, and due date filters simultaneously

### **Status Management**

- 📋 Status Workflow: `NEW` → `PENDING` → `IN_PROGRESS` → `COMPLETED` → `APPROVED` → `CANCELLED`
- 🔄 Status Updates: Quick status changes without full form editing
- 📊 Status Filtering: Filter tasks by current status for workflow management

## 🏢 **Data Model**

### **Task Entity Structure**

```javascript
Task {
  id: number,           // Auto-generated primary key
  title: string,        // Required, max 100 chars
  description: string,  // Optional, max 200 chars
  status: enum,         // NEW | PENDING | IN_PROGRESS | COMPLETED | APPROVED | CANCELLED
  dueDate: datetime,    // Required, must be future date
  tasknum: number       // Optional, custom task number
}
```

### **Database Schema**

```sql
-- PostgreSQL Production Schema
CREATE TYPE status_enum AS ENUM (
  'NEW', 'PENDING', 'IN_PROGRESS',
  'COMPLETED', 'APPROVED', 'CANCELLED'
);

CREATE TABLE public.task (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description VARCHAR(200),
  status status_enum NOT NULL,
  duedate TIMESTAMP(6) NOT NULL,
  tasknum INTEGER
);
```

## 🌐 **API Architecture**

### **REST API Endpoints**

| Method | Endpoint                 | Purpose                   |
| ------ | ------------------------ | ------------------------- |
| POST   | `/api/tasks`             | Create new task           |
| GET    | `/api/tasks`             | List all tasks            |
| GET    | `/api/tasks/{id}`        | Get specific task         |
| PUT    | `/api/tasks/{id}`        | Update full task          |
| PUT    | `/api/tasks/{id}/status` | Update status only        |
| DELETE | `/api/tasks/{id}`        | Delete task               |
| GET    | `/api/tasks/search`      | Advanced search filtering |
| GET    | `/api/tasks/statuses`    | Get available status list |
| GET    | `/api/tasks/overdue`     | List overdue tasks        |

### **API Response Format**

```json
{
  "id": 123,
  "title": "Complete quarterly report",
  "description": "Compile Q3 metrics and analysis",
  "status": "IN_PROGRESS",
  "dueDate": "2025-09-30T17:00:00",
  "tasknum": 2025001
}
```

## 🧪 **Testing Strategy**

### **Multi-Layer Test Coverage**

```
Frontend Testing:
├── Unit Tests (Vitest)
│   ├── Component behavior
│   ├── API client functions
│   └── Utility functions
├── Integration Tests
│   ├── Component + API integration
│   └── Form validation flows
└── E2E Tests (Playwright)
    ├── Complete user workflows
    └── Cross-browser compatibility

Backend Testing:
├── Unit Tests (JUnit 5)
│   ├── Service layer logic
│   ├── Controller behavior
│   └── Entity mapping
├── Integration Tests (TestContainers)
│   ├── Database operations
│   ├── Repository layer
│   └── Full stack integration
├── Functional Tests
│   ├── HTTP API testing
│   ├── End-to-end workflows
│   └── Error handling
└── Smoke Tests
    ├── Health checks
    ├── Basic connectivity
    └── Environment validation
```

### **Quality Assurance**

- 📊 **Code Coverage**: JaCoCo integration for backend, Vitest coverage for frontend
- 🔍 **Static Analysis**: OWASP dependency checking, code quality scans
- 🚨 **Error Handling**: Comprehensive exception handling with detailed logging
- 📝 **Documentation**: OpenAPI/Swagger specs, comprehensive README files

## 🚀 **Implementation & Deployment**

### **Development Environment Setup**

1. **Prerequisites**

   - Java 21+ (backend)
   - Node.js 18+ (frontend)
   - Docker & Docker Compose (database)
   - Git (version control)

2. **Quick Start Commands**

   ```sh
   # Clone and setup
   git clone <repository>
   cd DTS1

   # Install all dependencies
   npm run deps:install

   # Start backend (H2 dev database)
   cd kellybackendtask
   ./gradlew bootRun -Dspring.profiles.active=dev

   # Start frontend (separate terminal)
   cd kellyfrontendtask
   npm run dev

   # Access application
   # Frontend: http://localhost:3000
   # Backend API: http://localhost:4000
   # Swagger UI: http://localhost:4000/swagger-ui
   ```

### **Production Deployment**

1. **Database Setup**

   ```sh
   # Start PostgreSQL
   docker compose -f docker-compose.dev-db.yml up -d

   # Run backend with PostgreSQL profile
   ./gradlew bootRun -Dspring.profiles.active=devdb
   ```

2. **Build for Production**

   ```sh
   # Build everything
   ./build-all.sh

   # Backend JAR created in: kellybackendtask/build/libs/
   # Frontend build in: kellyfrontendtask/dist/
   ```


## 📈 **Key Benefits & Features**

### **Developer Experience**

- 🛠️ **VS Code Integration**: Pre-configured workspace with optimized settings
- 🔄 **Hot Reload**: Vite dev server for instant frontend updates
- 📊 **Comprehensive Logging**: Detailed test logs with timestamps for debugging
- 🎯 **Type Safety**: TypeScript frontend, strong Java typing

### **Production Readiness**

- 🏗️ **Scalable Architecture**: Layered design with clear separation of concerns
- 🔒 **Security**: Input validation, CORS configuration, error handling
- 📊 **Monitoring**: Health checks, actuator endpoints, detailed logging
- 🧪 **Quality Assurance**: Multi-layer testing with high coverage

### **Maintenance & Documentation**

- 📚 **Complete Documentation**: Architecture guides, API docs, setup instructions
- 🔄 **Automated Testing**: CI-ready test suite with deterministic outputs
- 📦 **Containerization**: Docker support for consistent environments
- 🚀 **Modern Tooling**: Latest versions of Spring Boot, React, build tools

## 🎯 **Use Cases**

This application is ideal for:

- **Learning Modern Full-Stack Development**: Demonstrates best practices across the entire stack
- **Project Management Systems**: Task tracking and workflow management
- **Enterprise Applications**: Shows production-ready patterns and testing strategies
- **Technical Assessment**: Comprehensive example of clean code and architecture
- **Prototype Foundation**: Solid base for building more complex applications

---

**📍 Quick Access Links:**

- **Frontend Details**: `kellyfrontendtask/README.md`
- **Backend Details**: `kellybackendtask/README.md`
- **API Documentation**: `api-endpoints.md`
- **Setup Guide**: Root `README.md`
