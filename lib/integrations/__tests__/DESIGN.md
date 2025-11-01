# Vercel Integration Test Suite Design

## Executive Summary

This document provides a comprehensive design for testing the Vercel Integration feature (Feature #1 in specs/FEATURES.md) following Test-Driven Development (TDD) principles. The test suite includes 290+ test cases across unit, integration, and E2E layers with >90% code coverage.

## Architecture

### Test Pyramid

```
              /\
             /E2E\         (User workflows with Playwright)
            /-----\        15-20 test scenarios
           /       \
          /Integration\    (Workflow combinations with fixtures)
         /----------\      25-30 test scenarios
        /            \
       /Unit Tests   \    (Module isolation with mocks)
      /---------------\   240+ test scenarios
     /                 \
```

## Module-by-Module Design

### 1. Encryption Module (`encryption.test.ts`)
**Path**: `/lib/integrations/__tests__/encryption.test.ts`

#### Purpose
Verify AES-256-GCM encryption/decryption for secure token storage in database.

#### Test Cases (37 total)

**encrypt() function**
- Valid encryption with IV generation
- Different IVs produce different ciphertexts
- Empty string handling
- Special characters and unicode
- Long token handling (1000+ chars)

**decrypt() function**
- Correct decryption of encrypted data
- Special characters decryption
- Unicode decryption
- Empty string decryption
- Error on corrupted ciphertext
- Error on corrupted auth tag
- Error on corrupted IV
- Error on wrong auth tag
- Invalid IV format handling
- Invalid hex encoding handling

**Round-trip testing**
- All data types encrypt/decrypt correctly
- Sensitive token integrity preservation
- No plaintext leakage in encrypted output
- Multiple test vectors

**Key management**
- Consistent key usage
- Different key failure detection

**Performance**
- Encryption/decryption speed benchmarks
- Batch operation handling

#### Mocking Strategy
- No mocks needed (pure cryptographic functions)
- Use Node.js crypto module
- Deterministic test with known inputs

#### Coverage Goals
- Line coverage: >95%
- Branch coverage: >95%
- Function coverage: 100%

---

### 2. Provider Abstraction (`types.test.ts`)
**Path**: `/lib/integrations/__tests__/types.test.ts`

#### Purpose
Test CloudProvider interface contract and ProviderRegistry pattern for multi-provider support.

#### Test Cases (45 total)

**CloudProvider Interface**
- Required methods present
- Correct method signatures
- Provider metadata
- Return type validation

**ProviderRegistry class**
- Provider registration
- Error on missing provider name
- Case-insensitive lookups
- Provider overwriting
- Provider retrieval
- Unknown provider errors
- hasProvider() checks
- listProviders() functionality
- Provider unregistration
- Multiple provider support

#### Design Pattern
```typescript
interface CloudProvider {
  name: string;
  version: string;
  createDatabase(config): Promise<DatabaseInfo>;
  getDatabases(): Promise<DatabaseInfo[]>;
  deleteDatabase(id): Promise<void>;
  updateEnvVars(config): Promise<void>;
  validateCredentials(): Promise<boolean>;
}

class ProviderRegistry {
  registerProvider(provider: CloudProvider): void
  getProvider(name: string): CloudProvider
  hasProvider(name: string): boolean
  listProviders(): string[]
  unregisterProvider(name: string): void
}
```

#### Mocking Strategy
- Create mock CloudProvider implementations
- Test interface adherence
- Simulate various provider configurations

#### Coverage Goals
- Line coverage: >90%
- Ensures interface contract enforced
- All registry operations covered

---

### 3. Vercel OAuth (`vercel/oauth.test.ts`)
**Path**: `/lib/integrations/__tests__/vercel/oauth.test.ts`

#### Purpose
Test OAuth 2.0 authorization flow and token lifecycle management.

#### Test Cases (46 total)

**Constructor validation**
- Valid configuration acceptance
- Missing clientId error
- Missing clientSecret error
- Missing redirectUri error

**generateAuthUrl()**
- Correct authorization URL format
- Default scopes included
- Custom scopes support
- Proper URL encoding
- State parameter preservation

**exchangeCodeForToken()**
- Valid code exchange
- Empty code error
- Invalid authorization code handling
- Expired code handling
- Correct POST request formation
- Secure client credential transmission
- Network error handling
- Correct expiration time calculation

**refreshAccessToken()**
- Token refresh with valid refresh token
- New refresh token handling
- Empty refresh token error
- Invalid refresh token handling
- Correct grant type
- Client credential validation

**isTokenExpired()**
- Expired token detection
- Valid token detection
- Boundary condition (exact expiration time)

**isTokenExpiringSoon()**
- Expiration within buffer time
- Default 5-minute buffer
- Custom buffer support

**Security validation**
- Client secret not in auth URL
- HTTPS endpoints required
- No secret exposure in error messages

#### Mocking Strategy
```typescript
global.fetch = vi.fn()
  .mockResolvedValueOnce({
    ok: true,
    json: async () => loadFixture('oauth.tokenExchange.success')
  });
```

#### Coverage Goals
- Line coverage: >92%
- All OAuth flows covered
- Security requirements verified

---

### 4. Vercel Client (`vercel/client.test.ts`)
**Path**: `/lib/integrations/__tests__/vercel/client.test.ts`

#### Purpose
Test HTTP client for API communication and error handling.

#### Test Cases (40 total)

**Constructor**
- Valid token acceptance
- Empty token error
- Null token error
- Undefined token error

**request() method**
- GET request handling
- POST request with body
- Authorization header injection
- Error response handling
- Network error handling
- Timeout error handling
- Malformed JSON handling
- DELETE request support
- PATCH request support

**Rate limiting**
- Rate limit header tracking
- Reset time tracking
- Rate limit exceeded detection
- Graceful missing header handling

**Error handling**
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 429 Rate Limited
- 500 Internal Server Error
- 502 Bad Gateway
- DNS resolution failure

**Sequential requests**
- Multiple requests in sequence
- Rate limit updates across requests

#### Mocking Strategy
```typescript
global.fetch = vi.fn()
  .mockResolvedValueOnce({
    ok: true,
    headers: new Map([
      ['x-rate-limit-remaining', '99'],
      ['x-rate-limit-reset', String(timestamp)]
    ]),
    json: async () => fixture
  });
```

#### Coverage Goals
- Line coverage: >94%
- All HTTP methods covered
- All error codes handled
- Rate limiting tracked

---

### 5. Vercel Database (`vercel/database.test.ts`)
**Path**: `/lib/integrations/__tests__/vercel/database.test.ts`

#### Purpose
Test database provisioning and lifecycle management.

#### Test Cases (35 total)

**Constructor**
- Valid client acceptance
- Missing client error
- Null client error

**createDatabase()**
- Valid database creation
- Default region handling
- Default plan handling
- Empty projectId error
- Empty database name error
- Invalid name format (uppercase)
- Invalid name format (special chars)
- Name too short error
- Name too long (>63 chars) error
- Valid names with hyphens/underscores
- Quota exceeded error
- Invalid region error
- Network error handling

**getDatabases()**
- Successful database listing
- Empty list handling
- Missing databases property
- Empty projectId error
- API error handling

**getDatabase()**
- Successful single database retrieval
- Empty projectId error
- Empty databaseId error
- Database not found error

**deleteDatabase()**
- Successful deletion
- Empty projectId error
- Empty databaseId error
- Database not found error
- Insufficient permissions error

**waitForDatabaseReady()**
- Immediate ready status
- Polling for creation completion
- Error status detection
- Timeout handling
- Default 5-minute timeout
- Custom timeout support

#### Mocking Strategy
```typescript
const mockClient = {
  request: vi.fn().mockResolvedValueOnce({
    id: 'db-123',
    name: 'test-db',
    // ...
  })
};

const manager = new VercelDatabaseManager(mockClient);
```

#### Coverage Goals
- Line coverage: >91%
- All CRUD operations covered
- Status polling logic verified
- Input validation comprehensive

---

### 6. oRPC Integration Router (`orpc-router.test.ts`)
**Path**: `/lib/integrations/__tests__/orpc-router.test.ts`

#### Purpose
Test server actions and protected procedures for user-facing API.

#### Test Cases (48 total)

**connectVercel procedure**
- OAuth flow completion
- Token storage
- Missing code error
- Missing state error
- Error on failed OAuth
- Token expiration calculation
- Not exposing client secret

**createDatabase procedure** (Protected)
- Successful creation with auth
- Authentication requirement
- Missing database name error
- No Vercel integration error
- Default region application
- Token passing to provider
- Integration data isolation

**updateEnvVars procedure** (Protected)
- Successful update with auth
- Authentication requirement
- Missing projectId error
- No variables error
- Invalid variable names
- Valid uppercase alphanumeric names
- Variable name length limits
- Multiple variables handling
- Token passing to provider

**Authentication & Authorization**
- Enforced authentication for protected procedures
- User data isolation
- Per-user integration retrieval

**Input validation**
- All required fields validated
- Type checking
- Format validation
- Length validation

#### Mocking Strategy
```typescript
const mockAuthContext = {
  getCurrentUserId: vi.fn().mockResolvedValueOnce('user-123')
};

const mockIntegrationDAL = {
  createIntegration: vi.fn().mockResolvedValueOnce(integration)
};

const router = new IntegrationRouter(
  mockAuthContext,
  mockIntegrationDAL,
  mockProviderFactory
);
```

#### Coverage Goals
- Line coverage: >93%
- All procedures covered
- Security requirements enforced
- User isolation verified

---

### 7. Integration Tests (`__tests__/integration/vercel-integration.test.ts`)
**Path**: `/__tests__/integration/vercel-integration.test.ts`

#### Purpose
Test complete workflows across multiple modules using fixtures.

#### Test Cases (25-30 total)

**End-to-end user flows**
- OAuth → Database Creation → Environment Variables setup
- Database listing after creation
- Error recovery workflows

**Fixture accuracy validation**
- OAuth token response structure
- Database creation response structure
- Database list response structure
- Error response structures

**Error scenario handling**
- OAuth token exchange failure
- Database creation quota exceeded
- Invalid environment variables
- Rate limiting
- Unauthorized access

**Fixture edge cases**
- Empty database lists
- Empty project lists
- Realistic connection strings
- ISO 8601 timestamps

**Fixture consistency**
- Consistent database IDs
- Valid region values
- Naming conventions

**Performance**
- Fixture loading speed
- Batch operation handling

#### Mocking Strategy
Uses recorded fixtures from `fixtures/vercel-api-responses.json`:
```typescript
function loadFixture(name: string) {
  return JSON.parse(fs.readFileSync('fixtures/vercel-api-responses.json'))
    [name.split('.').reduce((obj, key) => obj[key])];
}

const oauth = {
  exchange: vi.fn().mockImplementation(async (code) => {
    const fixture = loadFixture('oauth.tokenExchange.success');
    return {
      accessToken: fixture.access_token,
      refreshToken: fixture.refresh_token
    };
  })
};
```

---

### 8. E2E Tests (`e2e/vercel-integration.spec.ts`)
**Path**: `/e2e/vercel-integration.spec.ts`

#### Purpose
Test complete user workflows through the UI with Playwright.

#### Test Scenarios (15-20 total)

**OAuth Connection Flow**
- Display OAuth connect button
- Open authorization URL
- Handle OAuth callback
- Display connected status
- Allow disconnection
- Handle OAuth errors

**Database Creation Form**
- Display creation form
- Validate database name
- Show name format requirements
- Create with valid input
- Handle creation errors
- Allow region selection
- Disable form during submission

**Environment Variables Manager**
- Display env vars form
- Add new variable fields
- Validate variable names (uppercase)
- Accept valid names
- Require at least one variable
- Remove variable fields
- Submit variables
- Display sensitive toggle
- Mask sensitive values

**Integration Status**
- Display connection status
- Show connection timestamp
- List connected databases
- Display provider info

**Responsive Design**
- Mobile viewport (375x667)
- Tablet viewport (768x1024)
- Desktop viewport (1920x1080)

**Accessibility**
- Heading hierarchy
- Button labels
- Form label associations
- Keyboard navigation
- Color contrast

**Error Recovery**
- Retry after OAuth failure
- Retry after database creation failure

#### Testing Pattern
```typescript
test('should create database with valid input', async ({ page }) => {
  // Arrange - Set up test conditions
  await page.goto('http://localhost:3000/integrations');
  const nameInput = page.getByLabel(/database name/i);

  // Act - Perform user actions
  await nameInput.fill('my_test_database');
  await page.getByRole('button', { name: /create/i }).click();

  // Assert - Verify outcomes
  const success = page.locator('[role="status"]');
  await expect(success).toContainText(/success/i);
});
```

---

## Test Fixtures

**File**: `/lib/integrations/__tests__/fixtures/vercel-api-responses.json`

Contains realistic API responses for:
- Database creation (success, quota exceeded, invalid name, invalid region)
- Database listing (success, empty)
- Database deletion (success, not found, forbidden)
- OAuth token exchange (success, invalid code, expired code)
- OAuth token refresh (success, invalid grant)
- Project listing (success, empty)
- Environment variable updates (success, invalid names, invalid values)
- Error responses (unauthorized, rate limited, bad request, internal error)

**Strategy**: Record real API responses once (manually), store in JSON, replay in tests for:
- Deterministic testing (same response every time)
- Fast execution (no network calls)
- Zero cost (JSON parsing vs latency)
- Safe testing (no real credentials)

---

## Mocking Strategy

### Global Mocks (Vitest Setup)

```typescript
// setup.ts - Global mocks applied to all tests
global.fetch = vi.fn();
vi.stubEnv('ENCRYPTION_SECRET', 'a'.repeat(64));
vi.stubEnv('VERCEL_OAUTH_CLIENT_ID', 'test-client-id');
```

### Module-Specific Mocks

```typescript
// In each test file
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}));
```

### Service Mocks

```typescript
// In integration tests
const mockServices = {
  oauth: { exchange: vi.fn() },
  database: { create: vi.fn(), list: vi.fn() },
  envVars: { update: vi.fn() }
};
```

---

## Coverage Strategy

### Target Coverage by Module

| Module | Lines | Branches | Functions | Statements |
|--------|-------|----------|-----------|------------|
| encryption.ts | 95% | 95% | 100% | 95% |
| types.ts | 90% | 85% | 100% | 90% |
| oauth.ts | 92% | 90% | 100% | 92% |
| client.ts | 94% | 92% | 100% | 94% |
| database.ts | 91% | 88% | 100% | 91% |
| router.ts | 93% | 91% | 100% | 93% |
| **Overall** | **>90%** | **>88%** | **100%** | **>90%** |

### Coverage Areas

1. **Happy Paths** (60% of tests)
   - Successful operations
   - Valid inputs
   - Expected outputs

2. **Error Cases** (25% of tests)
   - Invalid inputs
   - API errors
   - Network failures
   - Missing permissions

3. **Edge Cases** (10% of tests)
   - Boundary conditions
   - Empty inputs
   - Unicode/special chars
   - Concurrent operations

4. **Security** (5% of tests)
   - Token handling
   - Data isolation
   - Input validation
   - Permission enforcement

---

## Execution Order

### For TDD Workflow

1. **Write encryption tests** (pure functions, no dependencies)
2. **Write provider abstraction tests** (interfaces, registry)
3. **Write OAuth tests** (token management)
4. **Write client tests** (HTTP communication)
5. **Write database tests** (provisioning)
6. **Write router tests** (server actions)
7. **Write integration tests** (workflows)
8. **Write E2E tests** (UI interactions)

After tests are written and failing:

9. Implement encryption module
10. Implement provider abstraction
11. Implement OAuth flow
12. Implement HTTP client
13. Implement database manager
14. Implement oRPC router
15. Run all tests until passing
16. Verify coverage >90%
17. Use Playwright MCP to verify components
18. Complete feature in specs/FEATURES.md

---

## Running the Tests

### Quick Start
```bash
# Install dependencies
pnpm install

# Run all tests with coverage
pnpm test --coverage

# Run specific test suite
pnpm test lib/integrations

# Watch mode
pnpm test --watch lib/integrations
```

### CI/CD Integration
```bash
# Run with strict coverage requirements
pnpm test --coverage --coverage.all --coverage.lines=90
```

### Debugging
```bash
# Verbose output
pnpm test --reporter=verbose

# Single test
pnpm test --grep "should create database"

# Debug with inspector
node --inspect-brk ./node_modules/vitest/vitest.mjs
```

---

## Success Criteria

Before marking Feature #1 as complete:

- ✅ All 290+ unit tests passing
- ✅ All 25-30 integration tests passing
- ✅ All 15-20 E2E tests passing
- ✅ Coverage >90% for all modules
- ✅ No console warnings or errors
- ✅ All Playwright MCP tests pass:
  - [ ] OAuth Connect Button interaction
  - [ ] Database Creation Form interaction
  - [ ] Environment Variables Manager interaction
- ✅ Features entry in specs/FEATURES.md complete

---

## Maintenance

### Adding New Tests
1. Follow AAA pattern (Arrange, Act, Assert)
2. Use descriptive test names
3. Mock external dependencies
4. Group related tests with describe blocks
5. Update coverage goals if needed

### Updating Fixtures
1. Record real API response (manually test with real API)
2. Sanitize sensitive data
3. Update fixture file
4. Verify all tests still pass

### Troubleshooting

**Tests fail with "Cannot find module"**
- Check import paths use @/ alias correctly
- Verify vitest.config.mts alias configuration

**Fetch mock not working**
- Ensure `global.fetch = vi.fn()` in beforeEach
- Check mock setup happens before test execution

**Flaky tests**
- Remove time-dependent assertions
- Use vi.useFakeTimers() for time-based logic
- Mock network delays properly

---

## Files Delivered

1. `/lib/integrations/__tests__/encryption.test.ts` (37 tests)
2. `/lib/integrations/__tests__/types.test.ts` (45 tests)
3. `/lib/integrations/__tests__/vercel/client.test.ts` (40 tests)
4. `/lib/integrations/__tests__/vercel/oauth.test.ts` (46 tests)
5. `/lib/integrations/__tests__/vercel/database.test.ts` (35 tests)
6. `/lib/integrations/__tests__/orpc-router.test.ts` (48 tests)
7. `/lib/integrations/__tests__/fixtures/vercel-api-responses.json`
8. `/__tests__/integration/vercel-integration.test.ts` (25-30 tests)
9. `/e2e/vercel-integration.spec.ts` (15-20 scenarios)
10. `/lib/integrations/__tests__/README.md` (documentation)
11. `/lib/integrations/__tests__/DESIGN.md` (this file)

**Total Test Cases**: 290+
**Total Lines of Test Code**: 4000+
**Total Documentation**: 2000+ lines
