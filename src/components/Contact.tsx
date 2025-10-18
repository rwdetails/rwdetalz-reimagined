import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
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

        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card rounded-xl p-6 animate-fade-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4 glow-border">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-2">Phone</h3>
              <a href="tel:9548656205" className="text-muted-foreground hover:text-primary transition-colors text-lg">
                (954) 865-6205
              </a>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4 glow-border">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-2">Email</h3>
              <a href="mailto:rwdetailz@gmail.com" className="text-muted-foreground hover:text-primary transition-colors break-all">
                rwdetailz@gmail.com
              </a>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4 glow-border">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-2">Service Area</h3>
              <p className="text-muted-foreground">
                South Florida & Surrounding Areas
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
