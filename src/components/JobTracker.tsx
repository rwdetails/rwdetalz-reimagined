import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, CheckCircle2, Truck } from "lucide-react";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const statuses = ["Scheduled", "En Route", "Cleaning", "Completed"];

// Fort Lauderdale / Broward County coordinates
const browardCenter: [number, number] = [26.1224, -80.1373];

const JobTracker = () => {
  const [trackingInput, setTrackingInput] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(0);
  const [technicianPosition, setTechnicianPosition] = useState<[number, number]>(browardCenter);
  const [customerPosition] = useState<[number, number]>([
    26.1224 + (Math.random() - 0.5) * 0.1,
    -80.1373 + (Math.random() - 0.5) * 0.1,
  ]);
  const [eta, setEta] = useState(25);

  useEffect(() => {
    if (!isTracking || currentStatus >= 3) return;

    const interval = setInterval(() => {
      // Simulate technician moving toward customer
      setTechnicianPosition((prev) => {
        const latDiff = customerPosition[0] - prev[0];
        const lngDiff = customerPosition[1] - prev[1];
        return [
          prev[0] + latDiff * 0.1,
          prev[1] + lngDiff * 0.1,
        ];
      });

      // Update ETA
      setEta((prev) => Math.max(0, prev - 2));

      // Progress through statuses
      if (eta <= 10 && currentStatus === 0) {
        setCurrentStatus(1); // En Route
      } else if (eta <= 5 && currentStatus === 1) {
        setCurrentStatus(2); // Cleaning
      } else if (eta <= 0 && currentStatus === 2) {
        setCurrentStatus(3); // Completed
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isTracking, currentStatus, eta, customerPosition]);

  const handleTrack = () => {
    if (trackingInput.trim()) {
      setIsTracking(true);
      setCurrentStatus(0);
      setEta(25);
      // Reset technician position to simulate new tracking
      setTechnicianPosition([
        browardCenter[0] + (Math.random() - 0.5) * 0.15,
        browardCenter[1] + (Math.random() - 0.5) * 0.15,
      ]);
    }
  };

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Track Your <span className="glow-text">Service</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Enter your booking ID or email to track your service in real-time
          </p>
        </div>

        <div className="glass-card rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Enter booking ID (e.g., RW-123ABC) or email"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              className="flex-1"
            />
            <Button variant="glow" onClick={handleTrack} className="md:w-auto gap-2">
              <Search className="w-4 h-4" />
              Track Service
            </Button>
          </div>
        </div>

        {isTracking && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Status Panel */}
            <div className="space-y-6">
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-xl font-bold mb-6">Service Status</h3>
                
                <div className="space-y-4">
                  {statuses.map((status, index) => (
                    <motion.div
                      key={status}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                        index === currentStatus
                          ? "bg-primary/20 border border-primary/50"
                          : index < currentStatus
                          ? "bg-green-500/10 border border-green-500/30"
                          : "bg-background/50 border border-border/50"
                      }`}
                    >
                      {index < currentStatus ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : index === currentStatus ? (
                        <div className="w-6 h-6 rounded-full bg-primary animate-pulse" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-muted" />
                      )}
                      <span
                        className={`font-semibold ${
                          index === currentStatus
                            ? "text-primary"
                            : index < currentStatus
                            ? "text-green-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {currentStatus < 3 && (
                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Truck className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold">Live Updates</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">ETA:</span>
                      <span className="font-bold text-primary">{eta} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>
                        {currentStatus === 0 && "Your technician is preparing equipment..."}
                        {currentStatus === 1 && "On the way to your location!"}
                        {currentStatus === 2 && "Actively cleaning your property..."}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm">
                      💬 <strong>Rakeem & Wood:</strong> "We're on our way! Your surfaces will shine like new."
                    </p>
                  </div>
                </div>
              )}

              {currentStatus === 3 && (
                <div className="glass-card rounded-xl p-6 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Service Completed!</h3>
                  <p className="text-muted-foreground mb-4">
                    Thank you for choosing RWDetailz. We hope your property looks amazing!
                  </p>
                  <Button variant="glow">Leave a Review</Button>
                </div>
              )}
            </div>

            {/* Map Placeholder - LeafletJS Integration Ready */}
            <div className="glass-card rounded-xl overflow-hidden relative" style={{ height: "600px" }}>
              <div className="absolute inset-0 flex items-center justify-center bg-card/50">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Map View Coming Soon</p>
                  <p className="text-sm text-muted-foreground mt-2">Live GPS tracking integration</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default JobTracker;
