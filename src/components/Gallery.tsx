import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = ["All", "Driveways", "Roofs", "Sidewalks", "Trash Cans", "Houses", "Coming Soon"];

const galleryItems = [
  { id: 1, category: "Driveways", before: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", after: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800", title: "Driveway Transformation" },
  { id: 2, category: "Roofs", before: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800", after: "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800", title: "Roof Cleaning" },
  { id: 3, category: "Sidewalks", before: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800", after: "https://images.unsplash.com/photo-1580216643062-cf460548a66a?w=800", title: "Sidewalk Revival" },
  { id: 4, category: "Houses", before: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800", after: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", title: "House Exterior Wash" },
];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const filteredItems = activeCategory === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <section id="gallery" className="py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our <span className="glow-text">Work</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See the difference professional power washing makes
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "glow" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className="transition-all"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="glass-card rounded-xl overflow-hidden hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                <div className="grid grid-cols-2 gap-2 p-4">
                  {/* Before Image */}
                  <div className="relative group">
                    <div className="absolute top-2 left-2 z-10 bg-destructive/90 text-white px-3 py-1 rounded-lg text-xs font-bold">
                      BEFORE
                    </div>
                    <img 
                      src={item.before} 
                      alt={`${item.title} - Before`}
                      className="w-full h-64 object-cover rounded-lg cursor-zoom-in group-hover:scale-105 transition-transform duration-300"
                      onClick={() => setSelectedImage(item.id)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  
                  {/* After Image */}
                  <div className="relative group">
                    <div className="absolute top-2 left-2 z-10 bg-primary/90 text-black px-3 py-1 rounded-lg text-xs font-bold">
                      AFTER
                    </div>
                    <img 
                      src={item.after} 
                      alt={`${item.title} - After`}
                      className="w-full h-64 object-cover rounded-lg cursor-zoom-in group-hover:scale-105 transition-transform duration-300"
                      onClick={() => setSelectedImage(item.id)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-xl">No projects in this category yet.</p>
            <p className="text-sm mt-2">Check back soon for more transformations!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
