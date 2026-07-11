"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Service } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { StepService } from "./step-service";
import { StepDate } from "./step-date";
import { StepDetails } from "./step-details";
import { StepConfirm } from "./step-confirm";
import { createAppointment } from "@/actions/appointments";
import { appointmentSchema } from "@/lib/validations";

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

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i <= step
                  ? "bg-navy-900 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                i <= step ? "font-medium text-navy-900" : "text-gray-400"
              }`}
            >
              {label}
            </span>
            {i < STEP_LABELS.length - 1 && (
              <div className="mx-2 h-px w-8 bg-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
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

      {/* Error message */}
      {errors.submit && (
        <p className="mt-4 text-center text-sm text-accent-500">
          {errors.submit}
        </p>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          Anterior
        </Button>

        {step < 3 ? (
          <Button
            onClick={handleNext}
            disabled={!canAdvance()}
            className="bg-navy-900 hover:bg-navy-800"
          >
            Siguiente
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-accent-500 hover:bg-accent-600"
          >
            {submitting ? "Confirmando..." : "Confirmar Turno"}
          </Button>
        )}
      </div>
    </div>
  );
}
