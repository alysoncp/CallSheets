"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Filter } from "lucide-react";
import { MileageLogEntryDialog } from "@/components/mileage/mileage-log-entry-dialog";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useTaxYear } from "@/lib/contexts/tax-year-context";
import { Select } from "@/components/ui/select";

interface MileageLogRecord {
  id: string;
  vehicleId: string;
  date: string;
  odometerReading?: number | null;
  tripDistance?: number | null;
  description?: string | null;
  isBusinessUse?: boolean | null;
  vehicle?: {
    name: string;
  };
}

interface VehicleMileagePageClientProps {
  initialLogs: MileageLogRecord[];
  vehicles: Array<{ id: string; name: string }>;
}

export function VehicleMileagePageClient({
  initialLogs,
  vehicles,
}: VehicleMileagePageClientProps) {
  const router = useRouter();
  const { taxYear } = useTaxYear();
  const [logs, setLogs] = useState(initialLogs);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MileageLogRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [mileageLoggingStyle, setMileageLoggingStyle] = useState<"odometer" | "trip_distance">("trip_distance");
  const [vehicleFilterId, setVehicleFilterId] = useState<string | "all">("all");

  // Filter logs by selected year from context
  const filteredLogsByYear = useMemo(() => {
    return logs.filter((log) => {
      try {
        const logDate = new Date(log.date);
        return logDate.getFullYear() === taxYear;
      } catch {
        return false;
      }
    });
  }, [logs, taxYear]);

  // Total business mileage per vehicle (for filtered year; all records are business)
  const totalMileageByVehicle = useMemo(() => {
    const byVehicle: Record<string, number> = {};
    vehicles.forEach((v) => {
      byVehicle[v.id] = 0;
    });
    const vehicleLogs = filteredLogsByYear.reduce<Record<string, MileageLogRecord[]>>((acc, log) => {
      (acc[log.vehicleId] = acc[log.vehicleId] ?? []).push(log);
      return acc;
    }, {});
    Object.entries(vehicleLogs).forEach(([vehicleId, vehicleLogList]) => {
      let total = 0;
      const withTrip = vehicleLogList.filter((l) => l.tripDistance != null && l.tripDistance > 0);
      const withOdometer = vehicleLogList.filter((l) => l.odometerReading != null);
      withTrip.forEach((l) => {
        total += l.tripDistance ?? 0;
      });
      if (withOdometer.length >= 2) {
        const sorted = [...withOdometer].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        for (let i = 0; i < sorted.length - 1; i++) {
          const curr = sorted[i].odometerReading ?? 0;
          const next = sorted[i + 1].odometerReading ?? 0;
          if (next >= curr) total += next - curr;
        }
      }
      byVehicle[vehicleId] = total;
    });
    return byVehicle;
  }, [filteredLogsByYear, vehicles]);

  // Apply vehicle filter to log list
  const filteredLogs = useMemo(() => {
    if (vehicleFilterId === "all") return filteredLogsByYear;
    return filteredLogsByYear.filter((log) => log.vehicleId === vehicleFilterId);
  }, [filteredLogsByYear, vehicleFilterId]);

  // Fetch user profile for mileage logging style
  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error && data.mileageLoggingStyle) {
          setMileageLoggingStyle(data.mileageLoggingStyle);
        }
      })
      .catch(() => {
        // Silently fail - default to trip_distance
      });
  }, []);

  const refreshLogs = async () => {
    try {
      const response = await fetch("/api/mileage-logs", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Error refreshing logs:", error);
    }
    router.refresh();
  };

  // Refresh logs when tax year changes
  useEffect(() => {
    refreshLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxYear]);

  const handleSuccess = () => {
    refreshLogs();
    setEditingLog(null);
  };

  const handleEdit = (log: MileageLogRecord) => {
    setEditingLog(log);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mileage log?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/mileage-logs/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLogs(logs.filter((log) => log.id !== id));
        router.refresh();
      } else {
        console.error("Failed to delete mileage log");
      }
    } catch (error) {
      console.error("Error deleting mileage log:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">Vehicle Mileage</h1>
        <Button onClick={() => setDialogOpen(true)} disabled={vehicles.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Log Mileage
        </Button>
      </div>

      {vehicles.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground mb-4">
              No vehicles found. Add a vehicle first to log mileage.
            </p>
            <Button asChild>
              <a href="/vehicles">Add Vehicle</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {vehicles.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Total Business Mileage ({taxYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="rounded-lg border bg-muted/40 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-muted-foreground">
                      {vehicle.name}
                    </p>
                    <p className="text-2xl font-semibold">
                      {(totalMileageByVehicle[vehicle.id] ?? 0).toLocaleString()}{" "}
                      km
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Mileage Logs</CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Select
                    value={vehicleFilterId}
                    onChange={(e) => setVehicleFilterId(e.target.value)}
                    className="w-[180px]"
                  >
                    <option value="all">All vehicles</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-muted-foreground mb-4">
                  No mileage logs for {taxYear}. Click Log Mileage to add one.
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  Log Mileage
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log) => {
                  // Get vehicle name - either from joined data or fetch it
                  const vehicle = vehicles.find((v) => v.id === log.vehicleId);
                  const vehicleName = vehicle?.name || "Unknown Vehicle";
                  
                  const value = log.odometerReading ?? log.tripDistance;
                  const valueLabel = log.odometerReading
                    ? `${value} (odometer)`
                    : `${value} km`;

                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{vehicleName}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(log.date), "MMM dd, yyyy")} • {valueLabel}
                              {log.description && ` • ${log.description}`}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(log)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(log.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        </>
      )}

      <MileageLogEntryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingLog(null);
          }
        }}
        onSuccess={handleSuccess}
        initialData={editingLog || undefined}
      />
    </div>
  );
}
