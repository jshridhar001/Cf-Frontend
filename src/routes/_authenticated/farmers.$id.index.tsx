import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/farmers/$id/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/farmers/$id/requisitions',
      params: { id: params.id },
    });
  },
});
