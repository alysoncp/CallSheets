import { VehicleForm } from "@/components/forms/vehicle-form";

export default function NewVehiclePage() {
  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-4 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Add Vehicle</h1>
      </div>
      <VehicleForm />
    </div>
  );
}
