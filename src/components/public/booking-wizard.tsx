"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Service } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { StepService } from "./step-service";
import { StepDate } from "./step-date";
import { StepDetails } from "./step-details";
import { StepConfirm } from "./step-confirm";
import { createAppointment } from "@/actions/appointments";
import { appointmentSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";

interface BookingWizardProps {
  services: Service[];
}

const STEP_LABELS = ["Servicio", "Fecha", "Datos", "Confirmar"];

export function BookingWizard({ services }: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [details, setDetails] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    vehicleBrand: "",
    vehicleModel: "",
    description: "",
  });

  const selectedService = services.find((s) => s.id === serviceId);

  function canAdvance(): boolean {
    switch (step) {
      case 0:
        return !!serviceId;
      case 1:
        return !!date && !!timeSlot;
      case 2: {
        const result = appointmentSchema.safeParse({
          serviceId,
          date,
          timeSlot,
          ...details,
        });
        return result.success;
      }
      default:
        return true;
    }
  }

  function handleNext() {
    if (step === 2) {
      const result = appointmentSchema.safeParse({
        serviceId,
        date,
        timeSlot,
        ...details,
      });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
      setErrors({});
    }
    setStep((s) => s + 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    const result = await createAppointment({
      serviceId,
      date,
      timeSlot,
      ...details,
    });

    if ("error" in result) {
      setErrors({ submit: result.error ?? "Ocurrió un error inesperado" });
      setSubmitting(false);
    } else {
      router.push(`/turno/${result.id}`);
    }
  }

  // Progress percentage for the bar
  const progressPct = (step / (STEP_LABELS.length - 1)) * 100;

  return (
    <div>
      {/* ── Step indicator ── */}
      <div className="mb-10">
        {/* Steps row */}
        <div className="flex items-center justify-between relative">
          {STEP_LABELS.map((label, i) => {
            const isDone = i < step;
            const isActive = i === step;

            return (
              <div key={label} className="flex flex-col items-center flex-1">
                {/* Circle */}
                <div
                  className={cn(
                    "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300",
                    isDone
                      ? "bg-accent-500 border-accent-500 text-white"
                      : isActive
                      ? "bg-navy-900 border-navy-900 text-white shadow-lg shadow-navy-900/30"
                      : "bg-white border-gray-200 text-gray-400"
                  )}
                >
                  {isDone ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                {/* Label */}
                <span
                  className={cn(
                    "mt-2 hidden text-xs font-medium sm:block transition-colors duration-200",
                    isDone
                      ? "text-accent-500"
                      : isActive
                      ? "text-navy-900"
                      : "text-gray-400"
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}

          {/* Connecting line behind the circles */}
          <div className="absolute top-4 left-0 right-0 h-px bg-gray-200 -z-0 mx-[18px]" />
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-navy-700 to-accent-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Step content ── */}
      {step === 0 && (
        <StepService
          services={services}
          selected={serviceId}
          onSelect={setServiceId}
        />
      )}
      {step === 1 && (
        <StepDate
          selectedDate={date}
          selectedTime={timeSlot}
          onSelectDate={setDate}
          onSelectTime={setTimeSlot}
        />
      )}
      {step === 2 && (
        <StepDetails details={details} onChange={setDetails} errors={errors} />
      )}
      {step === 3 && (
        <StepConfirm
          service={selectedService}
          date={date}
          timeSlot={timeSlot}
          {...details}
        />
      )}

      {/* ── Error message ── */}
      {errors.submit && (
        <p className="mt-4 rounded-lg bg-accent-50 border border-accent-200 px-4 py-3 text-center text-sm text-accent-600">
          {errors.submit}
        </p>
      )}

      {/* ── Navigation ── */}
      <div className="mt-10 flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="gap-2 border-gray-200 text-gray-600 hover:border-navy-300 hover:text-navy-900 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        {step < 3 ? (
          <Button
            onClick={handleNext}
            disabled={!canAdvance()}
            className="gap-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold shadow-md disabled:opacity-40"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-2 bg-accent-500 hover:bg-accent-400 text-white font-bold shadow-lg shadow-accent-900/30 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Confirmar Turno
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
