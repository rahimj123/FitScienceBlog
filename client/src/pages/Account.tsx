import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/platform/AuthProvider";

function Account() {
  const { user, login, register, logout } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "coach" | "physician" | "admin">("client");

  if (user) {
    return (
      <div className="container-custom py-16">
        <h1 className="text-4xl font-semibold">Account</h1>
        <p className="mt-4 text-lg text-muted-foreground">{user.email} • role: {user.role}</p>
        <Button
          className="mt-6 rounded-full"
          onClick={async () => {
            await logout();
            toast({ title: "Logged out" });
          }}
        >
          Log out
        </Button>
      </div>
    );
  }

  return (
    <div className="container-custom py-16">
      <h1 className="text-4xl font-semibold">Create or access your account</h1>
      <div className="mt-8 grid max-w-3xl gap-8 md:grid-cols-2">
        <div className="rounded-[1.75rem] border border-primary/10 bg-white p-6">
          <h2 className="text-2xl font-semibold">Register</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Email</Label>
              <Input className="mt-2 h-12 rounded-2xl" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" className="mt-2 h-12 rounded-2xl" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <Label>Role</Label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "client" | "coach" | "physician" | "admin")}
                className="mt-2 h-12 w-full rounded-2xl border border-primary/10 bg-white px-3 text-sm"
              >
                <option value="client">Client</option>
                <option value="coach">Coach / Personal Trainer</option>
                <option value="physician">Physician / Wellness Trainer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button
              className="rounded-full"
              onClick={async () => {
                await register({ email, password, role });
                toast({ title: "Account created" });
              }}
            >
              Register
            </Button>
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-primary/10 bg-white p-6">
          <h2 className="text-2xl font-semibold">Log in</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Email</Label>
              <Input className="mt-2 h-12 rounded-2xl" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" className="mt-2 h-12 rounded-2xl" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={async () => {
                await login({ email, password });
                toast({ title: "Logged in" });
              }}
            >
              Log in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;
