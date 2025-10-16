import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Create mailto link
    const mailtoLink = `mailto:rwdetailz@gmail.com?subject=New Contact from ${encodeURIComponent(
      formData.name
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || "Not provided"}\n\nMessage:\n${formData.message}`
    )}`;

    // Open mailto link
    window.location.href = mailtoLink;

    toast({
      title: "Opening Email Client",
      description: "Your email client should open shortly. Thank you for reaching out!",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
    setIsSubmitting(false);
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

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 space-y-6 animate-fade-in">
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

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-background/50"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message *
              </label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={5}
                className="bg-background/50 resize-none"
              />
            </div>

            <Button type="submit" variant="glow" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
