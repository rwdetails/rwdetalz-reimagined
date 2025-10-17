import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const BookingTracker = () => {
  const [trackingInput, setTrackingInput] = useState("");
  const [trackingResult, setTrackingResult] = useState<{
    found: boolean;
    status?: string;
    message?: string;
  } | null>(null);

  const handleTrack = () => {
    // Demo tracking logic - in production this would query a database
    if (trackingInput.trim()) {
      // Simulate finding a booking
      const statuses = ["Received", "Scheduled", "In Progress", "Completed"];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      setTrackingResult({
        found: true,
        status: randomStatus,
        message: `Your booking is currently: ${randomStatus}`,
      });
    }
  };

  return (
    <section id="track" className="py-24 px-4 bg-secondary/20">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Track Your <span className="glow-text">Booking</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enter your email or booking ID to check your service status
          </p>
        </div>

        <div className="glass-card rounded-xl p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Enter your email or booking ID"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              className="bg-background/50 flex-1"
            />
            <Button variant="glow" onClick={handleTrack} className="md:w-auto">
              <Search className="w-4 h-4 mr-2" />
              Track Booking
            </Button>
          </div>

          {trackingResult && trackingResult.found && (
            <div className="mt-6 p-6 rounded-lg bg-primary/10 border border-primary/20 animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <h3 className="text-xl font-bold">Booking Status</h3>
              </div>
              <p className="text-lg text-primary font-semibold mb-2">{trackingResult.status}</p>
              <p className="text-muted-foreground">{trackingResult.message}</p>
              <p className="text-sm text-muted-foreground mt-4">
                Need help? Call us at (954) 865-6205
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BookingTracker;
