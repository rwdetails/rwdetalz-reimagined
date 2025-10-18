import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import emailjs from '@emailjs/browser';

const services = [
  { name: "Pressure Washing", price: "$79.99" },
  { name: "Roof & Gutter Cleaning", price: "$99.99" },
  { name: "Driveway & Sidewalk Cleaning", price: "$59.99" },
  { name: "Trash Can Cleaning", price: "$39.99" },
];

const hearAboutUs = [
  "Google Search",
  "Instagram",
  "TikTok",
  "Friend/Family Referral",
  "Facebook",
  "Flyer/Sign",
  "Other",
];

const BookingForm = () => {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    date: "",
    time: "",
    details: "",
    source: "",
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState("");

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init("YOUR_PUBLIC_KEY"); // User needs to add their public key
  }, []);

  const handleServiceToggle = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const generateBookingId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `RW-${timestamp}-${random}`.toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.date || !formData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (selectedServices.length === 0) {
      toast({
        title: "No Services Selected",
        description: "Please select at least one service.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const newBookingId = generateBookingId();
    setBookingId(newBookingId);

    try {
      // Email to client
      await emailjs.send(
        "YOUR_SERVICE_ID", // User needs to add their service ID
        "YOUR_TEMPLATE_ID_CLIENT", // User needs to add template ID
        {
          to_name: formData.name,
          to_email: formData.email,
          booking_id: newBookingId,
          date: formData.date,
          time: formData.time,
          services: selectedServices.join(", "),
          address: formData.address,
          phone: formData.phone,
        }
      );

      // Email to business owner
      await emailjs.send(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID_OWNER", // User needs to add template ID
        {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone,
          address: formData.address,
          date: formData.date,
          time: formData.time,
          services: selectedServices.join(", "),
          details: formData.details,
          source: formData.source,
          booking_id: newBookingId,
          to_email: "rwdetailz@gmail.com",
        }
      );

      setShowConfirmation(true);
      
      toast({
        title: "Booking Confirmed!",
        description: `Your booking ID is ${newBookingId}. Check your email for details.`,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        date: "",
        time: "",
        details: "",
        source: "",
      });
      setSelectedServices([]);
    } catch (error: any) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please call us at (954) 865-6205.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-[600px] flex items-center justify-center px-4">
        <div className="glass-card rounded-xl p-8 md:p-12 max-w-2xl w-full text-center animate-fade-in">
          <div className="mb-6">
            <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Booking <span className="glow-text">Confirmed!</span>
            </h2>
          </div>
          
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
            <p className="text-sm text-muted-foreground mb-2">Your Booking ID</p>
            <p className="text-2xl font-bold text-primary mb-4">{bookingId}</p>
            <p className="text-muted-foreground">
              We've sent confirmation emails to <span className="text-foreground font-semibold">{formData.email}</span>
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <p className="text-muted-foreground">
              📅 Scheduled for: <span className="text-foreground font-semibold">{formData.date} at {formData.time}</span>
            </p>
            <p className="text-muted-foreground">
              📍 Location: <span className="text-foreground font-semibold">{formData.address}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="glow"
              onClick={() => {
                setShowConfirmation(false);
                setBookingId("");
              }}
            >
              Book Another Service
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=RWDetailz+Service&dates=${formData.date.replace(/-/g, '')}T${formData.time.replace(':', '')}00/${formData.date.replace(/-/g, '')}T${formData.time.replace(':', '')}00&details=Booking+ID:+${bookingId}&location=${encodeURIComponent(formData.address)}`;
                window.open(calendarUrl, '_blank');
              }}
            >
              Add to Calendar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Book Your <span className="glow-text">Service</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Schedule your appointment in minutes — we'll make your property shine!
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="glass-card rounded-xl p-8 space-y-6">
          {/* Personal Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name *
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number *
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="(954) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-2">
                Service Address *
              </label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                placeholder="123 Main St, Fort Lauderdale, FL"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Preferred Date *
              </label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Preferred Time *
              </label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Select Services *
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              {services.map((service) => (
                <div
                  key={service.name}
                  className={`flex items-center space-x-3 p-4 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 transition-colors cursor-pointer ${
                    selectedServices.includes(service.name) ? "border-primary bg-primary/10" : ""
                  }`}
                  onClick={() => handleServiceToggle(service.name)}
                >
                  <Checkbox
                    id={service.name}
                    checked={selectedServices.includes(service.name)}
                    onCheckedChange={() => handleServiceToggle(service.name)}
                  />
                  <label
                    htmlFor={service.name}
                    className="flex-1 text-sm font-medium cursor-pointer"
                  >
                    {service.name} - <span className="text-primary">{service.price}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* How did you hear about us */}
          <div>
            <label htmlFor="source" className="block text-sm font-medium mb-2">
              How did you hear about us?
            </label>
            <Select
              value={formData.source}
              onValueChange={(value) => setFormData({ ...formData, source: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {hearAboutUs.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Details */}
          <div>
            <label htmlFor="details" className="block text-sm font-medium mb-2">
              Additional Details / Special Instructions
            </label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              rows={4}
              placeholder="Any specific requirements or notes..."
            />
          </div>

          {/* Summary */}
          {selectedServices.length > 0 && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 animate-fade-in">
              <p className="text-sm font-medium mb-2">Booking Summary:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {selectedServices.map((service) => (
                  <li key={service}>• {service}</li>
                ))}
              </ul>
              {formData.date && formData.time && (
                <p className="text-sm text-muted-foreground mt-2">
                  📅 {formData.date} at {formData.time}
                </p>
              )}
            </div>
          )}

          <Button type="submit" variant="glow" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Confirm Booking"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default BookingForm;
