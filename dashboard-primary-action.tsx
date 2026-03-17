import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardPrimaryAction({
  stage,
  title,
  description,
  ctaLabel,
  ctaHref
}: {
  stage: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <Card className="mb-4 border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="mb-2">
          <Badge>{stage}</Badge>
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="max-w-2xl text-sm text-slate-600">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild size="lg">
          <Link href={ctaHref} className="inline-flex items-center gap-2">
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
