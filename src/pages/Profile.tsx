import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, ArrowLeft, Package, Clock, CheckCircle2, XCircle, Edit, Mail, Phone, MapPin, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Booking {
  id: string;
  booking_number: string;
  service_date: string;
  service_time: string;
  services: any;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  address: string;
  created_at: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    email: "",
  });
  const [cancelling, setCancelling] = useState<Record<string, boolean>>({});
  const [cancelReasons, setCancelReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadProfile(session.user.id);
        loadBookings(session.user.id);
      }
    });
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
    } else {
      setProfile(data);
      setEditForm({
        full_name: data.full_name || "",
        phone: data.phone || "",
        email: data.email || "",
      });
    }
  };

  const loadBookings = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading bookings:", error);
      toast.error("Failed to load bookings");
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setEditLoading(true);
    try {
      // Update profile info
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone,
          email: editForm.email,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // If email changed, update auth email
      if (editForm.email !== profile.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: editForm.email,
        });

        if (emailError) throw emailError;
        
        toast.success("Profile updated! Please check your new email to confirm the change.");
      } else {
        toast.success("Profile updated successfully!");
      }

      await loadProfile(user.id);
      setEditDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile?.email, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) throw error;

      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      toast.error(error.message || "Failed to send reset email");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Package className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "in-progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
  };

  const activeBookings = bookings.filter(
    (b) => b.status === "scheduled" || b.status === "in-progress"
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled"
  );

  const handleCancelBooking = async (booking: Booking) => {
    if (!user) return;
    setCancelling((prev) => ({ ...prev, [booking.id]: true }));
    try {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", booking.id)
        .eq("user_id", user.id);
      if (updateError) throw updateError;

      const servicesList = Array.isArray(booking.services)
        ? (booking.services as any[]).map((s: any) => s.name || String(s))
        : [];

      const { error: emailError } = await supabase.functions.invoke("send-cancellation-email", {
        body: {
          bookingNumber: booking.booking_number,
          name: profile?.full_name || (booking as any).full_name || "",
          email: profile?.email || (booking as any).email || "",
          phone: profile?.phone || "",
          address: booking.address,
          date: booking.service_date ? format(new Date(booking.service_date), "PPP") : "",
          time: booking.service_time,
          services: servicesList,
          totalAmount: booking.total_amount,
          reason: cancelReasons[booking.id] || "",
        },
      });
      if (emailError) console.error("Cancellation email error:", emailError);

      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: "cancelled" } : b)));
      toast.success("Booking cancelled");
    } catch (e: any) {
      console.error("Cancel booking error:", e);
      toast.error(e.message || "Failed to cancel booking");
    } finally {
      setCancelling((prev) => ({ ...prev, [booking.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl">My Profile</CardTitle>
                  <CardDescription>Manage your bookings and account</CardDescription>
                </div>
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Update your personal information
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">
                          <UserIcon className="w-4 h-4 inline mr-2" />
                          Full Name
                        </Label>
                        <Input
                          id="edit-name"
                          value={editForm.full_name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, full_name: e.target.value })
                          }
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email
                        </Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          placeholder="john@example.com"
                        />
                        <p className="text-xs text-muted-foreground">
                          Changing your email requires verification
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-phone">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Phone Number
                        </Label>
                        <Input
                          id="edit-phone"
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                          placeholder="(954) 865-6205"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setEditDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={editLoading}
                        className="flex-1"
                      >
                        {editLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserIcon className="w-4 h-4" />
                    <span>Name</span>
                  </div>
                  <p className="font-semibold">{profile?.full_name || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </div>
                  <p className="font-semibold">{profile?.email || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>Phone</span>
                  </div>
                  <p className="font-semibold">{profile?.phone || "N/A"}</p>
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleChangePassword}>
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">
                Active Bookings ({activeBookings.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past Bookings ({pastBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading bookings...</p>
                </div>
              ) : activeBookings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No active bookings</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate("/")}
                    >
                      Book a Service
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                activeBookings.map((booking) => (
                  <Card key={booking.id} className="hover-lift">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">
                            Booking #{booking.booking_number}
                          </CardTitle>
                          <CardDescription>
                            {format(new Date(booking.service_date), "PPP")} at{" "}
                            {booking.service_time}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(booking.status)}
                            {booking.status}
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Services</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(booking.services) &&
                            booking.services.map((service: any, idx: number) => (
                              <Badge key={idx} variant="outline">
                                {service.name || service}
                              </Badge>
                            ))}
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Address</p>
                          <p className="font-semibold">{booking.address}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Amount</p>
                          <p className="font-semibold text-primary">
                            ${booking.total_amount}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Payment</p>
                          <p className="font-semibold capitalize">
                            {booking.payment_method} - {booking.payment_status}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Cancel Booking
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. We’ll notify RWDetailz and the customer via email.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-2">
                              <Label htmlFor={`reason-${booking.id}`}>Reason (optional)</Label>
                              <Textarea
                                id={`reason-${booking.id}`}
                                placeholder="Tell us why you're cancelling"
                                value={cancelReasons[booking.id] || ""}
                                onChange={(e) => setCancelReasons((prev) => ({ ...prev, [booking.id]: e.target.value }))}
                              />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelBooking(booking)}
                                disabled={!!cancelling[booking.id]}
                              >
                                {cancelling[booking.id] ? "Cancelling..." : "Confirm Cancel"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4 mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading bookings...</p>
                </div>
              ) : pastBookings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No past bookings</p>
                  </CardContent>
                </Card>
              ) : (
                pastBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">
                            Booking #{booking.booking_number}
                          </CardTitle>
                          <CardDescription>
                            {format(new Date(booking.service_date), "PPP")} at{" "}
                            {booking.service_time}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(booking.status)}
                            {booking.status}
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Services</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(booking.services) &&
                            booking.services.map((service: any, idx: number) => (
                              <Badge key={idx} variant="outline">
                                {service.name || service}
                              </Badge>
                            ))}
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Address</p>
                          <p className="font-semibold">{booking.address}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Amount</p>
                          <p className="font-semibold text-primary">
                            ${booking.total_amount}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Payment</p>
                          <p className="font-semibold capitalize">
                            {booking.payment_method} - {booking.payment_status}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
