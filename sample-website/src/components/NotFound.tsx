import { Button } from "./ui/button";

interface NotFoundProps {
  onNavigate: (page: string) => void;
}

export default function NotFound({ onNavigate }: NotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-neutral-900 mb-4">404</h1>
      <p className="text-xl text-neutral-600 mb-8">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Button onClick={() => onNavigate("home")}>Return Home</Button>
    </div>
  );
}
