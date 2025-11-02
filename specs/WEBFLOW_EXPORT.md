Webflow Component Export - MVP Implementation Plan

 Overview

 Modular serverless system for exporting selected Webflow components with three swappable layers:
 1. Build Provider (Vercel Functions → AWS Lambda)
 2. Webflow Auth (Manual Token → OAuth)
 3. Component Discovery (Filesystem → Database Registry)

 ---
 Architecture

 1. Build Provider Interface (lib/integrations/build-providers/types.ts)

 interface BuildProvider {
   name: 'vercel' | 'aws-lambda';
   buildComponents(config: BuildConfig): Promise<BuildResult>;
   supportsStreaming: boolean;
 }
 Implementations: VercelBuildProvider, AWSLambdaBuildProvider (future)

 2. Webflow Auth Interface (lib/integrations/webflow/auth/types.ts)

 interface WebflowAuthProvider {
   name: 'manual-token' | 'oauth';
   getToken(userId: string): Promise<string>;
   saveToken(userId: string, token: string): Promise<void>;
   revokeToken(userId: string): Promise<void>;
 }
 Implementations:
 - ManualTokenProvider - Manual entry with encrypted storage (MVP)
 - WebflowOAuthProvider - OAuth flow (future)

 3. Component Discovery Interface (lib/integrations/webflow/discovery/types.ts)

 interface ComponentDiscovery {
   name: 'filesystem' | 'database';
   listComponents(): Promise<WebflowComponent[]>;
   getComponentFiles(componentIds: string[]): Promise<ComponentFiles>;
   getDependencies(componentId: string): Promise<string[]>;
 }

 interface WebflowComponent {
   id: string;
   name: string;
   path: string;
   dependencies: string[];
 }
 Implementations:
 - FilesystemDiscovery - Glob-based scanning (MVP)
 - DatabaseDiscovery - Registry-based lookup (future)

 ---
 Webflow Token Storage (Manual Token MVP)

 Reuse existing integrations table:
 - Provider: 'webflow'
 - Store encrypted workspace API token
 - Fields: accessToken, accessTokenIv, accessTokenAuthTag

 ManualTokenProvider implementation:
 class ManualTokenProvider implements WebflowAuthProvider {
   async getToken(userId: string): Promise<string> {
     // Fetch from integrations table + decrypt
   }

   async saveToken(userId: string, token: string): Promise<void> {
     // Encrypt + store in integrations table
   }

   async revokeToken(userId: string): Promise<void> {
     // Delete from integrations table
   }
 }

 ---
 Component Discovery (Filesystem MVP)

 FilesystemDiscovery implementation:
 class FilesystemDiscovery implements ComponentDiscovery {
   async listComponents(): Promise<WebflowComponent[]> {
     // Scan ./src/**/*.webflow.tsx using glob
     // Parse metadata and dependencies
   }

   async getComponentFiles(componentIds: string[]): Promise<ComponentFiles> {
     // Return file paths for selected components + dependencies
   }

   async getDependencies(componentId: string): Promise<string[]> {
     // Parse imports and return dependency list
   }
 }

 ---
 Backend APIs (oRPC Router)

 lib/api/routers/webflow.ts:
 - saveWebflowToken({ token }) - Uses ManualTokenProvider to encrypt and store
 - getWebflowToken() - Check if user has token stored (returns boolean only)
 - revokeWebflowToken() - Delete stored token
 - listWebflowComponents() - Uses FilesystemDiscovery to scan and return components
 - exportComponents({ componentIds }) - Main export procedure:
   - Uses ManualTokenProvider to get decrypted token
   - Uses FilesystemDiscovery to get component files
   - Uses VercelBuildProvider to build and deploy
   - Returns build logs and success status

 ---
 Build Execution (Single Job - 300s timeout)

 /tmp/webflow-export-{nanoid()}/
 ├── src/
 │   └── components/
 │       ├── Component1.tsx
 │       ├── Component1.webflow.tsx
 │       └── ...
 ├── webflow.json (filtered)
 ├── webpack.webflow.js (copied)
 ├── package.json (copied)
 └── node_modules/ (symlinked for speed)

 Build steps:
 1. FilesystemDiscovery.getComponentFiles() → copy selected files
 2. Generate filtered webflow.json
 3. Run webpack build
 4. Execute npx webflow library share --api-token {token} --no-input
 5. Return logs and success status

 ---
 Frontend UI (app/integrations/webflow/page.tsx)

 Token Setup Card (if no token stored)

 - Input field for Webflow workspace API token
 - Save button → calls saveWebflowToken()
 - Info tooltip: "Get your token from Webflow Account Settings"
 - Success/error feedback

 Component Selection Card

 - Checkbox list from listWebflowComponents()
 - "Select All" / "Deselect All"
 - Dependency badges (e.g., "Requires: Button, Card")
 - Search/filter components

 Export Card

 - Export button (disabled if no components selected)
 - Calls exportComponents({ componentIds })
 - Real-time build logs display
 - Success message with Webflow dashboard link
 - Error display with detailed logs

 ---
 Development Workflow (FEATURES.md Protocol)

 Feature Entry in specs/FEATURES.md:

 ## 3. Webflow Component Export System
 - [ ] Unit tests have been written
 - [ ] E2E tests for user workflows have been written (including all button clicks and component
 interactions)
 - [ ] Feature has been implemented
 - [ ] ALL E2E tests and unit tests pass
 - [ ] Every new component has been successfully interacted with using Playwright MCP:
   - [ ] Token entry form
   - [ ] Component selection checklist
   - [ ] Export button and progress display

 MANDATORY Agent Usage (NO EXCEPTIONS):

 1. test-architect agent - Design test coverage BEFORE implementation
 2. code-evaluator agent - Validate during and after implementation
 3. project-structure-documenter agent - Update docs after completion

 Implementation Steps:

 1. Add feature to FEATURES.md
 2. Use test-architect agent → design comprehensive tests
 3. Write unit tests (TDD approach)
 4. Write E2E tests (full user workflows)
 5. Implement interfaces (BuildProvider, WebflowAuthProvider, ComponentDiscovery)
 6. Implement MVP providers (Vercel, ManualToken, Filesystem)
 7. Implement backend (oRPC procedures)
 8. Implement frontend (token form, component selector, export UI)
 9. Use code-evaluator agent after each phase
 10. Use Playwright MCP to test each UI component
 11. Run all tests until passing
 12. Use project-structure-documenter agent
 13. Mark all sub-tasks complete in FEATURES.md
 14. Commit changes

 ---
 Implementation Phases

 Phase 1: Core Interfaces

 - Define BuildProvider interface
 - Define WebflowAuthProvider interface
 - Define ComponentDiscovery interface
 - Estimated time: 30-45 min

 Phase 2: Manual Token Provider

 - Implement ManualTokenProvider
 - Extend integrations table with 'webflow' provider
 - Add oRPC procedures: saveWebflowToken(), getWebflowToken(), revokeWebflowToken()
 - Estimated time: 45-60 min

 Phase 3: Filesystem Discovery

 - Implement FilesystemDiscovery
 - Component scanning with glob
 - Dependency parser (import analysis)
 - Add oRPC procedure: listWebflowComponents()
 - Estimated time: 60-90 min

 Phase 4: Vercel Build Provider

 - Implement VercelBuildProvider
 - Build isolation logic (temp directory)
 - Webpack compilation wrapper
 - Webflow CLI execution
 - Estimated time: 60-90 min

 Phase 5: Export Orchestration

 - Add oRPC procedure: exportComponents()
 - Integrate all three providers
 - Log streaming/collection
 - Error handling and cleanup
 - Estimated time: 60-90 min

 Phase 6: Frontend UI

 - Token setup form with encrypted storage
 - Component selection checklist with dependencies
 - Export button with progress/logs display
 - Error handling and success feedback
 - Estimated time: 90-120 min

 Phase 7: Testing & Verification

 - Write unit tests for all interfaces and implementations
 - Write E2E tests for complete workflow
 - Use Playwright MCP to interact with each component
 - Fix all test failures
 - Estimated time: 120-180 min

 ---
 Modularity Benefits

 Build Provider (Vercel → AWS Lambda)

 - Swap by changing provider instance
 - Same interface, different execution environment
 - Zero changes to orchestration code

 Webflow Auth (Manual → OAuth)

 - Replace ManualTokenProvider with WebflowOAuthProvider
 - No changes to oRPC procedures (same interface)
 - Frontend swaps token form for OAuth button

 Component Discovery (Filesystem → Database)

 - Replace FilesystemDiscovery with DatabaseDiscovery
 - Enable component versioning, tagging, metadata
 - No changes to export logic

 ---
 Technical Constraints Addressed

 ✅ 300s Vercel timeout - Single job execution (no queue)✅ Modular build provider - Interface-based
 (Vercel → AWS Lambda)✅ Modular auth provider - Interface-based (Manual → OAuth)✅ Modular discovery -
  Interface-based (Filesystem → Database)✅ Encrypted token storage - Reuses existing AES-256-GCM✅
 Manual token entry - MVP implementation of auth interface✅ Filesystem-based - MVP implementation of
 discovery interface