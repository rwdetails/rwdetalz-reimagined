import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Calendar, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    date: "",
    time: "",
    details: "",
    hearAbout: "",
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = [
    { name: "Pressure Washing", price: "$79.99" },
    { name: "Roof & Gutter Cleaning", price: "$99.99" },
    { name: "Driveway & Sidewalk Cleaning", price: "$59.99" },
    { name: "Trash Can Cleaning", price: "$39.99" },
  ];

  const handleServiceToggle = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.date || !formData.time || !formData.hearAbout) {
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

    try {
      const { data, error } = await supabase.functions.invoke("send-booking-email", {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          date: formData.date,
          time: formData.time,
          services: selectedServices,
          details: formData.details,
          hearAbout: formData.hearAbout,
        },
      });

      if (error) throw error;

      toast({
        title: "Booking Received!",
        description: "Thanks! We'll contact you soon to confirm your appointment.",
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
        hearAbout: "",
      });
      setSelectedServices([]);
    } catch (error: any) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try calling us at (954) 865-6205.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get In <span className="glow-text">Touch</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ready to give your property a fresh look? Reach out and let's get started.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8 animate-fade-in">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 glow-border">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Phone</h3>
                  <a href="tel:9548656205" className="text-muted-foreground hover:text-primary transition-colors">
                    (954) 865-6205
                  </a>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 glow-border">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Email</h3>
                  <a href="mailto:rwdetailz@gmail.com" className="text-muted-foreground hover:text-primary transition-colors break-all">
                    rwdetailz@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 glow-border">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Service Area</h3>
                  <p className="text-muted-foreground">
                    South Florida & Surrounding Areas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 space-y-6 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name *
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-background/50"
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
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Phone *
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="bg-background/50"
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
                  className="bg-background/50"
                  placeholder="123 Main St, City, FL"
                />
              </div>
            </div>

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
                  className="bg-background/50"
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
                  className="bg-background/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                Select Services *
              </label>
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.name}
                    className={`flex items-center space-x-3 p-3 rounded-lg border border-border/50 bg-background/30 ${
                      service.disabled ? "opacity-50" : "hover:bg-background/50"
                    }`}
                  >
                    <Checkbox
                      id={service.name}
                      checked={selectedServices.includes(service.name)}
                      onCheckedChange={() => handleServiceToggle(service.name)}
                      disabled={service.disabled}
                    />
                    <label
                      htmlFor={service.name}
                      className="flex-1 text-sm font-medium cursor-pointer"
                    >
                      {service.name} - {service.price}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {selectedServices.length > 0 && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 animate-fade-in">
                <p className="text-sm font-medium mb-2">Selected Services:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedServices.map((service) => (
                    <li key={service}>• {service}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <label htmlFor="hearAbout" className="block text-sm font-medium mb-2">
                How did you hear about us? *
              </label>
              <select
                id="hearAbout"
                value={formData.hearAbout}
                onChange={(e) => setFormData({ ...formData, hearAbout: e.target.value })}
                required
                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select an option</option>
                <option value="Google">Google</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Friend">Friend / Referral</option>
                <option value="Nextdoor">Nextdoor</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="details" className="block text-sm font-medium mb-2">
                Additional Details / Special Instructions
              </label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                rows={4}
                className="bg-background/50 resize-none"
                placeholder="Any specific requirements or notes..."
              />
            </div>

            <Button type="submit" variant="glow" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Book My Service"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
