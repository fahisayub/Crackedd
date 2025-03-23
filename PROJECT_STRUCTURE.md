# Crackedd Project Structure

This document outlines the industry-standard folder structure for the Crackedd application, which consists of a Next.js frontend (with App Router) and a FastAPI backend.

## Root Directory Structure

```
crackedd/
├── .github/                # GitHub workflows and configuration
├── backend/                # FastAPI backend
├── frontend/               # Next.js frontend
├── docs/                   # Documentation
├── .gitignore              # Git ignore file
├── README.md               # Project overview
├── PROJECT_STRUCTURE.md    # This file
└── docker-compose.yml      # Docker compose configuration
```

## Frontend (Next.js App Router) Structure

```
frontend/
├── app/                    # App Router for Next.js
│   ├── (auth)/             # Authentication routes grouped
│   │   ├── login/          # Login page route
│   │   ├── signup/         # Signup page route
│   │   └── [...auth]/      # Catch-all auth route for auth.js
│   ├── api/                # API routes
│   │   └── [...]/          # API route handlers
│   ├── dashboard/          # Dashboard route
│   │   └── page.tsx        # Dashboard page component
│   ├── error.tsx           # Error component
│   ├── layout.tsx          # Root layout
│   ├── loading.tsx         # Loading component
│   ├── not-found.tsx       # Not found component
│   ├── page.tsx            # Home page component
│   └── providers.tsx       # Client providers
├── components/             # Reusable components
│   ├── ui/                 # UI components (buttons, inputs, etc.)
│   ├── layout/             # Layout components (navbar, footer, etc.)
│   ├── forms/              # Form components
│   └── chat/               # Chat-specific components
├── hooks/                  # Custom React hooks
│   ├── useChat.ts          # Chat-related hooks
│   └── useAuth.ts          # Authentication hooks
├── lib/                    # Utility libraries and functions
│   ├── api/                # API client and utilities
│   ├── utils/              # Utility functions
│   └── constants.ts        # Constants
├── public/                 # Static assets
│   ├── images/             # Image assets
│   ├── fonts/              # Font files
│   └── favicon.ico         # Favicon
├── styles/                 # Global styles
│   └── globals.css         # Global CSS
├── types/                  # TypeScript type definitions
│   ├── api.ts              # API types
│   └── index.ts            # Common types
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
└── .env.local              # Environment variables (gitignored)
```

## Backend (FastAPI) Structure

```
backend/
├── app/                    # Main application package
│   ├── __init__.py         # Package initializer
│   ├── server.py           # Main FastAPI application
│   ├── config/             # Configuration
│   │   ├── __init__.py     # Package initializer
│   │   └── settings.py     # Settings and configuration
│   ├── api/                # API endpoints
│   │   ├── __init__.py     # Package initializer
│   │   ├── routes/         # API routes
│   │   │   ├── __init__.py # Package initializer
│   │   │   ├── auth.py     # Authentication routes
│   │   │   └── chat.py     # Chat routes
│   │   └── deps.py         # Dependencies for API endpoints
│   ├── core/               # Core functionality
│   │   ├── __init__.py     # Package initializer
│   │   ├── security.py     # Security utilities
│   │   └── errors.py       # Error handling
│   ├── db/                 # Database
│   │   ├── __init__.py     # Package initializer
│   │   ├── session.py      # Database session
│   │   └── models/         # Database models
│   │       ├── __init__.py # Package initializer
│   │       └── user.py     # User model
│   ├── models/             # Pydantic models (schemas)
│   │   ├── __init__.py     # Package initializer
│   │   └── user.py         # User schema
│   ├── services/           # Business logic
│   │   ├── __init__.py     # Package initializer
│   │   └── chat.py         # Chat service
│   ├── workers/            # Background tasks
│   │   ├── __init__.py     # Package initializer
│   │   ├── queue.py        # Queue configuration
│   │   ├── scheduler.py    # Task scheduler
│   │   └── tasks/          # Task modules
│   │       ├── __init__.py # Package initializer
│   │       ├── indexing.py # Data indexing tasks
│   │       └── notifications.py # Notification tasks
│   ├── agents/             # LangGraph agents
│   │   ├── __init__.py     # Package initializer
│   │   └── react_agent.py  # REACT agent implementation
│   └── utils/              # Utility functions
│       ├── __init__.py     # Package initializer
│       └── helpers.py      # Helper functions
├── migrations/             # Alembic migrations
├── tests/                  # Test directory
│   ├── __init__.py         # Package initializer
│   ├── conftest.py         # Test configuration
│   └── test_api/           # API tests
│       ├── __init__.py     # Package initializer
│       └── test_chat.py    # Chat API tests
├── alembic.ini             # Alembic configuration
├── pyproject.toml          # Poetry dependencies
├── poetry.lock             # Poetry lock file
└── .env                    # Environment variables (gitignored)
```

## Implementation Notes

### Frontend Implementation

1. **App Router Structure**: Next.js 13+ App Router uses a file-system based router where folders define routes.
   
2. **Routing Conventions**:
   - `page.tsx`: Defines a route and is publicly accessible
   - `layout.tsx`: Defines a layout that wraps child routes
   - `loading.tsx`: Loading UI for route segments
   - `error.tsx`: Error handling for route segments
   - `not-found.tsx`: 404 page
   - `(grouping)`: Parentheses create route groups without affecting the URL path

3. **Component Organization**: 
   - UI components are separated from business logic
   - Layout components handle page structure
   - Form components handle input collection
   - Chat components are specific to the messaging interface

4. **Data Fetching**:
   - Server components fetch data on the server
   - Client components use hooks for client-side data fetching

### Backend Implementation

1. **API Structure**:
   - Routes are organized by domain/feature
   - Dependencies are injected using FastAPI's dependency injection system
   
2. **Layered Architecture**:
   - API Layer: Handles HTTP requests and responses
   - Service Layer: Contains business logic
   - Data Access Layer: Handles database operations
   
3. **Agent Integration**:
   - LangGraph agents are defined in the `agents` directory
   - Services use agents to process natural language requests

4. **Testing**:
   - Tests follow the same structure as the application
   - Fixtures are defined in conftest.py

## Integration Points

- The frontend communicates with the backend through the Next.js API routes or directly to the FastAPI endpoints
- WebSocket connections for real-time chat functionality
- Authentication is handled through JWT tokens

This structure follows industry best practices and promotes:
- Separation of concerns
- Modularity and reusability
- Scalability
- Maintainability
- Testability
