export type Screen = {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  status: string;
  priority: string;
  image: string;
};

export const screens: Screen[] = [
  {
    id: "1",
    title: "Company Overview",
    category: "Executive",
    description:
      "Strategic vision and market positioning for Q1 2026. Comprehensive analysis of current operations and future growth opportunities.",
    date: "Feb 2026",
    status: "Active",
    priority: "High",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=85",
  },
  {
    id: "2",
    title: "Financial Performance",
    category: "Finance",
    description:
      "Year-over-year revenue growth of 34%. Key metrics include EBITDA margins, operational efficiency, and investment returns.",
    date: "Q4 2025",
    status: "Reviewed",
    priority: "High",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=85",
  },
  {
    id: "3",
    title: "Operations & Logistics",
    category: "Operations",
    description:
      "Supply chain optimization and warehouse efficiency. Real-time tracking and last-mile delivery improvements.",
    date: "Jan 2026",
    status: "In Progress",
    priority: "Medium",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&q=85",
  },
  {
    id: "4",
    title: "Technology Roadmap",
    category: "Technology",
    description:
      "Digital transformation initiatives and infrastructure upgrades. Cloud migration and security enhancements.",
    date: "Q1 2026",
    status: "Planned",
    priority: "High",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=85",
  },
  {
    id: "5",
    title: "Human Resources",
    category: "HR",
    description:
      "Talent acquisition and retention strategies. Diversity initiatives and leadership development programs.",
    date: "Feb 2026",
    status: "Active",
    priority: "Medium",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=85",
  },
];
