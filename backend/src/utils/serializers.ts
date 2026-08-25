import type { IProduct } from '../models/Product';
import type { ICart } from '../models/Cart';

type ProductWithId = IProduct & { _id: { toString(): string } };

export function serializeProduct(product: ProductWithId | Record<string, unknown>) {
  const value = 'toObject' in product && typeof product.toObject === 'function'
    ? product.toObject()
    : product;
  const record = value as Record<string, unknown>;
  return {
    ...record,
    id: record.slug,
    databaseId: record._id?.toString(),
  };
}

export function serializeCart(cart: ICart & { _id?: { toString(): string } } | Record<string, unknown>) {
  const value = 'toObject' in cart && typeof cart.toObject === 'function'
    ? (cart as { toObject(): Record<string, unknown> }).toObject()
    : (cart as Record<string, unknown>);

  const rawItems = Array.isArray(value.items) ? value.items : [];

  return {
    ...value,
    id: value._id?.toString(),
    giftWrap: Boolean(value.giftWrap),
    giftNote: (value.giftNote as string) ?? '',
    promoCode: (value.promoCode as string) ?? '',
    items: rawItems.map((item: unknown) => {
      const record = item as Record<string, unknown>;
      const product = record.product as unknown as ProductWithId;
      return {
        ...record,
        product: product && typeof product === 'object' && 'slug' in product
          ? serializeProduct(product)
          : product,
      };
    }),
  };
}
