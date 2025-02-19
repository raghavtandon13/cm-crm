# /api/agents

-   **GET /api/agents/assignments** - Retrieves a list of assignments for agents.
-   **POST /api/agents/cmuser** - Creates or updates a CM user associated with an agent.
-   **POST /api/agents/create** - Creates a new agent.
-   **GET /api/agents/get** - Retrieves information about a specific agent.
-   **POST /api/agents/login** - Authenticates an agent and provides a login token.
-   **GET /api/agents/logout** - Logs out an agent by invalidating their session.
-   **POST /api/agents/pass-reset** - Resets the password for an agent.
-   **GET /api/agents/tl_assignments** - Retrieves assignments for team leads.

## Attendance

-   **GET /api/agents/atten** - Fetches attendance data for agents.
-   **POST /api/agents/attendance** - Records attendance for an agent.
-   **GET /api/agents/attendance** - Retrieves attendance records.

### Leave Requests

-   **GET /api/agents/attendance/leave-requests** - Retrieves leave requests for agents.
-   **POST /api/agents/attendance/leave-requests** - Submits a new leave request for an agent.
-   **GET /api/agents/attendance/leave-requests/view** - Views details of a specific leave request.
-   **POST /api/agents/attendance/leave-requests/view** - Updates a leave request.

# /api/auth

-   **GET /api/auth/get** - Retrieves authentication details for the current user.
-   **POST /api/auth/login** - Authenticates a user and provides a login token.

# /api/db

-   **GET /api/db/queries** - Retrieves a list of database queries.
-   **POST /api/db/queries** - Executes a new database query.
-   **POST /api/db/queries/run** - Runs a specific database query.
-   **POST /api/db/queries/save** - Saves a new database query.

# /api/leads

-   **POST /api/leads/export/incoming** - Exports incoming leads data.
-   **POST /api/leads/export/stats** - Exports statistical data of leads.
-   **POST /api/leads/graphs** - Generates graphs for leads data.
-   **POST /api/leads/incoming** - Processes incoming leads data.
-   **POST /api/leads/perday** - Processes leads data on a per-day basis.
-   **POST /api/leads/stats** - Retrieves statistical data for leads.

# /api/partner

-   **POST /api/partner/cmuser/csv** - Exports CM user data to CSV for partners.
-   **POST /api/partner/cmuser/dedupe-check** - Checks for duplicate CM users for partners.
-   **POST /api/partner/cmuser** - Manages CM user data for partners.
-   **POST /api/partner/create** - Creates a new partner.
-   **GET /api/partner/get** - Retrieves information about a specific partner.
-   **GET /api/partner/getLeads** - Retrieves leads associated with a partner.
-   **GET /api/partner/getSubLeads** - Retrieves sub-leads associated with a partner.
-   **POST /api/partner/login** - Authenticates a partner and provides a login token.
-   **GET /api/partner/logout** - Logs out a partner by invalidating their session.
-   **POST /api/partner/pass-reset** - Resets the password for a partner.

# /api/users

-   **GET /api/users/id/[cmid]** - Retrieves user information by CMID.
-   **GET /api/users/monthlylenders** - Retrieves monthly lender data for users.
-   **GET /api/users/otp** - Retrieves OTP for user verification.
-   **POST /api/users/otp** - Sends OTP for user verification.
-   **GET /api/users** - Retrieves a list of users.
-   **GET /api/users/status/[phone]** - Retrieves user status by phone number.
-   **GET /api/users/[phone]** - Retrieves user information by phone number.
