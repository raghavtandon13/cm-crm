# CM Portal - Comprehensive Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Routes](#api-routes)
7. [Pages & Components](#pages--components)
8. [User Roles & Permissions](#user-roles--permissions)
9. [Features](#features)
10. [Setup & Installation](#setup--installation)
11. [Development Guidelines](#development-guidelines)

## Project Overview

CM Portal is a comprehensive Customer Relationship Management (CRM) system built for managing agents, partners, leads, and attendance. The application provides role-based access control with different interfaces for various user types including agents, team leaders, HR personnel, and partners.

### Key Features

-   **Role-based Access Control**: 7 different user roles with specific permissions
-   **Agent Management**: Create, manage, and track agent performance
-   **Partner Management**: Handle partner relationships and lead assignments
-   **Lead Management**: Track and assign leads to agents and partners
-   **Attendance System**: Comprehensive attendance tracking with leave management
-   **Real-time Updates**: Live data updates across the application
-   **Export Functionality**: Data export capabilities for reporting
-   **Database Query Interface**: Direct database query execution for administrators

## Technology Stack

### Frontend

-   **Next.js 14**: React framework with App Router
-   **TypeScript**: Type-safe JavaScript
-   **Tailwind CSS**: Utility-first CSS framework
-   **Radix UI**: Accessible component library
-   **React Hook Form**: Form management
-   **React Query (@tanstack/react-query)**: Server state management
-   **Lucide React**: Icon library
-   **Recharts**: Data visualization
-   **Sonner**: Toast notifications

### Backend

-   **Next.js API Routes**: Server-side API endpoints
-   **Prisma**: Database ORM
-   **MongoDB**: NoSQL database
-   **JWT (jsonwebtoken)**: Authentication tokens
-   **bcrypt**: Password hashing
-   **Mongoose**: MongoDB object modeling

### Development Tools

-   **ESLint**: Code linting
-   **Prettier**: Code formatting
-   **TypeScript**: Static type checking
-   **Bun**: Package manager and runtime

## Project Structure

```
cm-portal/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── agents/        # Agent-related APIs
│   │   │   ├── auth/          # Authentication APIs
│   │   │   ├── db/            # Database query APIs
│   │   │   ├── leads/         # Lead management APIs
│   │   │   ├── partner/       # Partner-related APIs
│   │   │   └── users/         # User management APIs
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── agent_attendance/
│   │   │   ├── attendance/
│   │   │   ├── create/
│   │   │   ├── database/
│   │   │   ├── export/
│   │   │   ├── myleads/
│   │   │   ├── partner_create/
│   │   │   ├── partner_leads/
│   │   │   ├── register/
│   │   │   ├── reports/
│   │   │   ├── search/
│   │   │   └── team_leads/
│   │   ├── login/             # Login page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI components (Radix-based)
│   │   ├── displays/         # Display components
│   │   ├── magicui/          # Magic UI components
│   │   └── [various components]
│   ├── context/              # React contexts
│   │   ├── UserContext.tsx   # User state management
│   │   └── Query.tsx         # React Query provider
│   ├── lib/                  # Utility libraries
│   └── middleware.ts         # Next.js middleware
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
├── helpers/                  # Helper functions
├── lib/                      # Additional libraries
├── package.json             # Dependencies
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── next.config.mjs         # Next.js configuration
```

## Database Schema

The application uses MongoDB with Prisma as the ORM. Key models include:

### Core Models

#### Agent

-   **Purpose**: Represents system agents/employees
-   **Key Fields**: email, name, password, roleId, supervisorId
-   **Relations**: Role, subordinates, assignments, attendance
-   **Features**: Hierarchical structure with supervisor-subordinate relationships

#### Partner

-   **Purpose**: External partners (DSA, subDSA, individual)
-   **Key Fields**: email, name, password, roleId, parentId, bank details
-   **Relations**: Role, partner leads, hierarchical structure
-   **Features**: Self-referential hierarchy for partner management

#### Role

-   **Purpose**: Defines user permissions and access levels
-   **Key Fields**: title, features
-   **Relations**: Agents, Partners
-   **Available Roles**: BOSS, OE, TE, TL, HR, INDIV, QA

#### Assignment

-   **Purpose**: Links CM users to agents for lead management
-   **Key Fields**: cmUserId, agentId, status, subStatus
-   **Relations**: Agent
-   **Statuses**: CALLBACK, PTP, DISBURSED, PENDING

#### AgentAttendance

-   **Purpose**: Tracks daily agent attendance
-   **Key Fields**: agentId, date, type, comment
-   **Relations**: Agent
-   **Types**: ABSENT, PRESENT, WEEK_OFF, WORK_FROM_HOME, UPL, HOLIDAY, LEAVE, HALF_DAY

#### LeaveRequest

-   **Purpose**: Manages agent leave requests
-   **Key Fields**: agentId, startDate, endDate, reason, status
-   **Statuses**: PENDING, APPROVED, REJECTED

#### PartnerLeads

-   **Purpose**: Manages leads assigned to partners
-   **Key Fields**: cmUserId, partnerId, status
-   **Relations**: Partner
-   **Statuses**: PENDING, DUPLICATE, ACCEPTED, REJECTED

### Enums

-   **Feature**: FEATURE1, FEATURE2, FEATURE3, FEATURE4
-   **Status**: CALLBACK, PTP, DISBURSED, PENDING
-   **SubStatus**: NOT_REQUIRED, NOT_CONTACTED, REJECTED, IN_PROGRESS, DISBURSED
-   **AttendanceType**: Various attendance states
-   **LeaveStatus**: Leave request states
-   **LeadStatus**: Partner lead states

## Authentication & Authorization

### Authentication Flow

1. **Login**: Users authenticate via `/api/auth/login`
2. **Token**: JWT token stored in `cm-token` cookie
3. **Middleware**: `middleware.ts` validates tokens on protected routes
4. **Session**: User data retrieved via `/api/auth/get`

### Authorization System

-   **Role-based**: Access controlled by user roles
-   **Route Protection**: Middleware enforces role-based route access
-   **Feature Flags**: Granular permissions via Feature enum

### Protected Routes by Role

#### BOSS (Administrator)

-   Full system access
-   All dashboard routes
-   Database management
-   User registration
-   Reports and analytics

#### OE (Operations Executive)

-   Lead creation and management
-   Personal leads view
-   Search functionality
-   Personal attendance

#### TE (Technical Executive)

-   Personal attendance only

#### TL (Team Leader)

-   Lead management
-   Team lead overview
-   Attendance management
-   Export functionality

#### HR (Human Resources)

-   User registration
-   Attendance management
-   Agent attendance oversight

#### INDIV (Individual Partner)

-   Partner lead creation
-   Partner lead management

#### QA (Quality Assurance)

-   Export functionality
-   Quality control features

## API Routes

### Authentication (`/api/auth`)

-   **GET /api/auth/get**: Retrieve current user details
-   **POST /api/auth/login**: User authentication

### Agents (`/api/agents`)

-   **GET /api/agents/assignments**: Get agent assignments
-   **POST /api/agents/cmuser**: Create/update CM user
-   **POST /api/agents/create**: Create new agent
-   **GET /api/agents/get**: Get agent information
-   **POST /api/agents/login**: Agent authentication
-   **GET /api/agents/logout**: Agent logout
-   **POST /api/agents/pass-reset**: Reset agent password
-   **GET /api/agents/tl_assignments**: Team leader assignments

#### Attendance APIs

-   **GET /api/agents/atten**: Fetch attendance data
-   **POST /api/agents/attendance**: Record attendance
-   **GET /api/agents/attendance**: Get attendance records
-   **GET /api/agents/attendance/leave-requests**: Get leave requests
-   **POST /api/agents/attendance/leave-requests**: Submit leave request
-   **GET /api/agents/attendance/leave-requests/view**: View leave request
-   **POST /api/agents/attendance/leave-requests/view**: Update leave request

### Database (`/api/db`)

-   **GET /api/db/queries**: Get saved queries
-   **POST /api/db/queries**: Execute database query
-   **POST /api/db/queries/run**: Run specific query
-   **POST /api/db/queries/save**: Save new query

### Leads (`/api/leads`)

-   **POST /api/leads/export/incoming**: Export incoming leads
-   **POST /api/leads/export/stats**: Export lead statistics
-   **POST /api/leads/graphs**: Generate lead graphs
-   **POST /api/leads/incoming**: Process incoming leads
-   **POST /api/leads/perday**: Process daily leads
-   **POST /api/leads/stats**: Get lead statistics

### Partners (`/api/partner`)

-   **POST /api/partner/cmuser/csv**: Export partner CM users to CSV
-   **POST /api/partner/cmuser/dedupe-check**: Check for duplicates
-   **POST /api/partner/cmuser**: Manage partner CM users
-   **POST /api/partner/create**: Create new partner
-   **GET /api/partner/get**: Get partner information
-   **GET /api/partner/getLeads**: Get partner leads
-   **GET /api/partner/getSubLeads**: Get partner sub-leads
-   **POST /api/partner/login**: Partner authentication
-   **GET /api/partner/logout**: Partner logout
-   **POST /api/partner/pass-reset**: Reset partner password

### Users (`/api/users`)

-   **GET /api/users/id/[cmid]**: Get user by CM ID
-   **GET /api/users/monthlylenders**: Get monthly lender data
-   **GET /api/users/otp**: Get OTP for verification
-   **POST /api/users/otp**: Send OTP
-   **GET /api/users**: Get users list
-   **GET /api/users/status/[phone]**: Get user status by phone
-   **GET /api/users/[phone]**: Get user by phone number

## Pages & Components

### Core Pages

#### Dashboard Layout (`/dashboard/layout.tsx`)

-   **Purpose**: Main dashboard navigation and layout
-   **Features**:
    -   Collapsible sidebar
    -   Role-based navigation items
    -   Responsive design
-   **Navigation Items**: Dynamically rendered based on user role

#### Login (`/login`)

-   **Purpose**: User authentication interface
-   **Features**: Email/password authentication
-   **Redirect**: Role-based dashboard redirection

### Dashboard Pages

#### Create Lead (`/dashboard/create`)

-   **Access**: OE, TL, BOSS
-   **Purpose**: Create new customer leads
-   **Features**: Lead form with validation

#### My Leads (`/dashboard/myleads`)

-   **Access**: OE, TL, BOSS
-   **Purpose**: View and manage assigned leads
-   **Features**: Lead status updates, filtering

#### Team Leads (`/dashboard/team_leads`)

-   **Access**: TL, BOSS
-   **Purpose**: Overview of team performance
-   **Features**: Team metrics, lead distribution

#### Search (`/dashboard/search`)

-   **Access**: OE, TL, BOSS
-   **Purpose**: Search across leads and customers
-   **Features**: Advanced search filters

#### Reports (`/dashboard/reports`)

-   **Access**: BOSS only
-   **Purpose**: Analytics and reporting dashboard
-   **Features**: Charts, metrics, performance data

#### Agents (`/dashboard/register`)

-   **Access**: BOSS, HR
-   **Purpose**: Agent management interface
-   **Features**: Create, edit, manage agents

#### Database (`/dashboard/database`)

-   **Access**: BOSS only
-   **Purpose**: Direct database query interface
-   **Features**: SQL-like query execution

#### Attendance (`/dashboard/attendance`)

-   **Access**: TL, BOSS, HR
-   **Purpose**: Team attendance management
-   **Features**: Attendance overview, leave approvals

#### My Attendance (`/dashboard/agent_attendance`)

-   **Access**: All agents
-   **Purpose**: Personal attendance tracking
-   **Features**: Mark attendance, request leave

#### Export (`/dashboard/export`)

-   **Access**: TL, BOSS, QA
-   **Purpose**: Data export functionality
-   **Features**: CSV/Excel exports

#### Partner Create (`/dashboard/partner_create`)

-   **Access**: INDIV partners
-   **Purpose**: Partner lead creation
-   **Features**: Partner-specific lead forms

#### Partner Leads (`/dashboard/partner_leads`)

-   **Access**: INDIV partners
-   **Purpose**: Partner lead management
-   **Features**: Lead tracking, status updates

### Key Components

#### Navigation (`components/navbar.tsx`)

-   **Purpose**: Top navigation bar
-   **Features**: User menu, logout, theme toggle

#### Data Table (`components/dataTable.tsx`)

-   **Purpose**: Reusable data table component
-   **Features**: Sorting, filtering, pagination
-   **Usage**: Used across multiple pages for data display

#### Form Field (`components/formField.tsx`)

-   **Purpose**: Standardized form input component
-   **Features**: Validation, error handling

#### Export Modal (`components/exportModal.tsx`)

-   **Purpose**: Data export interface
-   **Features**: Format selection, date ranges

#### Role Component (`components/role.tsx`)

-   **Purpose**: Role-based rendering
-   **Features**: Conditional component rendering

#### User Search (`components/userSearch.tsx`)

-   **Purpose**: User search functionality
-   **Features**: Real-time search, filtering

#### Date Search (`components/dateSearch.tsx`)

-   **Purpose**: Date range selection
-   **Features**: Calendar picker, range validation

#### Monthly Lenders (`components/monthlyLenders.tsx`)

-   **Purpose**: Monthly lending statistics
-   **Features**: Data visualization, trends

#### Real-time Component (`components/realtime.tsx`)

-   **Purpose**: Real-time data updates
-   **Features**: WebSocket/polling integration

### UI Components (`components/ui/`)

Built on Radix UI primitives:

-   **Button**: Various button styles and sizes
-   **Input**: Form input components
-   **Select**: Dropdown selection
-   **Dialog**: Modal dialogs
-   **Table**: Data table components
-   **Tabs**: Tabbed interfaces
-   **Accordion**: Collapsible content
-   **Alert Dialog**: Confirmation dialogs
-   **Checkbox**: Checkbox inputs
-   **Label**: Form labels
-   **Popover**: Popup content
-   **Progress**: Progress indicators
-   **Separator**: Visual separators
-   **Tooltip**: Hover tooltips

## User Roles & Permissions

### Role Hierarchy

1. **BOSS**: Full administrative access
2. **TL**: Team management capabilities
3. **HR**: Human resources functions
4. **OE**: Operations and lead management
5. **TE**: Technical support (limited access)
6. **QA**: Quality assurance functions
7. **INDIV**: Individual partner access

### Permission Matrix

| Feature          | BOSS | TL  | HR  | OE  | TE  | QA  | INDIV |
| ---------------- | ---- | --- | --- | --- | --- | --- | ----- |
| Create Leads     | ✓    | ✓   | ✗   | ✓   | ✗   | ✗   | ✓\*   |
| My Leads         | ✓    | ✓   | ✗   | ✓   | ✗   | ✗   | ✗     |
| Team Leads       | ✓    | ✓   | ✗   | ✗   | ✗   | ✗   | ✗     |
| Search           | ✓    | ✓   | ✗   | ✓   | ✗   | ✗   | ✗     |
| Reports          | ✓    | ✗   | ✗   | ✗   | ✗   | ✗   | ✗     |
| Agent Management | ✓    | ✗   | ✓   | ✗   | ✗   | ✗   | ✗     |
| Database         | ✓    | ✗   | ✗   | ✗   | ✗   | ✗   | ✗     |
| Attendance Mgmt  | ✓    | ✓   | ✓   | ✗   | ✗   | ✗   | ✗     |
| My Attendance    | ✓    | ✓   | ✓   | ✓   | ✓   | ✗   | ✗     |
| Export           | ✓    | ✓   | ✗   | ✗   | ✗   | ✓   | ✗     |
| Partner Leads    | ✗    | ✗   | ✗   | ✗   | ✗   | ✗   | ✓     |

\*INDIV users access partner-specific lead creation

## Features

### Lead Management

-   **Lead Creation**: Multi-step lead creation process
-   **Assignment**: Automatic and manual lead assignment
-   **Status Tracking**: Comprehensive status and sub-status system
-   **Follow-up**: Scheduled callbacks and follow-ups
-   **Conversion Tracking**: Lead to customer conversion metrics

### Agent Management

-   **Hierarchical Structure**: Supervisor-subordinate relationships
-   **Performance Tracking**: Individual and team performance metrics
-   **Workload Distribution**: Balanced lead assignment
-   **Role-based Access**: Granular permission system

### Attendance System

-   **Daily Tracking**: Mark daily attendance
-   **Leave Management**: Request and approve leave
-   **Attendance Types**: Multiple attendance categories
-   **Reporting**: Attendance reports and analytics
-   **Notifications**: Attendance reminders and alerts

### Partner Management

-   **Partner Onboarding**: Streamlined partner registration
-   **Lead Distribution**: Partner-specific lead assignment
-   **Commission Tracking**: Partner commission management
-   **Performance Metrics**: Partner performance analytics
-   **Hierarchical Structure**: DSA and sub-partner relationships

### Reporting & Analytics

-   **Dashboard Metrics**: Real-time performance indicators
-   **Lead Analytics**: Conversion rates, pipeline analysis
-   **Agent Performance**: Individual and team metrics
-   **Attendance Reports**: Comprehensive attendance analytics
-   **Export Capabilities**: Data export in multiple formats

### Data Management

-   **Database Queries**: Direct database access for administrators
-   **Data Import/Export**: Bulk data operations
-   **Data Validation**: Comprehensive data validation rules
-   **Audit Trail**: Change tracking and history
-   **Backup & Recovery**: Data backup mechanisms

## Setup & Installation

### Prerequisites

-   Node.js 18+ or Bun
-   MongoDB database
-   Git

### Installation Steps

1. **Clone Repository**

    ```bash
    git clone <repository-url>
    cd cm-portal
    ```

2. **Install Dependencies**

    ```bash
    # Using npm
    npm install

    # Using bun
    bun install
    ```

3. **Environment Setup**
   Create `.env` file with required variables:

    ```env
    DATABASE_URL="mongodb://localhost:27017/cm-portal"
    JWT_SECRET="your-jwt-secret"
    NEXTAUTH_SECRET="your-nextauth-secret"
    ```

4. **Database Setup**

    ```bash
    # Generate Prisma client
    npx prisma generate

    # Push schema to database
    npx prisma db push
    ```

5. **Development Server**

    ```bash
    # Using npm
    npm run dev

    # Using bun
    bun run dev
    ```

6. **Production Build**

    ```bash
    # Build application
    npm run build

    # Start production server
    npm run start
    ```

### Environment Variables

-   `DATABASE_URL`: MongoDB connection string
-   `JWT_SECRET`: Secret for JWT token signing
-   `NEXTAUTH_SECRET`: NextAuth.js secret
-   `NODE_ENV`: Environment (development/production)

## Development Guidelines

### Code Structure

-   **Components**: Reusable UI components in `/components`
-   **Pages**: Route-based pages in `/app`
-   **API**: Server-side logic in `/app/api`
-   **Types**: TypeScript definitions
-   **Utils**: Utility functions in `/lib`

### Naming Conventions

-   **Files**: kebab-case for files, PascalCase for components
-   **Variables**: camelCase
-   **Constants**: UPPER_SNAKE_CASE
-   **Database**: PascalCase for models, camelCase for fields

### Best Practices

-   **Type Safety**: Use TypeScript throughout
-   **Error Handling**: Comprehensive error handling
-   **Validation**: Client and server-side validation
-   **Security**: Input sanitization, authentication checks
-   **Performance**: Optimize queries, use caching
-   **Testing**: Unit and integration tests
-   **Documentation**: Code comments and documentation

### Git Workflow

-   **Branches**: Feature branches from main
-   **Commits**: Conventional commit messages
-   **Pull Requests**: Code review required
-   **Deployment**: Automated deployment pipeline

### Database Guidelines

-   **Migrations**: Use Prisma migrations
-   **Indexing**: Proper database indexing
-   **Relationships**: Maintain referential integrity
-   **Performance**: Optimize queries and aggregations

### Security Considerations

-   **Authentication**: JWT-based authentication
-   **Authorization**: Role-based access control
-   **Input Validation**: Sanitize all inputs
-   **SQL Injection**: Use parameterized queries
-   **XSS Protection**: Escape user content
-   **CSRF Protection**: Implement CSRF tokens

---

_This documentation is maintained and updated regularly. For the latest information, refer to the project repository and inline code comments._
