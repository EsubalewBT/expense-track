import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          ExpenseFlow UI
        </h1>
        <p className="text-muted-foreground">The architecture is ready.</p>
        <Button>Click Me</Button>
      </div>
    </div>
  );
}