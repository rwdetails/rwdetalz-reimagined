import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const statuses = [
  { name: "Scheduled", icon: Clock, color: "text-blue-500" },
  { name: "En Route", icon: MapPin, color: "text-yellow-500" },
  { name: "Cleaning", icon: Loader2, color: "text-purple-500" },
  { name: "Completed", icon: CheckCircle2, color: "text-green-500" },
];

const BookingTrackerEnhanced = () => {
  const [trackingInput, setTrackingInput] = useState("");
  const [currentStatus, setCurrentStatus] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [crewLocation, setCrewLocation] = useState<[number, number]>([26.1224, -80.1373]);
  const customerLocation: [number, number] = [26.1224, -80.1373];

  useEffect(() => {
    if (showMap && currentStatus < 3) {
      const interval = setInterval(() => {
        setCurrentStatus((prev) => (prev < 3 ? prev + 1 : prev));
        setCrewLocation([
          26.1224 + (Math.random() - 0.5) * 0.02,
          -80.1373 + (Math.random() - 0.5) * 0.02,
        ]);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [showMap, currentStatus]);

  const handleTrack = () => {
    if (trackingInput.trim()) {
      setShowMap(true);
      setCurrentStatus(0);
    }
  };

  const calculateETA = () => {
    const etas = ["15 minutes", "10 minutes", "In progress", "Completed"];
    return etas[currentStatus];
  };

  return (
    <section className="py-24 px-4 min-h-screen">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Track Your <span className="glow-text">Service</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enter your booking ID or email to track your service in real-time
          </p>
        </div>

        <div className="glass-card rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Enter your booking ID or email"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              className="bg-background/50 flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
            />
            <Button variant="glow" onClick={handleTrack} className="md:w-auto">
              <Search className="w-4 h-4 mr-2" />
              Track Service
            </Button>
          </div>
        </div>

        {showMap && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-6">Service Status</h3>
              <div className="flex items-center justify-between mb-8">
                {statuses.map((status, index) => {
                  const Icon = status.icon;
                  const isActive = index === currentStatus;
                  const isPast = index < currentStatus;
                  return (
                    <div key={status.name} className="flex flex-col items-center flex-1 relative">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                          isActive
                            ? "bg-primary/20 ring-2 ring-primary"
                            : isPast
                            ? "bg-primary/10"
                            : "bg-muted"
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            isActive || isPast ? status.color : "text-muted-foreground"
                          } ${isActive && status.name === "Cleaning" ? "animate-spin" : ""}`}
                        />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isActive || isPast ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {status.name}
                      </span>
                      {index < statuses.length - 1 && (
                        <div
                          className={`absolute top-6 left-1/2 w-full h-0.5 -z-10 transition-all ${
                            isPast ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="glass-card p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                  <p className="text-lg font-bold text-primary">{statuses[currentStatus].name}</p>
                </div>
                <div className="glass-card p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">ETA</p>
                  <p className="text-lg font-bold">{calculateETA()}</p>
                </div>
                <div className="glass-card p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Crew Contact</p>
                  <p className="text-lg font-bold">(954) 865-6205</p>
                </div>
              </div>

              <div className="h-[400px] rounded-lg overflow-hidden border border-border">
                <MapContainer
                  center={customerLocation}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={customerLocation}>
                    <Popup>Your Location</Popup>
                  </Marker>
                  {currentStatus < 3 && (
                    <Marker position={crewLocation}>
                      <Popup>RWDetailz Crew</Popup>
                    </Marker>
                  )}
                  <Circle
                    center={customerLocation}
                    radius={2000}
                    pathOptions={{ color: "hsl(var(--primary))", fillOpacity: 0.1 }}
                  />
                </MapContainer>
              </div>

              {currentStatus === 3 && (
                <div className="mt-6 p-6 rounded-lg bg-green-500/10 border border-green-500/20 text-center animate-fade-in">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h4 className="text-xl font-bold mb-2">Service Completed!</h4>
                  <p className="text-muted-foreground">
                    Thank you for choosing RWDetailz. We hope you love the results!
                  </p>
                  <Button variant="glow" className="mt-4">
                    Leave a Review
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BookingTrackerEnhanced;
