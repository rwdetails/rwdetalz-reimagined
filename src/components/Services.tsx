import { Droplets, Home, Car, Sparkles } from "lucide-react";

const services = [
  {
    icon: Droplets,
    title: "Pressure Washing",
    price: "$79.99",
    features: ["High pressure", "Stain removal", "Surface cleaning", "Fast turnaround"],
  },
  {
    icon: Home,
    title: "Roof & Gutter Cleaning",
    price: "$99.99",
    features: ["Soft wash", "Roof-safe", "Debris removal", "Gutter flow restoration"],
  },
  {
    icon: Sparkles,
    title: "Driveway & Sidewalk Cleaning",
    price: "$59.99",
    features: ["Deep clean", "Mold removal", "Eco-safe soap", "Restored appearance"],
  },
  {
    icon: Car,
    title: "Vehicle Wash & Detailing",
    price: "Coming Soon",
    features: ["Hand wash", "Tire shine", "Wax finish", "Interior detail"],
    comingSoon: true,
  },
];

const Services = () => {
  return (
    <section id="services" className="py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our <span className="glow-text">Services</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional exterior cleaning solutions designed for modern homes and businesses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className={`glass-card rounded-xl p-6 hover-lift ${
                  service.comingSoon ? "opacity-75" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 glow-border">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-2xl font-bold text-primary mb-4">{service.price}</p>
                </div>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="text-muted-foreground text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {service.comingSoon && (
                  <div className="mt-4 text-xs text-primary font-semibold">
                    Coming Soon
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
