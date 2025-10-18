import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import WhyUs from "@/components/WhyUs";
import About from "@/components/About";
import Reviews from "@/components/Reviews";
import Gallery from "@/components/Gallery";
import BookingTracker from "@/components/BookingTracker";
import Contact from "@/components/Contact";
import BookingForm from "@/components/BookingForm";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [showBooking, setShowBooking] = useState(false);
  const [activeTab, setActiveTab] = useState("reviews");

  return (
    <div className="min-h-screen bg-background">
      <Header onBookNowClick={() => setShowBooking(true)} onTabChange={setActiveTab} />
      <main>
        {showBooking ? (
          <div className="pt-[72px]">
            <BookingForm onClose={() => setShowBooking(false)} />
          </div>
        ) : (
          <>
            <Hero onBookNowClick={() => setShowBooking(true)} />
            <Services />
            <WhyUs />
            <About />
            <section id="reviews-gallery" className="py-24 px-4">
              <div className="container mx-auto">
                <div className="text-center mb-12 animate-fade-in">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">
                    See What Our <span className="glow-text">Customers Say</span> & Our Work
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Explore customer testimonials and view our amazing transformations
                  </p>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                    <TabsTrigger value="reviews" id="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="gallery" id="gallery">Gallery</TabsTrigger>
                  </TabsList>
                  <TabsContent value="reviews">
                    <Reviews />
                  </TabsContent>
                  <TabsContent value="gallery">
                    <Gallery />
                  </TabsContent>
                </Tabs>
              </div>
            </section>
            <BookingTracker />
            <Contact />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
