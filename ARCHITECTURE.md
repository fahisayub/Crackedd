# Crackedd - System Architecture

## Overview

Crackedd is an AI-powered knowledge engine that integrates with various organizational tools to unify siloed data and deliver actionable insights through natural language search. This document outlines the high-level architecture, component interactions, and technology choices for the Crackedd platform.

## System Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                  │
│  ┌──────────────────────────┐  ┌────────────────────┐  ┌──────────────────┐ │
│  │     Web Application      │  │  Desktop Application │  │ Mobile Application │
│  │  (Next.js + assistant-ui)│  │  (Windows/macOS)    │  │     (Future)     │ │
│  └──────────────┬───────────┘  └────────────────────┘  └──────────────────┘ │
└─────────────────┼─────────────────────────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                      FastAPI + assistant-stream                       │ │
│  └──────────────┬─────────────────────────────────────┬────────────────┬┘ │
└─────────────────┼─────────────────────────────────────┼────────────────┼──┘
                  │                                     │                │
                  ▼                                     ▼                ▼
┌─────────────────────────┐  ┌───────────────────────────────┐  ┌────────────────────┐
│   ORCHESTRATION LAYER   │  │       INTEGRATION LAYER       │  │   SECURITY LAYER   │
│ ┌─────────────────────┐ │  │ ┌───────────────────────────┐ │  │ ┌────────────────┐ │
│ │    LangGraph Agent  │ │  │ │  Integration Connectors   │ │  │ │ Authentication │ │
│ └──────────┬──────────┘ │  │ │  (Slack, GitHub, etc.)    │ │  │ └────────────────┘ │
│            │            │  │ └─────────────┬─────────────┘ │  │ ┌────────────────┐ │
│ ┌──────────┴──────────┐ │  │               │               │  │ │  Authorization │ │
│ │ LLM Reasoning Engine│ │  │ ┌─────────────┴─────────────┐ │  │ └────────────────┘ │
│ └─────────────────────┘ │  │ │      Sync Services        │ │  │ ┌────────────────┐ │
└─────────────────────────┘  │ └─────────────┬─────────────┘ │  │ │   Encryption   │ │
                             │               │               │  │ └────────────────┘ │
                             └───────────────┼───────────────┘  └────────────────────┘
                                             │
                                             ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                    │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐  ┌─────────┐ │
│  │  Vector Store  │  │ Document Store │  │ Metadata Store  │  │ Cache   │ │
│  │  (Optional)    │  │                │  │                 │  │         │ │
│  └────────────────┘  └────────────────┘  └─────────────────┘  └─────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

## Architecture Components

### 1. Client Layer

- **Web Application**
  - **Technology**: Next.js with assistant-ui
  - **Purpose**: Provides a responsive UI for users to interact with Crackedd via natural language queries
  - **Key Features**: Chat interface, visualization of insights, activity feeds

- **Desktop Application**
  - **Platforms**: Windows, macOS
  - **Purpose**: Provides a native desktop experience for users to interact with Crackedd
  - **Key Features**: Native UI, offline support, system integration

- **Mobile Application (Future)**
  - **Platforms**: iOS, Android
  - **Purpose**: Provides a mobile experience for users to interact with Crackedd on-the-go
  - **Key Features**: Native UI, push notifications, mobile-specific features

### 2. API Gateway

- **Technology**: FastAPI with assistant-stream
- **Purpose**: Handles all client-server communication, manages request routing
- **Key Features**: Real-time streaming responses, request validation, rate limiting

### 3. Orchestration Layer

- **LangGraph Agent**
  - **Purpose**: Orchestrates the workflow of understanding user queries, retrieving context, and generating responses
  - **Components**: State management, chain-of-thought reasoning, tool selection

- **LLM Reasoning Engine**
  - **Technology**: Based on OpenAI or other compatible LLM providers
  - **Purpose**: Provides natural language understanding and generation capabilities

### 4. Integration Layer

- **Integration Connectors**
  - **Purpose**: Connect to external services and tools (Slack, GitHub, CRMs, etc.)
  - **Implementation**: OAuth flows, API clients, webhook receivers
  - **Supported Platforms**: Slack, Notion, Gmail, GitHub, Salesforce, etc.

- **Sync Services**
  - **Purpose**: Manages data synchronization between external tools and Crackedd
  - **Features**: Incremental syncs, conflict resolution, event processing

### 5. Security Layer

- **Authentication**: Secure user authentication with OAuth 2.0, SAML, etc.
- **Authorization**: Role-based access control to ensure data security
- **Encryption**: End-to-end encryption for sensitive data

### 6. Data Layer

- **Vector Store** (Optional, recommended)
  - **Technology**: Pinecone, Weaviate, or similar
  - **Purpose**: Stores embeddings for semantic search capabilities
  - **Use Case**: Enables similarity search across documents and messages

- **Document Store**
  - **Purpose**: Stores raw documents, messages, and other unstructured data
  - **Requirements**: Version control, access tracking

- **Metadata Store**
  - **Purpose**: Stores relationships between entities, permissions, and other structured data
  - **Technology**: PostgreSQL or similar relational database

- **Cache**
  - **Purpose**: Improves performance by caching frequent queries and responses
  - **Technology**: Redis or similar

## Data Flow

1. **Data Ingestion Flow**:
   - External tools → Integration Connectors → Preprocessing → Storage (Document Store, Vector Store, Metadata Store)

2. **Query Processing Flow**:
   - User Query → API Gateway → LangGraph Agent → LLM Reasoning → Data Retrieval → Response Generation → Streaming Response

3. **Real-time Updates Flow**:
   - External Event → Webhooks → Event Processing → Notification System → Real-time Push to Clients

## Vector Database Consideration

**Recommendation**: Yes, a vector database is highly recommended for Crackedd's use case.

**Justification**:
- Semantic search across diverse data sources is a core feature
- Enables finding conceptually similar content beyond keyword matching
- Supports use cases like "Show me updates from the Q4 roadmap" where understanding semantics is crucial
- Allows for context-aware retrieval of relevant information

**Implementation Options**:
- **Pinecone**: Managed vector database with strong performance
- **Weaviate**: Open-source vector search engine with classification capabilities
- **Qdrant**: Vector database optimized for extended filtering
- **Milvus**: Distributed vector database for large-scale deployments
- **PostgreSQL with pgvector**: If you prefer extending your existing PostgreSQL infrastructure

## Scalability Considerations

- **Horizontal Scaling**: Each layer can be independently scaled based on load
- **Separation of Concerns**: Clear boundaries between services enables independent development and deployment
- **Stateless Services**: API Gateway and processing services should be stateless to facilitate scaling
- **Async Processing**: Use message queues for background tasks to handle spikes in workload

## Development Roadmap

### Phase 1: Foundation (Current)
- Set up basic Next.js frontend with assistant-ui
- Implement FastAPI backend with LangGraph agent
- Establish communication between frontend and backend

### Phase 2: Core Integration
- Implement first set of integrations (e.g., Slack, GitHub)
- Develop data synchronization services
- Set up vector database for semantic search

### Phase 3: Advanced Features
- Implement context intelligence
- Develop relationship mapping between entities
- Add proactive insights generation

### Phase 4: Enterprise Features
- Enhanced security controls
- Advanced analytics
- Custom integration framework

## Monitoring and Observability

- **Logging**: Structured logging across all services
- **Metrics**: Track performance, latency, error rates
- **Tracing**: Distributed tracing to follow requests across services
- **Alerting**: Proactive alerts for anomalies or failures

## Current Limitations and Future Work

- The current implementation is in early stages with no features implemented yet
- Vector database integration will need to be prioritized for semantic search capabilities
- Authentication and authorization systems need to be developed for enterprise security
- Custom connectors for each integration target will require significant development effort

## Conclusion

The proposed architecture for Crackedd provides a scalable, secure, and flexible foundation for building an AI-powered knowledge engine that can integrate with multiple organizational tools. The modular design allows for incremental development and deployment of features while maintaining a clear separation of concerns.

The inclusion of a vector database is strongly recommended to enable the semantic search capabilities that form a core part of Crackedd's value proposition. The architecture has been designed to accommodate this component, whether it's added initially or in a future phase of development.
