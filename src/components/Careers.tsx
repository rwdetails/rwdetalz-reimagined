import { useState } from "react";
import { Briefcase, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const positions = [
  {
    title: "Pressure Washing Technician",
    type: "Part-Time",
    description: "Join our growing team! Learn professional pressure washing techniques and work flexible hours.",
  },
  {
    title: "Operations Assistant",
    type: "Part-Time",
    description: "Help manage bookings, customer communication, and scheduling. Perfect for organized individuals.",
  },
  {
    title: "Social Media Manager",
    type: "Contract",
    description: "Create content, manage our Instagram/TikTok, and help grow our online presence.",
  },
];

const Careers = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you soon.",
      });
      setFormData({ name: "", email: "", phone: "", position: "", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Briefcase className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Join Our <span className="glow-text">Team</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            RWDetailz is growing! We're looking for motivated individuals who want to learn, grow, and be part of something special.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Open Positions */}
          <div>
            <h3 className="text-2xl font-bold mb-6">Open Positions</h3>
            <div className="space-y-4">
              {positions.map((position, index) => (
                <div
                  key={index}
                  className="glass-card rounded-xl p-6 hover-lift animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-lg">{position.title}</h4>
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary font-semibold">
                      {position.type}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">{position.description}</p>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-xl p-6 mt-6">
              <h4 className="font-bold mb-3">Why Work With Us?</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Flexible hours that work with your schedule
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Learn valuable business and technical skills
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Competitive pay and growth opportunities
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Work with a young, energetic team
                </li>
              </ul>
            </div>
          </div>

          {/* Application Form */}
          <div className="glass-card rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6">Apply Now</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone *</label>
                <Input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(954) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Position *</label>
                <Select
                  required
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos.title} value={pos.title}>
                        {pos.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tell us about yourself *
                </label>
                <Textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Why do you want to join RWDetailz? What skills or experience do you have?"
                  rows={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Resume (Optional)</label>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, or DOCX (Max 5MB)
                  </p>
                </div>
              </div>

              <Button type="submit" variant="glow" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Careers;
