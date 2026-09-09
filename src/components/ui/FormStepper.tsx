import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  title: string;
  subtitle?: string;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number; // 0-indexed
  onStepClick?: (stepIndex: number) => void;
}

export const FormStepper: React.FC<FormStepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="w-full py-4">
      {/* Mobile view step summary */}
      <div className="sm:hidden mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Step {currentStep + 1} of {steps.length}
          </span>
          <h4 className="text-sm font-bold text-emerald-950">{steps[currentStep]?.title}</h4>
        </div>
        <div className="text-xs font-mono font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-sm">
          {Math.round(((currentStep + 1) / steps.length) * 100)}%
        </div>
      </div>

      {/* Desktop & Tablet Stepper */}
      <nav aria-label="Progress">
        <ol role="list" className="hidden sm:flex items-center justify-between w-full">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <li key={step.title} className="relative flex-1 flex flex-col items-center">
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${
                      index < currentStep ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  />
                )}

                <button
                  type="button"
                  onClick={() => isCompleted && onStepClick?.(index)}
                  disabled={!isCompleted}
                  className={`group flex flex-col items-center focus:outline-none ${
                    isCompleted ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                      isCompleted
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-4 ring-emerald-50'
                        : isCurrent
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 font-extrabold scale-110'
                        : 'bg-slate-100 text-slate-400 border border-slate-300'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                  </span>
                  <span
                    className={`mt-2 text-xs font-semibold text-center ${
                      isCurrent ? 'text-emerald-900 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
