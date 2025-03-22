# Crackedd
Crackedd is an AI platform that connects to your organization’s tools (Slack, Notion, Gmail etc.), aggregates siloed data, and turns it into searchable, actionable insights. Ask questions, track workflows, and uncover hidden patterns—all through a single interface.

## Overview

This project showcases:

- A LangGraph agent running on a FastAPI
- Real-time response streaming to the frontend using assistant-stream
- A modern chat UI built with assistant-ui and Next.js
- Demonstrate how to integrate external tools and APIs

## Prerequisites

- Python 3.11
- Node.js v20.18.0
- npm v10.9.2
- Yarn v1.22.22

## Project Structure

```
crackedd/
├── backend/         # FastAPI + assistant-stream + LangGraph server
└── frontend/        # Next.js + assistant-ui client
```

## Setup Instructions

### Set up environment variables

Go to `./backend` and create `.env` file. Follow the example in `.env.example`.

### Backend Setup

The backend is built using the LangChain CLI and utilizes LangGraph's `create_react_agent` for agent creation.

```bash
cd backend
poetry install
poetry run python -m app.server
```

### Frontend Setup

The frontend is generated using the assistant-ui CLI tool.

```bash
cd frontend
yarn install
yarn dev
```