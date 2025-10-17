import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const reviews = [
  {
    id: 1,
    name: "Marcus Johnson",
    rating: 5,
    date: "2 weeks ago",
    text: "RWDetailz did an incredible job on my driveway! It looks brand new. Rakeem and Wood are super professional and hardworking. Highly recommend!",
    location: "Fort Lauderdale, FL"
  },
  {
    id: 2,
    name: "Sarah Martinez",
    rating: 5,
    date: "1 month ago",
    text: "These young entrepreneurs are amazing! They showed up on time, did great work, and my roof looks spotless. Will definitely use them again.",
    location: "Plantation, FL"
  },
  {
    id: 3,
    name: "David Chen",
    rating: 5,
    date: "3 weeks ago",
    text: "Best pressure washing service in Broward County! My sidewalk and driveway look like they were just installed. Great prices too!",
    location: "Coral Springs, FL"
  },
  {
    id: 4,
    name: "Jennifer Williams",
    rating: 5,
    date: "1 week ago",
    text: "Impressed by their professionalism and attention to detail. My house exterior looks incredible. Supporting local young business owners feels great!",
    location: "Pembroke Pines, FL"
  },
];

const Reviews = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    review: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Review Submitted!",
      description: "Thank you for your feedback! Your review will be posted shortly.",
    });
    setFormData({ name: "", email: "", rating: 5, review: "" });
  };

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <section id="reviews" className="py-24 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Customer <span className="glow-text">Reviews</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-2xl font-bold">{avgRating}</span>
            <span className="text-muted-foreground">({reviews.length} reviews)</span>
          </div>
          <p className="text-muted-foreground text-lg">
            See what our customers are saying about RWDetailz
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className="glass-card rounded-xl p-6 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{review.name}</h3>
                  <p className="text-sm text-muted-foreground">{review.location}</p>
                </div>
                <div className="text-xs text-muted-foreground">{review.date}</div>
              </div>
              <div className="flex gap-1 mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground">{review.text}</p>
            </div>
          ))}
        </div>

        {/* Leave Review Button */}
        <div className="text-center">
          <Dialog>
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
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= formData.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Your Review</label>
                  <Textarea
                    value={formData.review}
                    onChange={(e) => setFormData({ ...formData, review: e.target.value })}
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
      </div>
    </section>
  );
};

export default Reviews;
