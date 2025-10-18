import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const services = [
  { id: "pressure-washing", name: "Pressure Washing", price: 150, image: "🏠" },
  { id: "driveway", name: "Driveway Cleaning", price: 120, image: "🚗" },
  { id: "trash-can", name: "Trash Can Cleaning", price: 50, image: "🗑️" },
  { id: "roof", name: "Roof Cleaning", price: 200, image: "🏚️" },
];

interface BookingFormProps {
  onClose: () => void;
}

const BookingForm = ({ onClose }: BookingFormProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    date: undefined as Date | undefined,
    time: "",
    services: [] as string[],
    instructions: "",
    source: "",
  });

  const generateBookingId = () => {
    return `RW-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((s) => s !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  const calculateTotal = () => {
    return formData.services.reduce((total, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const newBookingId = generateBookingId();
    setBookingId(newBookingId);

    const selectedServices = services
      .filter((s) => formData.services.includes(s.id));

    const selectedServiceNames = selectedServices.map(s => s.name);

    try {
      const { error } = await supabase.functions.invoke("send-booking-email", {
        body: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          date: formData.date ? format(formData.date, "PPP") : "",
          time: formData.time,
          services: selectedServiceNames,
          details: formData.instructions,
        },
      });

      if (error) throw error;

      toast.success("Booking confirmed! Check your email.");
      setStep(4);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to send booking. Please contact us at (954) 865-6205.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold glow-text">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                  placeholder="(954) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="address">Service Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1"
                  placeholder="123 Main St, Fort Lauderdale, FL"
                />
              </div>
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!formData.fullName || !formData.email || !formData.phone || !formData.address}
              variant="glow"
              className="w-full"
            >
              Next: Select Services
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold glow-text">Select Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceToggle(service.id)}
                  className={cn(
                    "glass-card p-4 rounded-lg cursor-pointer transition-all hover-lift",
                    formData.services.includes(service.id) && "ring-2 ring-primary bg-primary/10"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{service.image}</div>
                      <div>
                        <h4 className="font-bold">{service.name}</h4>
                        <p className="text-primary font-semibold">${service.price}</p>
                      </div>
                    </div>
                    <Checkbox checked={formData.services.includes(service.id)} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-2xl font-bold text-primary">${calculateTotal()}</span>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={formData.services.length === 0}
                variant="glow"
                className="flex-1"
              >
                Next: Schedule & Details
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold glow-text">Schedule & Details</h3>
            <div className="space-y-4">
              <div>
                <Label>Preferred Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData({ ...formData, date })}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="time">Preferred Time *</Label>
                <Select value={formData.time} onValueChange={(time) => setFormData({ ...formData, time })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8:00 AM">8:00 AM</SelectItem>
                    <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                    <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                    <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                    <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="mt-1"
                  placeholder="Gate code, parking instructions, etc."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="source">How did you hear about us? *</Label>
                <Select value={formData.source} onValueChange={(source) => setFormData({ ...formData, source })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google Search</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="referral">Friend/Family Referral</SelectItem>
                    <SelectItem value="nextdoor">Nextdoor</SelectItem>
                    <SelectItem value="yard-sign">Yard Sign</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="glass-card p-4 rounded-lg space-y-2">
              <h4 className="font-bold">Booking Summary</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p><strong>Name:</strong> {formData.fullName}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Phone:</strong> {formData.phone}</p>
                <p><strong>Address:</strong> {formData.address}</p>
                <p><strong>Date:</strong> {formData.date ? format(formData.date, "PPP") : "Not selected"}</p>
                <p><strong>Time:</strong> {formData.time || "Not selected"}</p>
                <p><strong>Services:</strong> {formData.services.map(id => services.find(s => s.id === id)?.name).join(", ")}</p>
                <p className="text-primary font-bold text-base pt-2">
                  <strong>Total:</strong> ${calculateTotal()}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.date || !formData.time || !formData.source || loading}
                variant="glow"
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6 animate-fade-in py-8">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto glow-border">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-3xl font-bold glow-text mb-2">Booking Confirmed!</h3>
              <p className="text-muted-foreground">Your confirmation has been sent to {formData.email}</p>
            </div>
            <div className="glass-card p-6 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-muted-foreground mb-2">Your Booking ID</p>
              <p className="text-2xl font-bold text-primary">{bookingId}</p>
              <p className="text-xs text-muted-foreground mt-4">
                Save this ID to track your service
              </p>
            </div>
            <div className="space-y-3">
              <Button variant="glow" className="w-full max-w-md" onClick={() => {
                const event = {
                  title: `RWDetailz - ${formData.services.length} Service${formData.services.length > 1 ? 's' : ''}`,
                  description: `Booking ID: ${bookingId}`,
                  start: formData.date,
                  duration: [2, "hour"],
                };
                const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}`;
                window.open(googleUrl, "_blank");
              }}>
                Add to Google Calendar
              </Button>
              <p className="text-sm text-muted-foreground">
                Questions? Call us at <a href="tel:9548656205" className="text-primary hover:underline">(954) 865-6205</a>
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="py-24 px-4 min-h-screen">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-12">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Book Your <span className="glow-text">Service</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Complete your booking in just a few steps
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
            <X className="h-6 w-6" />
          </Button>
        </div>

        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-2 rounded-full transition-all",
                  s === step ? "w-12 bg-primary" : "w-2 bg-muted"
                )}
              />
            ))}
          </div>
        )}

        <div className="glass-card rounded-xl p-8">{renderStep()}</div>
      </div>
    </section>
  );
};

export default BookingForm;
