"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ConfirmationPage() {
  return (
    <section>
      <PageHeader title="Booking Confirmed" description="Your counselling session has been scheduled successfully." />
      <Card className="mx-auto max-w-2xl">
        <CardContent className="space-y-4 p-8 text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mx-auto w-fit rounded-full bg-accent/10 p-4"
          >
            <CheckCircle2 className="h-10 w-10 text-accent" />
          </motion.div>
          <h2 className="text-2xl font-semibold">Session details</h2>
          <p className="text-slate-600">Date: Tuesday, 5:00 PM - Counsellor: Priya Menon</p>
          <p className="text-slate-600">Meeting link: meet.studyhq.demo/session/aarav-red</p>
          <div className="rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-600">
            <p className="mb-2 font-medium text-slate-800">Preparation checklist</p>
            <p>1. Keep your report open</p>
            <p>2. Bring stream and subject questions</p>
            <p>3. Add parent/guardian to final 10 mins</p>
          </div>
          <Button asChild>
            <Link href="/counselling/outcome">Continue</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
