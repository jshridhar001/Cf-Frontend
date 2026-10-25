import { createFileRoute } from '@tanstack/react-router';
import { TaskManagerPage } from '@/features/task-manager/components/task-manager-page';

export const Route = createFileRoute('/_authenticated/task-manager')({
  component: TaskManagerPage,
});
