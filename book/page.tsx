"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const slots = ["Monday 6:00 PM", "Tuesday 5:00 PM", "Wednesday 7:00 PM", "Thursday 6:30 PM"];

export default function BookPage() {
  const router = useRouter();
  const setCounsellingBooked = useAppStore((s) => s.setCounsellingBooked);
  const [selectedSlot, setSelectedSlot] = useState(slots[0]);

  return (
    <section>
      <PageHeader title="Book Session" description="Select an available time slot." />
      <Card>
        <CardHeader>
          <CardTitle>Available slots</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            {slots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-xl border p-3 text-left ${
                  selectedSlot === slot ? "border-primary bg-primary/5 text-primary" : "border-slate-200"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
          <Button
            onClick={() => {
              setCounsellingBooked();
              router.push("/counselling/confirmation");
            }}
          >
            Confirm Booking
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
