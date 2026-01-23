import { VehicleForm } from "@/components/forms/vehicle-form";

export default function NewVehiclePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add Vehicle</h1>
      <VehicleForm />
    </div>
  );
}
