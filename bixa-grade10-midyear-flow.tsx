"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Flame, Lock, Target } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BixaDemoFlow } from "@/lib/bixa-demo-flows";

function getPhaseBadge(status: BixaDemoFlow["phases"][number]["status"]) {
  if (status === "completed") return <Badge variant="success">Completed</Badge>;
  if (status === "active") return <Badge>Active</Badge>;
  return <Badge variant="outline">Upcoming</Badge>;
}

function getWeekBadge(status: BixaDemoFlow["currentMonth"]["weeks"][number]["status"]) {
  if (status === "completed") return <Badge variant="success">Completed</Badge>;
  if (status === "in_progress") return <Badge>In progress</Badge>;
  return (
    <Badge variant="outline">
      <Lock className="mr-1 h-3 w-3" /> Locked
    </Badge>
  );
}

export function BixaGrade10MidyearFlow({ flow }: { flow: BixaDemoFlow }) {
  const activeWeek = flow.currentMonth.weeks.find((week) => week.status === "in_progress");
  const otherWeeks = flow.currentMonth.weeks.filter((week) => week.status !== "in_progress");
  const [primaryCompleted, setPrimaryCompleted] = useState(false);
  const [proofCompleted, setProofCompleted] = useState(false);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Bixa Roadmap"
        description="Weekly execution plan for the current academic phase."
        action={
          <Button asChild>
            <Link href="#this-week" className="inline-flex items-center gap-2">
              Resume Week 2 <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Goal</Badge>
            <Badge variant="secondary">12-month roadmap</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Target className="h-5 w-5 text-primary" />
            {flow.goal}
          </CardTitle>
          <CardDescription className="max-w-3xl">
            Based on your assessment, intake, and counselling validation, MPC is your selected stream. This roadmap helps you strengthen concepts, improve revision consistency, and build academic confidence through the year.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Fit Score</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{flow.metrics.fitScore}%</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Current Stage</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{flow.stage}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Progress</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{flow.progress.progressPct}%</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Consistency Score</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{flow.metrics.consistencyScore}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Roadmap Phases</CardTitle>
          <CardDescription>Goal {'>'} phases {'>'} month {'>'} week.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-4">
          {flow.phases.map((phase) => (
            <div key={phase.phaseId} className={`rounded-xl border p-3 ${phase.status === "active" ? "border-primary/30 bg-primary/5" : "border-slate-200 bg-white"}`}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-900">{phase.title}</p>
                {getPhaseBadge(phase.status)}
              </div>
              <p className="text-xs text-slate-500">{phase.duration}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_320px]">
        <Card id="this-week" className="border-primary/30">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>This Week</CardTitle>
                <CardDescription>
                  Week {activeWeek?.week} focuses on improving mock-test performance and revision consistency.
                </CardDescription>
              </div>
              {activeWeek ? getWeekBadge(activeWeek.status) : null}
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-slate-700">
              Month {flow.currentMonth.month} focus: {flow.currentMonth.focus}. Your mid-year review will refine the next phase after this cycle is complete.
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Primary task</p>
                    <p className="mt-1 font-semibold text-slate-900">Practice 30 Math problems</p>
                    <p className="mt-1 text-sm text-slate-600">
                      30-60 minute focus block. Includes timed mock strategy + formula revision support.
                    </p>
                  </div>
                  {primaryCompleted ? <Badge variant="success">Completed</Badge> : <Badge>Active</Badge>}
                </div>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">2 Drona modules support this task</Badge>
                  <Badge variant="outline">Week 2</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href="/drona">Start in Drona</Link>
                  </Button>
                  <Button variant="outline" onClick={() => setPrimaryCompleted(true)} disabled={primaryCompleted}>
                    {primaryCompleted ? "Completed" : "Mark completed"}
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Quick proof</p>
                    <p className="mt-1 font-semibold text-slate-900">Start 3-question concept check</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Quick acknowledgement task to confirm whether the week&apos;s revision method is working.
                    </p>
                  </div>
                  {proofCompleted ? <Badge variant="success">Nice work</Badge> : <Badge variant="secondary">5 min</Badge>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setProofCompleted(true)} disabled={proofCompleted}>
                    {proofCompleted ? "Completed" : "Start quick check"}
                  </Button>
                  {proofCompleted ? (
                    <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Progress updated
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Peer benchmark</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Students in this phase usually complete 2 tasks per week and stay on track when they study on 4 separate days.
                  </p>
                </div>
                <Badge variant="outline">Supportive benchmark</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-full bg-white px-2 py-1">1-2 learning modules is typical this week</span>
                <span className="rounded-full bg-white px-2 py-1">Consistency matters more than long study hours</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>Compact weekly execution snapshot.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-600">Roadmap progress</span>
                <span className="font-medium text-slate-900">{flow.progress.progressPct}%</span>
              </div>
              <Progress value={flow.progress.progressPct} />
            </div>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                Tasks completed: {flow.progress.tasksCompleted}/{flow.progress.tasksTotal}
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                Learning modules completed: {flow.progress.modulesCompleted}/{flow.progress.modulesTotal}
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                Current streak: {flow.progress.currentStreak}
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                Next checkpoint: mid-year follow-up
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Other Weeks</CardTitle>
          <CardDescription>Compact view so the active week stays in focus.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-3">
          {otherWeeks.map((week) => (
            <div key={week.week} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-medium text-slate-900">Week {week.week}</p>
                {getWeekBadge(week.status)}
              </div>
              <p className="text-sm text-slate-600">
                {week.status === "completed"
                  ? "Completed with revision tracking and one learning module finished."
                  : "Preview only. This week unlocks after the current plan is completed."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {week.status === "completed" ? (
                  <>
                    <Badge variant="secondary">3 tasks done</Badge>
                    <Badge variant="outline">2 modules used</Badge>
                  </>
                ) : (
                  <>
                    <Badge variant="outline">{week.tasks.length} tasks queued</Badge>
                    <Badge variant="outline">{week.dronaModules.length} learning supports</Badge>
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
