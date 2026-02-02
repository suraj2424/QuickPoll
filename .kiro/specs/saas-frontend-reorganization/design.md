# Design Document: SaaS Frontend Reorganization

## Overview

This design transforms the QuickPoll frontend from a simple polling application into a comprehensive SaaS platform with role-based access control, organized analytics, and administrative capabilities. The architecture emphasizes clear separation between user-facing features, analytics, and admin functionality while maintaining a cohesive user experience.

The design introduces a three-tier navigation structure (Main, Analytics, Admin), implements role-based authorization at both frontend and backend layers, and reorganizes existing components into logical feature groups. The system will support two user roles (user and admin) with appropriate UI/UX flows for each.

## Architecture

### Application Structure

```
frontend/
├── app/
│   ├── (app)/                    # Authenticated app routes
│   │   ├── layout.tsx            # Main app layout with sidebar
│   │   ├── dashboard/            # Personal user dashboard
│   │   ├── explore/              # Poll discovery and browsing
│   │   ├── create-poll/          # Poll creation
│   │   ├── analytics/            # Platform analytics (NEW)
│   │   ├── admin/                # Admin panel (NEW)
│   │   │   ├── page.tsx          # Admin dashboard
│   │   │   ├── users/            # User management
│   │   │   └── moderation/       # Content moderation
│   │   └── settings/             # User settings (NEW)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   ├── admin/                    # Admin-specific components (NEW)
│   │   ├── UserManagementTable.tsx
│   │   ├── RoleChangeDialog.tsx
│   │   ├── ModerationPanel.tsx
│   │   └── AdminStats.tsx
│   ├── analytics/                # Analytics components (NEW)
│   │   ├── PlatformMetrics.tsx
│   │   ├── TrendCharts.tsx
│   │   └── TopPerformers.tsx
│   ├── dashboard/                # Personal dashboard components
│   ├── layout/
│   │   ├── AppSidebar.tsx        # Enhanced with sections
│   │   └── MobileNav.tsx         # Mobile navigation (NEW)
│   └── ...
├── context/
│   ├── AuthContext.tsx           # Enhanced with role support
│   └── AdminContext.tsx          # Admin-specific state (NEW)
├── hooks/
│   ├── useAdmin.ts               # Admin operations (NEW)
│   └── useRoleCheck.ts           # Role verification (NEW)
└── lib/
    ├── admin-api.ts              # Admin API calls (NEW)
    └── rbac.ts                   # Role-based access control (NEW)
```

### Backend Structure Updates

```
backend/
├── app/
│   ├── models/
│   │   └── user.py               # Add role field
│   ├── routes/
│   │   ├── users.py              # Add role management endpoints
│   │   └── admin.py              # Admin-specific routes (NEW)
│   ├── middleware/
│   │   └── auth.py               # Role verification middleware (NEW)
│   └── schemas/
│       └── user.py               # Add role to schemas
```

## Components and Interfaces

### 1. Enhanced Sidebar Navigation

**Component:** `AppSidebar.tsx`

The sidebar will be reorganized into three distinct sections with conditional rendering based on user role:

```typescript
interface NavSection {
  title: string;
  items: NavItem[];
  requiresRole?: 'admin';
}

interface NavItem {
  href: string;
  label: string;
  icon: IconComponent;
  requireAuth?: boolean;
  badge?: string | number;
}

const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/explore', label: 'Explore', icon: Compass },
      { href: '/create-poll', label: 'Create Poll', icon: PlusCircle, requireAuth: true },
    ]
  },
  {
    title: 'Analytics',
    items: [
      { href: '/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/analytics/trends', label: 'Trends', icon: TrendingUp },
    ]
  },
  {
    title: 'Admin',
    requiresRole: 'admin',
    items: [
      { href: '/admin', label: 'Admin Panel', icon: Shield },
      { href: '/admin/users', label: 'User Management', icon: Users },
      { href: '/admin/moderation', label: 'Moderation', icon: Flag },
    ]
  }
];
```

**Features:**
- Section headers with visual separation
- Conditional rendering of admin section
- Active state highlighting
- Badge support for notifications
- Responsive collapse on mobile

### 2. Role-Based Access Control

**Module:** `lib/rbac.ts`

```typescript
type UserRole = 'user' | 'admin';

interface RBACConfig {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

// Route protection configuration
const routeProtection: Record<string, RBACConfig> = {
  '/admin': { allowedRoles: ['admin'], redirectTo: '/dashboard' },
  '/admin/*': { allowedRoles: ['admin'], redirectTo: '/dashboard' },
};

// Check if user has required role
function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

// Higher-order component for route protection
function withRoleProtection(
  Component: React.ComponentType,
  config: RBACConfig
): React.ComponentType;
```

### 3. Admin Dashboard

**Page:** `app/(app)/admin/page.tsx`

The admin dashboard provides a comprehensive overview of platform health and quick access to administrative functions:

**Sections:**
1. **Platform Overview**
   - Total users (with growth indicator)
   - Active polls count
   - Total votes today
   - System health status

2. **Quick Actions**
   - User management
   - Content moderation
   - View reports
   - System settings

3. **Recent Admin Activity**
   - Role changes log
   - Content moderation actions
   - User registrations
   - System events

4. **Platform Metrics**
   - User growth chart (last 30 days)
   - Poll creation trends
   - Engagement rates
   - Active users timeline

### 4. User Management Interface

**Component:** `components/admin/UserManagementTable.tsx`

```typescript
interface UserManagementRow {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  pollsCreated: number;
  totalVotes: number;
}

interface UserManagementTableProps {
  users: UserManagementRow[];
  onRoleChange: (userId: number, newRole: 'user' | 'admin') => Promise<void>;
  onSearch: (query: string) => void;
  loading?: boolean;
}
```

**Features:**
- Searchable and sortable table
- Inline role change controls
- User statistics display
- Pagination support
- Bulk selection for batch operations
- Export user data functionality

### 5. Role Change Dialog

**Component:** `components/admin/RoleChangeDialog.tsx`

```typescript
interface RoleChangeDialogProps {
  user: {
    id: number;
    username: string;
    currentRole: 'user' | 'admin';
  };
  open: boolean;
  onClose: () => void;
  onConfirm: (userId: number, newRole: 'user' | 'admin') => Promise<void>;
}
```

**Features:**
- Confirmation dialog with user details
- Warning message for role changes
- Reason input field (optional)
- Loading state during API call
- Success/error feedback

### 6. Analytics Page

**Page:** `app/(app)/analytics/page.tsx`

Dedicated analytics page separated from the dashboard:

**Sections:**
1. **Platform Overview**
   - Total polls created
   - Total votes cast
   - Total users registered
   - Average engagement rate

2. **Vote Trends**
   - Line chart showing votes over time
   - Selectable time ranges (7d, 30d, 90d, all)
   - Comparison with previous period

3. **Top Performing Polls**
   - List of polls with highest engagement
   - Metrics: votes, likes, comments
   - Visual indicators for trending polls

4. **Category Breakdown**
   - Distribution of polls by category
   - Pie chart visualization
   - Engagement rates per category

5. **User Engagement**
   - Active users over time
   - Retention metrics
   - Participation rates

### 7. Personal Dashboard Redesign

**Page:** `app/(app)/dashboard/page.tsx`

Refocused on personal user activity:

**Sections:**
1. **Welcome Header**
   - Personalized greeting
   - Quick stats: your polls, votes received, likes received

2. **Your Polls**
   - List of user's created polls
   - Status indicators (active/closed)
   - Quick actions: view, edit, close

3. **Recent Activity**
   - Recent votes on your polls
   - Recent likes on your polls
   - Real-time updates via WebSocket

4. **Quick Actions**
   - Create new poll button
   - View analytics button
   - Explore polls button

### 8. Settings Page

**Page:** `app/(app)/settings/page.tsx`

```typescript
interface UserSettings {
  profile: {
    username: string;
    email: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
    pollNotifications: boolean;
  };
  security: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
}
```

**Sections:**
1. **Profile Settings**
   - Update username
   - Update email
   - Account information display

2. **Preferences**
   - Theme selection
   - Notification preferences
   - Language selection (future)

3. **Security**
   - Change password
   - Two-factor authentication (future)
   - Active sessions (future)

4. **Account Management**
   - Account deletion
   - Data export
   - Privacy settings

### 9. Content Moderation Panel

**Component:** `components/admin/ModerationPanel.tsx`

```typescript
interface ModerationItem {
  id: number;
  type: 'poll';
  title: string;
  creator: string;
  createdAt: string;
  reportCount?: number;
  status: 'active' | 'flagged' | 'removed';
}

interface ModerationPanelProps {
  items: ModerationItem[];
  onClose: (itemId: number) => Promise<void>;
  onDelete: (itemId: number) => Promise<void>;
  onFlag: (itemId: number) => Promise<void>;
  onUnflag: (itemId: number) => Promise<void>;
}
```

**Features:**
- Filter by status (all, flagged, removed)
- Bulk moderation actions
- Moderation reason input
- Audit trail for actions
- Preview of content before action

### 10. Admin Context Provider

**Context:** `context/AdminContext.tsx`

```typescript
interface AdminContextValue {
  users: UserManagementRow[];
  moderationQueue: ModerationItem[];
  platformStats: PlatformStats;
  loading: boolean;
  error: string | null;
  
  // User management
  fetchUsers: (filters?: UserFilters) => Promise<void>;
  changeUserRole: (userId: number, newRole: 'user' | 'admin') => Promise<void>;
  
  // Content moderation
  fetchModerationQueue: () => Promise<void>;
  moderateContent: (itemId: number, action: ModerationAction) => Promise<void>;
  
  // Platform stats
  fetchPlatformStats: () => Promise<void>;
}
```

## Data Models

### Enhanced User Model (Backend)

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=False)
    role = Column(String(20), default="user", nullable=False)  # NEW
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # relationships
    polls = relationship("Poll", back_populates="creator")
    votes = relationship("Vote", back_populates="user")
    likes = relationship("Like", back_populates="user")
```

### Frontend User Type

```typescript
interface AuthUser {
  userId: number;
  username: string;
  email: string;
  role: 'user' | 'admin';  // NEW
  createdAt: string;
}
```

### Admin Action Log Model (Backend - NEW)

```python
class AdminAction(Base):
    __tablename__ = "admin_actions"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action_type = Column(String(50), nullable=False)  # role_change, content_delete, etc.
    target_type = Column(String(50), nullable=False)  # user, poll, etc.
    target_id = Column(Integer, nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    admin = relationship("User", foreign_keys=[admin_id])
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Role-based route access

*For any* user attempting to access an admin route, if the user does not have admin role, then the system should redirect them to the dashboard page.

**Validates: Requirements 2.1**

### Property 2: Admin section visibility

*For any* authenticated user, the admin navigation section should be visible if and only if the user has admin role.

**Validates: Requirements 2.2, 2.5**

### Property 3: Role persistence

*For any* user role change operation, after the operation completes successfully, querying the user's information should return the updated role.

**Validates: Requirements 1.4, 1.5, 1.6**

### Property 4: Default role assignment

*For any* new user registration (without admin access code), the created user should have the "user" role.

**Validates: Requirements 1.2**

### Property 5: Admin access code validation

*For any* registration with an admin access code, if the code matches the configured value, then the created user should have admin role; otherwise, the user should have user role.

**Validates: Requirements 14.2, 14.3, 14.4**

### Property 6: Backend authorization enforcement

*For any* API request to an admin endpoint, if the requesting user does not have admin role, then the API should return a 403 Forbidden status.

**Validates: Requirements 2.3, 2.4**

### Property 7: Navigation section grouping

*For any* navigation item, it should belong to exactly one section (Main, Analytics, or Admin).

**Validates: Requirements 3.1, 3.6**

### Property 8: Personal dashboard data isolation

*For any* user viewing their dashboard, all displayed polls should be created by that user.

**Validates: Requirements 8.1**

### Property 9: Role change logging

*For any* admin role change operation, the system should create an audit log entry with the admin user, target user, and timestamp.

**Validates: Requirements 9.5**

### Property 10: Settings update validation

*For any* settings update request, if validation fails, then the system should not persist the changes and should display appropriate error messages.

**Validates: Requirements 11.6**

### Property 11: Activity feed user filtering

*For any* activity item displayed in a user's activity feed, the associated poll should be created by that user.

**Validates: Requirements 15.4**

### Property 12: Search result filtering

*For any* user search query in the admin panel, all returned users should have usernames, emails, or IDs that match the search query.

**Validates: Requirements 6.2**

### Property 13: Mobile navigation responsiveness

*For any* screen width below 768px, the sidebar should be hidden and a mobile navigation menu should be displayed.

**Validates: Requirements 10.1, 10.2**

## Error Handling

### Authentication Errors

1. **Unauthenticated Access**
   - Redirect to login modal
   - Preserve intended destination
   - Display appropriate message

2. **Unauthorized Access (403)**
   - Redirect to dashboard
   - Display "Access Denied" message
   - Log unauthorized attempt

### Admin Operation Errors

1. **Role Change Failures**
   - Display error message in dialog
   - Revert UI state
   - Log error details
   - Suggest retry or contact support

2. **User Not Found**
   - Display error message
   - Refresh user list
   - Handle gracefully without crash

3. **Concurrent Modification**
   - Detect stale data
   - Prompt user to refresh
   - Prevent conflicting updates

### API Errors

1. **Network Failures**
   - Display retry button
   - Cache failed requests
   - Implement exponential backoff

2. **Server Errors (500)**
   - Display user-friendly message
   - Log error details
   - Provide support contact

3. **Validation Errors (400)**
   - Display field-specific errors
   - Highlight invalid fields
   - Provide correction guidance

### State Management Errors

1. **Context Provider Missing**
   - Throw descriptive error
   - Guide developer to fix
   - Prevent silent failures

2. **Invalid State Transitions**
   - Log warning
   - Revert to safe state
   - Notify user if needed

## Testing Strategy

### Unit Testing

Unit tests will focus on specific components, utilities, and edge cases:

1. **RBAC Utilities**
   - Test `hasRole` function with various role combinations
   - Test route protection logic
   - Test role validation edge cases

2. **Component Rendering**
   - Test sidebar section rendering for different roles
   - Test admin component visibility
   - Test mobile navigation toggle

3. **Form Validation**
   - Test settings form validation rules
   - Test role change dialog validation
   - Test search input handling

4. **API Client Functions**
   - Test request formatting
   - Test error handling
   - Test response parsing

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using a JavaScript PBT library (fast-check):

**Configuration:**
- Minimum 100 iterations per property test
- Use fast-check library for JavaScript/TypeScript
- Tag format: `Feature: saas-frontend-reorganization, Property {number}: {property_text}`

**Test Categories:**

1. **Authorization Properties**
   - Generate random user objects with different roles
   - Verify route access rules hold for all users
   - Test admin section visibility across role combinations

2. **Role Management Properties**
   - Generate random role change operations
   - Verify role persistence after changes
   - Test default role assignment for new users

3. **Navigation Properties**
   - Generate random navigation states
   - Verify section grouping invariants
   - Test active state highlighting

4. **Data Filtering Properties**
   - Generate random user lists and search queries
   - Verify search results match query criteria
   - Test activity feed filtering

**Example Property Test:**

```typescript
// Feature: saas-frontend-reorganization, Property 1: Role-based route access
import fc from 'fast-check';

test('non-admin users are redirected from admin routes', () => {
  fc.assert(
    fc.property(
      fc.record({
        userId: fc.integer({ min: 1 }),
        username: fc.string({ minLength: 3 }),
        role: fc.constantFrom('user' as const),
      }),
      fc.constantFrom('/admin', '/admin/users', '/admin/moderation'),
      (user, adminRoute) => {
        const result = checkRouteAccess(user, adminRoute);
        expect(result.allowed).toBe(false);
        expect(result.redirectTo).toBe('/dashboard');
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

Integration tests will verify component interactions:

1. **Authentication Flow**
   - Test login with role retrieval
   - Test role-based navigation rendering
   - Test admin access after role change

2. **Admin Operations**
   - Test user role change end-to-end
   - Test content moderation flow
   - Test audit log creation

3. **Navigation Flow**
   - Test page transitions
   - Test active state updates
   - Test mobile navigation behavior

4. **Real-time Updates**
   - Test WebSocket activity feed updates
   - Test poll status changes
   - Test notification delivery

### End-to-End Testing

E2E tests will verify complete user journeys:

1. **User Journey**
   - Register → Create Poll → View Dashboard → Check Analytics

2. **Admin Journey**
   - Login as Admin → View Admin Panel → Change User Role → Moderate Content

3. **Mobile Journey**
   - Access on Mobile → Navigate via Hamburger Menu → Create Poll → View Results

## Implementation Notes

### Phase 1: Backend Role Support
1. Add role field to User model
2. Create database migration
3. Update user registration endpoint
4. Add role management endpoints
5. Implement admin middleware

### Phase 2: Frontend RBAC
1. Update AuthContext with role support
2. Create RBAC utilities
3. Implement route protection
4. Update sidebar with sections

### Phase 3: Admin Features
1. Create admin pages structure
2. Build user management interface
3. Implement role change functionality
4. Create moderation panel

### Phase 4: Analytics Reorganization
1. Create dedicated analytics page
2. Move analytics components
3. Reorganize dashboard for personal use
4. Implement filtering and sorting

### Phase 5: Settings & Polish
1. Create settings page
2. Implement mobile navigation
3. Add activity feed
4. Polish UI/UX across all pages

### Environment Configuration

```env
# Backend .env
ADMIN_ACCESS_CODE=your-secure-admin-code-here
DATABASE_URL=sqlite:///./polls.db
```

### Security Considerations

1. **Admin Access Code**
   - Store in environment variables only
   - Never expose in client code
   - Use strong, random value
   - Rotate periodically

2. **Role Verification**
   - Always verify on backend
   - Don't trust client-side role checks
   - Implement middleware for all admin routes

3. **Audit Logging**
   - Log all admin actions
   - Include timestamp and actor
   - Store immutably
   - Regular review process

4. **Password Security**
   - Hash passwords (bcrypt recommended)
   - Implement password strength requirements
   - Add rate limiting for login attempts
