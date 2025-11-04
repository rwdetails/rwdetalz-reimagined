import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";

const testimonials: Array<{
  name: string;
  rating: number;
  text: string;
  service: string;
}> = [];

const Reviews = () => {
  const [reviewForm, setReviewForm] = useState({
    name: "",
    email: "",
    rating: 5,
    service: "",
    review: "",
  });
  const [open, setOpen] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you for your review!");
    setOpen(false);
    setReviewForm({ name: "", email: "", rating: 5, service: "", review: "" });
  };

  return (
    <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Customer <span className="glow-text">Reviews</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            See what our satisfied customers have to say about our services
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="glow">Leave a Review</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Share Your Experience</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitReview} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={reviewForm.email}
                    onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Rating *</Label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= reviewForm.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="service">Service</Label>
                  <Input
                    id="service"
                    value={reviewForm.service}
                    onChange={(e) => setReviewForm({ ...reviewForm, service: e.target.value })}
                    placeholder="e.g., Driveway Cleaning"
                  />
                </div>
                <div>
                  <Label htmlFor="review">Your Review *</Label>
                  <Textarea
                    id="review"
                    value={reviewForm.review}
                    onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" variant="glow" className="w-full">
                  Submit Review
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="glass-card p-6 hover-lift">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">{testimonial.name}</h3>
                      <div className="flex gap-0.5">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{testimonial.service}</p>
                    <p className="text-sm leading-relaxed">{testimonial.text}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="glass-card rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Find Us on Google</h3>
          <p className="text-muted-foreground mb-6">
            Check out more reviews and leave yours on Google
          </p>
          <Button variant="outline">View Google Reviews</Button>
        </div>
    </div>
  );
};

export default Reviews;
