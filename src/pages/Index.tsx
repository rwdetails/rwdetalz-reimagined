import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import About from "@/components/About";
import Contact from "@/components/Contact";
import BookingForm from "@/components/BookingForm";
import JobTracker from "@/components/JobTracker";
import Reviews from "@/components/Reviews";
import FAQ from "@/components/FAQ";
import Careers from "@/components/Careers";
import Chat from "@/components/Chat";
import Footer from "@/components/Footer";
import WhyUs from "@/components/WhyUs";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden" />
        
        <TabsContent value="home" className="mt-0">
          <Hero />
          <Services />
          <WhyUs />
          <About />
        </TabsContent>

        <TabsContent value="services">
          <Services />
        </TabsContent>

        <TabsContent value="gallery">
          <Gallery />
        </TabsContent>

        <TabsContent value="about">
          <About />
        </TabsContent>

        <TabsContent value="contact">
          <Contact />
        </TabsContent>

        <TabsContent value="book">
          <BookingForm />
        </TabsContent>

        <TabsContent value="track">
          <JobTracker />
        </TabsContent>

        <TabsContent value="reviews">
          <Reviews />
        </TabsContent>

        <TabsContent value="faq">
          <FAQ />
        </TabsContent>

        <TabsContent value="careers">
          <Careers />
        </TabsContent>
      </Tabs>

      <Chat />
      <Footer />
    </div>
  );
};

export default Index;
