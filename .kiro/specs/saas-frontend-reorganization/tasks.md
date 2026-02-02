# Implementation Plan: SaaS Frontend Reorganization

## Overview

This implementation plan transforms the QuickPoll frontend into a comprehensive SaaS platform with role-based access control, organized navigation, dedicated analytics, and admin functionality. The implementation is organized into phases that build incrementally, starting with backend role support, then frontend RBAC infrastructure, followed by admin features, analytics reorganization, and finally settings and polish.

## Tasks

- [x] 1. Backend Role Support - Add role field and management endpoints
  - [x] 1.1 Add role field to User model and create migration
    - Add `role` column to User model with default value "user"
    - Create Alembic migration for adding role field to existing users table
    - Update User model relationships if needed
    - _Requirements: 1.1, 1.2, 1.3, 13.1, 13.2_

  - [x] 1.2 Update user registration endpoint to support admin access code
    - Read ADMIN_ACCESS_CODE from environment variables
    - Check if access code is provided in registration request
    - Set role to "admin" if code matches, otherwise "user"
    - Return role in registration response
    - _Requirements: 1.2, 9.3, 9.4, 14.1, 14.2, 14.3, 14.4_

  - [x] 1.3 Update login endpoint to return user role
    - Include role field in login response
    - Update UserResponse schema to include role
    - _Requirements: 1.4, 13.5_

  - [x] 1.4 Create role management API endpoints
    - Create PUT /api/users/{user_id}/role endpoint
    - Implement role change logic with validation
    - Add admin authorization middleware
    - Return updated user data
    - _Requirements: 1.5, 1.6, 13.3, 13.4_

  - [x] 1.5 Create admin middleware for route protection
    - Create middleware to verify admin role from request
    - Return 403 Forbidden for non-admin users
    - Apply middleware to admin-only endpoints
    - _Requirements: 2.3, 2.4_

  - [x] 1.6 Create AdminAction model for audit logging
    - Create AdminAction model with fields: admin_id, action_type, target_type, target_id, details, created_at
    - Create database migration for admin_actions table
    - Add helper function to log admin actions
    - _Requirements: 5.7, 9.5_

- [x] 2. Checkpoint - Verify backend role support
  - Run backend server and test registration with/without admin code
  - Test login returns role field
  - Test role change endpoint with admin authorization
  - Ensure all tests pass, ask the user if questions arise

- [x] 3. Frontend RBAC Infrastructure - Update auth context and create utilities
  - [x] 3.1 Update AuthContext to support role field
    - Update AuthUser interface to include role field
    - Update login and register functions to handle role
    - Store role in localStorage with user data
    - Update fetchCurrentUser to include role
    - _Requirements: 1.4, 13.5_

  - [x] 3.2 Create RBAC utility module (lib/rbac.ts)
    - Create UserRole type ('user' | 'admin')
    - Create hasRole function to check user permissions
    - Create route protection configuration object
    - Create withRoleProtection HOC for route protection
    - _Requirements: 2.1, 2.2_

  - [x] 3.3 Create useRoleCheck custom hook
    - Create hook that returns current user role
    - Create hook functions: isAdmin, isUser, hasAccess
    - Handle unauthenticated state
    - _Requirements: 2.2, 2.5_

  - [x] 3.4 Create admin API client module (lib/admin-api.ts)
    - Create fetchUsers function with filtering
    - Create changeUserRole function
    - Create fetchPlatformStats function
    - Create fetchAdminActions function for audit logs
    - Add error handling for all functions
    - _Requirements: 6.1, 6.2, 6.5, 9.5_

- [x] 4. Enhanced Sidebar Navigation - Reorganize with sections
  - [x] 4.1 Update AppSidebar component with section structure
    - Define navSections array with Main, Analytics, Admin sections
    - Add section headers with styling
    - Implement conditional rendering for admin section based on role
    - Update navigation item rendering to support sections
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 4.2 Add Settings navigation item
    - Add Settings item to Main section
    - Add Settings icon (from lucide-react)
    - Link to /settings route
    - _Requirements: 11.1_

  - [x] 4.3 Create MobileNav component for responsive navigation
    - Create hamburger menu button
    - Create slide-out navigation drawer
    - Implement open/close state management
    - Add backdrop overlay
    - Render same navigation sections as desktop
    - _Requirements: 10.1, 10.2_

  - [x] 4.4 Update AppSidebar to use MobileNav on small screens
    - Hide desktop sidebar on mobile (< 768px)
    - Show MobileNav component on mobile
    - Ensure smooth transitions
    - _Requirements: 10.1, 10.2_

- [ ] 5. Checkpoint - Verify navigation and RBAC
  - Test sidebar renders sections correctly
  - Test admin section visibility for admin vs regular users
  - Test mobile navigation on small screens
  - Ensure all tests pass, ask the user if questions arise

- [ ] 6. Admin Context and State Management
  - [ ] 6.1 Create AdminContext provider (context/AdminContext.tsx)
    - Create AdminContextValue interface with users, moderationQueue, platformStats
    - Implement fetchUsers function with filtering
    - Implement changeUserRole function
    - Implement fetchPlatformStats function
    - Add loading and error states
    - _Requirements: 5.2, 5.3, 5.4, 6.1, 6.5_

  - [ ] 6.2 Create useAdmin custom hook
    - Export useAdmin hook to access AdminContext
    - Throw error if used outside AdminProvider
    - _Requirements: 5.2, 5.3, 5.4_

- [ ] 7. Admin Dashboard Page
  - [ ] 7.1 Create admin page structure (app/(app)/admin/page.tsx)
    - Create page component with role protection
    - Redirect non-admin users to dashboard
    - Create layout with sections: Overview, Quick Actions, Recent Activity, Metrics
    - _Requirements: 2.1, 5.1_

  - [ ] 7.2 Create AdminStats component
    - Display total users with growth indicator
    - Display active polls count
    - Display total votes today
    - Display system health status
    - Use card layout with icons
    - _Requirements: 5.6_

  - [ ] 7.3 Create AdminQuickActions component
    - Create action buttons: User Management, Content Moderation, View Reports
    - Link to respective admin pages
    - Use icon buttons with labels
    - _Requirements: 5.2, 5.5_

  - [ ] 7.4 Create RecentAdminActivity component
    - Fetch and display recent admin actions from audit log
    - Show action type, admin user, target, and timestamp
    - Limit to 10 most recent actions
    - Format timestamps as relative time
    - _Requirements: 5.7_

  - [ ] 7.5 Create PlatformMetricsChart component
    - Display user growth chart (last 30 days)
    - Display poll creation trends
    - Display engagement rates over time
    - Use recharts or similar library
    - _Requirements: 5.6_

- [x] 8. User Management Interface
  - [x] 8.1 Create admin users page (app/(app)/admin/users/page.tsx)
    - Create page with role protection
    - Integrate UserManagementTable component
    - Add search bar at top
    - Add filters for role (all, user, admin)
    - _Requirements: 5.2, 6.1, 6.2_

  - [x] 8.2 Create UserManagementTable component
    - Create table with columns: username, email, role, join date, polls created, total votes
    - Implement sortable columns
    - Add role change button for each user
    - Display user statistics
    - Add pagination controls
    - _Requirements: 6.1, 6.3, 6.4_

  - [x] 8.3 Create RoleChangeDialog component
    - Create modal dialog for role changes
    - Display user details and current role
    - Show warning message about role change implications
    - Add optional reason input field
    - Implement confirm/cancel actions
    - Show loading state during API call
    - Display success/error messages
    - _Requirements: 6.4, 6.5, 6.6, 6.7_

  - [x] 8.4 Implement search and filter functionality
    - Filter users by search query (username, email, ID)
    - Filter users by role
    - Update table display based on filters
    - Debounce search input
    - _Requirements: 6.2_

- [ ] 9. Checkpoint - Verify admin features
  - Test admin dashboard displays correctly for admin users
  - Test user management table and role changes
  - Test non-admin users cannot access admin pages
  - Ensure all tests pass, ask the user if questions arise

- [ ] 10. Content Moderation Interface
  - [ ] 10.1 Create admin moderation page (app/(app)/admin/moderation/page.tsx)
    - Create page with role protection
    - Integrate ModerationPanel component
    - Add filters for content status
    - _Requirements: 5.5, 7.1_

  - [ ] 10.2 Create ModerationPanel component
    - Display all polls with moderation controls
    - Show poll creator information
    - Add close poll button for admins
    - Add delete poll button for admins
    - Show poll status (active, closed, flagged)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 10.3 Implement moderation actions
    - Create closePoll function for admin
    - Create deletePoll function for admin
    - Log all moderation actions to audit log
    - Show confirmation dialogs before actions
    - Display success/error feedback
    - _Requirements: 7.2, 7.3, 7.5_

  - [ ] 10.4 Add bulk moderation support
    - Add checkbox selection for multiple polls
    - Add bulk close action
    - Add bulk delete action
    - Show bulk action confirmation
    - _Requirements: 7.6_

- [ ] 11. Analytics Page - Dedicated platform analytics
  - [ ] 11.1 Create analytics page (app/(app)/analytics/page.tsx)
    - Create page layout with sections
    - Add Platform Overview section
    - Add Vote Trends section
    - Add Top Performing Polls section
    - _Requirements: 4.1, 4.2_

  - [ ] 11.2 Create PlatformMetrics component
    - Display total polls created
    - Display total votes cast
    - Display total users registered
    - Display average engagement rate
    - Use card layout with icons and colors
    - _Requirements: 4.2_

  - [ ] 11.3 Create TrendCharts component
    - Create line chart for votes over time
    - Add time range selector (7d, 30d, 90d, all)
    - Show comparison with previous period
    - Add loading and empty states
    - _Requirements: 4.3_

  - [ ] 11.4 Create TopPerformers component
    - Display list of top performing polls
    - Show metrics: votes, likes, engagement rate
    - Add visual indicators for trending polls
    - Sort by engagement
    - _Requirements: 4.4_

  - [ ] 11.5 Add filtering and time range controls
    - Implement time range selector
    - Update charts based on selected range
    - Persist selection in URL params
    - _Requirements: 4.6_

- [x] 12. Dashboard Reorganization - Focus on personal activity
  - [x] 12.1 Update dashboard page for personal focus
    - Remove platform-wide analytics
    - Add personalized welcome header
    - Display user's own polls only
    - Show personal statistics
    - _Requirements: 8.1, 8.2_

  - [x] 12.2 Create YourPolls component
    - Display list of user's created polls
    - Show status indicators (active/closed)
    - Add quick actions: view, edit, close
    - Show poll statistics
    - _Requirements: 8.1_

  - [x] 12.3 Update RecentActivity component for personal activity
    - Filter activity to user's polls only
    - Show recent votes on user's polls
    - Show recent likes on user's polls
    - Format timestamps as relative time
    - _Requirements: 8.3, 15.1, 15.2, 15.3_

  - [x] 12.4 Create PersonalStats component
    - Display polls created count
    - Display total votes received
    - Display total likes received
    - Use card layout with icons
    - _Requirements: 8.2_

  - [x] 12.5 Add quick action buttons
    - Add "Create New Poll" button
    - Add "View Analytics" button
    - Add "Explore Polls" button
    - Style as prominent CTAs
    - _Requirements: 8.4_

  - [x] 12.6 Add unauthenticated state handling
    - Show welcome message for non-authenticated users
    - Display sign-in prompt
    - Hide personal content
    - _Requirements: 8.5_

- [ ] 13. Checkpoint - Verify analytics and dashboard
  - Test analytics page displays platform metrics
  - Test dashboard shows only personal content
  - Test time range filtering on analytics
  - Ensure all tests pass, ask the user if questions arise

- [-] 14. Settings Page - User account management
  - [x] 14.1 Create settings page (app/(app)/settings/page.tsx)
    - Create page layout with tabs or sections
    - Add Profile section
    - Add Preferences section
    - Add Security section
    - Add Account Management section
    - _Requirements: 11.1_

  - [x] 14.2 Create ProfileSettings component
    - Add username input field
    - Add email input field
    - Display account information (join date, role)
    - Add save button
    - Implement validation
    - _Requirements: 11.2, 11.4_

  - [x] 14.3 Create PreferencesSettings component
    - Add theme selector (light, dark, system)
    - Add email notifications toggle
    - Add poll notifications toggle
    - Save preferences to user settings
    - _Requirements: 11.5_

  - [x] 14.4 Create SecuritySettings component
    - Add current password field
    - Add new password field
    - Add confirm password field
    - Implement password validation
    - Add change password button
    - _Requirements: 11.3_

  - [x] 14.5 Implement settings update functionality
    - Create updateProfile API function
    - Create updatePreferences API function
    - Create changePassword API function
    - Validate all inputs before submission
    - Show success/error messages
    - _Requirements: 11.6, 11.7_

- [x] 15. Explore Page Enhancement - Better discovery
  - [x] 15.1 Add filtering controls to Explore page
    - Add filter buttons: All, Active, Closed
    - Update poll list based on selected filter
    - Highlight active filter
    - _Requirements: 12.1_

  - [x] 15.2 Add sorting controls to Explore page
    - Add sort dropdown: Recent, Popular, Most Voted
    - Update poll list based on selected sort
    - Persist sort selection
    - _Requirements: 12.2_

  - [x] 15.3 Add search functionality to Explore page
    - Add search input at top of page
    - Filter polls by title or content
    - Debounce search input
    - Show "no results" message when appropriate
    - _Requirements: 12.5_

  - [x] 15.4 Display result count and filters
    - Show number of results for current filters
    - Display active filters as badges
    - Add clear filters button
    - _Requirements: 12.6_

- [ ] 16. Activity Feed with Real-time Updates
  - [ ] 16.1 Create ActivityFeed component
    - Display recent votes on user's polls
    - Display recent likes on user's polls
    - Format timestamps as relative time
    - Group activity by poll
    - Limit to 20 most recent items
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ] 16.2 Integrate WebSocket updates for activity feed
    - Subscribe to activity events for user's polls
    - Update feed when new votes/likes occur
    - Show real-time notifications
    - Handle connection errors gracefully
    - _Requirements: 15.6_

- [ ] 17. Mobile Responsiveness Polish
  - [ ] 17.1 Ensure all pages are mobile responsive
    - Test dashboard on mobile
    - Test analytics on mobile
    - Test admin pages on mobile
    - Test settings on mobile
    - Adjust layouts for small screens
    - _Requirements: 10.3_

  - [ ] 17.2 Optimize charts and tables for mobile
    - Make charts responsive
    - Add horizontal scroll for tables
    - Simplify table columns on mobile
    - Use card layout for mobile tables
    - _Requirements: 10.4_

  - [ ] 17.3 Ensure touch-friendly interactions
    - Increase button sizes for touch
    - Add proper spacing between interactive elements
    - Test all interactions on touch devices
    - _Requirements: 10.5_

- [ ] 18. Final Integration and Testing
  - [ ] 18.1 Test complete user journey
    - Register new user
    - Create poll
    - View personal dashboard
    - Check analytics
    - Update settings
    - _Requirements: All user-facing requirements_

  - [ ] 18.2 Test complete admin journey
    - Login as admin (using access code)
    - Access admin panel
    - Change user role
    - Moderate content
    - View audit logs
    - _Requirements: All admin requirements_

  - [ ] 18.3 Test authorization enforcement
    - Verify non-admin cannot access admin routes
    - Verify backend rejects unauthorized requests
    - Test role-based UI rendering
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 18.4 Test mobile experience
    - Test navigation on mobile
    - Test all pages on mobile
    - Test touch interactions
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 19. Final Checkpoint - Complete verification
  - Run all tests
  - Verify all features work as expected
  - Check for any console errors
  - Ensure smooth user experience
  - Ask the user if questions arise or if ready for deployment

## Notes

- Each task builds on previous tasks incrementally
- Backend changes should be completed before frontend integration
- Test after each major phase (checkpoints)
- Focus on core functionality first, polish later
- All admin features require proper authorization checks
- Mobile responsiveness should be verified throughout development
- Real-time features use existing WebSocket infrastructure
