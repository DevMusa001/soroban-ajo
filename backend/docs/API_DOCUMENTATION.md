# Ajo API Documentation

## Overview

The Ajo API provides comprehensive endpoints for managing decentralized savings groups on the Stellar blockchain. This documentation covers authentication, endpoints, error handling, and rate limiting.

**Base URL**: `https://api.ajo.app/v1`

## Table of Contents

- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
- [Examples](#examples)

## Authentication

### Bearer Token Authentication

All API requests require a valid JWT token in the `Authorization` header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Obtaining a Token

Use the login endpoint to obtain a JWT token:

```bash
POST /auth/login
Content-Type: application/json

{
  "walletAddress": "GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJJBBQ5GGMHXQWVVVVVVVVVVVV",
  "signature": "0x...",
  "message": "Sign this message to login"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "walletAddress": "GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJJBBQ5GGMHXQWVVVVVVVVVVVV",
    "name": "John Doe",
    "email": "john@example.com",
    "trustScore": 85,
    "kycLevel": 2,
    "createdAt": "2024-04-24T15:04:29Z",
    "updatedAt": "2024-04-24T15:04:29Z"
  }
}
```

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ],
  "timestamp": "2024-04-24T15:04:29Z",
  "requestId": "req-123"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `INVALID_SIGNATURE` | 401 | Invalid wallet signature |
| `TOKEN_EXPIRED` | 401 | Authentication token has expired |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `INVALID_EMAIL` | 400 | Invalid email format |
| `INVALID_WALLET_ADDRESS` | 400 | Invalid wallet address format |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE_RESOURCE` | 409 | Resource already exists |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_GROUP_MEMBER` | 403 | User is not a member of this group |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | An unexpected error occurred |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `BLOCKCHAIN_ERROR` | 500 | Blockchain operation failed |

## Rate Limiting

API requests are rate-limited to prevent abuse. Rate limits vary by endpoint:

| Endpoint | Limit | Window |
|----------|-------|--------|
| Default | 100 requests | 60 seconds |
| Authentication | 5 requests | 60 seconds |
| Search | 30 requests | 60 seconds |
| File Upload | 10 requests | 60 seconds |

### Rate Limit Headers

Each response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1713960269
```

When rate limited, the API returns a 429 status code:

```json
{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Rate limit exceeded. Max 100 requests per minute",
  "timestamp": "2024-04-24T15:04:29Z",
  "requestId": "req-123"
}
```

## Endpoints

### Groups

#### List Groups

```
GET /groups
```

**Parameters**:
- `page` (query, integer): Page number (default: 1)
- `limit` (query, integer): Items per page (default: 20, max: 100)
- `q` (query, string): Search query
- `isActive` (query, boolean): Filter by active status

**Example**:
```bash
curl -X GET "https://api.ajo.app/v1/groups?page=1&limit=20&isActive=true" \
  -H "Authorization: Bearer <token>"
```

**Response**:
```json
{
  "data": [
    {
      "id": "group-123",
      "name": "Community Savings",
      "description": "A group for community members",
      "contributionAmount": 1000,
      "frequency": "monthly",
      "maxMembers": 20,
      "currentMembers": 15,
      "isActive": true,
      "createdAt": "2024-04-24T15:04:29Z",
      "updatedAt": "2024-04-24T15:04:29Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

#### Create Group

```
POST /groups
```

**Request Body**:
```json
{
  "name": "Community Savings",
  "description": "A group for community members",
  "contributionAmount": 1000,
  "frequency": "monthly",
  "maxMembers": 20
}
```

**Response** (201 Created):
```json
{
  "id": "group-123",
  "name": "Community Savings",
  "description": "A group for community members",
  "contributionAmount": 1000,
  "frequency": "monthly",
  "maxMembers": 20,
  "currentMembers": 1,
  "isActive": true,
  "createdAt": "2024-04-24T15:04:29Z",
  "updatedAt": "2024-04-24T15:04:29Z"
}
```

#### Get Group Details

```
GET /groups/{groupId}
```

**Parameters**:
- `groupId` (path, string): Group ID

**Example**:
```bash
curl -X GET "https://api.ajo.app/v1/groups/group-123" \
  -H "Authorization: Bearer <token>"
```

### Search

#### Full-Text Search

```
GET /search
```

**Parameters**:
- `q` (query, string, required): Search query (min 2 characters)
- `type` (query, string): Filter by entity type (groups, users, transactions)
- `limit` (query, integer): Results per type (default: 20, max: 100)

**Example**:
```bash
curl -X GET "https://api.ajo.app/v1/search?q=community&type=groups&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Response**:
```json
{
  "groups": [
    {
      "id": "group-123",
      "name": "Community Savings",
      "description": "A group for community members",
      "contributionAmount": 1000,
      "frequency": "monthly",
      "maxMembers": 20,
      "currentMembers": 15,
      "isActive": true,
      "createdAt": "2024-04-24T15:04:29Z",
      "updatedAt": "2024-04-24T15:04:29Z"
    }
  ],
  "users": [],
  "transactions": []
}
```

## Examples

### Complete Workflow

#### 1. Login

```bash
curl -X POST "https://api.ajo.app/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJJBBQ5GGMHXQWVVVVVVVVVVVV",
    "signature": "0x...",
    "message": "Sign this message to login"
  }'
```

#### 2. Create a Group

```bash
curl -X POST "https://api.ajo.app/v1/groups" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Community Savings",
    "description": "A group for community members",
    "contributionAmount": 1000,
    "frequency": "monthly",
    "maxMembers": 20
  }'
```

#### 3. Search Groups

```bash
curl -X GET "https://api.ajo.app/v1/search?q=community&type=groups" \
  -H "Authorization: Bearer <token>"
```

### Error Handling Example

```bash
curl -X GET "https://api.ajo.app/v1/groups/invalid-id" \
  -H "Authorization: Bearer <token>"
```

**Response** (404 Not Found):
```json
{
  "code": "NOT_FOUND",
  "message": "Group not found",
  "timestamp": "2024-04-24T15:04:29Z",
  "requestId": "req-123"
}
```

## Postman Collection

A complete Postman collection is available for testing the API:

```json
{
  "info": {
    "name": "Ajo API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"walletAddress\": \"...\", \"signature\": \"...\", \"message\": \"...\"}"
            }
          }
        }
      ]
    }
  ]
}
```

## Support

For API support and questions:
- Email: support@ajo.app
- Documentation: https://docs.ajo.app
- GitHub Issues: https://github.com/Christopherdominic/soroban-ajo/issues
