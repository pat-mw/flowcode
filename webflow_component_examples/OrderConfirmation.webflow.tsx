import { OrderConfirmation } from './OrderConfirmation';
import { props } from '@webflow/data-types';
import { declareComponent } from '@webflow/react';

import '@/app/globals.css';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface WebflowOrderConfirmationProps {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  itemsJson: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  pdfUrl: string;
  shippingAddress: string;
}

const OrderConfirmationWrapper = (props: WebflowOrderConfirmationProps) => {
  let items: OrderItem[] = [];

  try {
    items = JSON.parse(props.itemsJson);
  } catch (e) {
    console.error('Failed to parse items JSON:', e);
    items = [];
  }

  return <OrderConfirmation {...props} items={items} />;
};

export default declareComponent(OrderConfirmationWrapper, {
  name: 'Order Confirmation',
  description: 'Display order confirmation with downloadable PDF receipt',
  group: 'E-commerce',
  props: {
    orderNumber: props.Text({
      name: "Order Number",
      defaultValue: "ORD-2025-001234",
      tooltip: "Unique order identifier"
    }),
    orderDate: props.Text({
      name: "Order Date",
      defaultValue: "October 14, 2025",
      tooltip: "Date when order was placed"
    }),
    customerName: props.Text({
      name: "Customer Name",
      defaultValue: "John Smith",
      tooltip: "Name of the customer"
    }),
    customerEmail: props.Text({
      name: "Customer Email",
      defaultValue: "john.smith@example.com",
      tooltip: "Customer's email address"
    }),
    itemsJson: props.Text({
      name: "Order Items (JSON)",
      defaultValue: JSON.stringify([
        {
          name: "Premium Cotton T-Shirt",
          quantity: 2,
          price: 29.99
        },
        {
          name: "Classic Jeans",
          quantity: 1,
          price: 79.99
        }
      ]),
      tooltip: "JSON array of order items with name, quantity, and price"
    }),
    subtotal: props.Number({
      name: "Subtotal",
      defaultValue: 139.97,
      tooltip: "Order subtotal before tax and shipping"
    }),
    tax: props.Number({
      name: "Tax",
      defaultValue: 11.20,
      tooltip: "Tax amount"
    }),
    shipping: props.Number({
      name: "Shipping",
      defaultValue: 9.99,
      tooltip: "Shipping cost"
    }),
    total: props.Number({
      name: "Total",
      defaultValue: 161.16,
      tooltip: "Total order amount"
    }),
    pdfUrl: props.Text({
      name: "PDF URL",
      defaultValue: "https://example.com/invoice.pdf",
      tooltip: "URL to downloadable PDF receipt (optional)"
    }),
    shippingAddress: props.Text({
      name: "Shipping Address",
      defaultValue: "123 Main Street\nApt 4B\nNew York, NY 10001\nUnited States",
      tooltip: "Full shipping address (use \\n for line breaks)"
    }),
  },
});
