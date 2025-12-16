/**
 * DetailerTracker Component
 * 
 * Purpose: Allows detailers to share their live GPS location with customers
 * This runs on the detailer's mobile device and sends location updates
 * to the server in real-time.
 * 
 * Features:
 * - Start/stop location sharing
 * - Update booking status (On the Way, Arrived, In Progress, Completed)
 * - Automatic GPS tracking with high accuracy
 * - Visual feedback for tracking state
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Navigation, 
  MapPin, 
  Play, 
  Square, 
  Truck, 
  CheckCircle2, 
  Clock,
  Car,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Status options for the detailer to select
const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled", icon: Clock, color: "bg-yellow-500" },
  { value: "on-the-way", label: "On the Way", icon: Truck, color: "bg-blue-500" },
  { value: "arrived", label: "Arrived", icon: MapPin, color: "bg-purple-500" },
  { value: "in-progress", label: "In Progress", icon: Car, color: "bg-orange-500" },
  { value: "completed", label: "Completed", icon: CheckCircle2, color: "bg-green-500" },
];

const DetailerTracker = () => {
  // State for booking lookup
  const [bookingNumber, setBookingNumber] = useState("");
  const [booking, setBooking] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  // State for location tracking
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("scheduled");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  // Ref for geolocation watch ID
  const watchIdRef = useRef<number | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Search for a booking by booking number
   */
  const handleSearch = async () => {
    if (!bookingNumber.trim()) {
      toast.error("Please enter a booking number");
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("booking_number", bookingNumber.trim())
        .single();

      if (error || !data) {
        toast.error("Booking not found");
        setBooking(null);
      } else {
        setBooking(data);
        setSelectedStatus(data.status || "scheduled");
        toast.success("Booking found!");
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast.error("Failed to fetch booking");
    } finally {
      setSearching(false);
    }
  };

  /**
   * Send location update to the server
   */
  const sendLocationUpdate = async (lat: number, lng: number, status?: string) => {
    if (!booking?.booking_number) return;

    try {
      const response = await supabase.functions.invoke("update-detailer-location", {
        body: {
          booking_number: booking.booking_number,
          lat,
          lng,
          status: status || selectedStatus,
        },
      });

      if (response.error) {
        console.error("Error sending location:", response.error);
        toast.error("Failed to send location update");
      } else {
        setLastUpdate(new Date());
        setUpdateCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error sending location:", error);
    }
  };

  /**
   * Start tracking location
   */
  const startTracking = () => {
    if (!booking) {
      toast.error("Please search for a booking first");
      return;
    }

    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported on this device");
      return;
    }

    // Request high accuracy GPS tracking
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        
        // Send update to server
        sendLocationUpdate(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error(`Location error: ${error.message}`);
        stopTracking();
      },
      {
        enableHighAccuracy: true,  // Use GPS if available
        maximumAge: 5000,          // Accept cached position up to 5 seconds old
        timeout: 15000,            // Wait up to 15 seconds for position
      }
    );

    watchIdRef.current = watchId;
    setIsTracking(true);
    toast.success("Location tracking started");

    // Also set up an interval to send updates every 10 seconds
    // This ensures consistent updates even if position doesn't change much
    updateIntervalRef.current = setInterval(() => {
      if (currentLocation) {
        sendLocationUpdate(currentLocation.lat, currentLocation.lng);
      }
    }, 10000);
  };

  /**
   * Stop tracking location
   */
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }

    setIsTracking(false);
    toast.success("Location tracking stopped");
  };

  /**
   * Handle status change
   */
  const handleStatusChange = async (newStatus: string) => {
    setSelectedStatus(newStatus);
    
    if (currentLocation && booking) {
      await sendLocationUpdate(currentLocation.lat, currentLocation.lng, newStatus);
      toast.success(`Status updated to: ${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}`);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Booking Search Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            Detailer Location Tracker
          </CardTitle>
          <CardDescription>
            Share your live location with customers during service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Booking Number Input */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="booking-number" className="sr-only">
                Booking Number
              </Label>
              <Input
                id="booking-number"
                placeholder="Enter booking number (RW-XXXXXX)"
                value={bookingNumber}
                onChange={(e) => setBookingNumber(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={searching} variant="glow">
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Find Booking"
              )}
            </Button>
          </div>

          {/* Booking Info */}
          {booking && (
            <div className="glass-card p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-semibold">{booking.full_name}</p>
                </div>
                <Badge variant="outline">{booking.booking_number}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="text-sm">{booking.address}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking Controls Card */}
      {booking && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Tracking Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Selector */}
            <div className="space-y-2">
              <Label>Update Status</Label>
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => {
                    const Icon = status.icon;
                    return (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {status.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Start/Stop Tracking Button */}
            <div className="flex gap-3">
              {!isTracking ? (
                <Button onClick={startTracking} variant="glow" className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Start Sharing Location
                </Button>
              ) : (
                <Button onClick={stopTracking} variant="destructive" className="flex-1">
                  <Square className="w-4 h-4 mr-2" />
                  Stop Sharing
                </Button>
              )}
            </div>

            {/* Tracking Status */}
            {isTracking && (
              <div className="glass-card p-4 rounded-lg space-y-2 bg-green-500/10 border-green-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-semibold text-green-500">Tracking Active</span>
                </div>
                
                {currentLocation && (
                  <div className="text-sm text-muted-foreground">
                    <p>Lat: {currentLocation.lat.toFixed(6)}</p>
                    <p>Lng: {currentLocation.lng.toFixed(6)}</p>
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground">
                  <p>Updates sent: {updateCount}</p>
                  {lastUpdate && (
                    <p>Last update: {lastUpdate.toLocaleTimeString()}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DetailerTracker;
