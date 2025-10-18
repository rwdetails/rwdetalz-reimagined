import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";

const positions = [
  "Pressure Washing Technician",
  "Team Lead",
  "Customer Service Representative",
  "Operations Manager",
  "Marketing Specialist",
];

const Careers = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    message: "",
    resume: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await emailjs.send(
        "YOUR_SERVICE_ID",
        "YOUR_CAREERS_TEMPLATE_ID",
        {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone,
          position: formData.position,
          experience: formData.experience,
          message: formData.message,
        },
        "YOUR_PUBLIC_KEY"
      );
      
      toast.success("Application submitted successfully!");
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please email us directly.");
    }
  };

  if (submitted) {
    return (
      <section className="py-24 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 animate-fade-in max-w-2xl">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto glow-border">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h3 className="text-3xl font-bold glow-text mb-2">Application Received!</h3>
            <p className="text-muted-foreground text-lg">
              Thank you for your interest in joining the RWDetailz team. We'll review your application and get back to you soon.
            </p>
          </div>
          <Button variant="glow" onClick={() => setSubmitted(false)}>
            Submit Another Application
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-4 min-h-screen">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Join Our <span className="glow-text">Team</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Be part of a young, motivated team revolutionizing the power washing industry in South Florida
          </p>
        </div>

        <div className="glass-card rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold mb-4">Why Work With Us?</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
              <span>Competitive pay and performance bonuses</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
              <span>Flexible scheduling and work-life balance</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
              <span>Training and growth opportunities</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
              <span>Modern equipment and tools</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
              <span>Be part of an entrepreneurial, innovative team</span>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 space-y-6">
          <h3 className="text-2xl font-bold">Apply Now</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="position">Position *</Label>
              <Select
                value={formData.position}
                onValueChange={(position) => setFormData({ ...formData, position })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="experience">Relevant Experience</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="Tell us about your relevant experience..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="message">Why do you want to join RWDetailz? *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us why you'd be a great fit for our team..."
              rows={4}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="resume">Resume / CV (Optional)</Label>
            <div className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                id="resume"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFormData({ ...formData, resume: e.target.files?.[0] || null })}
                className="hidden"
              />
              <label htmlFor="resume" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {formData.resume ? formData.resume.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOC, or DOCX (max 5MB)</p>
              </label>
            </div>
          </div>

          <Button type="submit" variant="glow" className="w-full">
            Submit Application
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Careers;
