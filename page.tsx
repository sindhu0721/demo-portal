"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { canBookInterpretationSession, getEntitlements } from "@/lib/access-control";
import { getFlowOverride, isFlowPreviewEnabled, resolveFlowId } from "@/lib/flowOverride";
import { getStrategyDashboardFlow, isStrategyDashboardFlow } from "@/lib/strategy-dashboard-flows";
import { useOnboardingStore } from "@/store/onboarding-store";
import { getActiveSession, initializeJourneyStateIfMissing, JourneyState } from "@/lib/journey-state";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardPrimaryAction } from "@/components/platform/dashboard-primary-action";
import { JourneyProgressStrip } from "@/components/platform/journey-progress-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { careerClusters, student, topStrengths } from "@/lib/mock-data";

type AssessmentStatus = "not_started" | "in_progress" | "completed";

function getStrategyStatusBadge(status: string) {
  if (status === "completed" || status === "final" || status === "active" || status === "near-complete") {
    return <Badge variant="success">{status === "near-complete" ? "Near complete" : status === "final" ? "Final" : "Active"}</Badge>;
  }

  if (status === "ready-to-book") {
    return <Badge>Ready now</Badge>;
  }

  if (status === "pending") {
    return <Badge variant="secondary">Pending</Badge>;
  }

  if (status === "preview") {
    return <Badge variant="secondary">Preview</Badge>;
  }

  if (status === "not-started" || status === "inactive" || status === "awaiting-activation") {
    return <Badge variant="outline">{status === "awaiting-activation" ? "Awaiting activation" : status === "inactive" ? "Inactive" : "Not started"}</Badge>;
  }

  return (
    <Badge variant="outline">
      <Lock className="mr-1 h-3 w-3" />
      Locked
    </Badge>
  );
}

function getStrategyPrimaryAction(flow: string) {
  if (flow === "strategy-direct-before-assessment") {
    return {
      stage: "Assessment Pending",
      title: "Start Assessment",
      description: "Your Strategy plan is active, but the journey cannot move forward until your assessment is completed.",
      ctaLabel: "Start assessment",
      ctaHref: "/assessments/start"
    };
  }

  if (flow === "strategy-upgraded-after-free-assessment" || flow === "strategy-after-assessment-counselling-pending") {
    return {
      stage: "Counselling Pending",
      title: "Book Counselling",
      description: "Your assessment is ready. The next step is Session 1, where your final pathway gets locked and Bixa activates.",
      ctaLabel: "Book Session 1",
      ctaHref: "/counselling"
    };
  }

  if (flow === "strategy-near-year-end") {
    return {
      stage: "Completion Stage",
      title: "Finish Roadmap",
      description: "Most of your roadmap is complete. Close the final milestone and prepare for the next annual cycle.",
      ctaLabel: "Finish roadmap",
      ctaHref: "/bixa"
    };
  }

  return {
    stage: "Roadmap Active",
    title: "Continue Roadmap",
    description: "Your pathway is locked and execution is live. Keep momentum by continuing your roadmap and linked learning.",
    ctaLabel: "Continue roadmap",
    ctaHref: "/bixa"
  };
}

function getStrategyJourneySteps(flow: string) {
  if (flow === "strategy-direct-before-assessment") {
    return [
      { label: "Assessment", status: "current" as const },
      { label: "Counselling", status: "locked" as const },
      { label: "Roadmap", status: "locked" as const },
      { label: "Learning", status: "locked" as const },
      { label: "Progress", status: "locked" as const }
    ];
  }

  if (flow === "strategy-upgraded-after-free-assessment" || flow === "strategy-after-assessment-counselling-pending") {
    return [
      { label: "Assessment", status: "complete" as const },
      { label: "Counselling", status: "current" as const },
      { label: "Roadmap", status: "locked" as const },
      { label: "Learning", status: "locked" as const },
      { label: "Progress", status: "locked" as const }
    ];
  }

  if (flow === "strategy-near-year-end") {
    return [
      { label: "Assessment", status: "complete" as const },
      { label: "Counselling", status: "complete" as const },
      { label: "Roadmap", status: "complete" as const },
      { label: "Learning", status: "complete" as const },
      { label: "Progress", status: "current" as const }
    ];
  }

  return [
    { label: "Assessment", status: "complete" as const },
    { label: "Counselling", status: "complete" as const },
    { label: "Roadmap", status: "current" as const },
    { label: "Learning", status: "current" as const },
    { label: "Progress", status: "locked" as const }
  ];
}

function getFreePrimaryAction(state: JourneyState, assessmentHref: string) {
  if (state.assessmentStatus === "in_progress") {
    return {
      stage: "Assessment In Progress",
      title: "Resume Free Assessment",
      description: "Complete your one free assessment attempt to unlock your first insight snapshot.",
      ctaLabel: "Resume free assessment",
      ctaHref: assessmentHref
    };
  }

  if (state.assessmentStatus === "completed") {
    return {
      stage: "Upgrade Opportunity",
      title: "Unlock Your Full Report",
      description: "Your free attempt is complete. Upgrade to move into counselling, roadmap activation, and guided learning.",
      ctaLabel: "Compare plans",
      ctaHref: "/pricing"
    };
  }

  return {
    stage: "Assessment Pending",
    title: "Start Your Free Assessment",
    description: "Use your one free attempt to discover early strengths and career direction.",
    ctaLabel: "Start free assessment",
    ctaHref: "/assessments/start"
  };
}

function getFreeJourneySteps(state: JourneyState) {
  return [
    { label: "Assessment", status: state.assessmentStatus === "completed" ? "complete" as const : state.assessmentStatus === "in_progress" ? "current" as const : "current" as const },
    { label: "Counselling", status: "locked" as const },
    { label: "Roadmap", status: "locked" as const },
    { label: "Learning", status: "locked" as const },
    { label: "Progress", status: "locked" as const }
  ];
}

export default function DashboardPage() {
  const pathname = usePathname();
  const selectedPlan = useOnboardingStore((s) => s.selectedPlan);
  const onboardingEmail = useOnboardingStore((s) => s.email);
  const authVerified = useOnboardingStore((s) => s.authVerified);
  const [journeyState, setJourneyState] = useState<JourneyState | null>(null);
  const [flowParam, setFlowParam] = useState<string | null>(null);
  const [pathwaysParam, setPathwaysParam] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setFlowParam(params.get("flow"));
    setPathwaysParam(params.get("pathways"));
  }, [pathname]);

  const flowOverride = useMemo(() => {
    if (!isFlowPreviewEnabled()) return null;
    const flowId = resolveFlowId(flowParam, pathname);
    if (!flowId) return null;
    return getFlowOverride(flowId);
  }, [flowParam, pathname]);

  useEffect(() => {
    const activeSession = getActiveSession();
    const resolvedEmail = activeSession?.isAuthenticated
      ? activeSession.currentUserEmail
      : authVerified
        ? onboardingEmail
        : "";
    if (!resolvedEmail) return;

    const resolvedPlan = activeSession?.currentPlanTier || selectedPlan;
    const state = initializeJourneyStateIfMissing(resolvedEmail, resolvedPlan);
    setJourneyState(state);
  }, [authVerified, onboardingEmail, selectedPlan, pathname]);

  const state = useMemo(
    () => {
      const base =
        journeyState || {
        planTier: selectedPlan,
        assessmentStatus: "not_started" as AssessmentStatus,
        intakeStatus: "not_started" as const,
        candidatePathwaysGenerated: false,
        careerGoalLocked: false,
        assessmentAttemptsAllowed: 1,
        assessmentAttemptsUsed: 0,
        freePreviewUnlocked: false,
        reportUnlocked: false,
        roadmapActivated: false,
        taskProgress: {},
        learningProgress: {}
      };

      if (!flowOverride) return base;
      return {
        ...base,
        ...(flowOverride.entitlements || {}),
        ...(flowOverride.progress || {})
      };
    },
    [journeyState, selectedPlan, flowOverride]
  );

  const flowUi = flowOverride?.ui;
  const isFlowPreview = Boolean(flowOverride);
  const entitlements = useMemo(() => getEntitlements(state.planTier), [state.planTier]);
  const counsellingEnabled =
    canBookInterpretationSession({
      planTier: state.planTier,
      assessmentStatus: state.assessmentStatus,
      intakeStatus: state.intakeStatus,
      candidatePathwaysGenerated: state.candidatePathwaysGenerated,
      careerGoalLocked: state.careerGoalLocked,
      roadmapActivated: state.roadmapActivated
    }) || state.planTier === "strategy" || state.planTier === "mentorship_plus";
  const strategyFlowId = isStrategyDashboardFlow(flowParam)
    ? flowParam
    : !flowParam && selectedPlan === "strategy"
      ? "strategy-direct-before-assessment"
      : null;
  const strategyFlowState = strategyFlowId ? getStrategyDashboardFlow(strategyFlowId) : null;
  const isPathwaysOpen = pathwaysParam === "open";

  const isFreePlan = state.planTier === "free";

  if (!isFreePlan) {
    const nonFreeAssessmentCompleted = state.assessmentStatus === "completed";
    const nonFreeRoadmapStatus = isFlowPreview ? flowUi?.roadmapStatus : undefined;
    const nonFreeDronaAccess = isFlowPreview ? flowUi?.dronaAccess : undefined;
    const strategyPrimaryAction = strategyFlowState ? getStrategyPrimaryAction(strategyFlowState.flow) : {
      stage: nonFreeAssessmentCompleted ? "Journey Active" : "Assessment Pending",
      title: nonFreeAssessmentCompleted ? "Continue Journey" : "Start Assessment",
      description: nonFreeAssessmentCompleted
        ? "Your assessment is complete. Continue into the next stage of your career journey."
        : "Complete your assessment to unlock report interpretation and execution planning.",
      ctaLabel: nonFreeAssessmentCompleted ? "Continue journey" : "Start assessment",
      ctaHref: nonFreeAssessmentCompleted ? flowUi?.continueJourneyHref || "/counselling" : "/assessments/start"
    };
    const strategyJourneySteps = strategyFlowState
      ? getStrategyJourneySteps(strategyFlowState.flow)
      : [
          { label: "Assessment", status: nonFreeAssessmentCompleted ? "complete" as const : "current" as const },
          { label: "Counselling", status: nonFreeAssessmentCompleted ? "current" as const : "locked" as const },
          { label: "Roadmap", status: nonFreeRoadmapStatus === "active" ? "current" as const : "locked" as const },
          { label: "Learning", status: nonFreeDronaAccess === "starter" ? "current" as const : "locked" as const },
          { label: "Progress", status: entitlements.progressTracking ? "current" as const : "locked" as const }
        ];
    const nonFreeActionHref = strategyPrimaryAction.ctaHref;
    const nonFreeActionLabel = strategyPrimaryAction.ctaLabel;

    return (
      <section>
        <PageHeader
          title={`Welcome back, ${student.name.split(" ")[0]}`}
          description="Your career journey is organized in one place."
        />
        <DashboardPrimaryAction
          stage={strategyPrimaryAction.stage}
          title={strategyPrimaryAction.title}
          description={strategyPrimaryAction.description}
          ctaLabel={strategyPrimaryAction.ctaLabel}
          ctaHref={strategyPrimaryAction.ctaHref}
        />
        <JourneyProgressStrip steps={strategyJourneySteps} />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Career Discovery Assessment</CardTitle>
              <CardDescription>{isFlowPreview && nonFreeAssessmentCompleted ? "Status: Completed" : "Status: Not started"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm">
                <Link href={isFlowPreview && nonFreeAssessmentCompleted ? "/assessments/result" : "/assessments/start"}>
                  {isFlowPreview && nonFreeAssessmentCompleted ? "View report" : "Start assessment"}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Career Counselling</CardTitle>
              <CardDescription>
                {strategyFlowState
                  ? strategyFlowState.counselling.description
                  : nonFreeAssessmentCompleted
                    ? "Schedule your interpretation session"
                    : "Counselling opens after your assessment is ready"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                {strategyFlowState
                  ? getStrategyStatusBadge(strategyFlowState.counselling.status)
                  : counsellingEnabled
                    ? <Badge>Active</Badge>
                    : <Badge variant="outline">Locked</Badge>}
              </div>
              {strategyFlowState?.counselling.tasks?.length ? (
                <div className="space-y-2">
                  {strategyFlowState.counselling.tasks.map((task) => (
                    <div key={task} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-700">
                      {task}
                    </div>
                  ))}
                </div>
              ) : counsellingEnabled ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  {state.careerGoalLocked ? "Session 1 completed. Follow your counselling plan for the next checkpoint." : "Book your first interpretation session to move into guided execution."}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Lock className="h-4 w-4" /> Complete the previous stage first.
                </div>
              )}
              {strategyFlowState?.counselling.ctaLabel && strategyFlowState.counselling.ctaHref ? (
                <Button asChild size="sm">
                  <Link href={strategyFlowState.counselling.ctaHref}>{strategyFlowState.counselling.ctaLabel}</Link>
                </Button>
              ) : counsellingEnabled ? (
                <Button asChild size="sm">
                  <Link href={state.careerGoalLocked ? "/counselling" : "/counselling/intake"}>
                    {state.careerGoalLocked ? "View counselling plan" : "Book session"}
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Roadmap Progress</CardTitle>
              <CardDescription>
                {isFlowPreview
                  ? nonFreeRoadmapStatus === "active"
                    ? "Bixa roadmap active"
                    : nonFreeRoadmapStatus === "draft"
                      ? "Draft roadmap: final goal locks after counselling outcome"
                      : "Complete counselling to finalize goal"
                  : "Bixa activation pending"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isFlowPreview && nonFreeRoadmapStatus === "active" ? (
                <>
                  <Progress value={44} />
                  <p className="mt-2 text-sm text-slate-500">Monthly timeline active. Weekly tasks ON.</p>
                </>
              ) : !isFlowPreview ? (
                <>
                  <Progress value={22} />
                  <p className="mt-2 text-sm text-slate-500">Activate after counselling outcome</p>
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Lock className="h-4 w-4" /> Locked
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommended Learning</CardTitle>
              <CardDescription>
                {isFlowPreview
                  ? nonFreeDronaAccess === "starter"
                    ? "Starter Drona track available"
                    : "Drona teaser only"
                  : "Mapped for Product Design"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isFlowPreview ? (nonFreeDronaAccess === "starter" ? (
                <Button variant="outline" asChild size="sm">
                  <Link href="/drona">Open Drona</Link>
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Lock className="h-4 w-4" /> Drona modules unlock with roadmap progress.
                </div>
              )) : (
                <Button variant="outline" asChild size="sm">
                  <Link href="/drona">Open Drona</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Secondary Context</h2>
            <p className="text-sm text-slate-500">Supporting insight for your current stage</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="bg-gradient-to-r from-primary to-secondary text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Career Pathways
                </CardTitle>
                <CardDescription className="text-white/80">
                  {strategyFlowState
                    ? strategyFlowState.pathways.description
                    : "Based on your current strengths and interests"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {strategyFlowState
                  ? strategyFlowState.pathways.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg bg-white/10 p-2 text-sm">
                        <div>
                          <p>{item.title}</p>
                          {item.subtitle ? <p className="text-xs text-white/70">{item.subtitle}</p> : null}
                        </div>
                        {item.locked ? <Lock className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                      </div>
                    ))
                  : careerClusters.map((career) => (
                      <div key={career} className="flex items-center justify-between rounded-lg bg-white/10 p-2 text-sm">
                        <span>{career}</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    ))}
                {strategyFlowState ? (
                  <Button asChild size="sm" variant="secondary" className="mt-3">
                    <Link href={isPathwaysOpen ? `/dashboard?flow=${strategyFlowState.flow}` : `/dashboard?flow=${strategyFlowState.flow}&pathways=open`}>
                      {isPathwaysOpen ? "Hide details" : "Open details"}
                    </Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white/90">
              <CardHeader>
                <CardTitle className="text-lg">Career Insights Preview</CardTitle>
                <CardDescription>
                  {strategyFlowState
                    ? strategyFlowState.insights.description
                    : isFlowPreview && !nonFreeAssessmentCompleted
                      ? "Complete assessment to unlock your full report"
                      : "Top strengths unlocked"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {strategyFlowState ? (
                  strategyFlowState.insights.previewItems?.length ? (
                    strategyFlowState.insights.previewItems.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)
                  ) : (
                    <div className="w-full rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                      Insights will become available at the right stage.
                    </div>
                  )
                ) : isFlowPreview && !nonFreeAssessmentCompleted ? (
                  <div className="w-full rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                    Assessment incomplete. Full report will unlock once completed.
                  </div>
                ) : (
                  topStrengths.slice(0, 2).map((strength) => <Badge key={strength}>{strength}</Badge>)
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white/90">
              <CardHeader>
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  {strategyFlowState
                    ? strategyFlowState.progress.description
                    : entitlements.progressTracking ? "Execution monitoring is active." : "Available in Strategy and Mentorship+ plans."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {strategyFlowState ? (
                  <>
                    <div className="flex items-center justify-between">
                      {getStrategyStatusBadge(strategyFlowState.progress.status)}
                    </div>
                    {strategyFlowState.progress.stats ? (
                      <>
                        <div className="grid gap-2 text-sm sm:grid-cols-2">
                          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                            Tasks: {strategyFlowState.progress.stats.tasksCompleted}/{strategyFlowState.progress.stats.tasksTotal}
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                            Modules: {strategyFlowState.progress.stats.modulesCompleted}/{strategyFlowState.progress.stats.modulesTotal}
                          </div>
                        </div>
                        {typeof strategyFlowState.progress.stats.roadmapCompletionPct === "number" ? (
                          <>
                            <Progress value={strategyFlowState.progress.stats.roadmapCompletionPct} />
                            <p className="text-xs text-slate-500">
                              Roadmap completion: {strategyFlowState.progress.stats.roadmapCompletionPct}%
                            </p>
                          </>
                        ) : null}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Lock className="h-4 w-4" /> Progress data appears after roadmap activation.
                      </div>
                    )}
                    {strategyFlowState.progress.ctaLabel && strategyFlowState.progress.ctaHref ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={strategyFlowState.progress.ctaHref}>{strategyFlowState.progress.ctaLabel}</Link>
                      </Button>
                    ) : null}
                  </>
                ) : entitlements.progressTracking ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href="/progress">Open Progress</Link>
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Lock className="h-4 w-4" /> Locked
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {strategyFlowState && isPathwaysOpen ? (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{strategyFlowState.pathways.detail.title}</CardTitle>
                  <CardDescription>{strategyFlowState.pathways.detail.description}</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard?flow=${strategyFlowState.flow}`}>Close</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Why it fits</p>
                <div className="mt-2 space-y-2 text-sm text-slate-700">
                  {strategyFlowState.pathways.detail.whyItFits.map((item) => (
                    <p key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Education direction</p>
                <div className="mt-2 space-y-2 text-sm text-slate-700">
                  {strategyFlowState.pathways.detail.educationDirection.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Career examples</p>
                <div className="mt-2 space-y-2 text-sm text-slate-700">
                  {strategyFlowState.pathways.detail.careerExamples.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Related options</p>
                <div className="mt-2 space-y-2 text-sm text-slate-700">
                  {(strategyFlowState.pathways.detail.relatedOptions || []).map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
                <Button asChild size="sm" className="mt-4">
                  <Link href={strategyFlowState.pathways.detail.ctaHref}>{strategyFlowState.pathways.detail.ctaLabel}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </section>
    );
  }

  const assessmentCard =
    state.assessmentStatus === "not_started"
      ? {
          status: `${state.assessmentAttemptsAllowed - state.assessmentAttemptsUsed} free attempt available`,
          helper: "You can submit once on the Free plan.",
          chip: "Not started",
          cta: "Start free assessment",
          href: "/assessments/start"
        }
      : state.assessmentStatus === "in_progress"
        ? {
            status: "Free attempt in progress",
            helper: "Complete submission to unlock your snapshot preview.",
            chip: "In progress",
            cta: "Resume free attempt",
            href: "/assessments/start"
          }
        : {
            status: "Completed",
            helper: "Free attempt used. No additional free attempts available.",
            chip: "Completed",
            cta: "View Results",
            href: "/assessments/result"
          };

  const isFreeExistingPreview = isFlowPreview && flowUi?.reportAccessLevel === "limited" && state.assessmentStatus === "completed";
  const freePrimaryAction = getFreePrimaryAction(state, assessmentCard.href);
  const freeJourneySteps = getFreeJourneySteps(state);

  return (
    <section>
      <PageHeader
        title={`Welcome back, ${student.name.split(" ")[0]}`}
        description="Your career journey is organized in one place."
      />
      <DashboardPrimaryAction
        stage={freePrimaryAction.stage}
        title={freePrimaryAction.title}
        description={freePrimaryAction.description}
        ctaLabel={freePrimaryAction.ctaLabel}
        ctaHref={freePrimaryAction.ctaHref}
      />
      <JourneyProgressStrip steps={freeJourneySteps} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Career Discovery Assessment</CardTitle>
            <CardDescription>{assessmentCard.status}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <Badge variant={state.assessmentStatus === "completed" ? "outline" : "default"}>{assessmentCard.chip}</Badge>
              {state.assessmentStatus === "completed" ? <Badge variant="outline">Attempt used</Badge> : null}
            </div>
            <p className="mb-3 text-xs text-slate-500">{assessmentCard.helper}</p>
            {state.assessmentStatus === "not_started" ? null : (
              <Button asChild size="sm">
                <Link href={assessmentCard.href}>{assessmentCard.cta}</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Career Counselling</CardTitle>
            <CardDescription>
              {counsellingEnabled
                ? state.careerGoalLocked
                  ? "Counsellor outcome locked"
                  : "Schedule your interpretation session"
                : "Locked until plan and assessment requirements are met"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {counsellingEnabled ? (
              <Button asChild size="sm">
                <Link href={state.careerGoalLocked ? "/counselling" : "/counselling/intake"}>
                  {state.careerGoalLocked ? "View session outcome" : "Book session"}
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Lock className="h-4 w-4" /> Upgrade to Clarity to unlock.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{state.roadmapActivated ? "Roadmap Progress" : "Roadmap"}</CardTitle>
            <CardDescription>
              {state.roadmapActivated
                ? "Bixa roadmap active"
                : state.assessmentStatus === "completed"
                  ? "Locked: upgrade to activate your personalized Bixa roadmap"
                  : "Available after assessment and plan activation"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.roadmapActivated ? (
              <>
                <Progress value={22} />
                <p className="mt-2 text-sm text-slate-500">Milestone execution in progress</p>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Lock className="h-4 w-4" /> Locked
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recommended Learning</CardTitle>
            <CardDescription>
              Locked on Free plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Lock className="h-4 w-4" /> Upgrade required to unlock Drona learning tracks.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Secondary Context</h2>
          <p className="text-sm text-slate-500">Supporting cards remain available below the main action area</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="bg-gradient-to-r from-primary to-secondary text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" /> Career Pathways
              </CardTitle>
              <CardDescription className="text-white/80">
                {state.assessmentStatus === "not_started"
                  ? "Complete your free assessment to discover your best-fit career clusters"
                  : isFreeExistingPreview
                    ? "1 cluster unlocked in preview. Full fit analysis is locked."
                    : "Locked on Free plan dashboard"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isFreeExistingPreview
                ? (
                  <>
                    <div className="flex items-center justify-between rounded-lg bg-white/10 p-2 text-sm">
                      <span>Product Design</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/10 p-2 text-sm text-white/80">
                      <span>Architecture (Locked)</span>
                      <Lock className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/10 p-2 text-sm text-white/80">
                      <span>UX Design (Locked)</span>
                      <Lock className="h-4 w-4" />
                    </div>
                  </>
                )
                : state.assessmentStatus !== "not_started"
                ? [1, 2].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-lg bg-white/10 p-2 text-sm text-white/80">
                      <span>Cluster deep-dive locked</span>
                      <Lock className="h-4 w-4" />
                    </div>
                  ))
                : [1, 2].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-lg bg-white/10 p-2 text-sm text-white/70">
                      <span>Locked cluster preview</span>
                      <Lock className="h-4 w-4" />
                    </div>
                  ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white/90">
            <CardHeader>
              <CardTitle className="text-lg">Career Insights Preview</CardTitle>
              <CardDescription>
                {isFreeExistingPreview ? "Limited report preview unlocked" : "Locked on Free plan dashboard"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {isFreeExistingPreview ? (
                <>
                  {topStrengths.slice(0, 3).map((strength) => (
                    <Badge key={strength}>{strength}</Badge>
                  ))}
                  <Badge variant="secondary">Product Design</Badge>
                  <Badge variant="outline">Architecture (Locked)</Badge>
                  <Badge variant="outline">UX Design (Locked)</Badge>
                  <p className="w-full text-xs text-slate-500">You&apos;ve unlocked one cluster preview. Upgrade for full report access.</p>
                  <Button asChild size="sm">
                    <Link href="/pricing">Unlock report</Link>
                  </Button>
                </>
              ) : (
                <div className="w-full rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                  {state.assessmentStatus === "completed"
                    ? "View your limited snapshot from the Assessment card. Full dashboard insights unlock with upgrade."
                    : "Insight preview is locked until your free assessment is completed."}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white/90">
            <CardHeader>
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                {entitlements.progressTracking ? "Execution monitoring is active." : "Available in Strategy and Mentorship+ plans."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {entitlements.progressTracking ? (
                <Button asChild size="sm" variant="outline">
                  <Link href="/progress">Open Progress</Link>
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Lock className="h-4 w-4" /> Locked
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
