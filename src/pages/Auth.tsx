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
import { Mail, Phone, User as UserIcon, Lock, Chrome, ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("reset_token");

  // Sign in (email/password)
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign up
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  // Forgot password (custom)
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Reset password (custom)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState("signin");

  useEffect(() => {
    // If there's a reset token in URL, show reset password form
    if (resetToken) {
      setActiveTab("reset");
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session && !resetToken) navigate("/");
    });
    return () => subscription.unsubscribe();
  }, [navigate, resetToken]);

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
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

  // Custom forgot password using edge function
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setForgotLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-password-reset", {
        body: { email: forgotEmail },
      });
      if (error) throw error;
      setForgotSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (e: any) {
      toast.error(e.message || "Failed to send reset email.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Custom password reset using edge function
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setResetLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("reset-password", {
        body: { token: resetToken, newPassword },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      setResetSuccess(true);
      toast.success("Password updated successfully!");
    } catch (e: any) {
      console.error("Reset password error:", e);
      toast.error(e.message || "Failed to reset password. The link may have expired.");
    } finally {
      setResetLoading(false);
    }
  };

  // If reset token is present, show reset password UI
  if (resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">RWDetailz</CardTitle>
            <CardDescription className="text-center">
              {resetSuccess ? "Password Reset Complete" : "Reset Your Password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetSuccess ? (
              <div className="text-center space-y-4 py-6">
                <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
                <h3 className="font-semibold text-lg">Password Updated!</h3>
                <p className="text-muted-foreground text-sm">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
                <Button 
                  className="w-full mt-4" 
                  onClick={() => {
                    // Clear URL params and go to sign in
                    window.location.href = "/auth";
                  }}
                >
                  Sign In Now
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Enter your new password below.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="new-password">
                    <Lock className="inline w-4 h-4 mr-1" /> New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    <Lock className="inline w-4 h-4 mr-1" /> Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={resetLoading}>
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => window.location.href = "/auth"}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="forgot">Forgot</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email"><Mail className="inline w-4 h-4 mr-1"/> Email</Label>
                  <Input id="signin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password"><Lock className="inline w-4 h-4 mr-1"/> Password</Label>
                  <Input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
              </form>

              <div className="my-4"><Separator /></div>

              <Button type="button" variant="outline" onClick={handleGoogle} className="w-full">
                <Chrome className="w-4 h-4 mr-2"/> Continue with Google
              </Button>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name"><UserIcon className="inline w-4 h-4 mr-1"/> Full Name</Label>
                  <Input id="signup-name" type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone"><Phone className="inline w-4 h-4 mr-1"/> Phone</Label>
                  <Input id="signup-phone" type="tel" placeholder="(954) 865-6205" value={phone} onChange={(e) => setPhone(e.target.value)} required />
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

            <TabsContent value="forgot">
              {forgotSent ? (
                <div className="text-center space-y-4 py-6">
                  <KeyRound className="w-12 h-12 mx-auto text-primary" />
                  <h3 className="font-semibold text-lg">Check Your Email</h3>
                  <p className="text-muted-foreground text-sm">
                    We've sent a password reset link to <strong>{forgotEmail}</strong>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    The link will expire in 1 hour.
                  </p>
                  <Button variant="outline" onClick={() => setForgotSent(false)} className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Try Another Email
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Enter your email and we'll send you a link to reset your password.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email"><Mail className="inline w-4 h-4 mr-1"/> Email</Label>
                    <Input 
                      id="forgot-email" 
                      type="email" 
                      placeholder="you@example.com"
                      value={forgotEmail} 
                      onChange={(e) => setForgotEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={forgotLoading}>
                    {forgotLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
