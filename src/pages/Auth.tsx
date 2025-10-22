import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, User as UserIcon, ShieldCheck, Lock, Smartphone, Chrome } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Sign in (email/password)
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign up (email/password)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  // Phone sign-in (OTP)
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Password reset
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !searchParams.get("reset")) {
        navigate("/");
      } else if (session && searchParams.get("reset") === "true") {
        navigate("/reset-password");
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session && !searchParams.get("reset")) {
        navigate("/");
      } else if (session && searchParams.get("reset") === "true") {
        navigate("/reset-password");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message); else toast.success("Logged in successfully!");
    setLoading(false);
  };

  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (e: any) {
      toast.error(e.message || "Google sign-in failed. Ensure Google provider is enabled in Supabase.");
    }
  };

  // Email/password signup flow
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: { full_name: fullName, phone },
        },
      });
      if (error) throw error;
      toast.success("Account created successfully!");
      navigate("/");
    } catch (e: any) {
      toast.error(e.message || "Failed to create account.");
    } finally {
      setSignupLoading(false);
    }
  };

  // Phone OTP sign-in
  const handleSendPhoneCode = async () => {
    if (!phoneNumber) return toast.error("Enter your phone number");
    setPhoneLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: phoneNumber });
      if (error) throw error;
      setPhoneCodeSent(true);
      toast.success("SMS code sent");
    } catch (e: any) {
      toast.error(e.message || "Failed to send SMS code. Configure SMS in Supabase.");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (!phoneOtp) return toast.error("Enter the SMS code");
    setPhoneLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: phoneOtp,
        type: "sms",
      });
      if (error) throw error;
      toast.success("Signed in with phone");
      navigate("/");
    } catch (e: any) {
      toast.error(e.message || "Invalid SMS code");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return toast.error("Enter your email address");
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      if (error) throw error;
      toast.success("Password reset link sent to your email");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (e: any) {
      toast.error(e.message || "Failed to send reset email");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">RWDetailz</CardTitle>
          <CardDescription className="text-center">
            Sign in or create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              {!showForgotPassword ? (
                <>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email"><Mail className="inline w-4 h-4 mr-1"/> Email</Label>
                      <Input id="signin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password"><Lock className="inline w-4 h-4 mr-1"/> Password</Label>
                        <Button
                          type="button"
                          variant="link"
                          className="h-auto p-0 text-sm"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <Input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
                  </form>
                </>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email"><Mail className="inline w-4 h-4 mr-1"/> Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={resetLoading}>
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail("");
                    }}
                  >
                    Back to Sign In
                  </Button>
                </form>
              )}

              {!showForgotPassword && (
                <>
                  <div className="my-4"><Separator /></div>

                  <div className="grid gap-2">
                <Button type="button" variant="outline" onClick={handleGoogle}>
                  <Chrome className="w-4 h-4 mr-2"/> Continue with Google
                </Button>
                <div className="p-3 rounded-md border border-border">
                  <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                    <Smartphone className="w-4 h-4"/> Phone sign-in (OTP)
                  </div>
                  <div className="grid gap-2">
                    <Input placeholder="+1 555 123 4567" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    {!phoneCodeSent ? (
                      <Button type="button" variant="secondary" onClick={handleSendPhoneCode} disabled={phoneLoading}>
                        {phoneLoading ? "Sending..." : "Send SMS Code"}
                      </Button>
                    ) : (
                      <div className="grid gap-2">
                        <Input placeholder="Enter SMS code" value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value)} />
                        <Button type="button" onClick={handleVerifyPhoneCode} disabled={phoneLoading}>
                          {phoneLoading ? "Verifying..." : "Verify & Sign In"}
                        </Button>
                      </div>
                    )}
                  </div>
                  </div>
                </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name"><UserIcon className="inline w-4 h-4 mr-1"/> Full Name</Label>
                  <Input id="signup-name" type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone"><Phone className="inline w-4 h-4 mr-1"/> Phone (optional)</Label>
                  <Input id="signup-phone" type="tel" placeholder="(954) 865-6205" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email"><Mail className="inline w-4 h-4 mr-1"/> Email</Label>
                  <Input id="signup-email" type="email" placeholder="you@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password"><Lock className="inline w-4 h-4 mr-1"/> Password</Label>
                  <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={signupLoading}>
                  {signupLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
