"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const methods = ["UPI", "Card", "Netbanking"];

export default function PaymentPage() {
  const router = useRouter();
  const [method, setMethod] = useState("UPI");

  return (
    <section>
      <PageHeader title="Payment" description="Secure checkout for Career Strategy Session." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Choose payment method</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {methods.map((item) => (
              <button
                key={item}
                onClick={() => setMethod(item)}
                className={`rounded-xl border p-4 text-left ${
                  method === item ? "border-primary bg-primary/5 text-primary" : "border-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
            <CardDescription>Career Strategy Session - 60 min</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Price</span>
              <span>INR 1,999</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Platform fee</span>
              <span>INR 0</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span>INR 1,999</span>
            </div>
            <Button className="mt-3 w-full" onClick={() => router.push("/counselling/book")}>
              Pay with {method}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
