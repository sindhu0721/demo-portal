export type StrategyDashboardFlowId =
  | "strategy-direct-before-assessment"
  | "strategy-upgraded-after-free-assessment"
  | "strategy-after-assessment-counselling-pending"
  | "strategy-after-counselling-active"
  | "strategy-near-year-end";

export type StrategyDashboardCardStatus =
  | "not-started"
  | "in-progress"
  | "completed"
  | "locked"
  | "preview"
  | "final"
  | "active"
  | "near-complete"
  | "ready-to-book"
  | "pending"
  | "session-1-complete"
  | "year-end-review"
  | "inactive"
  | "awaiting-activation";

export type StrategyPathwayItem = {
  id: string;
  title: string;
  subtitle?: string;
  locked?: boolean;
  type?: "sample" | "emerging" | "final" | "related";
};

export type StrategyPathwaysDetail = {
  title: string;
  description: string;
  whyItFits: string[];
  educationDirection: string[];
  careerExamples: string[];
  relatedOptions?: string[];
  ctaLabel: string;
  ctaHref: string;
};

export type StrategyDashboardFlowState = {
  flow: StrategyDashboardFlowId;
  plan: "strategy";
  planStatus: "active" | "active-pending-counselling" | "active-roadmap-live" | "nearing-year-end";
  dominantAction: {
    label: string;
    href: string;
  };
  assessment: {
    status: "not-started" | "in-progress" | "completed";
    source: "direct-strategy" | "upgraded-from-free";
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    showAttemptUsed?: boolean;
    showCompletedBadge?: boolean;
  };
  insights: {
    status: "locked" | "preview" | "final";
    title: string;
    description: string;
    previewItems?: string[];
  };
  roadmap: {
    status: "locked" | "preview" | "active" | "near-complete";
    title: string;
    description: string;
    previewMilestones?: string[];
    ctaLabel?: string;
    ctaHref?: string;
    completionPct?: number;
  };
  learning: {
    status: "locked" | "preview" | "active" | "near-complete";
    title: string;
    description: string;
    nextModule?: string;
    ctaLabel?: string;
    ctaHref?: string;
  };
  counselling: {
    status: "locked" | "ready-to-book" | "pending" | "session-1-complete" | "year-end-review";
    title: string;
    description: string;
    tasks?: string[];
    ctaLabel?: string;
    ctaHref?: string;
    highlight?: boolean;
  };
  progress: {
    status: "inactive" | "awaiting-activation" | "active" | "near-complete";
    title: string;
    description: string;
    stats?: {
      tasksCompleted?: number;
      tasksTotal?: number;
      modulesCompleted?: number;
      modulesTotal?: number;
      roadmapCompletionPct?: number;
    };
    ctaLabel?: string;
    ctaHref?: string;
  };
  pathways: {
    status: "sample-clusters" | "emerging-fit" | "locked-pathway" | "next-phase-options";
    title: string;
    description: string;
    items: StrategyPathwayItem[];
    detail: StrategyPathwaysDetail;
  };
};

const STRATEGY_DASHBOARD_FLOWS: Record<StrategyDashboardFlowId, StrategyDashboardFlowState> = {
  "strategy-direct-before-assessment": {
    flow: "strategy-direct-before-assessment",
    plan: "strategy",
    planStatus: "active",
    dominantAction: {
      label: "Start assessment",
      href: "/assessments/start"
    },
    assessment: {
      status: "not-started",
      source: "direct-strategy",
      title: "Career Discovery Assessment",
      description: "Assessment not started. Complete it to unlock the rest of your Strategy journey.",
      ctaLabel: "Start assessment",
      ctaHref: "/assessments/start"
    },
    insights: {
      status: "locked",
      title: "Career Insights Preview",
      description: "Your insight preview will unlock after you finish the assessment."
    },
    roadmap: {
      status: "locked",
      title: "Roadmap",
      description: "Finish assessment and counselling to unlock your Bixa roadmap."
    },
    learning: {
      status: "locked",
      title: "Recommended Learning",
      description: "Your Drona learning track will be personalized after assessment and counselling."
    },
    counselling: {
      status: "locked",
      title: "Career Counselling",
      description: "Counselling will open after your assessment results are ready."
    },
    progress: {
      status: "inactive",
      title: "Progress Tracking",
      description: "Your progress dashboard will begin once your roadmap is activated."
    },
    pathways: {
      status: "sample-clusters",
      title: "Career Pathways",
      description: "These are example pathway clusters. Your final pathway will be locked after assessment and counselling.",
      items: [
        { id: "product-design", title: "Product Design", subtitle: "Example cluster", type: "sample" },
        { id: "ux-design", title: "UX Design", subtitle: "Example cluster", type: "sample" },
        { id: "architecture", title: "Architecture", subtitle: "Example cluster", type: "sample" }
      ],
      detail: {
        title: "Example pathway clusters",
        description: "These are sample directions shown before your assessment is complete. Final pathway locking happens after assessment and counselling.",
        whyItFits: [
          "Sample view only before personalized scoring",
          "Used to illustrate the kinds of pathways StudyHQ can evaluate",
          "Final fit depends on assessment + counselling validation"
        ],
        educationDirection: [
          "Assessment completion",
          "Counselling interpretation",
          "Roadmap activation after pathway lock"
        ],
        careerExamples: ["Product Designer", "UX Designer", "Architect"],
        relatedOptions: ["Visual Design", "Design Research"],
        ctaLabel: "Start assessment",
        ctaHref: "/assessments/start"
      }
    }
  },
  "strategy-upgraded-after-free-assessment": {
    flow: "strategy-upgraded-after-free-assessment",
    plan: "strategy",
    planStatus: "active-pending-counselling",
    dominantAction: {
      label: "Book Session 1",
      href: "/counselling"
    },
    assessment: {
      status: "completed",
      source: "upgraded-from-free",
      title: "Career Discovery Assessment",
      description: "Assessment completed on Free. Strategy is now active for the guided next step.",
      ctaLabel: "View results",
      ctaHref: "/assessments/result",
      showAttemptUsed: true,
      showCompletedBadge: true
    },
    insights: {
      status: "preview",
      title: "Career Insights Preview",
      description: "Limited strengths and cluster preview unlocked from your completed assessment.",
      previewItems: ["Creative Thinking", "Observation", "Product Design", "UX Design"]
    },
    roadmap: {
      status: "locked",
      title: "Roadmap",
      description: "Your roadmap unlocks after counselling locks your final pathway."
    },
    learning: {
      status: "preview",
      title: "Recommended Learning",
      description: "Your Drona track will activate after counselling finalizes your direction."
    },
    counselling: {
      status: "ready-to-book",
      title: "Career Counselling",
      description: "Your assessment is complete. Book counselling to lock your final pathway.",
      ctaLabel: "Book Session 1",
      ctaHref: "/counselling",
      highlight: true
    },
    progress: {
      status: "awaiting-activation",
      title: "Progress Tracking",
      description: "Progress tracking begins after roadmap activation."
    },
    pathways: {
      status: "emerging-fit",
      title: "Career Pathways",
      description: "Based on your assessment, these are emerging pathway directions. Final fit will be locked after counselling.",
      items: [
        { id: "product-design", title: "Product Design", subtitle: "Emerging fit", type: "emerging" },
        { id: "ux-design", title: "UX Design", subtitle: "Emerging fit", type: "emerging" },
        { id: "architecture", title: "Architecture", subtitle: "Under review", type: "emerging" }
      ],
      detail: {
        title: "Emerging pathway directions",
        description: "These directions come from your completed assessment, but the final pathway is still under review until counselling is completed.",
        whyItFits: [
          "Strong visual creativity",
          "High observation and detail sensitivity",
          "Early design-problem solving signals"
        ],
        educationDirection: [
          "Counselling session to validate direction",
          "Pathway lock after report interpretation",
          "Bixa activation once direction is confirmed"
        ],
        careerExamples: ["Product Designer", "UX Designer", "Architectural Designer"],
        relatedOptions: ["Design Research", "Interaction Design"],
        ctaLabel: "Book Session 1",
        ctaHref: "/counselling"
      }
    }
  },
  "strategy-after-assessment-counselling-pending": {
    flow: "strategy-after-assessment-counselling-pending",
    plan: "strategy",
    planStatus: "active-pending-counselling",
    dominantAction: {
      label: "Book Session 1",
      href: "/counselling"
    },
    assessment: {
      status: "completed",
      source: "direct-strategy",
      title: "Career Discovery Assessment",
      description: "Assessment complete. Counselling is the next step to finalize direction.",
      ctaLabel: "View results",
      ctaHref: "/assessments/result",
      showCompletedBadge: true
    },
    insights: {
      status: "preview",
      title: "Career Insights Preview",
      description: "Strengths and likely domains are ready, but final direction is still pending counsellor validation.",
      previewItems: ["Creative Thinking", "Observation", "Analytical Reasoning", "Design pathway likely"]
    },
    roadmap: {
      status: "locked",
      title: "Roadmap",
      description: "Waiting for counselling outcome to activate Bixa."
    },
    learning: {
      status: "locked",
      title: "Recommended Learning",
      description: "Learning track activates after pathway lock."
    },
    counselling: {
      status: "pending",
      title: "Career Counselling",
      description: "Assessment complete. Session 1 is pending. Final pathway will be locked here.",
      tasks: ["Complete intake form", "Review assessment summary", "Note your top questions"],
      ctaLabel: "Book Session 1",
      ctaHref: "/counselling",
      highlight: true
    },
    progress: {
      status: "awaiting-activation",
      title: "Progress Tracking",
      description: "Progress tracking will start after your roadmap is activated."
    },
    pathways: {
      status: "emerging-fit",
      title: "Career Pathways",
      description: "Possible pathways are under review. Final pathway lock happens after counselling.",
      items: [
        { id: "product-design", title: "Product Design", subtitle: "Leading direction", type: "emerging" },
        { id: "ux-design", title: "UX Design", subtitle: "Related direction", type: "emerging" },
        { id: "architecture", title: "Architecture", subtitle: "Under review", type: "emerging" }
      ],
      detail: {
        title: "Possible pathways under review",
        description: "Your assessment points to a few strong directions, but the final pathway should only be treated as locked after counselling.",
        whyItFits: [
          "Creative and visual reasoning strength",
          "Good pattern recognition and observation",
          "Strong interest in user-centered problem solving"
        ],
        educationDirection: [
          "Report interpretation session",
          "Pathway lock with counsellor",
          "Bixa roadmap activation"
        ],
        careerExamples: ["Product Designer", "UX Designer", "Service Designer"],
        relatedOptions: ["Architecture", "Interaction Design"],
        ctaLabel: "Book Session 1",
        ctaHref: "/counselling"
      }
    }
  },
  "strategy-after-counselling-active": {
    flow: "strategy-after-counselling-active",
    plan: "strategy",
    planStatus: "active-roadmap-live",
    dominantAction: {
      label: "View Roadmap",
      href: "/bixa"
    },
    assessment: {
      status: "completed",
      source: "direct-strategy",
      title: "Career Discovery Assessment",
      description: "Assessment completed and used to lock your final pathway.",
      ctaLabel: "View results",
      ctaHref: "/assessments/result",
      showCompletedBadge: true
    },
    insights: {
      status: "final",
      title: "Career Insights Preview",
      description: "Final pathway locked: Product Design",
      previewItems: ["Visual creativity", "Observation", "Problem solving orientation"]
    },
    roadmap: {
      status: "active",
      title: "Roadmap",
      description: "Bixa is active with yearly milestones and execution checkpoints.",
      previewMilestones: ["Year 1: Portfolio Basics", "Year 2: Design Competitions"],
      ctaLabel: "View Roadmap",
      ctaHref: "/bixa"
    },
    learning: {
      status: "active",
      title: "Recommended Learning",
      description: "Drona is now mapped to your current roadmap milestones.",
      nextModule: "Sketching Fundamentals",
      ctaLabel: "Open Drona",
      ctaHref: "/drona"
    },
    counselling: {
      status: "session-1-complete",
      title: "Career Counselling",
      description: "Session 1 completed. Session 2 will open at the next review checkpoint.",
      tasks: ["Session 1 completed", "Next checkpoint: Quarter 2", "Mid-Year Review upcoming"],
      ctaLabel: "View counselling plan",
      ctaHref: "/counselling"
    },
    progress: {
      status: "active",
      title: "Progress Tracking",
      description: "Roadmap and learning progress are now live.",
      stats: {
        tasksCompleted: 5,
        tasksTotal: 12,
        modulesCompleted: 3,
        modulesTotal: 8,
        roadmapCompletionPct: 42
      },
      ctaLabel: "Open Progress",
      ctaHref: "/progress"
    },
    pathways: {
      status: "locked-pathway",
      title: "Career Pathways",
      description: "Final pathway locked. Related adjacent options remain visible for context.",
      items: [
        { id: "product-design", title: "Product Design", subtitle: "Final locked pathway", type: "final" },
        { id: "ux-design", title: "UX Design", subtitle: "Related adjacent option", type: "related" },
        { id: "interaction-design", title: "Interaction Design", subtitle: "Related adjacent option", type: "related" }
      ],
      detail: {
        title: "Final Career Pathway",
        description: "Your final pathway has been locked after counselling and is now guiding your roadmap and learning system.",
        whyItFits: [
          "Strong visual creativity",
          "High observation ability",
          "Problem-solving orientation"
        ],
        educationDirection: [
          "Design foundation",
          "Portfolio building",
          "Entrance preparation"
        ],
        careerExamples: ["Product Designer", "UX Designer", "Interaction Designer"],
        relatedOptions: ["Design Research", "Service Design"],
        ctaLabel: "View Bixa Roadmap",
        ctaHref: "/bixa"
      }
    }
  },
  "strategy-near-year-end": {
    flow: "strategy-near-year-end",
    plan: "strategy",
    planStatus: "nearing-year-end",
    dominantAction: {
      label: "Finish roadmap",
      href: "/bixa"
    },
    assessment: {
      status: "completed",
      source: "direct-strategy",
      title: "Career Discovery Assessment",
      description: "Assessment completed and still guiding your active pathway.",
      ctaLabel: "View results",
      ctaHref: "/assessments/result",
      showCompletedBadge: true
    },
    insights: {
      status: "final",
      title: "Career Insights Preview",
      description: "Your journey this year has stayed aligned with Product Design.",
      previewItems: ["Creative Thinking", "Observation", "Portfolio-led growth"]
    },
    roadmap: {
      status: "near-complete",
      title: "Roadmap",
      description: "85% completed with the final milestone currently in progress.",
      previewMilestones: ["Final milestone: Portfolio refinement", "Next annual cycle planning"],
      ctaLabel: "Finish roadmap",
      ctaHref: "/bixa",
      completionPct: 85
    },
    learning: {
      status: "near-complete",
      title: "Recommended Learning",
      description: "Only the final advanced module remains in your current cycle.",
      nextModule: "Advanced Portfolio Review",
      ctaLabel: "Continue in Drona",
      ctaHref: "/drona"
    },
    counselling: {
      status: "year-end-review",
      title: "Career Counselling",
      description: "Year-end review approaching. Your annual Strategy cycle is closing soon.",
      tasks: ["Review end-of-year progress", "Prepare next-cycle questions", "Year-end checkpoint due soon"],
      ctaLabel: "View counselling plan",
      ctaHref: "/counselling"
    },
    progress: {
      status: "near-complete",
      title: "Progress Tracking",
      description: "Execution is nearing completion and readiness for the next cycle is high.",
      stats: {
        tasksCompleted: 22,
        tasksTotal: 24,
        modulesCompleted: 11,
        modulesTotal: 12,
        roadmapCompletionPct: 85
      },
      ctaLabel: "Open Progress",
      ctaHref: "/progress"
    },
    pathways: {
      status: "next-phase-options",
      title: "Career Pathways",
      description: "Locked pathway remains stable, with next-phase skill focus visible for what comes after this year.",
      items: [
        { id: "product-design", title: "Product Design", subtitle: "Final locked pathway", type: "final" },
        { id: "interaction-design", title: "Interaction Design", subtitle: "Next-phase adjacent direction", type: "related" },
        { id: "design-strategy", title: "Design Strategy", subtitle: "Future pathway option", type: "related" }
      ],
      detail: {
        title: "Final pathway and next-phase direction",
        description: "Your current pathway remains locked, but the next year can expand into adjacent skill directions and higher-level roles.",
        whyItFits: [
          "Consistent alignment with Product Design",
          "Strong portfolio and task completion trend",
          "Improving strategic design thinking"
        ],
        educationDirection: [
          "Portfolio refinement",
          "Advanced project depth",
          "Next-cycle entrance preparation"
        ],
        careerExamples: ["Product Designer", "Interaction Designer", "Design Strategist"],
        relatedOptions: ["Service Design", "UX Research"],
        ctaLabel: "View Bixa Roadmap",
        ctaHref: "/bixa"
      }
    }
  }
};

export function isStrategyDashboardFlow(value: string | null): value is StrategyDashboardFlowId {
  return value === "strategy-direct-before-assessment"
    || value === "strategy-upgraded-after-free-assessment"
    || value === "strategy-after-assessment-counselling-pending"
    || value === "strategy-after-counselling-active"
    || value === "strategy-near-year-end";
}

export function getStrategyDashboardFlow(flowId: StrategyDashboardFlowId) {
  return STRATEGY_DASHBOARD_FLOWS[flowId];
}
