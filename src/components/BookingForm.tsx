import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Check, Loader2, X, Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Service definitions with promotional pricing
// isQuote: true means it's a quote-based service (no vehicle details needed)
// originalPrice: shows crossed-out price for promotional display
const services = [
  { 
    id: "pressure-washing", 
    name: "Pressure Washing", 
    price: 99,
    originalPrice: 129,
    image: "🏠",
    isQuote: true,
    addons: [
      { id: "house-exterior", name: "House Exterior", price: 0 },
      { id: "driveway", name: "Driveway", price: 0 },
      { id: "deck-patio", name: "Deck/Patio", price: 0 },
      { id: "fence", name: "Fence", price: 0 },
      { id: "walkway", name: "Walkway", price: 0 },
    ]
  },
  { id: "driveway", name: "Driveway Cleaning", price: 99, originalPrice: 129, image: "🚗", isQuote: true },
  { id: "trash-can", name: "Trash Can Cleaning", price: 50, image: "🗑️", isQuote: false },
  { id: "roof", name: "Roof Cleaning", price: 99, originalPrice: 129, image: "🏚️", isQuote: true },
  { id: "gutter", name: "Gutter Cleaning", price: 99, originalPrice: 129, image: "🏠", isQuote: true },
  { 
    id: "vehicle-detailing", 
    name: "Vehicle Detailing", 
    price: 99,
    originalPrice: 129,
    image: "🚙",
    isNew: true,
    isQuote: true,
    addons: [
      { id: "clay-bar", name: "Clay Bar Treatment", price: 25 },
      { id: "ceramic-coating", name: "Ceramic Coating", price: 150 },
      { id: "engine-bay", name: "Engine Bay Detail", price: 40 },
      { id: "headlight-restore", name: "Headlight Restoration", price: 35 },
      { id: "pet-hair", name: "Pet Hair Removal", price: 30 },
    ]
  },
];

interface ServiceAddons {
  [key: string]: string[];
}

interface CustomOptions {
  [key: string]: string;
}

interface BookingFormProps {
  onClose: () => void;
}

const BookingForm = ({ onClose }: BookingFormProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [user, setUser] = useState<any>(null);
  const [images, setImages] = useState<File[]>([]);
  const [testingMode] = useState(() => localStorage.getItem("owner_testing_mode") === "true");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    date: undefined as Date | undefined,
    time: "",
    services: [] as string[],
    instructions: "",
    source: "",
    paymentMethod: "",
  });
  const [serviceAddons, setServiceAddons] = useState<ServiceAddons>({});
  const [customOptions, setCustomOptions] = useState<CustomOptions>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Please log in to book a service");
        navigate("/auth");
      } else {
        setUser(session.user);
        // Pre-fill form with user data
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setFormData((prev) => ({
                ...prev,
                fullName: data.full_name || "",
                email: data.email || "",
                phone: data.phone || "",
              }));
            }
          });
      }
    });
  }, [navigate]);

  const generateBookingId = () => {
    return `RW-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((s) => s !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  const handleAddonToggle = (serviceId: string, addonId: string) => {
    setServiceAddons((prev) => {
      const addons = prev[serviceId] || [];
      return {
        ...prev,
        [serviceId]: addons.includes(addonId)
          ? addons.filter((id) => id !== addonId)
          : [...addons, addonId],
      };
    });
  };

  const calculateTotal = () => {
    let total = formData.services.reduce((sum, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      return sum + (service?.price || 0);
    }, 0);

    // Add addon prices
    Object.entries(serviceAddons).forEach(([serviceId, addonIds]) => {
      const service = services.find((s) => s.id === serviceId);
      if (service?.addons) {
        addonIds.forEach((addonId) => {
          const addon = service.addons.find((a: any) => a.id === addonId);
          if (addon) total += addon.price;
        });
      }
    });

    return total;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = testingMode ? 20 : 5;
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }
    setImages([...images, ...files]);
  };

  // Check if any selected service is a quote-based service
  const hasQuoteServices = formData.services.some(serviceId => {
    const service = services.find(s => s.id === serviceId);
    return service?.isQuote;
  });

  // Determine if this is a booking or quote request
  const isQuoteRequest = hasQuoteServices;
  const formType = isQuoteRequest ? "Quote" : "Booking";

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (!user || images.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('booking-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('booking-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please log in to complete booking");
      return;
    }

    setLoading(true);
    const newBookingId = generateBookingId();
    setBookingId(newBookingId);

    const selectedServices = services
      .filter((s) => formData.services.includes(s.id));

    const selectedServiceNames = selectedServices.map(s => s.name);
    const totalAmount = calculateTotal();

    try {
      // Upload images first
      const imageUrls = await uploadImages();

      // Save booking to database
      const { error: dbError } = await supabase.from("bookings").insert({
        user_id: user.id,
        booking_number: newBookingId,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        service_date: formData.date,
        service_time: formData.time,
        services: selectedServices.map(s => ({ id: s.id, name: s.name, price: s.price })),
        total_amount: totalAmount,
        special_instructions: formData.instructions,
        how_heard: formData.source,
        payment_method: formData.paymentMethod,
        status: "scheduled",
        payment_status: "pending",
      } as any);

      if (dbError) throw dbError;

      // Send confirmation emails
      const { error: emailError } = await supabase.functions.invoke("send-booking-email", {
        body: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          date: formData.date ? format(formData.date, "PPP") : "",
          time: formData.time,
          services: selectedServiceNames,
          details: formData.instructions,
          imageUrls: imageUrls,
        },
      });

      if (emailError) console.error("Email error:", emailError);

      toast.success("Booking confirmed! Check your email.");
      setStep(5);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to send booking. Please contact us at (954) 865-6205.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold glow-text">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                  placeholder="(954) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="address">Service Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1"
                  placeholder="123 Main St, Fort Lauderdale, FL"
                />
              </div>
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!formData.fullName || !formData.email || !formData.phone || !formData.address}
              variant="glow"
              className="w-full"
            >
              Next: Select Services
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold glow-text">Select Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div key={service.id} className="space-y-2">
                  <div
                    onClick={() => handleServiceToggle(service.id)}
                    className={cn(
                      "glass-card p-4 rounded-lg cursor-pointer transition-all hover-lift",
                      formData.services.includes(service.id) && "ring-2 ring-primary bg-primary/10"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl relative">
                          {service.image}
                          {service.isNew && (
                            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                              NEW
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold">{service.name}</h4>
                          <div className="flex items-center gap-2">
                            {(service as any).originalPrice && (
                              <span className="text-muted-foreground line-through text-sm">${(service as any).originalPrice}</span>
                            )}
                            <span className="text-primary font-semibold">${service.price}</span>
                            {(service as any).originalPrice && (
                              <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-semibold">SAVE ${(service as any).originalPrice - service.price}</span>
                            )}
                          </div>
                          {service.isQuote && (
                            <span className="text-xs text-muted-foreground">Quote Request</span>
                          )}
                        </div>
                      </div>
                      <Checkbox checked={formData.services.includes(service.id)} />
                    </div>
                  </div>
                  
                  {service.addons && formData.services.includes(service.id) && (
                    <div className="ml-4 glass-card p-3 rounded-lg space-y-2 animate-fade-in">
                      <p className="text-sm font-semibold text-muted-foreground">
                        {service.id === "pressure-washing" ? "What needs to be washed:" : "Add-ons:"}
                      </p>
                      {service.addons.map((addon: any) => (
                        <div
                          key={addon.id}
                          onClick={() => handleAddonToggle(service.id, addon.id)}
                          className={cn(
                            "flex items-center justify-between p-2 rounded cursor-pointer hover:bg-primary/5 transition-colors",
                            serviceAddons[service.id]?.includes(addon.id) && "bg-primary/10"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox checked={serviceAddons[service.id]?.includes(addon.id)} />
                            <span className="text-sm">{addon.name}</span>
                          </div>
                          {addon.price > 0 && (
                            <span className="text-sm font-semibold text-primary">+${addon.price}</span>
                          )}
                        </div>
                      ))}
                      {service.id === "pressure-washing" && (
                        <div className="pt-2">
                          <Label htmlFor={`custom-${service.id}`} className="text-xs">Custom Options</Label>
                          <Input
                            id={`custom-${service.id}`}
                            placeholder="e.g., Pool area, Garage door..."
                            value={customOptions[service.id] || ""}
                            onChange={(e) => setCustomOptions({ ...customOptions, [service.id]: e.target.value })}
                            className="mt-1 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-2xl font-bold text-primary">${calculateTotal()}</span>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={formData.services.length === 0}
                variant="glow"
                className="flex-1"
              >
                Next: Schedule & Details
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold glow-text">Schedule & Details</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Upload Images {testingMode ? "(Testing Mode - Optional)" : "(Required - Max 5)"} {!testingMode && "*"}</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Please upload photos of areas to be cleaned
                  {testingMode && <span className="ml-2 text-primary font-semibold">(Testing Mode Active)</span>}
                </p>
                <div className="space-y-3">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="glass-card p-6 rounded-lg border-2 border-dashed hover:border-primary transition-colors flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload images
                      </span>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                  
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {images.map((image, index) => (
                        <div key={index} className="relative glass-card p-2 rounded-lg">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <ImageIcon className="h-3 w-3" />
                            <span className="truncate">{image.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Preferred Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData({ ...formData, date })}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="time">Preferred Time *</Label>
                <Select value={formData.time} onValueChange={(time) => setFormData({ ...formData, time })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8:00 AM">8:00 AM</SelectItem>
                    <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                    <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                    <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                    <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="mt-1"
                  placeholder="Gate code, parking instructions, etc."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="source">How did you hear about us? *</Label>
                <Select value={formData.source} onValueChange={(source) => setFormData({ ...formData, source })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google Search</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="referral">Friend/Family Referral</SelectItem>
                    <SelectItem value="nextdoor">Nextdoor</SelectItem>
                    <SelectItem value="yard-sign">Yard Sign</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="glass-card p-4 rounded-lg space-y-2">
              <h4 className="font-bold">Booking Summary</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p><strong>Name:</strong> {formData.fullName}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Phone:</strong> {formData.phone}</p>
                <p><strong>Address:</strong> {formData.address}</p>
                <p><strong>Date:</strong> {formData.date ? format(formData.date, "PPP") : "Not selected"}</p>
                <p><strong>Time:</strong> {formData.time || "Not selected"}</p>
                <p><strong>Services:</strong> {formData.services.map(id => services.find(s => s.id === id)?.name).join(", ")}</p>
                <p className="text-primary font-bold text-base pt-2">
                  <strong>Total:</strong> ${calculateTotal()}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!formData.date || !formData.time || !formData.source || (!testingMode && images.length === 0)}
                variant="glow"
                className="flex-1"
              >
                Next: Payment
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold glow-text">Payment Information</h3>
            <div className="glass-card p-6 rounded-lg space-y-4">
              <p className="text-muted-foreground">
                Total Amount: <span className="text-2xl font-bold text-primary">${calculateTotal()}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Please select your preferred payment method and complete payment to confirm your booking.
              </p>
            </div>

            <div className="space-y-4">
              <Label>Select Payment Method *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setFormData({ ...formData, paymentMethod: "zelle" })}
                  className={cn(
                    "glass-card p-6 rounded-lg cursor-pointer transition-all hover-lift",
                    formData.paymentMethod === "zelle" && "ring-2 ring-primary bg-primary/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-lg">Zelle</h4>
                    <Checkbox checked={formData.paymentMethod === "zelle"} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">Send payment to:</p>
                    <p className="font-mono text-primary font-bold text-base">754-245-4962</p>
                  </div>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, paymentMethod: "cashapp" })}
                  className={cn(
                    "glass-card p-6 rounded-lg cursor-pointer transition-all hover-lift",
                    formData.paymentMethod === "cashapp" && "ring-2 ring-primary bg-primary/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-lg">Cash App</h4>
                    <Checkbox checked={formData.paymentMethod === "cashapp"} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">Send payment to:</p>
                    <p className="font-mono text-primary font-bold text-base">@KeenooLmao</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-lg bg-primary/5">
              <p className="text-sm text-muted-foreground">
                <strong>Important:</strong> After sending payment via {formData.paymentMethod === "zelle" ? "Zelle" : "Cash App"}, 
                please include your booking details in the payment note and click confirm below.
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.paymentMethod || loading}
                variant="glow"
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6 animate-fade-in py-8">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto glow-border">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-3xl font-bold glow-text mb-2">Booking Confirmed!</h3>
              <p className="text-muted-foreground">Your confirmation has been sent to {formData.email}</p>
            </div>
            <div className="glass-card p-6 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-muted-foreground mb-2">Your Booking ID</p>
              <p className="text-2xl font-bold text-primary">{bookingId}</p>
              <p className="text-xs text-muted-foreground mt-4">
                Save this ID to track your service
              </p>
            </div>
            <div className="glass-card p-4 rounded-lg max-w-md mx-auto bg-primary/5">
              <p className="text-sm font-semibold mb-2">Payment Details</p>
              <p className="text-sm text-muted-foreground">
                {formData.paymentMethod === "zelle" ? "Zelle: 754-245-4962" : "Cash App: @KeenooLmao"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Amount: <span className="text-primary font-bold">${calculateTotal()}</span>
              </p>
            </div>
            <div className="space-y-3">
              <Button variant="glow" className="w-full max-w-md" onClick={() => {
                const event = {
                  title: `RWDetailz - ${formData.services.length} Service${formData.services.length > 1 ? 's' : ''}`,
                  description: `Booking ID: ${bookingId}`,
                  start: formData.date,
                  duration: [2, "hour"],
                };
                const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}`;
                window.open(googleUrl, "_blank");
              }}>
                Add to Google Calendar
              </Button>
              <p className="text-sm text-muted-foreground">
                Questions? Call us at <a href="tel:9548656205" className="text-primary hover:underline">(954) 865-6205</a>
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="py-24 px-4 min-h-screen">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-12">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {isQuoteRequest ? (
                <>Request a <span className="glow-text">Quote</span></>
              ) : (
                <>Book Your <span className="glow-text">Service</span></>
              )}
            </h2>
            <p className="text-muted-foreground text-lg">
              {isQuoteRequest 
                ? "Get a free quote in just a few steps" 
                : "Complete your booking in just a few steps"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
            <X className="h-6 w-6" />
          </Button>
        </div>

        {step < 5 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-2 rounded-full transition-all",
                  s === step ? "w-12 bg-primary" : "w-2 bg-muted"
                )}
              />
            ))}
          </div>
        )}

        <div className="glass-card rounded-xl p-8">{renderStep()}</div>
      </div>
    </section>
  );
};

export default BookingForm;
