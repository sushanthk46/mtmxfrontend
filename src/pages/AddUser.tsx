import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AddUser() {
  const [form, setForm] = useState({ id: "", name: "", email: "", phone: "" });
  const [added, setAdded] = useState(false);

  const handleSubmit = () => {
    if (!form.id || !form.name || !form.email || !form.phone) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
    setForm({ id: "", name: "", email: "", phone: "" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Add New User</h2>
      <div className="grid md:grid-cols-5 gap-4 items-end">
        <Input placeholder="Employee ID" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} />
        <Input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <Input placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <Button onClick={handleSubmit}>Add User</Button>
      </div>

      {added && (
        <Card className="mt-4 p-4 text-green-600 font-medium">User added successfully (in-memory only)</Card>
      )}
    </div>
  );
}
