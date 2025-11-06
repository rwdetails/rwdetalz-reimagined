import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Droplets, Home, TrashIcon, Fence, Car, Paintbrush, Truck, Building2, Trees, Sparkles, Shield } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

const activeServices = [
  {
    icon: Droplets,
    title: "Pressure Washing",
    price: "$150",
    image: "🏠",
    features: ["High pressure cleaning", "Stain removal", "Surface restoration", "Fast turnaround"],
    description: "Professional high-pressure cleaning for all exterior surfaces. Remove years of dirt, grime, and buildup to restore your property's original beauty.",
  },
  {
    icon: Sparkles,
    title: "Driveway Cleaning",
    price: "$120",
    image: "🚗",
    features: ["Oil stain removal", "Concrete restoration", "Eco-safe products", "Long-lasting results"],
    description: "Deep clean your driveway to remove oil stains, tire marks, and embedded dirt. We'll make it look brand new.",
  },
  {
    icon: TrashIcon,
    title: "Trash Can Cleaning",
    price: "$50",
    image: "🗑️",
    features: ["Interior sanitization", "Odor elimination", "Eco-friendly disinfectant", "Monthly service available"],
    description: "Keep your trash cans fresh and sanitary with our specialized cleaning service. We eliminate bacteria, odors, and buildup.",
  },
  {
    icon: Car,
    title: "Vehicle Detailing",
    price: "$89.99",
    image: "🚗",
    features: ["Hand wash", "Interior detail", "Wax & polish", "Tire shine"],
    description: "Complete vehicle detailing service. Choose from basic wash to premium packages with clay bar treatment, ceramic coating, and more.",
    isNew: true,
  },
  {
    icon: Home,
    title: "Roof Cleaning",
    price: "$200",
    image: "🏚️",
    features: ["Soft wash technique", "Algae & moss removal", "Roof-safe chemicals", "Extended roof life"],
    description: "Gentle yet effective roof cleaning that removes algae, moss, and stains without damaging your shingles.",
  },
];

const comingSoonServices = [
  {
    icon: Fence,
    title: "Deck & Fence Cleaning",
    price: "Coming Soon",
    image: "🪵",
    features: ["Wood restoration", "Stain prep", "Mildew removal", "Sealing available"],
  },
  {
    icon: Paintbrush,
    title: "Graffiti Removal",
    price: "Coming Soon",
    image: "🎨",
    features: ["Safe removal", "Surface protection", "Fast response", "Multiple surfaces"],
  },
  {
    icon: Truck,
    title: "Fleet Washing",
    price: "Coming Soon",
    image: "🚚",
    features: ["Commercial vehicles", "Regular schedules", "Volume discounts", "On-site service"],
  },
  {
    icon: Building2,
    title: "Building Exterior",
    price: "Coming Soon",
    image: "🏢",
    features: ["Multi-story buildings", "Commercial properties", "Window cleaning", "Scheduled maintenance"],
  },
  {
    icon: Trees,
    title: "Sidewalk & Patio",
    price: "Coming Soon",
    image: "🌳",
    features: ["Paver cleaning", "Joint sand restoration", "Sealing services", "Weed prevention"],
  },
  {
    icon: Shield,
    title: "Gutter Cleaning",
    price: "Coming Soon",
    image: "💧",
    features: ["Debris removal", "Downspout flushing", "Inspection included", "Seasonal service"],
  },
];

const ServicesEnhanced = () => {
  const [expandedService, setExpandedService] = useState<string | null>(null);

  return (
    <section className="py-24 px-4 min-h-screen">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our <span className="glow-text">Services</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional exterior cleaning solutions designed for modern homes and businesses in Broward County
          </p>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6 text-primary">Active Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Collapsible
                  key={index}
                  open={expandedService === service.title}
                  onOpenChange={(open) => setExpandedService(open ? service.title : null)}
                >
                  <div className="glass-card rounded-xl p-6 hover-lift h-full flex flex-col">
                  <div className="mb-4">
                      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 glow-border text-3xl relative">
                        {service.image}
                        {service.isNew && (
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                            NEW!
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                      <p className="text-2xl font-bold text-primary mb-4">{service.price}</p>
                    </div>
                    <ul className="space-y-2 mb-4 flex-grow">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="text-muted-foreground text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        {expandedService === service.title ? "Hide" : "Learn More"}
                        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${expandedService === service.title ? "rotate-180" : ""}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                      <Button variant="glow" size="sm" className="w-full mt-3">
                        Add to Booking
                      </Button>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-6 text-muted-foreground">Coming Soon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {comingSoonServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="glass-card rounded-xl p-6 opacity-75"
                >
                  <div className="mb-4">
                    <div className="w-14 h-14 rounded-lg bg-muted/10 flex items-center justify-center mb-4 text-3xl">
                      {service.image}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-lg font-bold text-muted-foreground mb-4">{service.price}</p>
                  </div>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-muted-foreground text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesEnhanced;
