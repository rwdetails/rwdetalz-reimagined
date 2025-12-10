import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, FileText, Send } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

const QuoteRequest = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    propertySize: "",
    details: "",
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = [
    { name: "Pressure Washing", description: "House, driveway, deck, etc." },
    { name: "Roof & Gutter Cleaning", description: "Complete roof and gutter service" },
    { name: "Driveway & Sidewalk Cleaning", description: "Concrete and paver cleaning" },
    { name: "Vehicle Detailing", description: "Full interior and exterior detail" },
    { name: "Commercial Services", description: "Business and commercial properties" },
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

    if (!formData.name || !formData.email || !formData.phone) {
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
        description: "Please select at least one service for your quote.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: `
QUOTE REQUEST

Services Requested: ${selectedServices.join(", ")}

Address: ${formData.address || "Not provided"}
Property Size: ${formData.propertySize || "Not provided"}

Additional Details:
${formData.details || "None"}
          `.trim(),
        },
      });

      if (error) throw error;

      toast({
        title: "Quote Request Sent!",
        description: "We'll get back to you with a custom quote within 24 hours.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        propertySize: "",
        details: "",
      });
      setSelectedServices([]);
    } catch (error: any) {
      console.error("Error submitting quote request:", error);
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
    <section id="quote" className="py-24 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Request a <span className="glow-text">Free Quote</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get a personalized quote for your project. No obligation, just honest pricing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Info Side */}
          <div className="space-y-8 animate-fade-in">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-bold">Why Get a Quote?</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>No hidden fees or surprise charges</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Customized pricing based on your needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Response within 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Compare and save with bundle deals</span>
                </li>
              </ul>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="font-bold mb-4">Quick Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <a href="tel:9548656205" className="hover:text-primary transition-colors">
                    (954) 865-6205
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <a href="mailto:rwdetailz@gmail.com" className="hover:text-primary transition-colors">
                    rwdetailz@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">South Florida & Surrounding Areas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Form */}
          <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 space-y-6 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="quote-name" className="block text-sm font-medium mb-2">
                  Name *
                </label>
                <Input
                  id="quote-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-background/50"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="quote-phone" className="block text-sm font-medium mb-2">
                  Phone *
                </label>
                <Input
                  id="quote-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="bg-background/50"
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>

            <div>
              <label htmlFor="quote-email" className="block text-sm font-medium mb-2">
                Email *
              </label>
              <Input
                id="quote-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-background/50"
                placeholder="your@email.com"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="quote-address" className="block text-sm font-medium mb-2">
                  Address
                </label>
                <Input
                  id="quote-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-background/50"
                  placeholder="123 Main St, City"
                />
              </div>
              <div>
                <label htmlFor="quote-size" className="block text-sm font-medium mb-2">
                  Property Size
                </label>
                <Input
                  id="quote-size"
                  value={formData.propertySize}
                  onChange={(e) => setFormData({ ...formData, propertySize: e.target.value })}
                  className="bg-background/50"
                  placeholder="e.g., 2000 sq ft"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                Services Interested In *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {services.map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 cursor-pointer"
                    onClick={() => handleServiceToggle(service.name)}
                  >
                    <Checkbox
                      id={`quote-${service.name}`}
                      checked={selectedServices.includes(service.name)}
                      onCheckedChange={() => handleServiceToggle(service.name)}
                    />
                    <div className="flex-1">
                      <label htmlFor={`quote-${service.name}`} className="text-sm font-medium cursor-pointer">
                        {service.name}
                      </label>
                      <p className="text-xs text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="quote-details" className="block text-sm font-medium mb-2">
                Project Details
              </label>
              <Textarea
                id="quote-details"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                rows={3}
                className="bg-background/50 resize-none"
                placeholder="Tell us more about your project..."
              />
            </div>

            <Button type="submit" variant="glow" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Request Free Quote
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default QuoteRequest;
