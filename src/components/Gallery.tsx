import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = ["All", "Driveways", "Roofs", "Sidewalks", "Trash Cans", "Houses", "Coming Soon"];

const galleryImages = [
  { id: 1, category: "Driveways", before: "/placeholder.svg", after: "/placeholder.svg", title: "Driveway Transformation" },
  { id: 2, category: "Roofs", before: "/placeholder.svg", after: "/placeholder.svg", title: "Roof Cleaning" },
  { id: 3, category: "Sidewalks", before: "/placeholder.svg", after: "/placeholder.svg", title: "Sidewalk Restoration" },
  { id: 4, category: "Trash Cans", before: "/placeholder.svg", after: "/placeholder.svg", title: "Trash Can Deep Clean" },
  { id: 5, category: "Driveways", before: "/placeholder.svg", after: "/placeholder.svg", title: "Concrete Driveway" },
  { id: 6, category: "Houses", before: "/placeholder.svg", after: "/placeholder.svg", title: "House Exterior Wash" },
];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);
  const [showBefore, setShowBefore] = useState(true);

  const filteredImages = activeCategory === "All" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our <span className="glow-text">Work</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See the incredible transformations we've delivered across Broward County
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "glow" : "outline"}
              onClick={() => setActiveCategory(category)}
              className="transition-all"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredImages.map((image) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="glass-card rounded-xl overflow-hidden group cursor-pointer hover-lift"
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={image.before} 
                    alt={`${image.title} before`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{image.title}</h3>
                  <p className="text-sm text-muted-foreground">{image.category}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Image Modal with Before/After Slider */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-4xl w-full glass-card rounded-xl p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-4">{selectedImage.title}</h3>
                
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                  <img 
                    src={showBefore ? selectedImage.before : selectedImage.after}
                    alt={`${selectedImage.title} ${showBefore ? 'before' : 'after'}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setShowBefore(!showBefore)}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {showBefore ? "Show After" : "Show Before"}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="glow" onClick={() => setSelectedImage(null)}>
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Gallery;
