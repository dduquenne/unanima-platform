'use client'

import { cn } from '../utils/cn'

interface Step {
  id: string
  label: string
  description?: string
}

export interface StepperProps {
  steps: Step[]
  currentStep: number
  orientation?: 'horizontal' | 'vertical'
  onStepClick?: (index: number) => void
  className?: string
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function Stepper({
  steps,
  currentStep,
  orientation = 'horizontal',
  onStepClick,
  className,
}: StepperProps) {
  const isHorizontal = orientation === 'horizontal'

  return (
    <div
      role="list"
      className={cn(
        isHorizontal
          ? 'flex items-start overflow-x-auto scrollbar-hide'
          : 'flex flex-col',
        className,
      )}
    >
      {steps.map((step, index) => {
        const isPast = index < currentStep
        const isCurrent = index === currentStep
        const isFuture = index > currentStep
        const isClickable = isPast && !!onStepClick

        return (
          <div
            key={step.id}
            role="listitem"
            aria-current={isCurrent ? 'step' : undefined}
            className={cn(
              isHorizontal ? 'flex items-center flex-1 min-w-0' : 'flex gap-3',
              index < steps.length - 1 && !isHorizontal && 'pb-6',
            )}
          >
            {/* Vertical connector line (left side) */}
            {!isHorizontal && (
              <div className="flex flex-col items-center">
                <StepCircle
                  index={index}
                  isPast={isPast}
                  isCurrent={isCurrent}
                  isClickable={isClickable}
                  onClick={() => isClickable && onStepClick?.(index)}
                />
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 min-h-[1.5rem] mt-2',
                      isPast
                        ? 'bg-[var(--color-success)]'
                        : 'bg-[var(--color-border-light)]',
                    )}
                  />
                )}
              </div>
            )}

            {/* Horizontal layout */}
            {isHorizontal && (
              <>
                <div className="flex flex-col items-center shrink-0">
                  <StepCircle
                    index={index}
                    isPast={isPast}
                    isCurrent={isCurrent}
                    isClickable={isClickable}
                    onClick={() => isClickable && onStepClick?.(index)}
                  />
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 mx-2 mt-4',
                      isPast
                        ? 'bg-[var(--color-success)]'
                        : 'bg-[var(--color-border-light)]',
                    )}
                  />
                )}
              </>
            )}

            {/* Labels */}
            <div
              className={cn(
                isHorizontal ? 'hidden' : 'pt-0.5 min-w-0',
              )}
            >
              <p
                className={cn(
                  'text-[var(--font-size-sm)] font-[var(--font-weight-medium)] truncate',
                  isCurrent && 'text-[var(--color-primary)]',
                  isPast && 'text-[var(--color-text)]',
                  isFuture && 'text-[var(--color-text-muted)]',
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)] truncate">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        )
      })}

      {/* Horizontal labels (below circles) */}
      {isHorizontal && (
        <div className="sr-only">
          {steps.map((step, index) => (
            <span key={step.id}>
              {`Étape ${index + 1}: ${step.label}${index === currentStep ? ' (en cours)' : index < currentStep ? ' (terminée)' : ''}`}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

interface StepCircleProps {
  index: number
  isPast: boolean
  isCurrent: boolean
  isClickable: boolean
  onClick: () => void
}

function StepCircle({ index, isPast, isCurrent, isClickable, onClick }: StepCircleProps) {
  const circle = (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--font-size-sm)] font-[var(--font-weight-semibold)] transition-colors',
        isPast && 'bg-[var(--color-success)] text-white',
        isCurrent &&
          'border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-surface)]',
        !isPast && !isCurrent &&
          'border border-[var(--color-border-light)] text-[var(--color-text-muted)] bg-[var(--color-surface)]',
      )}
    >
      {isPast ? <CheckIcon /> : index + 1}
    </div>
  )

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 rounded-full"
        aria-label={`Aller à l'étape ${index + 1}`}
      >
        {circle}
      </button>
    )
  }

  return circle
}
