import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  customerName: string;
  email: string;
  phone?: string;
  businessType: string;
  product: string;
  quantity: number;
  message?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalPrice?: number;
  orderDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    businessType: {
      type: String,
      required: [true, 'Business type is required'],
      enum: ['hotel', 'supermarket', 'retailer', 'international', 'other'],
    },
    product: {
      type: String,
      required: [true, 'Product is required'],
      default: 'Pure Teff Injera',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    totalPrice: {
      type: Number,
      min: [0, 'Total price cannot be negative'],
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for analytics queries
orderSchema.index({ orderDate: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ product: 1 });

export default mongoose.model<IOrder>('Order', orderSchema);


