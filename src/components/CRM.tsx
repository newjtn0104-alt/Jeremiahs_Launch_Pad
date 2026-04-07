"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Search, Phone, Mail, Building, X } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "lead" | "prospect" | "customer" | "inactive";
  notes: string;
  lastContact: string;
  createdAt: string;
}

const CACHE_KEY = "crm-customers-cache";

export default function CRM() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      setCustomers(JSON.parse(cached));
    } else {
      // Default sample data
      setCustomers([
        {
          id: "1",
          name: "John Smith",
          email: "john@example.com",
          phone: "(555) 123-4567",
          company: "ABC School",
          status: "customer",
          notes: "Regular catering customer",
          lastContact: "2026-04-01",
          createdAt: "2026-03-15"
        },
        {
          id: "2",
          name: "Sarah Johnson",
          email: "sarah@company.com",
          phone: "(555) 987-6543",
          company: "Tech Corp",
          status: "prospect",
          notes: "Interested in weekly orders",
          lastContact: "2026-04-02",
          createdAt: "2026-03-20"
        }
      ]);
    }
  }, []);

  // Save to localStorage whenever customers change
  useEffect(() => {
    if (customers.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(customers));
    }
  }, [customers]);

  const addCustomer = (customer: Omit<Customer, "id" | "createdAt">) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0]
    };
    setCustomers([...customers, newCustomer]);
    setShowAddForm(false);
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(customers.map(c => 
      c.id === updatedCustomer.id ? updatedCustomer : c
    ));
    setEditingCustomer(null);
  };

  const deleteCustomer = (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "customer": return "bg-green-100 text-green-700";
      case "prospect": return "bg-blue-100 text-blue-700";
      case "lead": return "bg-yellow-100 text-yellow-700";
      case "inactive": return "bg-slate-100 text-slate-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const CustomerForm = ({ 
    customer, 
    onSubmit, 
    onCancel 
  }: { 
    customer?: Customer;
    onSubmit: (data: any) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      company: customer?.company || "",
      status: customer?.status || "lead",
      notes: customer?.notes || "",
      lastContact: customer?.lastContact || new Date().toISOString().split("T")[0]
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name.trim()) return;
      onSubmit(formData);
    };

    return (
      <Card className="mb-6 border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {customer ? "Edit Customer" : "Add New Customer"}
            </h3>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full p-2 rounded-md border border-slate-200 bg-white"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="lead">Lead</option>
                  <option value="prospect">Prospect</option>
                  <option value="customer">Customer</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Contact</label>
                <Input
                  type="date"
                  value={formData.lastContact}
                  onChange={(e) => setFormData({ ...formData, lastContact: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-md border border-slate-200 bg-white text-slate-900"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add notes about this customer..."
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {customer ? "Update" : "Add"} Customer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
          <Search className="w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm || !!editingCustomer}>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <CustomerForm
          onSubmit={addCustomer}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Form */}
      {editingCustomer && (
        <CustomerForm
          customer={editingCustomer}
          onSubmit={(data) => updateCustomer({ ...data, id: editingCustomer.id })}
          onCancel={() => setEditingCustomer(null)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-sm text-slate-500">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {customers.filter(c => c.status === "customer").length}
            </div>
            <p className="text-sm text-slate-500">Active Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {customers.filter(c => c.status === "prospect").length}
            </div>
            <p className="text-sm text-slate-500">Prospects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {customers.filter(c => c.status === "lead").length}
            </div>
            <p className="text-sm text-slate-500">Leads</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            {searchTerm ? "No customers found" : "No customers yet. Add your first customer!"}
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      <Badge className={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      {customer.company && (
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {customer.company}
                        </span>
                      )}
                      {customer.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </span>
                      )}
                      {customer.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {customer.phone}
                        </span>
                      )}
                    </div>

                    {customer.notes && (
                      <p className="text-sm text-slate-600 mt-2">{customer.notes}</p>
                    )}

                    <p className="text-xs text-slate-400 mt-2">
                      Last contact: {customer.lastContact}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCustomer(customer)}
                      disabled={showAddForm || !!editingCustomer}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCustomer(customer.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
