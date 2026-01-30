-- Add trip_distance column to vehicle_mileage_logs table
ALTER TABLE vehicle_mileage_logs 
ADD COLUMN IF NOT EXISTS trip_distance INTEGER;
