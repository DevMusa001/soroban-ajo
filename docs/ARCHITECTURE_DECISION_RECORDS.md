# Architecture Decision Records (ADRs)

This document contains all significant architectural decisions made for the Soroban Ajo project. Each ADR follows the standard format with context, options, decision, and consequences.

## Table of Contents

1. [ADR-001: Blockchain Platform Selection](#adr-001-blockchain-platform-selection)
2. [ADR-002: Smart Contract Language](#adr-002-smart-contract-language)
3. [ADR-003: Backend Framework](#adr-003-backend-framework)
4. [ADR-004: Frontend Framework](#adr-004-frontend-framework)
5. [ADR-005: Database Architecture](#adr-005-database-architecture)
6. [ADR-006: Authentication Strategy](#adr-006-authentication-strategy)
7. [ADR-007: API Design Pattern](#adr-007-api-design-pattern)
8. [ADR-008: State Management](#adr-008-state-management)
9. [ADR-009: Testing Strategy](#adr-009-testing-strategy)
10. [ADR-010: Deployment Architecture](#adr-010-deployment-architecture)

---

## ADR-001: Blockchain Platform Selection

**Status**: Accepted  
**Date**: April 2026  
**Deciders**: Architecture Team  
**Affected Components**: Smart Contracts, Backend, Frontend

### Context

We needed to select a blockchain platform for implementing a decentralized savings group system. Key requirements included:
- Low transaction costs
- Fast finality
- Strong developer ecosystem
- Existing wallet infrastructure
- Suitable for financial applications

### Options Considered

1. **Ethereum**: High fees, complex smart contracts, large ecosystem
2. **Polygon**: Lower fees than Ethereum, good ecosystem
3. **Stellar**: Low fees, fast finality, built for payments, strong compliance
4. **Solana**: Very fast, low fees, but less mature for financial apps

### Decision

**Selected: Stellar Network**

Stellar was chosen because:
- Extremely low transaction costs (0.00001 XLM)
- Fast finality (3-5 seconds)
- Built specifically for payments and financial applications
- Strong regulatory compliance features
- Excellent developer documentation
- Soroban smart contract platform provides necessary functionality

### Consequences

**Positive:**
- Users can transact with minimal fees
- Fast confirmation times improve UX
- Stellar's compliance features support regulatory requirements
- Strong community support for financial applications

**Negative:**
- Smaller ecosystem compared to Ethereum
- Fewer third-party tools and libraries
- Less developer familiarity (requires education)

### Related Decisions

- ADR-002: Smart Contract Language (Rust on Soroban)
- ADR-006: Authentication Strategy (Stellar wallet integration)

---

## ADR-002: Smart Contract Language

**Status**: Accepted  
**Date**: April 2026  
**Deciders**: Architecture Team  
**Affected Components**: Smart Contracts

### Context

We needed to select a language for implementing smart contracts on Soroban. Soroban supports Rust and JavaScript/TypeScript. Key considerations:
- Performance and security
- Developer experience
- Ecosystem maturity
- Compilation to WASM

### Options Considered

1. **Rust**: Strong type system, memory safety, excellent performance
2. **JavaScript/TypeScript**: Familiar to web developers, easier learning curve

### Decision

**Selected: Rust**

Rust was chosen because:
- Memory safety prevents entire classes of bugs
- Strong type system catches errors at compile time
- Excellent performance for financial calculations
- Mature ecosystem for blockchain development
- Better for security-critical code

### Consequences

**Positive:**
- Memory safety eliminates buffer overflows and use-after-free bugs
- Strong type system prevents many runtime errors
- Excellent performance for financial operations
- Mature testing frameworks

**Negative:**
- Steeper learning curve for developers
- Longer development time initially
- Requires Rust expertise on team

### Mitigation

- Provide comprehensive documentation and examples
- Conduct Rust training for team members
- Use established patterns and libraries

---

## ADR-003: Backend Framework

**Status**: Accepted  
**Date**: April 2026  
**Deciders**: Architecture Team  
**Affected Components**: Backend API

### Context

We needed to select a backend framework for the Node.js API server. Key requirements:
- RESTful API support
- TypeScript support
- Middleware ecosystem
- Performance
- Developer productivity

### Options Considered

1. **Express.js**: Lightweight, flexible, large ecosystem
2. **NestJS**: Opinionated, built-in TypeScript, enterprise features
3. **Fastify**: High performance, modern, TypeScript support
4. **Koa**: Lightweight, modern middleware pattern

### Decision

**Selected: Express.js with TypeScript**

Express.js was chosen because:
- Lightweight and flexible
- Massive ecosystem of middleware
- Easy to learn and use
- Excellent TypeScript support
- Proven in production at scale
- Large community for troubleshooting

### Consequences

**Positive:**
- Rapid development with familiar patterns
- Extensive middleware ecosystem
- Easy to find developers with Express experience
- Flexible architecture allows custom patterns

**Negative:**
- Less opinionated than alternatives
- Requires more manual setup for enterprise features
- Performance not as high as Fastify

### Related Decisions

- ADR-007: API Design Pattern (RESTful with versioning)

---

## ADR-004: Frontend Framework

**Status**: Accepted  
**Date**: April 2026  
**Deciders**: Architecture Team  
**Affected Components**: Frontend Web Application

### Context

We needed to select a frontend framework for the web application. Key requirements:
- Server-side rendering capability
- TypeScript support
- Component ecosystem
- Performance
- Developer experience

### Options Considered

1. **Next.js**: Full-stack React framework, SSR, excellent DX
2. **React + Vite**: Lightweight, fast, requires more setup
3. **Vue.js**: Simpler learning curve, good ecosystem
4. **Svelte**: Compiler-based, excellent performance

### Decision

**Selected: Next.js 14 with App Router**

Next.js was chosen because:
- Built-in server-side rendering improves SEO
- App Router provides modern file-based routing
- Excellent TypeScript support
- Built-in optimization (image, font, code splitting)
- Vercel deployment integration
- Large ecosystem and community

### Consequences

**Positive:**
- Improved SEO with server-side rendering
- Excellent developer experience
- Built-in performance optimizations
- Easy deployment to Vercel
- Strong community and ecosystem

**Negative:**
- Larger bundle size than lightweight alternatives
- Learning curve for App Router
- Opinionated structure may not suit all projects

### Related Decisions

- ADR-008: State Management (React Query + Zustand)

---

## ADR-005: Database Architecture

**Status**: Accepted  
**Date**: April 2026  
**Deciders**: Architecture Team  
**Affected Components**: Backend, Data Layer

### Context

We needed to select a database for storing application state. Key requirements:
- ACID compliance for financial data
- Scalability
- Query flexibility
- Operational simplicity
- Cost effectiveness

### Options Considered

1. **PostgreSQL**: Mature, ACID, excellent for relational data
2. **MongoDB**: Flexible schema, good for rapid development
3. **DynamoDB**: Serverless, scalable, AWS-managed
4. **Firebase**: Serverless, real-time, managed

### Decision

**Selected: PostgreSQL with Prisma ORM**

PostgreSQL was chosen because:
- Strong ACID guarantees for financial transactions
- Excellent query performance with proper indexing
- Mature and battle-tested
- Excellent tooling ecosystem
- Cost-effective for our scale
- Prisma provides excellent TypeScript support

### Consequences

**Positive:**
- Strong consistency guarantees for financial data
- Excellent query performance
- Mature ecosystem and tooling
- Easy to scale with read replicas
- Cost-effective

**Negative:**
- Requires operational expertise
- Vertical scaling limitations
- Schema migrations can be complex

### Mitigation

- Use Prisma for schema management
- Implement proper indexing strategy
- Plan for read replicas as needed

---

## ADR-006: Authentication Strategy

**Status**: Accepted  
**Date**: April 2026  
**Deciders**: Architecture Team  
**Affected Components**: Frontend, Backend, Smart Contracts

### Context

We needed to implement authentication for the platform. Key requirements:
- Decentralized (wallet-based)
- No password management
- Stellar integration
- Secure message signing
- User-friendly

### Options Considered

1. **Wallet-based authentication**: Sign messages with wallet
2. **OAuth**: Centralized, requires third-party provider
3. **Traditional username/password**: Centralized, security risks
4. **Multi-signature**: Complex, overkill for this use case

### Decision

**Selected: Wallet-based Authentication with Message Signing**

Wallet-based auth was chosen because:
- Aligns with blockchain philosophy
- No password management needed
- Leverages existing Stellar wallets (Freighter, Albedo)
- Cryptographically secure
- User-friendly with wallet extensions

### Implementation

```typescript
// User signs a message with their wallet
const message = `Sign to authenticate: ${timestamp}`;
const signature = await wallet.signMessage(message);

// Backend verifies signature
const isValid = verifySignature(publicKey, message, signature);
```

### Consequences

**Positive:**
- No password management burden
- Leverages existing wallet infrastructure
- Cryptographically secure
- Aligns with blockchain principles
- Better user experience

**Negative:**
- Users must have a wallet
- Lost wallet = lost access (unless recovery implemented)
- Requires user education

### Related Decisions

- ADR-001: Blockchain Platform Selection (Stellar)

---

## ADR-007: API Design Pattern

**Status**: Accepted  
**Date**: April 2026  
**Deciders**: Architecture Team  
**Affected Components**: Backend API

### Context

We needed to establish API design patterns for consistency and maintainability. Key requirements:
- RESTful principles
- Versioning strategy
- Error handling
- Documentation
- Backward compatibility

### Options Considered

1. **RESTful with URL versioning**: `/api/v1/groups`
2. **RESTful with header versioning**: `Accept: application/vnd.ajo.v1+json`
3. **GraphQL**: Flexible queries, complex implementation
4. **gRPC**: High performance, less suitable for web

### Decision

**Selected: RESTful API with URL Versioning**

RESTful with URL versioning was chosen because:
- Clear, explicit versioning
- Easy to understand and use
- Supports multiple versions simultaneously
- Good for caching with CDNs
- Familiar to most developers

### API Structure

```
GET    /api/v1/groups              # List groups
POST   /api/v1/groups              # Create group
GET    /api/v1/groups/:id          # Get group
PUT    /api/v1/groups/:id          # Update group
DELETE /api/v1/groups/:id          # Delete group
POST   /api/v1/groups/:id/members  # Add member
```

### Consequences

**Positive:**
- Clear versioning strategy
- Easy to maintain multiple versions
- Good CDN caching support
- Familiar to developers
- Easy to document

**Negative:**
- URL versioning can lead to code duplication
- Requires careful migration planning
- May need multiple versions in production

---

## ADR-008: State Management

**Status**: Accepted  
**Date**: April 2026  
**Deciders**: Architecture Team  
**Affected Components**: Frontend

### Context

We needed to select state management for the React frontend. Key requirements:
- Server state management
- Client state management
- Caching
- Developer experience
- Performance

### Options Considered

1. **Redux**: Powerful, verbose, steep learning curve
2. **Zustand**: Lightweight, simple, good DX
3. **Jotai**: Atomic state, modern approach
4. **React Query + Zustand**: Separation of concerns

### Decision

**Selected: React Query + Zustand**

This combination was chosen because:
- React Query handles server state (data fetching, caching)
- Zustand handles client state (UI state, preferences)
- Clear separation of concerns
- Excellent developer experience
- Minimal boilerplate
- Great TypeScript support

### Implementation Pattern

```typescript
// Server state with React Query
const { data: groups } = useQuery({
  queryKey: ['groups'],
  queryFn: () => api.getGroups(),
});

// Client state with Zustand
const useUIStore = create((set) => ({
  isMenuOpen: false,
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
}));
```

### Consequences

**Positive:**
- Clear separation of concerns
- Excellent caching with React Query
- Minimal boilerplate with Zustand
- Great TypeScript support
- Easy to test

**Negative:**
- Two libraries to learn
- Requires discipline to maintain separation
- May be overkill for simple apps

---

## ADR-009: Testing Strategy

**Status**: Accepted  
**Date**: April 2026  
**Deciders**: Architecture Team  
**Affected Components**: All

### Context

We needed to establish a comprehensive testing strategy. Key requirements:
- Unit test coverage
- Integration test coverage
- End-to-end test coverage
- Performance testing
- Security testing

### Options Considered

1. **Jest + React Testing Library**: Comprehensive, good DX
2. **Vitest + Testing Library**: Faster, modern
3. **Cypress + Jest**: E2E + unit testing
4. **Playwright + Jest**: Modern E2E testing

### Decision

**Selected: Multi-tier Testing Strategy**

- **Unit Tests**: Jest for backend and frontend
- **Integration Tests**: Jest with test containers
- **E2E Tests**: Cypress for critical user flows
- **Contract Tests**: Rust test framework for smart contracts

### Coverage Targets

| Layer | Target Coverage |
|-------|-----------------|
| Backend | 80%+ |
| Frontend | 70%+ |
| Smart Contracts | 90%+ |

### Consequences

**Positive:**
- Comprehensive coverage across all layers
- Early bug detection
- Confidence in deployments
- Good documentation through tests

**Negative:**
- Significant time investment
- Maintenance overhead
- Requires discipline

---

## ADR-010: Deployment Architecture

**Status**: Accepted  
**Date**: April 2026  
**Deciders**: Architecture Team  
**Affected Components**: All

### Context

We needed to establish a deployment architecture. Key requirements:
- Scalability
- High availability
- Easy rollbacks
- Cost efficiency
- Monitoring and logging

### Options Considered

1. **Monolithic deployment**: Single server, simple but limited
2. **Containerized (Docker + Kubernetes)**: Complex but scalable
3. **Serverless (AWS Lambda)**: Scalable, cost-efficient, vendor lock-in
4. **Platform as a Service (Vercel, Railway)**: Easy, limited control

### Decision

**Selected: Containerized Deployment with Docker**

Docker containerization was chosen because:
- Consistent environments across dev/staging/production
- Easy to scale horizontally
- Good balance of control and simplicity
- Excellent tooling ecosystem
- Cost-effective

### Deployment Targets

- **Frontend**: Vercel (Next.js optimized)
- **Backend**: Docker on Railway or DigitalOcean
- **Database**: Managed PostgreSQL (Railway, AWS RDS)
- **Smart Contracts**: Stellar network (no deployment needed)

### CI/CD Pipeline

```
Code Push → GitHub Actions → Tests → Build → Deploy
```

### Consequences

**Positive:**
- Consistent environments
- Easy horizontal scaling
- Good tooling support
- Cost-effective
- Easy rollbacks

**Negative:**
- Requires Docker knowledge
- Operational overhead
- Monitoring complexity

---

## Decision Review Process

### When to Create an ADR

Create an ADR when:
- Making significant architectural decisions
- Choosing between major technologies
- Establishing patterns that affect multiple components
- Making decisions with long-term implications

### ADR Template

```markdown
## ADR-XXX: [Title]

**Status**: [Proposed/Accepted/Deprecated/Superseded]
**Date**: [Date]
**Deciders**: [Team members]
**Affected Components**: [List components]

### Context
[Explain the issue and why it matters]

### Options Considered
1. [Option 1]: [Pros and cons]
2. [Option 2]: [Pros and cons]

### Decision
[Explain the chosen option and why]

### Consequences
**Positive:**
- [Benefit 1]

**Negative:**
- [Drawback 1]

### Related Decisions
- [Related ADR]
```

### Review Checklist

- [ ] Problem clearly stated
- [ ] Options thoroughly evaluated
- [ ] Decision well justified
- [ ] Consequences identified
- [ ] Related decisions noted
- [ ] Team consensus achieved

---

## Superseded Decisions

None yet. As decisions are superseded, they will be marked as deprecated with references to new ADRs.

---

## Future Decisions to Make

- [ ] Caching strategy (Redis vs in-memory)
- [ ] Message queue implementation (Bull vs RabbitMQ)
- [ ] Monitoring and observability stack
- [ ] Disaster recovery strategy
- [ ] Multi-region deployment strategy

---

**Last Updated**: April 2026  
**Version**: 1.0.0  
**Maintainers**: Ajo Architecture Team

For questions or to propose new ADRs, please open an issue on GitHub or contact the architecture team.
