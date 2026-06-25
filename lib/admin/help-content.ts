export type HelpSection = {
  id: string;
  title: string;
  body: string[];
};

export function getHelpSections(isAdmin: boolean): HelpSection[] {
  const sections: HelpSection[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      body: [
        "See complaint totals, monthly trends, and category breakdown at a glance.",
        "Use this page each morning to check new grievances and resolution progress.",
      ],
    },
    {
      id: "complaints",
      title: "Complaints",
      body: [
        "Citizens submit grievances from the public Grievance Portal.",
        "Open a complaint to update status, add remarks, and track resolution.",
        "Statuses flow: Submitted → Under Review → In Progress → Resolved.",
        "Citizens track progress using their Complaint ID on the Track page.",
      ],
    },
    {
      id: "projects",
      title: "Projects",
      body: [
        "Add constituency development projects with photos and progress.",
        "Published — visible on the public Projects page.",
        "Featured — highlighted on the homepage (also needs Published).",
        "Featured Image — the cover photo shown on cards (not the same as Featured).",
      ],
    },
    {
      id: "news",
      title: "News",
      body: [
        "Publish announcements, welfare updates, and event coverage.",
        "Published — article goes live on the News page.",
        "Featured — shown prominently on the homepage news section.",
        "Set a clear title in English and Malayalam when possible.",
      ],
    },
    {
      id: "gallery",
      title: "Gallery",
      body: [
        "Create albums by category and upload multiple photos at once.",
        "Published on public gallery — album visible on the Gallery page.",
        "The first uploaded image becomes the cover if none is set.",
      ],
    },
  ];

  if (isAdmin) {
    sections.push(
      {
        id: "settings",
        title: "Settings (Admin)",
        body: [
          "Edit homepage hero text, MLA biography, office details, and impact stats.",
          "Changes appear on the public site after saving.",
        ],
      },
      {
        id: "users",
        title: "Users (Admin)",
        body: [
          "Invite staff and assign roles: Admin (full access) or Staff (content + complaints).",
          "Deactivate accounts instead of deleting when someone leaves the office.",
        ],
      }
    );
  }

  sections.push({
    id: "tips",
    title: "Quick tips",
    body: [
      "Save drafts with Published unchecked until content is ready.",
      "Use View Public Site in the sidebar to preview changes.",
      "Reopen this guide anytime from Help in the sidebar.",
    ],
  });

  return sections;
}

export type TourStep = {
  element?: string;
  popover: {
    title: string;
    description: string;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
  };
};

export function getTourSteps(isAdmin: boolean): TourStep[] {
  const steps: TourStep[] = [
    {
      popover: {
        title: "Welcome to the Admin Console",
        description:
          "This short tour shows where to manage grievances, publish content, and monitor constituency activity. You can skip anytime or reopen Help from the sidebar.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="nav-dashboard"]',
      popover: {
        title: "Dashboard",
        description:
          "Your overview of complaint volume, categories, status, and resolution rate. Start here each day.",
        side: "right",
      },
    },
    {
      element: '[data-tour="nav-complaints"]',
      popover: {
        title: "Complaints",
        description:
          "Review citizen grievances, update status, and add remarks. Citizens track cases with their Complaint ID.",
        side: "right",
      },
    },
    {
      element: '[data-tour="nav-projects"]',
      popover: {
        title: "Projects & News",
        description:
          "Publish development projects and news articles. Use Published to go live and Featured to highlight on the homepage. Manage news from the News menu.",
        side: "right",
      },
    },
    {
      element: '[data-tour="nav-gallery"]',
      popover: {
        title: "Gallery",
        description:
          "Create photo albums for events and field visits. Toggle Published when an album is ready for the public site.",
        side: "right",
      },
    },
  ];

  if (isAdmin) {
    steps.push({
      element: '[data-tour="nav-settings"]',
      popover: {
        title: "Settings & Users",
        description:
          "Admins can edit site content (hero, biography, office info) and invite staff. Open Users to manage team access.",
        side: "right",
      },
    });
  }

  steps.push({
    element: '[data-tour="nav-help"]',
    popover: {
      title: "Need help later?",
      description:
        "Open Help anytime for detailed guides. Use View Public Site to preview what citizens see. You're all set!",
      side: "right",
    },
  });

  return steps;
}
