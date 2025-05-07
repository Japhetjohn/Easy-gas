import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950">
      <Card className="w-full max-w-md mx-4 border-neutral-800 bg-neutral-900 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-6">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-3xl font-bold text-white">404 - Page Not Found</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary my-4"></div>
            <p className="mt-2 text-neutral-300">
              The page you are looking for doesn't exist or has been moved.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Link href="/">
            <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white">
              <Home className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
