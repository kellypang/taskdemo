# Full-Stack Task Management System

A task management application demonstrating modern software engineering practices with comprehensive testing and clean architecture.

## 🚀 Overview

Complete CRUD task management solution built with **Spring Boot** (backend) and **React/Vite** (frontend):

- ✅ **Full CRUD Operations** - Create, Read, Update, Delete, and Search tasks
- 🏗️ **Modern Architecture** - Layered backend with comprehensive test strategy
- 🎨 **Rich Frontend** - React/Vite with reusable components and server-backed search
- 📊 **Comprehensive Testing** - Multi-layer test coverage (unit, integration, functional, smoke)
- 📚 **Complete Documentation** - API docs, architecture guides, and development workflows

## 🚀 Quick Start

**Development Mode:**

```sh
# Backend (H2 database, port 4000)
cd kellybackendtask
./gradlew bootRun -Dspring.profiles.active=dev

# Frontend (Vite dev server, port 3000)
cd kellyfrontendtask
npm install && npm run dev
```

## 🏗️ Architecture

| Component    | Technology                   | Purpose                                 |
| ------------ | ---------------------------- | --------------------------------------- |
| **Backend**  | Spring Boot + Java 21        | REST API with layered testing           |
| **Frontend** | React 18 + Vite + TypeScript | Interactive UI with reusable components |
| **Database** | PostgreSQL / H2              | Production / Development                |
| **Testing**  | JUnit + Vitest + Playwright  | Comprehensive test coverage             |

## 📚 Documentation

| Document                                                                     | Description                    |
| ---------------------------------------------------------------------------- | ------------------------------ |
| [`kellybackendtask/README.md`](kellybackendtask/README.md)                   | Backend API documentation      |
| [`kellyfrontendtask/README.md`](kellyfrontendtask/README.md)                 | Frontend application guide     |
| [`api-endpoints.md`](api-endpoints.md)                                       | API reference                  |

## ✅ Core Features

**Task Management:**

- Create tasks with validation (title, description, due date, status)
- Update tasks (full updates + status-only changes)
- Interactive task table with sorting and selection
- Safe deletion with confirmation dialogs

**Advanced Search:**

- Server-backed search by title, due date, and status
- Automatic client-side fallback for reliability
- Real-time filtering and results display

**Status Workflow:**
`NEW` → `PENDING` → `IN_PROGRESS` → `COMPLETED` → `APPROVED` / `CANCELLED`
