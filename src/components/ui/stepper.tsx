import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle } from "lucide-react"

interface StepperProps {
  steps: Array<{
    id: string
    title: string
    description?: string
    completed?: boolean
  }>
  currentStep: string
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isCompleted = step.completed || index < currentIndex
        const isPast = index < currentIndex

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                isCompleted || isPast
                  ? "bg-primary border-primary text-primary-foreground"
                  : isActive
                    ? "border-primary text-primary bg-primary/10"
                    : "border-muted-foreground text-muted-foreground"
              )}>
                {isCompleted || isPast ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={cn(
                  "text-sm font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-4 transition-colors",
                isPast || isCompleted ? "bg-primary" : "bg-muted"
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}