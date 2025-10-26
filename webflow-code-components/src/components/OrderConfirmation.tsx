import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, Package } from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationProps {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  pdfUrl?: string;
  shippingAddress: string;
}

export const OrderConfirmation = ({
  orderNumber,
  orderDate,
  customerName,
  customerEmail,
  items,
  subtotal,
  tax,
  shipping,
  total,
  pdfUrl,
  shippingAddress,
}: OrderConfirmationProps) => {
  const handleDownloadPDF = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl">Order Confirmed!</CardTitle>
          <CardDescription className="text-lg">
            Thank you for your order, {customerName}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Details */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-muted-foreground">Order Number</p>
                <p className="font-mono font-bold">{orderNumber}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Order Date</p>
                <p className="font-medium">{orderDate}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Email</p>
                <p className="font-medium">{customerEmail}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Status</p>
                <Badge variant="default" className="bg-green-500">Processing</Badge>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5" />
              <h3 className="font-semibold text-lg">Order Items</h3>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{shippingAddress}</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {pdfUrl && (
            <Button
              onClick={handleDownloadPDF}
              className="w-full"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Order Confirmation (PDF)
            </Button>
          )}
          <p className="text-xs text-center text-muted-foreground">
            A confirmation email has been sent to {customerEmail}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
