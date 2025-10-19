import { Mail, Phone, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
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

    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: formData,
      });

      if (error) throw error;

      toast.success("Thank you! We'll get back to you soon.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again or call us directly.");
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="glass-card p-6 animate-fade-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4 glow-border">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-2">Phone</h3>
              <a href="tel:9548656205" className="text-muted-foreground hover:text-primary transition-colors text-lg">
                (954) 865-6205
              </a>
            </div>
          </Card>

          <Card className="glass-card p-6 animate-fade-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4 glow-border">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-2">Email</h3>
              <a href="mailto:rwdetailz@gmail.com" className="text-muted-foreground hover:text-primary transition-colors break-all">
                rwdetailz@gmail.com
              </a>
            </div>
          </Card>

          <Card className="glass-card p-6 animate-fade-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4 glow-border">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-2">Service Area</h3>
              <p className="text-muted-foreground">
                South Florida & Surrounding Areas
              </p>
            </div>
          </Card>

          <Card className="glass-card p-6 animate-fade-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4 glow-border">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-2">Payment</h3>
              <div className="text-muted-foreground text-sm space-y-1">
                <p>Zelle: 754-245-4962</p>
                <p>CashApp: @KeenooLmao</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="glass-card p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-6 text-center">Send Us a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="(954) 865-6205"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="your@email.com"
              />
            </div>
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                placeholder="Tell us about your project..."
                rows={5}
              />
            </div>
            <Button type="submit" variant="glow" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
};

export default Contact;
