import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ComingSoonPage({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <p className="max-w-md text-sm leading-6 text-slate-500">{description}</p>
          <Button className="mt-6">Create New</Button>
        </div>
      </CardContent>
    </Card>
  );
}
