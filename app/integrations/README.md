# Integration UI Flows

This directory contains the user-facing pages for cloud provider integrations. Users can connect their cloud accounts via OAuth, then manage databases, deployments, and other resources through intuitive UI components.

## Directory Structure

```
app/integrations/
├── README.md                           # This file
├── test/
│   └── page.tsx                        # Integration dashboard (720 lines)
└── vercel/
    └── success/
        └── page.tsx                    # OAuth success page with navigation cards
```

## Pages Overview

### 1. OAuth Success Page (`/integrations/vercel/success`)

**Purpose:** Post-OAuth landing page that confirms successful connection and provides navigation to key features.

**Route:** `/integrations/vercel/success`

**Features:**
- ✅ Success confirmation with CheckCircle2 icon
- ✅ Integration details display (provider, status, permissions)
- ✅ Navigation cards to:
  - **Create a Database** → `/integrations/test#databases`
  - **Create a Deployment** → `/integrations/test#deployments`
- ✅ "Continue to Dashboard" button

**Component Structure:**
```tsx
<div className="min-h-screen bg-gradient-to-br from-background to-muted">
  {/* Success Header */}
  <div className="text-center">
    <CheckCircle2 icon />
    <h1>Successfully Connected!</h1>
    <p>Your Vercel account is now integrated</p>
  </div>

  {/* Navigation Cards */}
  <Card>
    <button onClick={() => router.push('/integrations/test#databases')}>
      <Database icon />
      <h3>Create a Database</h3>
      <p>Provision a Postgres database on Vercel</p>
    </button>

    <button onClick={() => router.push('/integrations/test#deployments')}>
      <Rocket icon />
      <h3>Create a Deployment</h3>
      <p>Deploy a test site or application</p>
    </button>
  </Card>

  {/* Integration Details */}
  <Card>
    <div>Provider: Vercel</div>
    <div>Status: Connected</div>
    <div>Permissions: Database & Deployment Management</div>
  </Card>
</div>
```

**Design Patterns:**
- Gradient background (`from-background to-muted`)
- Interactive cards with hover effects (`hover:border-primary hover:shadow-lg`)
- Icon animations on hover (`group-hover:scale-110`)
- Arrow animations on hover (`group-hover:translate-x-1`)

---

### 2. Integration Dashboard (`/integrations/test`)

**Purpose:** Comprehensive dashboard for testing and managing Vercel integrations. Includes database provisioning, deployment management, and real-time status monitoring.

**Route:** `/integrations/test`

**Sections:**
1. **Connection Management** - Connect/disconnect Vercel account
2. **Database Management** (#databases) - Create, list, delete Postgres databases
3. **Deployment Management** (#deployments) - Deploy sites, monitor status, view deployments

---

## Section 1: Connection Management

**Features:**
- Display active integrations
- "Connect Vercel" button with OAuth flow
- Disconnect with confirmation

**UI Components:**
```tsx
{/* No integrations */}
<Alert>
  <XCircle icon />
  <AlertTitle>No Vercel Integration</AlertTitle>
  <Button onClick={handleConnect}>Connect Vercel</Button>
</Alert>

{/* Connected */}
<Card>
  <Badge>Connected</Badge>
  <div>Provider: Vercel</div>
  <div>Connected: {date}</div>
  <Button onClick={handleDisconnect}>Disconnect</Button>
</Card>
```

**OAuth Flow:**
1. Click "Connect Vercel"
2. Redirect to `/api/integrations/vercel/auth-url`
3. User authorizes on Vercel
4. Redirect to `/api/integrations/vercel/callback`
5. Tokens encrypted and stored
6. Redirect to `/integrations/vercel/success`

---

## Section 2: Database Management

**ID Anchor:** `#databases`

**Features:**
- ✅ Create Postgres database with name and region selection
- ✅ List all databases with status badges
- ✅ Delete database with confirmation dialog
- ✅ Refresh database list
- ✅ Real-time status updates

### Create Database Form

```tsx
<Card id="databases">
  <CardHeader>
    <DatabaseIcon />
    <CardTitle>Create Vercel Database</CardTitle>
  </CardHeader>
  <CardContent>
    <Label>Database Name</Label>
    <Input
      value={dbName}
      onChange={(e) => setDbName(e.target.value)}
      placeholder="my-database"
    />

    <Label>Region</Label>
    <Select value={dbRegion} onValueChange={setDbRegion}>
      <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
      <SelectItem value="us-west-1">US West (N. California)</SelectItem>
      <SelectItem value="eu-west-1">EU West (Ireland)</SelectItem>
      {/* ... */}
    </Select>

    <Button onClick={handleCreateDatabase}>
      Create Database
    </Button>
  </CardContent>
</Card>
```

**Available Regions:**
- `us-east-1` - US East (N. Virginia)
- `us-west-1` - US West (N. California)
- `eu-west-1` - EU West (Ireland)
- `ap-southeast-1` - Asia Pacific (Singapore)
- `ap-northeast-1` - Asia Pacific (Tokyo)

### Database List Table

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Region</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Created</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {databases.map(db => (
      <TableRow key={db.id}>
        <TableCell>{db.name}</TableCell>
        <TableCell>{db.region}</TableCell>
        <TableCell>
          <Badge variant={statusVariant}>
            {db.status}
          </Badge>
        </TableCell>
        <TableCell>{formatDate(db.createdAt)}</TableCell>
        <TableCell>
          <Button onClick={() => openDeleteDialog(db)}>
            <Trash2 />
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Status Badges:**
- `creating` - Yellow badge, "Creating..."
- `active` - Green badge with checkmark
- `error` - Red badge with X icon

### Delete Confirmation Dialog

```tsx
<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Database?</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete "{databaseToDelete?.name}".
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirmDelete}>
        Delete Database
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Data Flow:**
```typescript
// Create database mutation
const createDb = useMutation(
  orpc.integrations.createVercelDatabase.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.integrations.listVercelDatabases.key(),
      });
      setDbName('');
    },
  })
);

// List databases query
const { data: databases, refetch } = useQuery(
  orpc.integrations.listVercelDatabases.queryOptions({
    input: { integrationId: integration.id },
  })
);

// Delete mutation
const deleteDb = useMutation(
  orpc.integrations.deleteVercelDatabase.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.integrations.listVercelDatabases.key(),
      });
    },
  })
);
```

---

## Section 3: Deployment Management

**ID Anchor:** `#deployments`

**Features:**
- ✅ Create deployment with template selection
- ✅ Real-time status polling (3-second intervals)
- ✅ Display deployment URL and inspector link
- ✅ List all deployments with status badges
- ✅ External links to live sites

### Create Deployment Form

```tsx
<Card id="deployments">
  <CardHeader>
    <Rocket />
    <CardTitle>Create Vercel Deployment</CardTitle>
  </CardHeader>
  <CardContent>
    <Label>Deployment Name</Label>
    <Input
      value={deploymentName}
      onChange={(e) => setDeploymentName(e.target.value)}
      placeholder="my-deployment"
    />

    <Label>Template</Label>
    <Select value={deploymentTemplate} onValueChange={setDeploymentTemplate}>
      <SelectItem value="static">Static HTML (Instant)</SelectItem>
      <SelectItem value="nextjs-hello-world">Next.js Hello World</SelectItem>
    </Select>

    <Button onClick={handleCreateDeployment}>
      Create Deployment
    </Button>
  </CardContent>
</Card>
```

**Available Templates:**

1. **Static HTML (Instant)**
   - Base64-encoded HTML file
   - Gradient design with project name
   - Instant deployment (no build step)
   - Framework: `static`

2. **Next.js Hello World**
   - Deployed from `vercel/next.js` repository
   - Path: `examples/hello-world`
   - Branch: `canary`
   - Framework: `nextjs`

### Real-Time Status Display

```tsx
{currentDeployment && (
  <Alert>
    <h4>Deployment: {currentDeployment.name}</h4>
    <div>Status:
      <Badge variant={statusVariant}>
        {currentDeployment.readyState === 'BUILDING' && <Loader2 className="animate-spin" />}
        {currentDeployment.readyState}
      </Badge>
    </div>
    {currentDeployment.readyState === 'READY' && (
      <div>
        <a href={`https://${currentDeployment.url}`} target="_blank">
          View Live Site <ExternalLink />
        </a>
        {currentDeployment.inspectorUrl && (
          <a href={currentDeployment.inspectorUrl} target="_blank">
            Open Inspector <ExternalLink />
          </a>
        )}
      </div>
    )}
  </Alert>
)}
```

**Status Badge Variants:**
- `QUEUED` - Secondary (gray)
- `BUILDING` - Default (blue) with spinning loader
- `READY` - Success (green) with checkmark
- `ERROR` - Destructive (red) with X icon
- `CANCELED` - Secondary (gray)

### Status Polling Implementation

```typescript
// Poll every 3 seconds while building
const { data: deployment } = useQuery({
  ...orpc.integrations.getVercelDeploymentStatus.queryOptions({
    input: {
      integrationId: integration.id,
      deploymentId: currentDeployment.id,
    },
  }),
  refetchInterval: currentDeployment?.readyState === 'BUILDING' ? 3000 : false,
  enabled: !!currentDeployment,
});

// Update current deployment when status changes
useEffect(() => {
  if (deployment) {
    setCurrentDeployment(deployment);
  }
}, [deployment]);
```

### Deployment List Table

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>URL</TableHead>
      <TableHead>Created</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {deployments.map(deployment => (
      <TableRow key={deployment.id}>
        <TableCell>{deployment.name}</TableCell>
        <TableCell>
          <Badge variant={getStatusVariant(deployment.readyState)}>
            {deployment.readyState}
          </Badge>
        </TableCell>
        <TableCell>
          <a href={`https://${deployment.url}`} target="_blank">
            {deployment.url} <ExternalLink />
          </a>
        </TableCell>
        <TableCell>{formatDate(deployment.createdAt)}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Data Flow:**
```typescript
// Create deployment mutation
const createDeployment = useMutation(
  orpc.integrations.createVercelDeployment.mutationOptions({
    onSuccess: (deployment) => {
      setCurrentDeployment(deployment);
      queryClient.invalidateQueries({
        queryKey: orpc.integrations.listVercelDeployments.key(),
      });
    },
  })
);

// List deployments query
const { data: deploymentList } = useQuery(
  orpc.integrations.listVercelDeployments.queryOptions({
    input: { integrationId: integration.id },
  })
);
```

---

## Key UI Patterns

### 1. Loading States

```tsx
{isLoading ? (
  <div className="flex items-center gap-2">
    <Loader2 className="animate-spin" />
    <span>Loading...</span>
  </div>
) : (
  <Content />
)}
```

### 2. Error States

```tsx
{isError && (
  <Alert variant="destructive">
    <XCircle />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
)}
```

### 3. Empty States

```tsx
{databases.length === 0 && (
  <div className="text-center py-8 text-muted-foreground">
    <DatabaseIcon className="mx-auto mb-4" />
    <p>No databases yet</p>
    <Button onClick={() => setShowCreateForm(true)}>
      Create Your First Database
    </Button>
  </div>
)}
```

### 4. Optimistic Updates

```tsx
const mutation = useMutation(
  orpc.integrations.deleteVercelDatabase.mutationOptions({
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData(listKey);

      // Optimistically remove from list
      queryClient.setQueryData(listKey, (old) =>
        old.filter(db => db.id !== variables.databaseId)
      );

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(listKey, context.previous);
    },
  })
);
```

### 5. Confirmation Dialogs

Always use `AlertDialog` for destructive actions:

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirm}>
        Continue
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Styling Conventions

### Color Palette

```css
/* Status Colors */
--creating: hsl(var(--warning))     /* Yellow */
--active: hsl(var(--success))       /* Green */
--error: hsl(var(--destructive))    /* Red */
--queued: hsl(var(--muted))         /* Gray */
--building: hsl(var(--primary))     /* Blue */
```

### Animations

```tsx
/* Hover Effects */
className="transition-all hover:shadow-lg hover:scale-105"

/* Icon Spin */
<Loader2 className="animate-spin" />

/* Arrow Slide */
<ArrowRight className="group-hover:translate-x-1 transition-transform" />

/* Icon Scale */
<Icon className="group-hover:scale-110 transition-transform" />
```

### Gradients

```tsx
/* Page Background */
className="bg-gradient-to-br from-background to-muted"

/* Card Accent */
className="bg-gradient-to-r from-primary/10 to-primary/5"
```

---

## Accessibility

### Keyboard Navigation
- All interactive elements focusable
- Tab order follows visual flow
- Enter/Space activate buttons
- Escape closes dialogs

### Screen Readers
- Proper heading hierarchy (h1 → h2 → h3)
- `aria-label` on icon-only buttons
- `aria-describedby` for form fields
- Loading states announced

### Visual Indicators
- Focus rings on all interactive elements
- Status colors also have icons (not color-only)
- Sufficient contrast ratios
- Loading spinners for async operations

---

## Related Documentation

- **lib/integrations/README.md** - Backend integration system architecture
- **lib/api/routers/integrations.ts** - oRPC procedures implementation
- **CLAUDE.md** - Vercel integration patterns and configuration
- **docs/vercel-integration-guide.md** - Complete setup and usage guide
