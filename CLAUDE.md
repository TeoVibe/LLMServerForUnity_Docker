# UndreamAI-Docker Development Guide

## Build Commands
- Frontend development: `cd runpod-frontend/frontend && npm run dev`
- Frontend build: `cd runpod-frontend/frontend && npm run build`
- Frontend lint: `cd runpod-frontend/frontend && npm run lint`
- Backend development: `cd runpod-frontend/backend && uvicorn main:app --reload`
- Docker build: `docker build -t undreamai-docker ./runpod-frontend`
- Docker compose: `docker-compose -f docker-compose/docker-compose.yml up`

## Code Style Guidelines
- **TypeScript**: Use strict mode, avoid `any` types
- **React**: Functional components with hooks (useState, useEffect)
- **API Calls**: Use fetch API with async/await and proper error handling
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Formatting**: 4-space indentation
- **Error Handling**: try/catch blocks with appropriate user feedback
- **Imports**: Group by external, then internal dependencies
- **Styling**: Use className with CSS classes for component styling
- **Backend Python**: Follow PEP 8 style guidelines

Run linting before committing changes to ensure code quality.