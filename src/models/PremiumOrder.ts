import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPremiumOrder extends Document {
  userId: Types.ObjectId;
  byshopOrderId: string;
  productName: string;
  productImage: string;
  typeId: string;
  typeMenu: string;
  price: number;
  accountDetail: string;
  createdAt: Date;
}

delete mongoose.models.PremiumOrder;

const PremiumOrderSchema = new Schema<IPremiumOrder>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  byshopOrderId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, default: "" },
  typeId: { type: String, required: true },
  typeMenu: { type: String, default: "" },
  price: { type: Number, required: true },
  accountDetail: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPremiumOrder>("PremiumOrder", PremiumOrderSchema);
