import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/master/stations')({
  beforeLoad: () => {
    throw redirect({ to: '/master/addresses' });
  },
});
