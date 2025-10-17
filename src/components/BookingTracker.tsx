import { useState, useEffect } from "react";
import { Search, MapPin, Navigation, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const BookingTracker = () => {
  const { toast } = useToast();
  const [bookingId, setBookingId] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [technicianPosition, setTechnicianPosition] = useState<[number, number]>([26.1224, -80.1373]);

  // Fort Lauderdale coordinates
  const customerLocation: [number, number] = [26.1224, -80.1373];

  // Mock tracking data
  const mockTrackingData = {
    id: "RW-2024-001",
    service: "Pressure Washing",
    address: "123 Main St, Fort Lauderdale, FL",
    date: "January 15, 2024",
    time: "2:00 PM",
    status: "en-route",
    eta: "15 minutes",
    message: "We're on our way! Our team will arrive shortly.",
    steps: [
      { label: "Booking Received", completed: true, time: "10:00 AM" },
      { label: "Scheduled", completed: true, time: "10:15 AM" },
      { label: "En Route", completed: true, time: "1:30 PM" },
      { label: "In Progress", completed: false, time: "Est. 2:00 PM" },
      { label: "Completed", completed: false, time: "Est. 3:30 PM" },
    ],
  };

  // Simulate technician movement
  useEffect(() => {
    if (trackingData) {
      const interval = setInterval(() => {
        setTechnicianPosition((prev) => {
          const newLat = prev[0] + (Math.random() - 0.5) * 0.005;
          const newLng = prev[1] + (Math.random() - 0.5) * 0.005;
          return [newLat, newLng];
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [trackingData]);

  const handleTrack = () => {
    if (!bookingId.trim()) {
      toast({
        title: "Please enter a booking ID or email",
        variant: "destructive",
      });
      return;
    }

    setTimeout(() => {
      setTrackingData(mockTrackingData);
      toast({
        title: "Booking Found!",
        description: `Tracking booking ${bookingId}`,
      });
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "text-yellow-500";
      case "en-route":
        return "text-blue-500";
      case "in-progress":
        return "text-orange-500";
      case "completed":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <section id="track" className="py-24 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Track Your <span className="glow-text">Job</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Enter your booking ID or email to see real-time updates
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="glass-card rounded-xl p-6">
            <div className="flex gap-4">
              <Input
                placeholder="Enter Booking ID or Email..."
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleTrack()}
                className="bg-background/50"
              />
              <Button onClick={handleTrack} variant="glow" className="gap-2">
                <Search className="w-4 h-4" />
                Track
              </Button>
            </div>
          </div>
        </div>

        {/* Tracking Results */}
        {trackingData && (
          <div className="space-y-6 animate-fade-in">
            {/* Status Banner */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{trackingData.service}</h3>
                  <p className="text-muted-foreground">{trackingData.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {trackingData.date} • {trackingData.time}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold mb-1 ${getStatusColor(trackingData.status)}`}>
                    {trackingData.status.replace("-", " ").toUpperCase()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    ETA: {trackingData.eta}
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="glass-card rounded-xl overflow-hidden" style={{ height: "400px" }}>
              <MapContainer
                center={customerLocation}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                
                {/* Customer Location */}
                <Circle
                  center={customerLocation}
                  radius={200}
                  pathOptions={{ color: "#00B0FF", fillColor: "#00B0FF", fillOpacity: 0.2 }}
                />
                <Marker position={customerLocation}>
                  <Popup>
                    <strong>Your Location</strong>
                    <br />
                    {trackingData.address}
                  </Popup>
                </Marker>

                {/* Technician Location */}
                <Marker position={technicianPosition}>
                  <Popup>
                    <strong>RWDetailz Technician</strong>
                    <br />
                    On the way to your location!
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Message */}
            <div className="glass-card rounded-xl p-6 bg-primary/10 border-primary/20">
              <div className="flex items-start gap-4">
                <Navigation className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold mb-2">Update from RWDetailz</h4>
                  <p className="text-muted-foreground">{trackingData.message}</p>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="glass-card rounded-xl p-6">
              <h4 className="font-bold text-lg mb-6">Job Progress</h4>
              <div className="space-y-4">
                {trackingData.steps.map((step: any, index: number) => (
                  <div key={index} className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? "bg-primary text-black" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!trackingData && (
          <div className="text-center text-muted-foreground mt-12">
            <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Enter your booking ID or email to track your job</p>
            <p className="text-sm mt-2">
              You should have received a booking ID via email after scheduling
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BookingTracker;
