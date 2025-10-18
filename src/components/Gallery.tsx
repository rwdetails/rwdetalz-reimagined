import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ZoomIn } from "lucide-react";

const categories = ["All", "Driveways", "Roofs", "Sidewalks", "Trash Cans"];

const galleryImages = [
  { category: "Driveways", before: "🏠", after: "✨", title: "Driveway Transformation" },
  { category: "Roofs", before: "🏚️", after: "🏡", title: "Roof Cleaning" },
  { category: "Sidewalks", before: "👣", after: "🌟", title: "Sidewalk Restoration" },
  { category: "Trash Cans", before: "🗑️", after: "🧼", title: "Trash Can Sanitization" },
  { category: "Driveways", before: "🚗", after: "💎", title: "Concrete Cleaning" },
  { category: "Roofs", before: "🍃", after: "🏠", title: "Moss Removal" },
];

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [compareSlider, setCompareSlider] = useState(50);

  const filteredImages =
    selectedCategory === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === selectedCategory);

  return (
    <div className="container mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our <span className="glow-text">Gallery</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See the amazing transformations we've delivered across Broward County
          </p>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="w-full justify-center flex-wrap h-auto gap-2">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="mb-12 glass-card rounded-xl p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-4 text-center">Before & After Slider</h3>
          <div className="relative h-64 rounded-lg overflow-hidden border-2 border-primary/20">
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              {galleryImages[0].before}
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center text-6xl bg-background"
              style={{ clipPath: `inset(0 ${100 - compareSlider}% 0 0)` }}
            >
              {galleryImages[0].after}
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={compareSlider}
              onChange={(e) => setCompareSlider(Number(e.target.value))}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 z-10"
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary"
              style={{ left: `${compareSlider}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <ZoomIn className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-4 text-sm text-muted-foreground">
            <span>Before</span>
            <span>After</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, index) => (
            <Card
              key={index}
              className="group overflow-hidden hover-lift cursor-pointer glass-card"
            >
              <div className="relative h-64 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center text-6xl transition-opacity group-hover:opacity-0">
                  {image.before}
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-0 group-hover:opacity-100 transition-opacity">
                  {image.after}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg">{image.title}</h3>
                <p className="text-sm text-muted-foreground">{image.category}</p>
              </div>
            </Card>
          ))}
        </div>
    </div>
  );
};

export default Gallery;
