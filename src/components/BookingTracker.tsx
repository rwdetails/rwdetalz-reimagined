import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Package, CheckCircle2, Clock, Truck, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

const BookingTracker = () => {
  const [bookingId, setBookingId] = useState("");
  const [bookingStatus, setBookingStatus] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!bookingId.trim()) {
      toast.error("Please enter a booking ID");
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("booking_number", bookingId.trim())
        .single();

      if (error || !data) {
        toast.error("Booking not found");
        setBookingStatus(null);
      } else {
        setBookingStatus(data);
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast.error("Failed to fetch booking");
      setBookingStatus(null);
    } finally {
      setSearching(false);
    }
  };

  const getStatusIcon = () => {
    switch (bookingStatus?.status) {
      case "completed":
        return <CheckCircle2 className="w-8 h-8 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-8 h-8 text-red-500" />;
      case "in-progress":
        return <Truck className="w-8 h-8 text-blue-500" />;
      case "scheduled":
        return <Clock className="w-8 h-8 text-yellow-500" />;
      default:
        return <Package className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (bookingStatus?.status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "in-progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
  };

  return (
    <section id="track" className="py-24 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Track Your <span className="glow-text">Booking</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Enter your booking ID to check your service status
          </p>
        </div>

        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle>Track Booking</CardTitle>
            <CardDescription>
              Find your booking ID in your confirmation email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="booking-id" className="sr-only">
                  Booking ID
                </Label>
                <Input
                  id="booking-id"
                  placeholder="RW-XXXXXX"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={searching} variant="glow">
                <Search className="w-4 h-4 mr-2" />
                {searching ? "Searching..." : "Track"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {bookingStatus && (
          <Card className="glass-card animate-fade-in">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">{getStatusIcon()}</div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CardTitle className="text-2xl capitalize">{bookingStatus.status}</CardTitle>
                <Badge className={getStatusColor()}>{bookingStatus.status}</Badge>
              </div>
              <CardDescription>Booking #{bookingStatus.booking_number}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Customer Information</p>
                <div className="glass-card p-3 rounded-lg space-y-1 text-sm">
                  <p><strong>Name:</strong> {bookingStatus.full_name}</p>
                  <p><strong>Email:</strong> {bookingStatus.email}</p>
                  <p><strong>Phone:</strong> {bookingStatus.phone}</p>
                  <p><strong>Address:</strong> {bookingStatus.address}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Service Details</p>
                <div className="glass-card p-3 rounded-lg space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-semibold">
                        {format(new Date(bookingStatus.service_date), "PPP")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-semibold">{bookingStatus.service_time}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Services</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(bookingStatus.services) &&
                        bookingStatus.services.map((service: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {service.name || service}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="glass-card p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-bold text-primary text-lg">
                      ${bookingStatus.total_amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Status</p>
                    <p className="font-semibold capitalize">
                      {bookingStatus.payment_status}
                    </p>
                  </div>
                </div>
              </div>

              {bookingStatus.special_instructions && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Special Instructions</p>
                    <p className="text-sm">{bookingStatus.special_instructions}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default BookingTracker;
