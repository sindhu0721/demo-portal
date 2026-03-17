"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

const steps = [
  { label: "Academic context", field: "Grade and subjects", placeholder: "Grade 10, CBSE, Math, Science, English" },
  { label: "Career interests", field: "Career interests", placeholder: "Product design, architecture, UX" },
  { label: "Parent expectations", field: "Parent expectations", placeholder: "Balance passion with strong career outcomes" },
  { label: "Main confusion", field: "Main confusion", placeholder: "Which stream and path should I choose?" },
  { label: "Questions", field: "Questions for counsellor", placeholder: "How to build portfolio in class 10?" }
];

export default function IntakePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  return (
    <section>
      <PageHeader title="Counselling Intake Form" description={`Step ${step + 1} of ${steps.length}`} />
      <Card>
        <CardHeader>
          <CardTitle>{steps[step].label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Progress value={((step + 1) / steps.length) * 100} />
          {step === 0 ? (
            <Input placeholder={steps[step].placeholder} />
          ) : (
            <Textarea placeholder={steps[step].placeholder} />
          )}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              Previous
            </Button>
            <Button
              onClick={() => (step === steps.length - 1 ? router.push("/counselling/book") : setStep((s) => s + 1))}
            >
              {step === steps.length - 1 ? "Continue to Booking" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
