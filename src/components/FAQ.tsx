import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How long does a pressure washing job take?",
    answer: "Most residential jobs take 2-4 hours depending on the size and condition of the area. Driveways typically take 1-2 hours, while full house exteriors may take 3-4 hours. We'll provide an estimated time during booking.",
  },
  {
    question: "Do I need to be home during the service?",
    answer: "No, you don't need to be home! As long as we have access to water and the areas to be cleaned, we can complete the work. We'll send you photos when we're done and follow up via email or text.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept cash, Venmo, CashApp, and Zelle. Payment is due upon completion of the service. We'll provide an invoice with all details for your records.",
  },
  {
    question: "Can I book recurring cleanings?",
    answer: "Absolutely! Many of our customers schedule monthly or quarterly cleanings to keep their properties looking fresh. Contact us to set up a recurring schedule and we'll offer you a loyalty discount.",
  },
  {
    question: "Do you clean commercial properties?",
    answer: "Yes! We service both residential and commercial properties throughout Broward County. For commercial quotes, please contact us directly at (954) 865-6205 or rwdetailz@gmail.com.",
  },
  {
    question: "What areas do you service?",
    answer: "We proudly serve all of Fort Lauderdale and Broward County, Florida. This includes Pompano Beach, Coral Springs, Pembroke Pines, Hollywood, Davie, and surrounding areas.",
  },
  {
    question: "Is pressure washing safe for all surfaces?",
    answer: "Yes! We use professional equipment and adjust pressure levels based on the surface type. We use soft wash techniques for delicate surfaces like roofs and painted walls, and higher pressure for concrete and driveways.",
  },
  {
    question: "How often should I have my property pressure washed?",
    answer: "We recommend pressure washing driveways and sidewalks 2-4 times per year, and house exteriors 1-2 times per year. Florida's climate can cause mold and algae to build up quickly, so regular cleaning helps maintain your property's value and appearance.",
  },
  {
    question: "Do you provide before and after photos?",
    answer: "Yes! We love showcasing our work. We'll take before and after photos of your property and send them to you. With your permission, we may also feature them in our gallery and social media.",
  },
  {
    question: "What if I'm not satisfied with the results?",
    answer: "Customer satisfaction is our top priority. If you're not completely happy with our work, let us know immediately and we'll make it right—no questions asked. Your property should shine!",
  },
];

const FAQ = () => {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="glow-text">Questions</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about RWDetailz services
          </p>
        </div>

        <div className="glass-card rounded-xl p-6 md:p-8">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                <AccordionTrigger className="text-left hover:text-primary transition-colors">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-8 text-center glass-card rounded-xl p-6">
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:9548656205" className="text-primary hover:underline font-semibold">
              📞 (954) 865-6205
            </a>
            <a href="mailto:rwdetailz@gmail.com" className="text-primary hover:underline font-semibold">
              📧 rwdetailz@gmail.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
