import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import WhyUs from "@/components/WhyUs";
import About from "@/components/About";
import BookingTracker from "@/components/BookingTracker";
import Contact from "@/components/Contact";
import Reviews from "@/components/Reviews";
import FAQ from "@/components/FAQ";
import Careers from "@/components/Careers";
import Chat from "@/components/Chat";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Chat />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-16">
        <div className="sticky top-16 z-40 glass-card border-b border-border/50 overflow-x-auto">
          <TabsList className="w-full justify-start rounded-none bg-transparent h-14 p-0 flex-nowrap overflow-x-auto">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="track">Track Job</TabsTrigger>
            <TabsTrigger value="book">Book Now</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="careers">Careers</TabsTrigger>
          </TabsList>
        </div>

        <main>
          <TabsContent value="home" className="m-0">
            <Hero />
            <Services />
            <WhyUs />
          </TabsContent>
          <TabsContent value="services" className="m-0"><Services /></TabsContent>
          <TabsContent value="gallery" className="m-0"><Gallery /></TabsContent>
          <TabsContent value="about" className="m-0"><About /><WhyUs /></TabsContent>
          <TabsContent value="track" className="m-0"><BookingTracker /></TabsContent>
          <TabsContent value="book" className="m-0"><Contact /></TabsContent>
          <TabsContent value="reviews" className="m-0"><Reviews /></TabsContent>
          <TabsContent value="faq" className="m-0"><FAQ /></TabsContent>
          <TabsContent value="careers" className="m-0"><Careers /></TabsContent>
        </main>
      </Tabs>

      <Footer />
    </div>
  );
};

export default Index;
