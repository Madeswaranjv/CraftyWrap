import { HydratedDocument, model, models, Schema } from 'mongoose';

export interface IWebhookEvent {
  eventId: string;
  eventType: string;
  processedAt: Date;
  payloadSummary?: Record<string, any>;
}

export type WebhookEventDocument = HydratedDocument<IWebhookEvent>;

const webhookEventSchema = new Schema<IWebhookEvent>(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, required: true },
    processedAt: { type: Date, default: Date.now },
    payloadSummary: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export const WebhookEvent =
  models.WebhookEvent || model<IWebhookEvent>('WebhookEvent', webhookEventSchema);
