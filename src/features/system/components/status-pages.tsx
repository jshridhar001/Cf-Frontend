import { type ErrorComponentProps } from '@tanstack/react-router';
import {
  StatusBackButton,
  StatusDashboardButton,
  StatusHomeButton,
  StatusLoginButton,
  StatusPage,
  StatusRetryButton,
} from './status-page';

export function NotFoundPage() {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      description="This page doesn’t exist or the resource you’re looking for has been moved."
    >
      <StatusHomeButton />
      <StatusBackButton />
    </StatusPage>
  );
}

export function ServerErrorPage() {
  return (
    <StatusPage
      code="500"
      title="Server error"
      description="Something went wrong on our side. Please try again in a moment."
    >
      <StatusRetryButton />
      <StatusHomeButton variant="outline" />
    </StatusPage>
  );
}

export function ForbiddenPage() {
  return (
    <StatusPage
      code="403"
      title="Access denied"
      description="You don’t have permission to view this page. Ask an administrator if you need access."
    >
      <StatusDashboardButton />
      <StatusHomeButton variant="outline" />
    </StatusPage>
  );
}

export function UnauthorizedPage() {
  return (
    <StatusPage
      code="401"
      title="Sign in required"
      description="You need to sign in before you can access this part of the app."
    >
      <StatusLoginButton />
      <StatusHomeButton variant="outline" />
    </StatusPage>
  );
}

export function ErrorPage() {
  return (
    <StatusPage
      title="Something went wrong"
      description="An unexpected error occurred. Return to the homepage to continue."
    >
      <StatusHomeButton label="Return to Homepage" />
    </StatusPage>
  );
}

export function RouterErrorComponent(_props: ErrorComponentProps) {
  return <ErrorPage />;
}

export function MaintenancePage() {
  return (
    <StatusPage
      title="We’ll be back soon"
      description="The service is temporarily unavailable for maintenance. Please check back shortly."
    >
      <StatusHomeButton />
    </StatusPage>
  );
}

export function OfflinePage() {
  return (
    <StatusPage
      title="You’re offline"
      description="Check your network connection, then try again when you’re back online."
    >
      <StatusRetryButton />
      <StatusHomeButton variant="outline" />
    </StatusPage>
  );
}

export function ComingSoonPage() {
  return (
    <StatusPage
      title="Coming soon"
      description="This feature isn’t available yet. We’re working on it."
    >
      <StatusHomeButton />
    </StatusPage>
  );
}
