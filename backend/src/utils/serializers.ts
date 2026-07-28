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

export function serializeCart(cart: ICart & { _id?: { toString(): string } }) {
  return {
    ...cart,
    id: cart._id?.toString(),
    items: cart.items.map((item) => {
      const product = item.product as unknown as ProductWithId;
      return {
        ...item,
        product: product && typeof product === 'object' && 'slug' in product
          ? serializeProduct(product)
          : product,
      };
    }),
  };
}
