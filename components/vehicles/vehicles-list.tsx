"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface VehicleRecord {
  id: string;
  name: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  licensePlate?: string | null;
  isPrimary?: boolean | null;
}

interface VehiclesListProps {
  initialData: VehicleRecord[];
}

export function VehiclesList({ initialData }: VehiclesListProps) {
  const [vehicles, setVehicles] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setVehicles(vehicles.filter((v) => v.id !== id));
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  if (vehicles.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">No vehicles added yet.</p>
          <Button asChild className="mt-4">
            <Link href="/vehicles/new">Add Your First Vehicle</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Vehicles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="flex items-center justify-between border-b pb-4 last:border-0"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{vehicle.name}</p>
                  {vehicle.isPrimary && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {vehicle.year && `${vehicle.year} `}
                  {vehicle.make && vehicle.model
                    ? `${vehicle.make} ${vehicle.model}`
                    : vehicle.make || vehicle.model}
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="ghost" size="icon">
                  <Link href={`/vehicles/${vehicle.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(vehicle.id)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
