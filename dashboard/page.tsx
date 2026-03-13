"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { canBookInterpretationSession, getEntitlements } from "@/lib/access-control";
import { getFlowOverride, isFlowPreviewEnabled, resolveFlowId } from "@/lib/flowOverride";
import { useOnboardingStore } from "@/store/onboarding-store";
import { getActiveSession, initializeJourneyStateIfMissing, JourneyState } from "@/lib/journey-state";
import { PageHeader } from "@/components/layout/page-header";
import { RouteCard } from "@/components/layout/route-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { careerClusters, student, topStrengths } from "@/lib/mock-data";

type AssessmentStatus = "not_started" | "in_progress" | "completed";

export default function DashboardPage() {
  const pathname = usePathname();
  const selectedPlan = useOnboardingStore((s) => s.selectedPlan);
  const onboardingEmail = useOnboardingStore((s) => s.email);
  const authVerified = useOnboardingStore((s) => s.authVerified);
  const [journeyState, setJourneyState] = useState<JourneyState | null>(null);
  const [flowParam, setFlowParam] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setFlowParam(new URLSearchParams(window.location.search).get("flow"));
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

  const isFreePlan = state.planTier === "free";

  if (!isFreePlan) {
    const nonFreeAssessmentCompleted = state.assessmentStatus === "completed";
    const nonFreeActionHref = isFlowPreview
      ? nonFreeAssessmentCompleted
        ? flowUi?.continueJourneyHref || "/counselling"
        : "/assessments/start"
      : "/assessments/start";
    const nonFreeActionLabel = isFlowPreview
      ? nonFreeAssessmentCompleted
        ? "Continue journey"
        : "Start assessment"
      : "Start assessment";
    const nonFreeRoadmapStatus = isFlowPreview ? flowUi?.roadmapStatus : undefined;
    const nonFreeDronaAccess = isFlowPreview ? flowUi?.dronaAccess : undefined;

    return (
      <section>
        <PageHeader
          title={`Welcome back, ${student.name.split(" ")[0]}`}
          description="Your career journey is organized in one place."
          action={
            <Button asChild>
              <Link href={nonFreeActionHref}>{nonFreeActionLabel}</Link>
            </Button>
          }
        />
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
              <CardTitle className="text-lg">Career Insights Preview</CardTitle>
              <CardDescription>
                {isFlowPreview && !nonFreeAssessmentCompleted
                  ? "Complete assessment to unlock your full report"
                  : "Top strengths unlocked"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {isFlowPreview && !nonFreeAssessmentCompleted ? (
                <div className="w-full rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                  Assessment incomplete. Full report will unlock once completed.
                </div>
              ) : (
                topStrengths.slice(0, 2).map((strength) => <Badge key={strength}>{strength}</Badge>)
              )}
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

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <RouteCard
            title={isFlowPreview && nonFreeAssessmentCompleted ? "Next Action: Continue Journey" : "Next Action: Complete Assessment"}
            description={isFlowPreview && nonFreeAssessmentCompleted
              ? "Move into counselling to interpret your report and finalize your roadmap."
              : "Unlock your detailed profile and counselling recommendation."
            }
            cta={isFlowPreview && nonFreeAssessmentCompleted ? "Continue journey" : "Continue journey"}
            href={isFlowPreview && nonFreeAssessmentCompleted ? nonFreeActionHref : "/assessments"}
          />

          <Card className="bg-gradient-to-r from-primary to-secondary text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" /> Career clusters trending
              </CardTitle>
              <CardDescription className="text-white/80">Based on your current strengths and interests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {careerClusters.map((career) => (
                <div key={career} className="flex items-center justify-between rounded-lg bg-white/10 p-2 text-sm">
                  <span>{career}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
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
  const counsellingEnabled =
    canBookInterpretationSession({
      planTier: state.planTier,
      assessmentStatus: state.assessmentStatus,
      intakeStatus: state.intakeStatus,
      candidatePathwaysGenerated: state.candidatePathwaysGenerated,
      careerGoalLocked: state.careerGoalLocked,
      roadmapActivated: state.roadmapActivated
    }) || state.planTier === "strategy" || state.planTier === "mentorship_plus";

  return (
    <section>
      <PageHeader
        title={`Welcome back, ${student.name.split(" ")[0]}`}
        description="Your career journey is organized in one place."
        action={state.assessmentStatus === "in_progress" ? (
          <Button asChild>
            <Link href="/assessments/start">Resume free attempt</Link>
          </Button>
        ) : undefined}
      />
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

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
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

        <Card>
          <CardHeader>
            <CardTitle>Career Counselling</CardTitle>
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
                <Lock className="h-4 w-4" /> {isFreePlan ? "Upgrade to Clarity to unlock." : "Complete assessment first."}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
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
    </section>
  );
}
