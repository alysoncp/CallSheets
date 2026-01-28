"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { MileageLogEntryDialog } from "@/components/mileage/mileage-log-entry-dialog";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useTaxYear } from "@/lib/contexts/tax-year-context";

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

  // Filter logs by selected year from context
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      try {
        const logDate = new Date(log.date);
        return logDate.getFullYear() === taxYear;
      } catch {
        return false;
      }
    });
  }, [logs, taxYear]);

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vehicle Mileage</h1>
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
        <Card>
          <CardHeader>
            <CardTitle>Mileage Logs</CardTitle>
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
                              {log.isBusinessUse && (
                                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                  Business
                                </span>
                              )}
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
