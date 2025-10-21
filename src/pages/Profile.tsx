import { useEffect, useRef, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, ArrowLeft, Package, Clock, CheckCircle2, XCircle, Edit, Mail, Phone, MapPin, User as UserIcon, Share2, StopCircle, Filter } from "lucide-react";
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
  full_name: string;
  email: string;
  phone: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", phone: "", email: "" });
  const [cancelling, setCancelling] = useState<Record<string, boolean>>({});
  const [cancelReasons, setCancelReasons] = useState<Record<string, string>>({});
  const [completing, setCompleting] = useState<Record<string, boolean>>({});
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [allProfilesLoading, setAllProfilesLoading] = useState(false);
  const [banning, setBanning] = useState<Record<string, boolean>>({});
  const isOwner = (user?.email || "").toLowerCase() === "rwdetailz@gmail.com";

  // Owner panel filtering
  const [ownerFilterText, setOwnerFilterText] = useState("");
  const [ownerFilterStatus, setOwnerFilterStatus] = useState<string>("all");

  // Owner live tracking state
  const [trackingOn, setTrackingOn] = useState<Record<string, boolean>>({});
  const trackingWatchIds = useRef<Record<string, number | null>>({});
  const trackingChannels = useRef<Record<string, ReturnType<typeof supabase.channel> | null>>({});

  const LOCAL_OVERRIDES_KEY = "booking_overrides";
  const readOverrides = (): Record<string, Partial<Booking & { crew_name?: string; eta_minutes?: number }>> => {
    try { return JSON.parse(localStorage.getItem(LOCAL_OVERRIDES_KEY) || "{}"); } catch { return {}; }
  };
  const writeOverrides = (data: Record<string, Partial<Booking>>) => {
    localStorage.setItem(LOCAL_OVERRIDES_KEY, JSON.stringify(data));
  };
  const applyOverrides = (list: Booking[]) => {
    const o = readOverrides();
    return list.map((b) => ({ ...b, ...(o[b.id] || {}) }));
  };
  const setOverride = (id: string, patch: Partial<Booking & { crew_name?: string; eta_minutes?: number }>) => {
    const o = readOverrides();
    o[id] = { ...(o[id] || {}), ...patch };
    writeOverrides(o as any);
  };

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

  useEffect(() => {
    if (isOwner) {
      loadAllBookings();
      loadAllProfiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwner]);

  useEffect(() => {
    return () => {
      // Cleanup any active geolocation watches and channels
      Object.values(trackingWatchIds.current).forEach((wid) => {
        if (wid !== null) navigator.geolocation.clearWatch(wid);
      });
      Object.values(trackingChannels.current).forEach((ch) => {
        try { ch?.unsubscribe(); } catch {}
      });
    };
  }, []);

  const ensureChannel = (bookingNumber: string) => {
    const topic = `tracking:${bookingNumber}`;
    const existing = trackingChannels.current[topic];
    if (existing) return existing;
    const ch = supabase.channel(topic, { config: { broadcast: { ack: true } } });
    ch.subscribe();
    trackingChannels.current[topic] = ch;
    return ch;
  };

  const startOwnerTracking = (booking: Booking) => {
    if (!booking?.booking_number) return;
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported on this device");
      return;
    }
    const topic = `tracking:${booking.booking_number}`;
    const ch = ensureChannel(booking.booking_number);
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const payload = { lat: pos.coords.latitude, lng: pos.coords.longitude, ts: Date.now(), booking: booking.booking_number };
        ch.send({ type: "broadcast", event: "location", payload });
      },
      (err) => {
        console.error("Geolocation error", err);
        toast.error("Location error: " + err.message);
        stopOwnerTracking(booking);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
    trackingWatchIds.current[topic] = watchId as unknown as number;
    setTrackingOn((m) => ({ ...m, [booking.id]: true }));
    toast.success(`Live tracking started for ${booking.booking_number}`);
  };

  const stopOwnerTracking = (booking: Booking) => {
    const topic = `tracking:${booking.booking_number}`;
    const wid = trackingWatchIds.current[topic];
    if (wid !== null && wid !== undefined) {
      navigator.geolocation.clearWatch(wid);
      trackingWatchIds.current[topic] = null;
    }
    setTrackingOn((m) => ({ ...m, [booking.id]: false }));
    toast.success(`Live tracking stopped for ${booking.booking_number}`);
  };

  const setStatus = async (booking: Booking, status: string) => {
    try {
      const qb = supabase.from("bookings").update({ status }).eq("id", booking.id);
      if (!isOwner && user) qb.eq("user_id", user.id);
      const { error } = await qb;
      if (error) throw error;
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status } : b)));
      setAllBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status } : b)));
      toast.success(`Status updated to ${status}`);
    } catch (e: any) {
      console.error("Update status error", e);
      toast.error(e.message || "Failed to update status");
    }
  };

  const saveOwnerMeta = (booking: Booking, patch: { crew_name?: string; eta_minutes?: number }) => {
    setOverride(booking.id, patch as any);
    setAllBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, ...(patch as any) } : b)));
    setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, ...(patch as any) } : b)));
    toast.success("Saved");
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error) {
      console.error("Error loading profile:", error);
    } else {
      setProfile(data);
      setEditForm({ full_name: data.full_name || "", phone: data.phone || "", email: data.email || "" });
    }
  };

  const loadBookings = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase.from("bookings").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) {
      console.error("Error loading bookings:", error);
      toast.error("Failed to load bookings");
    } else {
      setBookings(applyOverrides(data || []));
    }
    setLoading(false);
  };

  const loadAllBookings = async () => {
    setAllLoading(true);
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Error loading all bookings:", error);
      toast.error("Failed to load all bookings");
    } else {
      setAllBookings(applyOverrides(data || []));
    }
    setAllLoading(false);
  };

  const loadAllProfiles = async () => {
    setAllProfilesLoading(true);
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Error loading profiles:", error);
      toast.error("Failed to load users");
    } else {
      setAllProfiles(data as any[]);
    }
    setAllProfilesLoading(false);
  };

  const handleBanToggle = async (id: string, next: boolean) => {
    if (!isOwner) return;
    setBanning((p) => ({ ...p, [id]: true }));
    try {
      const { error } = await supabase.functions.invoke("admin-set-ban", { body: { userId: id, banned: next } });
      if (error) throw error;
      setAllProfiles((list) => list.map((u) => (u.id === id ? { ...u, banned: next } : u)));
      toast.success(next ? "User banned" : "User unbanned");
    } catch (e: any) {
      console.error("Ban toggle error:", e);
      toast.error(e.message || "Failed to update ban status");
    } finally {
      setBanning((p) => ({ ...p, [id]: false }));
    }
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
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: editForm.full_name, phone: editForm.phone, email: editForm.email })
        .eq("id", user.id);
      if (profileError) throw profileError;
      if (editForm.email !== profile.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: editForm.email });
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
      const { error } = await supabase.auth.resetPasswordForEmail(profile?.email, { redirectTo: `${window.location.origin}/` });
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

  const activeBookings = bookings.filter((b) => b.status === "scheduled" || b.status === "in-progress");
  const pastBookings = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  const handleCancelBooking = async (booking: Booking) => {
    if (!user) return;
    setCancelling((prev) => ({ ...prev, [booking.id]: true }));
    try {
      const qb = supabase.from("bookings").update({ status: "cancelled" }).eq("id", booking.id);
      if (!isOwner) qb.eq("user_id", user.id);
      const { error: updateError } = await qb;
      if (updateError) throw updateError;

      const servicesList = Array.isArray(booking.services) ? (booking.services as any[]).map((s: any) => s.name || String(s)) : [];

      try {
        const { error: emailError } = await supabase.functions.invoke("send-cancellation-email", {
          body: {
            bookingNumber: booking.booking_number,
            name: (booking as any).full_name || profile?.full_name || "",
            email: (booking as any).email || profile?.email || "",
            phone: (booking as any).phone || profile?.phone || "",
            address: booking.address,
            date: booking.service_date ? format(new Date(booking.service_date), "PPP") : "",
            time: booking.service_time,
            services: servicesList,
            totalAmount: booking.total_amount,
            reason: cancelReasons[booking.id] || "",
          },
        });
        if (emailError) throw emailError;
      } catch (err) {
        await fetch("/api/send-cancellation-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingNumber: booking.booking_number,
            name: (booking as any).full_name || profile?.full_name || "",
            email: (booking as any).email || profile?.email || "",
            phone: (booking as any).phone || profile?.phone || "",
            address: booking.address,
            date: booking.service_date ? format(new Date(booking.service_date), "PPP") : "",
            time: booking.service_time,
            services: servicesList,
            totalAmount: booking.total_amount,
            reason: cancelReasons[booking.id] || "",
          }),
        });
      }

      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: "cancelled" } : b)));
      setAllBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: "cancelled" } : b)));
      toast.success("Booking cancelled");
    } catch (e: any) {
      console.error("Cancel booking error:", e);
      toast.error(e.message || "Failed to cancel booking");
    } finally {
      setCancelling((prev) => ({ ...prev, [booking.id]: false }));
      setOverride(booking.id, { status: "cancelled" });
    }
  };

  const handleCompleteBooking = async (booking: Booking) => {
    if (!user) return;
    setCompleting((prev) => ({ ...prev, [booking.id]: true }));
    try {
      const qb = supabase.from("bookings").update({ status: "completed" }).eq("id", booking.id);
      if (!isOwner) qb.eq("user_id", user.id);
      const { error: updateError } = await qb;
      if (updateError) throw updateError;

      const servicesList = Array.isArray(booking.services) ? (booking.services as any[]).map((s: any) => s.name || String(s)) : [];
      try {
        const { error } = await supabase.functions.invoke("send-completion-email", {
          body: {
            bookingNumber: booking.booking_number,
            name: (booking as any).full_name || profile?.full_name || "",
            email: (booking as any).email || profile?.email || "",
            address: booking.address,
            date: booking.service_date ? format(new Date(booking.service_date), "PPP") : "",
            time: booking.service_time,
            services: servicesList,
            totalAmount: booking.total_amount,
          },
        });
        if (error) throw error;
      } catch (err) {
        await fetch("/api/send-completion-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingNumber: booking.booking_number,
            name: (booking as any).full_name || profile?.full_name || "",
            email: (booking as any).email || profile?.email || "",
            address: booking.address,
            date: booking.service_date ? format(new Date(booking.service_date), "PPP") : "",
            time: booking.service_time,
            services: servicesList,
            totalAmount: booking.total_amount,
          }),
        });
      }

      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: "completed" } : b)));
      setAllBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: "completed" } : b)));
      toast.success("Booking marked completed");
    } catch (e: any) {
      console.error("Complete booking error:", e);
      toast.error(e.message || "Failed to complete booking");
    } finally {
      setCompleting((prev) => ({ ...prev, [booking.id]: false }));
      setOverride(booking.id, { status: "completed" });
    }
  };

  const ownerFilteredBookings = allBookings.filter((b) => {
    const text = ownerFilterText.toLowerCase().trim();
    const matchText = !text || [b.booking_number, b.full_name, b.email, b.phone, b.address].some((f) => (f || "").toLowerCase().includes(text));
    const matchStatus = ownerFilterStatus === "all" || b.status === ownerFilterStatus;
    return matchText && matchStatus;
  });

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
                      <DialogDescription>Update your personal information</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">
                          <UserIcon className="w-4 h-4 inline mr-2" />
                          Full Name
                        </Label>
                        <Input id="edit-name" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email
                        </Label>
                        <Input id="edit-email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="john@example.com" />
                        <p className="text-xs text-muted-foreground">Changing your email requires verification</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-phone">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Phone Number
                        </Label>
                        <Input id="edit-phone" type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="(954) 865-6205" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="flex-1">Cancel</Button>
                      <Button onClick={handleSaveProfile} disabled={editLoading} className="flex-1">{editLoading ? "Saving..." : "Save Changes"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><UserIcon className="w-4 h-4" /><span>Name</span></div>
                  <p className="font-semibold">{profile?.full_name || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="w-4 h-4" /><span>Email</span></div>
                  <p className="font-semibold">{profile?.email || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="w-4 h-4" /><span>Phone</span></div>
                  <p className="font-semibold">{profile?.phone || "N/A"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleChangePassword}>Change Password</Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className={`grid w-full ${isOwner ? "grid-cols-3" : "grid-cols-2"}`}>
              <TabsTrigger value="active">Active Bookings ({activeBookings.length})</TabsTrigger>
              <TabsTrigger value="past">Past Bookings ({pastBookings.length})</TabsTrigger>
              {isOwner && (<TabsTrigger value="owner">Owner Panel</TabsTrigger>)}
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-6">
              {loading ? (
                <div className="text-center py-12"><p className="text-muted-foreground">Loading bookings...</p></div>
              ) : activeBookings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No active bookings</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>Book a Service</Button>
                  </CardContent>
                </Card>
              ) : (
                activeBookings.map((booking) => (
                  <Card key={booking.id} className="hover-lift">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">Booking #{booking.booking_number}</CardTitle>
                          <CardDescription>{format(new Date(booking.service_date), "PPP")} at {booking.service_time}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          <span className="flex items-center gap-1">{getStatusIcon(booking.status)}{booking.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Services</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(booking.services) && booking.services.map((service: any, idx: number) => (
                            <Badge key={idx} variant="outline">{service.name || service}</Badge>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div><p className="text-muted-foreground">Address</p><p className="font-semibold">{booking.address}</p></div>
                        <div><p className="text-muted-foreground">Total Amount</p><p className="font-semibold text-primary">${booking.total_amount}</p></div>
                        <div><p className="text-muted-foreground">Payment</p><p className="font-semibold capitalize">{booking.payment_method} - {booking.payment_status}</p></div>
                      </div>
                      <div className="pt-4 flex items-center justify-end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Cancel Booking</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone. We’ll notify RWDetailz and the customer via email.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-2">
                              <Label htmlFor={`reason-${booking.id}`}>Reason (optional)</Label>
                              <Textarea id={`reason-${booking.id}`} placeholder="Tell us why you're cancelling" value={cancelReasons[booking.id] || ""} onChange={(e) => setCancelReasons((prev) => ({ ...prev, [booking.id]: e.target.value }))} />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancelBooking(booking)} disabled={!!cancelling[booking.id]}>{cancelling[booking.id] ? "Cancelling..." : "Confirm Cancel"}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {isOwner && (
              <TabsContent value="owner" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Filter className="w-4 h-4"/> Owner Tools</CardTitle>
                    <CardDescription>Filter, update status, assign crew, and broadcast your live location to customers.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <Label>Search</Label>
                        <Input placeholder="Search by #, name, email, phone, address" value={ownerFilterText} onChange={(e) => setOwnerFilterText(e.target.value)} />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Select value={ownerFilterStatus} onValueChange={setOwnerFilterStatus}>
                          <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="scheduled">scheduled</SelectItem>
                            <SelectItem value="in-progress">in-progress</SelectItem>
                            <SelectItem value="completed">completed</SelectItem>
                            <SelectItem value="cancelled">cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end"><Button variant="outline" onClick={() => { setOwnerFilterText(""); setOwnerFilterStatus("all"); }}>Reset</Button></div>
                    </div>
                  </CardContent>
                </Card>

                {allLoading ? (
                  <div className="text-center py-12"><p className="text-muted-foreground">Loading all bookings...</p></div>
                ) : ownerFilteredBookings.length === 0 ? (
                  <Card><CardContent className="py-12 text-center"><Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">No bookings found</p></CardContent></Card>
                ) : (
                  ownerFilteredBookings.map((booking) => {
                    const overrides = readOverrides();
                    const crewName = (overrides[booking.id] as any)?.crew_name || (booking as any).crew_name || "";
                    const etaMinutes = (overrides[booking.id] as any)?.eta_minutes || (booking as any).eta_minutes || "";
                    const trackingActive = !!trackingOn[booking.id];
                    return (
                      <Card key={booking.id} className="hover-lift">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl">Booking #{booking.booking_number}</CardTitle>
                              <CardDescription>{format(new Date(booking.service_date), "PPP")} at {booking.service_time}</CardDescription>
                            </div>
                            <Badge className={getStatusColor(booking.status || "scheduled")}><span className="flex items-center gap-1">{getStatusIcon(booking.status || "scheduled")}{booking.status}</span></Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Customer</p>
                              <p className="font-semibold">{booking.full_name}</p>
                              <p className="text-xs text-muted-foreground">{booking.email}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Address</p>
                              <p className="font-semibold">{booking.address}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total</p>
                              <p className="font-semibold text-primary">${booking.total_amount}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Payment</p>
                              <p className="font-semibold capitalize">{booking.payment_method} - {booking.payment_status}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label>Crew Name</Label>
                              <Input defaultValue={crewName} onBlur={(e) => saveOwnerMeta(booking, { crew_name: e.target.value })} placeholder="Crew member" />
                            </div>
                            <div>
                              <Label>ETA (minutes)</Label>
                              <Input type="number" defaultValue={etaMinutes} onBlur={(e) => saveOwnerMeta(booking, { eta_minutes: Number(e.target.value || 0) })} placeholder="15" />
                            </div>
                            <div className="flex items-end gap-2">
                              {booking.status !== "in-progress" && booking.status !== "completed" && (
                                <Button variant="secondary" onClick={() => setStatus(booking, "in-progress")}>Set In-Progress</Button>
                              )}
                              {booking.status !== "completed" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="secondary" disabled={!!completing[booking.id]}>{completing[booking.id] ? "Completing..." : "Mark Completed"}</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Mark booking as completed?</AlertDialogTitle>
                                      <AlertDialogDescription>This will notify the customer when they check their profile.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleCompleteBooking(booking)}>Confirm</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>

                          <Separator />

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{trackingActive ? "Live tracking ON" : "Live tracking OFF"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {!trackingActive ? (
                                <Button onClick={() => startOwnerTracking(booking)}>
                                  <Share2 className="w-4 h-4 mr-2" /> Start Live Tracking
                                </Button>
                              ) : (
                                <Button variant="outline" onClick={() => stopOwnerTracking(booking)}>
                                  <StopCircle className="w-4 h-4 mr-2" /> Stop Live Tracking
                                </Button>
                              )}
                              {booking.status !== "cancelled" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" disabled={!!cancelling[booking.id]}>
                                      {cancelling[booking.id] ? "Cancelling..." : "Cancel"}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                                      <AlertDialogDescription>This cannot be undone. An email will be sent to the customer.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="space-y-2">
                                      <Label htmlFor={`owner-reason-${booking.id}`}>Reason (optional)</Label>
                                      <Textarea id={`owner-reason-${booking.id}`} placeholder="Reason for cancellation" value={cancelReasons[booking.id] || ""} onChange={(e) => setCancelReasons((prev) => ({ ...prev, [booking.id]: e.target.value }))} />
                                    </div>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Keep</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleCancelBooking(booking)}>Confirm Cancel</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}

                <Separator />
                <Card>
                  <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Ban or unban accounts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {allProfilesLoading ? (
                      <p className="text-muted-foreground">Loading users...</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-muted-foreground">
                              <th className="py-2">Name</th>
                              <th className="py-2">Email</th>
                              <th className="py-2">Phone</th>
                              <th className="py-2">Created</th>
                              <th className="py-2">Status</th>
                              <th className="py-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allProfiles.map((u) => (
                              <tr key={u.id} className="border-t border-border">
                                <td className="py-2">{u.full_name}</td>
                                <td className="py-2">{u.email}</td>
                                <td className="py-2">{u.phone || "-"}</td>
                                <td className="py-2">{u.created_at ? format(new Date(u.created_at), "PP") : "-"}</td>
                                <td className="py-2">{(u as any).banned ? (<Badge variant="destructive">banned</Badge>) : (<Badge className="bg-green-500/10 text-green-500 border-green-500/20">active</Badge>)}</td>
                                <td className="py-2 text-right">{(u as any).banned ? (
                                  <Button size="sm" variant="outline" disabled={!!banning[u.id]} onClick={() => handleBanToggle(u.id, false)}>{banning[u.id] ? "Updating..." : "Unban"}</Button>
                                ) : (
                                  <Button size="sm" variant="destructive" disabled={!!banning[u.id]} onClick={() => handleBanToggle(u.id, true)}>{banning[u.id] ? "Updating..." : "Ban"}</Button>
                                )}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="past" className="space-y-4 mt-6">
              {loading ? (
                <div className="text-center py-12"><p className="text-muted-foreground">Loading bookings...</p></div>
              ) : pastBookings.length === 0 ? (
                <Card><CardContent className="py-12 text-center"><Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">No past bookings</p></CardContent></Card>
              ) : (
                pastBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">Booking #{booking.booking_number}</CardTitle>
                          <CardDescription>{format(new Date(booking.service_date), "PPP")} at {booking.service_time}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(booking.status)}><span className="flex items-center gap-1">{getStatusIcon(booking.status)}{booking.status}</span></Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Services</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(booking.services) && booking.services.map((service: any, idx: number) => (
                            <Badge key={idx} variant="outline">{service.name || service}</Badge>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div><p className="text-muted-foreground">Address</p><p className="font-semibold">{booking.address}</p></div>
                        <div><p className="text-muted-foreground">Total Amount</p><p className="font-semibold text-primary">${booking.total_amount}</p></div>
                        <div><p className="text-muted-foreground">Payment</p><p className="font-semibold capitalize">{booking.payment_method} - {booking.payment_status}</p></div>
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
