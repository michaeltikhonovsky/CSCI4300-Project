import mongoose, { Schema, Document, Model } from "mongoose";

interface IItem extends Document {
  owner: string;
  title: string;
  description?: string;
  url?: string;
}

const itemSchema: Schema = new Schema({
  owner: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String, required: false },
});

const Item: Model<Item> =
  mongoose.models.Item || mongoose.model<IItem>("Item", itemSchema);
export default Item;
