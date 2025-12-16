/**
 * CustomerLiveTracker Component
 * 
 * Purpose: Allows customers to view real-time location of their detailer
 * Shows a map with the detailer's position, status updates, ETA, and crew name.
 * 
 * FIXES APPLIED:
 * - ETA now displays correctly from database
 * - Crew name displays correctly
 * - Tracking activates automatically for on-the-way/in-progress status
 * - Fallback UI messages for missing data
 * 
 * Security: Only shows tracking for the customer's own booking
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  MapPin, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Car,
  Navigation,
  Loader2,
  RefreshCw,
  User,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom car icon for detailer marker
const carIcon = new L.DivIcon({
  html: `<div style="background: hsl(var(--primary)); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/>
      <circle cx="7" cy="17" r="2"/>
      <circle cx="17" cy="17" r="2"/>
    </svg>
  </div>`,
  className: 'car-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Status configuration with icons and colors
const STATUS_CONFIG = [
  { value: "scheduled", label: "Scheduled", icon: Clock, color: "text-yellow-500", bgColor: "bg-yellow-500" },
  { value: "on-the-way", label: "On the Way", icon: Truck, color: "text-blue-500", bgColor: "bg-blue-500" },
  { value: "arrived", label: "Arrived", icon: MapPin, color: "text-purple-500", bgColor: "bg-purple-500" },
  { value: "in-progress", label: "In Progress", icon: Car, color: "text-orange-500", bgColor: "bg-orange-500" },
  { value: "completed", label: "Completed", icon: CheckCircle2, color: "text-green-500", bgColor: "bg-green-500" },
];

/**
 * Component to recenter map when location changes
 */
const MapRecenter = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
};

const CustomerLiveTracker = () => {
  // State for booking lookup
  const [bookingNumber, setBookingNumber] = useState("");
  const [booking, setBooking] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [isLive, setIsLive] = useState(false);

  // Ref for realtime subscription
  const subscriptionRef = useRef<any>(null);

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
        .eq("booking_number", bookingNumber.trim().toUpperCase())
        .single();

      if (error || !data) {
        toast.error("Booking not found. Please check your booking number.");
        setBooking(null);
        setIsLive(false);
      } else {
        setBooking(data);
        // FIX: Auto-enable live view when status indicates active service
        const isActiveStatus = ["on-the-way", "arrived", "in-progress"].includes(data.status);
        setIsLive(data.tracking_enabled || isActiveStatus);
        toast.success("Booking found!");
        
        // Subscribe to realtime updates for this booking
        subscribeToBooking(data.id);
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast.error("Failed to fetch booking");
    } finally {
      setSearching(false);
    }
  };

  /**
   * Subscribe to realtime updates for the booking
   */
  const subscribeToBooking = (bookingId: string) => {
    // Unsubscribe from previous subscription if exists
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    // Create new subscription
    const channel = supabase
      .channel(`booking-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          setBooking((prev: any) => ({ ...prev, ...payload.new }));
          // FIX: Update live status based on tracking_enabled OR active status
          const newData = payload.new as any;
          const isActiveStatus = ["on-the-way", "arrived", "in-progress"].includes(newData.status);
          setIsLive(newData.tracking_enabled || isActiveStatus);
        }
      )
      .subscribe();

    subscriptionRef.current = channel;
  };

  /**
   * Get the current status index for progress display
   */
  const getCurrentStatusIndex = () => {
    return STATUS_CONFIG.findIndex(s => s.value === booking?.status) || 0;
  };

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, []);

  const hasLocation = booking?.detailer_lat && booking?.detailer_lng;
  const hasCrewName = booking?.crew_name;
  const hasETA = booking?.eta_minutes !== null && booking?.eta_minutes !== undefined;

  return (
    <section id="live-track" className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Live <span className="glow-text">Tracking</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Track your detailer in real-time like Uber
          </p>
        </div>

        {/* Search Card */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" />
              Track Your Service
            </CardTitle>
            <CardDescription>
              Enter your booking number from your confirmation email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="track-booking" className="sr-only">
                  Booking Number
                </Label>
                <Input
                  id="track-booking"
                  placeholder="RW-XXXXXX"
                  value={bookingNumber}
                  onChange={(e) => setBookingNumber(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={searching} variant="glow">
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Track
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details & Tracking */}
        {booking && (
          <div className="space-y-6 animate-fade-in">
            {/* Crew & ETA Info Card - NEW */}
            <Card className="glass-card border-primary/20">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Assigned Detailer */}
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Your Detailer</p>
                      <p className="font-bold text-lg">
                        {hasCrewName ? booking.crew_name : (
                          <span className="text-muted-foreground italic">Assigning...</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* ETA Display - FIXED */}
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ETA</p>
                      <p className="font-bold text-lg">
                        {booking.status === "completed" ? (
                          <span className="text-green-500">Completed</span>
                        ) : booking.status === "arrived" ? (
                          <span className="text-purple-500">Arrived!</span>
                        ) : hasETA ? (
                          <span className="text-primary">{booking.eta_minutes} min</span>
                        ) : (
                          <span className="text-muted-foreground italic flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Calculating...
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Last Update */}
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Update</p>
                      <p className="font-bold text-lg">
                        {booking.detailer_updated_at ? (
                          format(new Date(booking.detailer_updated_at), 'h:mm:ss a')
                        ) : (
                          <span className="text-muted-foreground italic">Waiting...</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Service Status</CardTitle>
                  {isLive && (
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                      Live Tracking
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-6">
                  {STATUS_CONFIG.map((status, index) => {
                    const Icon = status.icon;
                    const currentIndex = getCurrentStatusIndex();
                    const isActive = index === currentIndex;
                    const isPast = index < currentIndex;
                    
                    return (
                      <div key={status.value} className="flex flex-col items-center flex-1 relative">
                        {/* Connector line */}
                        {index < STATUS_CONFIG.length - 1 && (
                          <div
                            className={`absolute top-5 left-1/2 w-full h-1 -z-10 transition-all ${
                              isPast ? status.bgColor : "bg-muted"
                            }`}
                          />
                        )}
                        
                        {/* Status icon */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                            isActive
                              ? `${status.bgColor}/20 ring-2 ring-offset-2 ring-offset-background ${status.bgColor.replace('bg-', 'ring-')}`
                              : isPast
                              ? `${status.bgColor}/30`
                              : "bg-muted"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              isActive || isPast ? status.color : "text-muted-foreground"
                            } ${isActive && status.value === "on-the-way" ? "animate-bounce" : ""}`}
                          />
                        </div>
                        
                        {/* Status label */}
                        <span
                          className={`text-xs font-medium text-center ${
                            isActive || isPast ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {status.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Current Status Display */}
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-primary capitalize">
                    {booking.status?.replace('-', ' ') || 'Scheduled'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Live Map */}
            {hasLocation ? (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Live Location
                    {hasCrewName && (
                      <span className="text-muted-foreground font-normal text-sm">
                        — {booking.crew_name}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] rounded-lg overflow-hidden border border-border">
                    <MapContainer
                      center={[booking.detailer_lat, booking.detailer_lng]}
                      zoom={14}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      {/* Detailer marker with car icon */}
                      <Marker 
                        position={[booking.detailer_lat, booking.detailer_lng]}
                        icon={carIcon}
                      >
                        <Popup>
                          <div className="text-center">
                            <strong>{hasCrewName ? booking.crew_name : "RW Details"}</strong>
                            <p className="text-sm capitalize">{booking.status?.replace('-', ' ')}</p>
                            {hasETA && <p className="text-xs text-muted-foreground">ETA: {booking.eta_minutes} min</p>}
                          </div>
                        </Popup>
                      </Marker>
                      
                      {/* Accuracy circle */}
                      <Circle
                        center={[booking.detailer_lat, booking.detailer_lng]}
                        radius={100}
                        pathOptions={{ 
                          color: "hsl(var(--primary))", 
                          fillOpacity: 0.1,
                          weight: 2
                        }}
                      />
                      
                      {/* Recenter map when location changes */}
                      <MapRecenter lat={booking.detailer_lat} lng={booking.detailer_lng} />
                    </MapContainer>
                  </div>
                  
                  {/* Coordinates display */}
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Coordinates: {booking.detailer_lat.toFixed(6)}, {booking.detailer_lng.toFixed(6)}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleSearch}
                      className="text-muted-foreground"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* No location available yet - show helpful message */
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Location Not Available Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {booking.status === "scheduled" 
                      ? "Your detailer will start sharing their location when they're on the way."
                      : "Waiting for location data. The detailer may be in an area with poor GPS signal."}
                  </p>
                  <Button variant="outline" className="mt-4" onClick={handleSearch}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Check Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Booking Details */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Booking Number</p>
                    <p className="font-semibold">{booking.booking_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Service Date</p>
                    <p className="font-semibold">
                      {format(new Date(booking.service_date), "PPP")} at {booking.service_time}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Services</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(booking.services) &&
                      booking.services.map((service: any, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {service.name || service}
                        </Badge>
                      ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Service Address</p>
                  <p className="font-semibold">{booking.address}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No booking searched yet */}
        {!booking && !searching && (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <Navigation className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Enter Your Booking Number</h3>
              <p className="text-muted-foreground">
                Find your booking number in the confirmation email we sent you.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default CustomerLiveTracker;
