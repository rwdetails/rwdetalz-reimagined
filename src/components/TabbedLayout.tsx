import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Hero from "./Hero";
import Services from "./ServicesEnhanced";
import BookingForm from "./BookingForm";
import BookingTrackerEnhanced from "./BookingTrackerEnhanced";
import Gallery from "./Gallery";
import Reviews from "./Reviews";
import FAQ from "./FAQ";
import Contact from "./Contact";
import Careers from "./Careers";

const TabbedLayout = () => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-[72px] z-40 glass-card border-b border-border/50">
          <div className="container mx-auto px-4">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-transparent border-none h-auto p-0 gap-1">
              <TabsTrigger value="home" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-4 py-2 transition-all">
                Home
              </TabsTrigger>
              <TabsTrigger value="services" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-4 py-2 transition-all">
                Services
              </TabsTrigger>
              <TabsTrigger value="booking" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-4 py-2 transition-all">
                Book Now
              </TabsTrigger>
              <TabsTrigger value="tracker" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-4 py-2 transition-all">
                Track Job
              </TabsTrigger>
              <TabsTrigger value="gallery" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-4 py-2 transition-all">
                Gallery
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-4 py-2 transition-all">
                Reviews
              </TabsTrigger>
              <TabsTrigger value="faq" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-4 py-2 transition-all">
                FAQ
              </TabsTrigger>
              <TabsTrigger value="contact" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-4 py-2 transition-all">
                Contact
              </TabsTrigger>
              <TabsTrigger value="careers" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-4 py-2 transition-all">
                Careers
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="home" className="mt-0 animate-fade-in">
          <Hero />
        </TabsContent>

        <TabsContent value="services" className="mt-0 animate-fade-in">
          <Services />
        </TabsContent>

        <TabsContent value="booking" className="mt-0 animate-fade-in">
          <BookingForm />
        </TabsContent>

        <TabsContent value="tracker" className="mt-0 animate-fade-in">
          <BookingTrackerEnhanced />
        </TabsContent>

        <TabsContent value="gallery" className="mt-0 animate-fade-in">
          <Gallery />
        </TabsContent>

        <TabsContent value="reviews" className="mt-0 animate-fade-in">
          <Reviews />
        </TabsContent>

        <TabsContent value="faq" className="mt-0 animate-fade-in">
          <FAQ />
        </TabsContent>

        <TabsContent value="contact" className="mt-0 animate-fade-in">
          <Contact />
        </TabsContent>

        <TabsContent value="careers" className="mt-0 animate-fade-in">
          <Careers />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TabbedLayout;
