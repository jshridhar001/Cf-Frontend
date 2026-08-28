import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useMe } from '@/features/auth/api/use-me';
import { env } from '@/lib/env';

export function StartScreen() {
  const navigate = useNavigate();
  const { data: me } = useMe();

  function handleGetStarted() {
    if (me) {
      void navigate({ to: '/dashboard' });
      return;
    }

    void navigate({ to: '/login' });
  }

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-background px-4 py-8">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <img
          src="https://res.cloudinary.com/dakh64xhy/image/upload/v1759410800/Bhatti-Agritech_gwqywg.jpg"
          alt={env.appName}
          className="size-16 shrink-0 rounded-md sm:size-20"
        />
        <h1 className="scroll-m-20 text-center text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
          Bhatti Agritech Contract Farming
        </h1>
        <Button type="button" size="lg" className="w-full" onClick={handleGetStarted}>
          Get Started
        </Button>
      </div>
    </div>
  );
}
