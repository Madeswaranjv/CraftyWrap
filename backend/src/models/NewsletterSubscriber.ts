import { HydratedDocument, model, models, Schema } from 'mongoose';

export type NewsletterSource = 'footer' | 'homepage_banner';

export interface INewsletterSubscriber {
  email: string;
  source: NewsletterSource;
  subscribedAt: Date;
}

export type NewsletterSubscriberDocument = HydratedDocument<INewsletterSubscriber>;

const newsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, required: true, enum: ['footer', 'homepage_banner'] },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

newsletterSubscriberSchema.index({ subscribedAt: -1 });

export const NewsletterSubscriber =
  models.NewsletterSubscriber || model<INewsletterSubscriber>('NewsletterSubscriber', newsletterSubscriberSchema);
