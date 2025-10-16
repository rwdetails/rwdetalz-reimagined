import { Leaf, Calendar, Zap, Users } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "Eco-Friendly Setup",
    description: "Biodegradable soaps and water-efficient equipment that's safe for your family and the planet.",
  },
  {
    icon: Calendar,
    title: "Real-Time Scheduling",
    description: "Book instantly online or by phone. Flexible timing that works around your schedule.",
  },
  {
    icon: Zap,
    title: "Fast Response",
    description: "Same-day or next-day service available. We show up on time, every time.",
  },
  {
    icon: Users,
    title: "Young + Motivated Team",
    description: "Fresh energy, modern approach, and serious dedication to every job we take on.",
  },
];

const WhyUs = () => {
  return (
    <section id="why" className="py-24 px-4 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="glow-text">RWDetailz</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We're not your typical cleaning company. We're bringing fresh ideas and real hustle to every job.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4 inline-flex">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center glow-border animate-float">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
