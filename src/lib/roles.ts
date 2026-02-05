import {
    BookUser,
    Database,
    Download,
    Library,
    LineChart,
    type LucideIcon,
    Search,
    Sparkles,
    UserPlus,
    UserRound,
    Users,
    Biohazard,
} from "lucide-react";

export type RoleTitle = "BOSS" | "OE" | "TE" | "TL" | "QA" | "HR" | "DSA" | "SUBDSA" | "INDIV";

export type DashboardRoute = {
    path: string;
    label: string;
    icon: LucideIcon;
    roles: RoleTitle[];
    showInSidebar?: boolean;
    showInNavbar?: boolean;
};

export const DASHBOARD_ROUTES: DashboardRoute[] = [
    {
        path: "/dashboard/create",
        label: "Create New Lead",
        icon: UserPlus,
        roles: ["BOSS", "OE", "TL"],
        showInSidebar: true,
        showInNavbar: true,
    },
    {
        path: "/dashboard/partner_create",
        label: "Create New Lead",
        icon: UserPlus,
        roles: ["INDIV", "SUBDSA"],
        showInSidebar: true,
        showInNavbar: true,
    },
    {
        path: "/dashboard/myleads",
        label: "My Leads",
        icon: Library,
        roles: ["BOSS", "OE", "TL"],
        showInSidebar: true,
        showInNavbar: true,
    },
    {
        path: "/dashboard/team_leads",
        label: "Team Leads",
        icon: BookUser,
        roles: ["BOSS", "TL"],
        showInSidebar: true,
    },
    {
        path: "/dashboard/search",
        label: "Search",
        icon: Search,
        roles: ["BOSS", "OE", "TL"],
        showInSidebar: true,
        showInNavbar: true,
    },
    {
        path: "/dashboard/reports",
        label: "Reports",
        icon: LineChart,
        roles: ["BOSS"],
        showInSidebar: true,
        showInNavbar: true,
    },

    {
        path: "/dashboard/reports2",
        label: "ARD",
        icon: Sparkles,
        roles: ["BOSS"],
        showInSidebar: true,
        showInNavbar: true,
    },
    {
        path: "/dashboard/reports2/LS",
        label: "ARD",
        icon: Sparkles,
        roles: ["BOSS"],
        showInSidebar: false,
        showInNavbar: false,
    },
    {
        path: "/dashboard/register",
        label: "Agents",
        icon: Users,
        roles: ["BOSS", "HR"],
        showInSidebar: true,
        showInNavbar: true,
    },

    {
        path: "/dashboard/partner_search",
        label: "My Leads",
        icon: Users,
        roles: ["DSA", "INDIV", "SUBDSA"],
        showInSidebar: false,
        showInNavbar: false,
    },
    {
        path: "/dashboard/partner_leads",
        label: "My Leads",
        icon: Users,
        roles: ["DSA", "INDIV", "SUBDSA"],
        showInSidebar: true,
        showInNavbar: true,
    },
    {
        path: "/dashboard/partner_dsa",
        label: "Agents",
        icon: Users,
        roles: ["DSA"],
        showInSidebar: true,
    },
    {
        path: "/dashboard/database",
        label: "Database",
        icon: Database,
        roles: ["BOSS"],
        showInSidebar: true,
        showInNavbar: true,
    },
    {
        path: "/dashboard/attendance",
        label: "Attendance",
        icon: UserRound,
        roles: ["BOSS", "TL", "HR"],
        showInSidebar: true,
        showInNavbar: true,
    },
    {
        path: "/dashboard/attendance/overview",
        label: "Attendance",
        icon: UserRound,
        roles: ["BOSS", "TL", "HR"],
        showInSidebar: false,
        showInNavbar: false,
    },
    {
        path: "/dashboard/agent_attendance",
        label: "My Attendance",
        icon: UserRound,
        roles: ["BOSS", "OE", "TE", "TL", "QA", "HR"],
        showInSidebar: true,
        showInNavbar: true,
    },
    {
        path: "/dashboard/export",
        label: "Export",
        icon: Download,
        roles: ["BOSS", "TL", "QA"],
        showInSidebar: true,
    },
    {
        path: "/dashboard/invoice",
        label: "Invoices",
        icon: UserPlus,
        roles: ["BOSS", "TL"],
        showInSidebar: true,
        showInNavbar: true,
    },
    {
        path: "/dashboard/temp",
        label: "TEMP",
        icon: Biohazard,
        roles: ["BOSS", "OE", "TE", "TL", "QA", "HR", "DSA", "SUBDSA", "INDIV"],
        showInSidebar: false,
        showInNavbar: false,
    },
];

export const DEFAULT_REDIRECTS: Record<RoleTitle, string> = {
    BOSS: "/dashboard/reports",
    OE: "/dashboard/create",
    TE: "/dashboard/agent_attendance",
    TL: "/dashboard/team_leads",
    QA: "/dashboard/export",
    HR: "/dashboard/attendance",
    DSA: "/dashboard/partner_dsa",
    SUBDSA: "/dashboard/partner_create",
    INDIV: "/dashboard/partner_create",
};
