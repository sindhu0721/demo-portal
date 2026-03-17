"use client";

import { useRouter } from "next/navigation";
import { careerClusters } from "@/lib/mock-data";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CounsellingOutcomePage() {
  const router = useRouter();
  const activateRoadmap = useAppStore((s) => s.activateRoadmap);

  return (
    <section>
      <PageHeader title="Counselling Outcome" description="Recommended directions and execution roadmap preview." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recommended careers</CardTitle>
            <CardDescription>Based on assessment + counselling interpretation</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {careerClusters.map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roadmap Preview</CardTitle>
            <CardDescription>Goal-led monthly milestones through Bixa.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                activateRoadmap("Become Product Designer");
                router.push("/bixa");
              }}
            >
              Activate Career Roadmap
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
