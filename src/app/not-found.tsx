import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftIcon } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <Card className="w-full max-w-lg text-center">
        <CardContent className="py-12">
          <h1 className="mb-4 text-7xl font-extrabold text-orange-600 md:text-9xl">
            404
          </h1>
          <h2 className="mb-3 text-2xl font-semibold text-slate-900 md:text-3xl">
            Page Not Found
          </h2>
          <p className="mb-8 text-center text-sm leading-6 text-slate-500 md:text-base">
            This admin route does not exist yet. Return to the dashboard and continue managing auctions.
          </p>
          <Link href="/" className="flex justify-center">
            <Button>
              <ArrowLeftIcon />
              Go Back Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
