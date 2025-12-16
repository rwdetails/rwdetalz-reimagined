/**
 * CustomerLiveTracker Component
 * 
 * Purpose: Allows customers to view real-time location of their detailer
 * Shows a map with the detailer's position, status updates, and ETA.
 * 
 * Features:
 * - Real-time location updates via Supabase Realtime
 * - Interactive map with moving marker
 * - Status timeline showing service progress
 * - ETA display based on detailer location
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
  RefreshCw
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
        .eq("booking_number", bookingNumber.trim())
        .single();

      if (error || !data) {
        toast.error("Booking not found");
        setBooking(null);
        setIsLive(false);
      } else {
        setBooking(data);
        setIsLive(data.tracking_enabled || false);
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
          setIsLive(payload.new.tracking_enabled || false);
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

  /**
   * Get status badge color
   */
  const getStatusBadgeColor = () => {
    const status = STATUS_CONFIG.find(s => s.value === booking?.status);
    return status ? `${status.bgColor}/20 ${status.color} border-${status.color.replace('text-', '')}/30` : '';
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
                  onChange={(e) => setBookingNumber(e.target.value)}
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

                {/* Current Status & ETA */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-card p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                    <p className="text-lg font-bold text-primary capitalize">
                      {booking.status?.replace('-', ' ') || 'Scheduled'}
                    </p>
                  </div>
                  <div className="glass-card p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">ETA</p>
                    <p className="text-lg font-bold">
                      {booking.eta_minutes 
                        ? `${booking.eta_minutes} min` 
                        : booking.status === 'completed' 
                        ? 'Completed' 
                        : 'Calculating...'}
                    </p>
                  </div>
                  <div className="glass-card p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Last Update</p>
                    <p className="text-lg font-bold">
                      {booking.detailer_updated_at 
                        ? format(new Date(booking.detailer_updated_at), 'h:mm:ss a')
                        : 'Waiting...'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Map */}
            {hasLocation && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Live Location
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
                            <strong>RW Details</strong>
                            <p className="text-sm capitalize">{booking.status?.replace('-', ' ')}</p>
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

        {/* No tracking message */}
        {booking && !isLive && !hasLocation && (
          <Card className="glass-card animate-fade-in">
            <CardContent className="py-12 text-center">
              <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">Tracking Not Started</h3>
              <p className="text-muted-foreground">
                Your detailer hasn't started sharing their location yet.
                <br />
                You'll see live tracking once they're on the way.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default CustomerLiveTracker;
