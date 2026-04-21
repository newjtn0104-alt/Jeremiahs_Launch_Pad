"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, CheckCircle, Clock, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SyscoOrder {
  id: string;
  orderNumber: string;
  location: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'ordered' | 'in_transit' | 'delivered';
  totalAmount?: number;
}

export default function SyscoOrders() {
  const [orders, setOrders] = useState<SyscoOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextOrderDays, setNextOrderDays] = useState<string[]>([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sysco-orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    calculateNextOrderDays();
  }, []);

  const calculateNextOrderDays = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 3 = Wednesday
    
    const nextDays: string[] = [];
    
    // If today is before Sunday, next is Sunday
    if (dayOfWeek < 0) {
      nextDays.push('Sunday');
    } else if (dayOfWeek === 0) {
      nextDays.push('Today (Sunday)');
    }
    
    // If today is before Wednesday, next is Wednesday
    if (dayOfWeek < 3) {
      nextDays.push('Wednesday');
    } else if (dayOfWeek === 3) {
      nextDays.push('Today (Wednesday)');
    }
    
    // If past Wednesday, next is Sunday
    if (dayOfWeek > 3) {
      nextDays.push('Sunday');
    }
    
    setNextOrderDays(nextDays);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_transit':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'ordered':
        return <Package className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-700">Delivered</Badge>;
      case 'in_transit':
        return <Badge className="bg-blue-100 text-blue-700">In Transit</Badge>;
      case 'ordered':
        return <Badge className="bg-yellow-100 text-yellow-700">Ordered</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-600">Unknown</Badge>;
    }
  };

  // Format date safely
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Invalid Date') return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Get unique locations for summary
  const uniqueLocations = [...new Set(orders.map(o => o.location))];
  
  // Count orders by location
  const orderCounts = orders.reduce((acc, order) => {
    acc[order.location] = (acc[order.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Next Order Alert */}
      <Card className="border-slate-200 shadow-md bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Sysco Orders</CardTitle>
                <p className="text-sm text-slate-500">
                  {orders.length} total orders • {uniqueLocations.length} locations
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">
                Next Order: {nextOrderDays.join(' & ')}
              </p>
              <p className="text-sm text-yellow-600">
                Orders placed Sundays & Wednesdays by 8:00 PM
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List - Each order shown separately */}
      {orders.length === 0 ? (
        <Card className="border-slate-200 shadow-md bg-white">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        orders.map((order, index) => (
          <Card key={order.id} className="border-slate-200 shadow-md bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-800">
                      {order.location}
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                      Order #{order.orderNumber}
                    </p>
                  </div>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Order Date</span>
                  <span className="font-medium">{formatDate(order.orderDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Expected Delivery</span>
                  <span className="font-medium">{formatDate(order.expectedDelivery) || 'TBD'}</span>
                </div>
                {order.totalAmount && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Total</span>
                    <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Quick Actions */}
      <Card className="border-slate-200 shadow-md bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-between"
            onClick={() => window.open('https://shop.sysco.com', '_blank')}
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Place Sysco Order
            </span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-between"
            onClick={fetchOrders}
            disabled={loading}
          >
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Refresh Orders
            </span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
