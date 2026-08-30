import { model, models, Schema } from 'mongoose';

export interface ICounter {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = models.Counter || model<ICounter>('Counter', counterSchema);

export async function getNextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const counterId = `order_${year}`;
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  const formattedSeq = String(counter.seq).padStart(6, '0');
  return `CW-${year}-${formattedSeq}`;
}
