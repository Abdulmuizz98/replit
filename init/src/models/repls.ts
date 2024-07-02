import { Schema, model } from "mongoose";

const replSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

replSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Repl = model("Repl", replSchema);
