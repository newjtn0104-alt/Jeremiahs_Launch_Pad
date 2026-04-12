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

  // Group orders by location
  const ordersByLocation = orders.reduce((acc, order) => {
    if (!acc[order.location]) {
      acc[order.location] = [];
    }
    acc[order.location].push(order);
    return acc;
  }, {} as Record<string, SyscoOrder[]>);

  // Get most recent orders (last 7 days)
  const recentOrders = orders.filter(order => {
    const orderDate = new Date(order.orderDate);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return orderDate >= sevenDaysAgo;
  });

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
                  {orders.length} total orders on record
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

      {/* Recent Orders by Location */}
      {Object.entries(ordersByLocation).map(([location, locationOrders]) => {
        const latestOrder = locationOrders[0];
        
        return (
          <Card key={location} className="border-slate-200 shadow-md bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-800">
                      {location}
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                      {locationOrders.length} orders
                    </p>
                  </div>
                </div>
                {getStatusBadge(latestOrder?.status || 'unknown')}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {latestOrder ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Order #</span>
                    <span className="font-mono font-medium">{latestOrder.orderNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Order Date</span>
                    <span>{new Date(latestOrder.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Expected Delivery</span>
                    <span>{latestOrder.expectedDelivery ? new Date(latestOrder.expectedDelivery).toLocaleDateString() : 'TBD'}</span>
                  </div>
                  {latestOrder.totalAmount && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Total</span>
                      <span className="font-medium">${latestOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">No recent orders</p>
              )}
            </CardContent>
          </Card>
        );
      })}

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

      {/* Order History */}
      {recentOrders.length > 0 && (
        <Card className="border-slate-200 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Recent Order History (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="font-medium text-slate-800">{order.location}</p>
                      <p className="text-sm text-slate-500">Order #{order.orderNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">{new Date(order.orderDate).toLocaleDateString()}</p>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
