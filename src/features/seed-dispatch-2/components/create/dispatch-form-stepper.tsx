import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

const STEPS = [
  {
    title: 'Select Requisitions',
    description: 'Choose approved requisitions',
    short: 'Select',
  },
  {
    title: 'Fill Details',
    description: 'Enter dispatch and truck details',
    short: 'Details',
  },
] as const;

type DispatchFormStepperProps = {
  currentStep: 1 | 2;
  onStepChange?: (step: 1 | 2) => void;
};

export function DispatchFormStepper({ currentStep, onStepChange }: DispatchFormStepperProps) {
  return (
    <nav aria-label="Dispatch form progress" className="w-full">
      <ol className="flex items-center gap-2 sm:hidden">
        {STEPS.map((step, index) => {
          const stepNumber = (index + 1) as 1 | 2;
          const isActive = currentStep === stepNumber;
          const isComplete = currentStep > stepNumber;
          const isLast = index === STEPS.length - 1;
          const canNavigate = Boolean(onStepChange) && isComplete;

          return (
            <li key={step.title} className="flex items-center gap-2">
              <button
                type="button"
                disabled={!canNavigate}
                className={cn(
                  'flex items-center gap-1.5 rounded-md text-left',
                  canNavigate && 'hover:opacity-80',
                  !canNavigate && 'cursor-default',
                )}
                onClick={() => {
                  if (canNavigate) onStepChange?.(stepNumber);
                }}
              >
                <div
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                    isComplete || isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isComplete ? <Check className="size-3" /> : stepNumber}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium',
                    isActive || isComplete ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.short}
                </span>
              </button>
              {!isLast ? (
                <span className="text-muted-foreground text-sm" aria-hidden>
                  →
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      <ol className="hidden items-start sm:flex">
        {STEPS.map((step, index) => {
          const stepNumber = (index + 1) as 1 | 2;
          const isActive = currentStep === stepNumber;
          const isComplete = currentStep > stepNumber;
          const isLast = index === STEPS.length - 1;
          const canNavigate = Boolean(onStepChange) && isComplete;

          return (
            <li key={step.title} className={cn('flex items-start', !isLast && 'flex-1')}>
              <button
                type="button"
                disabled={!canNavigate}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-md text-center',
                  canNavigate && 'hover:opacity-80',
                  !canNavigate && 'cursor-default',
                )}
                onClick={() => {
                  if (canNavigate) onStepChange?.(stepNumber);
                }}
              >
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium',
                    isComplete || isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isComplete ? <Check className="size-4" /> : stepNumber}
                </div>
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isActive || isComplete ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="text-muted-foreground text-xs">{step.description}</span>
                </div>
              </button>
              {!isLast ? (
                <div
                  className={cn('mx-4 mt-4 h-px flex-1', isComplete ? 'bg-primary' : 'bg-border')}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
