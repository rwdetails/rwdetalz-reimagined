import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const reviews = [
  {
    id: 1,
    name: "Sarah Martinez",
    rating: 5,
    date: "2 weeks ago",
    text: "Rakeem and Wood did an amazing job on my driveway! It looks brand new. These young men are professional and hardworking. Highly recommend!",
  },
  {
    id: 2,
    name: "James Thompson",
    rating: 5,
    date: "1 month ago",
    text: "Incredible service! They cleaned my roof and gutters perfectly. Very impressed with their attention to detail. Will definitely use again.",
  },
  {
    id: 3,
    name: "Maria Rodriguez",
    rating: 5,
    date: "3 weeks ago",
    text: "Best pressure washing service in Broward County! Fast, affordable, and the results speak for themselves. My sidewalk has never looked better.",
  },
  {
    id: 4,
    name: "David Chen",
    rating: 5,
    date: "1 week ago",
    text: "These young entrepreneurs are going places! Excellent communication, showed up on time, and did fantastic work on my property.",
  },
];

const Reviews = () => {
  const { toast } = useToast();
  const [reviewForm, setReviewForm] = useState({
    name: "",
    email: "",
    rating: 5,
    review: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback. It means the world to us!",
      });
      setReviewForm({ name: "", email: "", rating: 5, review: "" });
      setIsSubmitting(false);
      setDialogOpen(false);
    }, 1000);
  };

  const renderStars = (rating: number, interactive = false, onClick?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "fill-primary text-primary"
                : "fill-muted text-muted"
            } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
            onClick={() => interactive && onClick?.(star)}
          />
        ))}
      </div>
    );
  };

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <section className="py-24 px-4 bg-secondary/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Customer <span className="glow-text">Reviews</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            See what our clients are saying about RWDetailz
          </p>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex gap-1">
              {renderStars(5)}
            </div>
            <span className="text-2xl font-bold">{avgRating}</span>
            <span className="text-muted-foreground">({reviews.length} reviews)</span>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="glow" size="lg" className="gap-2">
                <MessageSquare className="w-5 h-5" />
                Leave a Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Share Your Experience</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitReview} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name *</label>
                  <Input
                    required
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <Input
                    required
                    type="email"
                    value={reviewForm.email}
                    onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rating *</label>
                  {renderStars(reviewForm.rating, true, (rating) => 
                    setReviewForm({ ...reviewForm, rating })
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Your Review *</label>
                  <Textarea
                    required
                    value={reviewForm.review}
                    onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                    placeholder="Tell us about your experience..."
                    rows={5}
                  />
                </div>
                <Button type="submit" variant="glow" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className="glass-card rounded-xl p-6 animate-fade-in hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{review.name}</h3>
                  <p className="text-sm text-muted-foreground">{review.date}</p>
                </div>
                {renderStars(review.rating)}
              </div>
              <p className="text-muted-foreground leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
