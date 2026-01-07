import mongoose, { Document, Schema } from 'mongoose';

export interface IStock extends Document {
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  category: string;
  isActive: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const stockSchema = new Schema<IStock>(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      default: 'pieces',
      enum: ['pieces', 'packs', 'boxes', 'kg'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      default: 'Injera',
      enum: ['Injera', 'Teff Flour', 'Packaging', 'Other'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update lastUpdated on save
stockSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

export default mongoose.model<IStock>('Stock', stockSchema);


