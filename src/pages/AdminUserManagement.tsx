import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([
    { id: "E001", name: "Alice Johnson", email: "alice@example.com", phone: "1234567890" },
    { id: "E002", name: "Bob Smith", email: "bob@example.com", phone: "2345678901" },
    { id: "E003", name: "Charlie Brown", email: "charlie@example.com", phone: "3456789012" }
  ]);
  const [form, setForm] = useState<User>({ id: "", name: "", email: "", phone: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const handleAdd = () => {
    if (!form.id || !form.name || !form.email || !form.phone) return;
    setUsers([...users, form]);
    setForm({ id: "", name: "", email: "", phone: "" });
  };

  const handleUpdate = () => {
    setUsers(users.map(u => u.id === editId ? { ...u, email: form.email, phone: form.phone } : u));
    setForm({ id: "", name: "", email: "", phone: "" });
    setEditId(null);
  };

  const handleEdit = (user: User) => {
    setEditId(user.id);
    setForm(user);
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Manage Employees</h2>

      <Input
        placeholder="Search by Employee ID or Name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="grid md:grid-cols-4 gap-4 items-end">
        <Input placeholder="Employee ID" value={form.id} disabled={!!editId} onChange={e => setForm({ ...form, id: e.target.value })} />
        <Input placeholder="Name" value={form.name} disabled={!!editId} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <Input placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <Button onClick={editId ? handleUpdate : handleAdd}>
          {editId ? "Update" : "Add"} User
        </Button>
      </div>

      <Card className="mt-6 p-4">
        <h3 className="text-lg font-semibold mb-2">User List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{user.id}</td>
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.phone}</td>
                  <td className="px-4 py-2">
                    <Button size="sm" onClick={() => handleEdit(user)} className="mr-2">Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
