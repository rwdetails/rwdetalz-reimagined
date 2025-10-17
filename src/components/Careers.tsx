import { useState } from "react";
import { Briefcase, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Careers = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Application Submitted!",
      description: "Thanks for your interest! We'll review your application and get back to you soon.",
    });
    setFormData({ name: "", email: "", phone: "", position: "", message: "" });
  };

  return (
    <section id="careers" className="py-24 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 glow-border">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Join Our <span className="glow-text">Team</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            RWDetailz is growing! We're looking for motivated individuals to join our team and help us serve Broward County.
          </p>
        </div>

        {/* Open Positions */}
        <div className="mb-12 space-y-4">
          <h3 className="text-2xl font-bold mb-6">Open Positions</h3>
          
          <div className="glass-card rounded-xl p-6">
            <h4 className="text-xl font-bold mb-2">Pressure Washing Technician</h4>
            <p className="text-muted-foreground mb-4">
              Full-time | Fort Lauderdale, FL | $15-20/hr + tips
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Experience with pressure washing equipment preferred</li>
              <li>• Must have reliable transportation</li>
              <li>• Strong work ethic and customer service skills</li>
              <li>• Ability to work outdoors in various weather conditions</li>
            </ul>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h4 className="text-xl font-bold mb-2">Customer Service & Scheduler</h4>
            <p className="text-muted-foreground mb-4">
              Part-time | Remote | $14-18/hr
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Handle customer inquiries and booking requests</li>
              <li>• Schedule appointments and manage calendar</li>
              <li>• Excellent communication skills required</li>
              <li>• Experience with scheduling software a plus</li>
            </ul>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h4 className="text-xl font-bold mb-2">Marketing Assistant</h4>
            <p className="text-muted-foreground mb-4">
              Part-time | Remote/Hybrid | $12-16/hr
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Manage social media content (Instagram, TikTok)</li>
              <li>• Create before/after photos and videos</li>
              <li>• Engage with customers online</li>
              <li>• Creative mindset and social media savvy</li>
            </ul>
          </div>
        </div>

        {/* Application Form */}
        <div className="glass-card rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-6">Apply Now</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Phone *</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Position *</label>
                <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technician">Pressure Washing Technician</SelectItem>
                    <SelectItem value="scheduler">Customer Service & Scheduler</SelectItem>
                    <SelectItem value="marketing">Marketing Assistant</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Resume/CV</label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, or DOCX (Max 5MB)
                </p>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Why do you want to join RWDetailz?
              </label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                placeholder="Tell us about yourself and why you'd be a great fit..."
              />
            </div>

            <Button type="submit" variant="glow" size="lg" className="w-full">
              Submit Application
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Careers;
