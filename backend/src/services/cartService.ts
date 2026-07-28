import type { Request } from 'express';
import { Cart, CartDocument } from '../models/Cart';
import { Product } from '../models/Product';
import { HttpError } from '../utils/HttpError';

export interface CartOwner {
  user?: string;
  cartToken?: string;
}

export function getCartOwner(req: Request): CartOwner {
  if (req.auth) {
    return { user: req.auth.userId };
  }

  const cartToken = req.header('x-cart-token')?.trim();
  if (!cartToken || cartToken.length < 16 || cartToken.length > 200) {
    throw new HttpError(400, 'A valid x-cart-token header is required for a guest cart.');
  }
  return { cartToken };
}

export async function findCart(owner: CartOwner): Promise<CartDocument | null> {
  return Cart.findOne(owner).populate('items.product');
}

export async function getOrCreateCart(owner: CartOwner): Promise<CartDocument> {
  const cart = await Cart.findOneAndUpdate(
    owner,
    { $setOnInsert: { ...owner, items: [], giftWrap: false } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return cart.populate('items.product');
}

export async function addItemToCart(
  owner: CartOwner,
  productId: string,
  quantity: number,
  customNote?: string,
): Promise<CartDocument> {
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw new HttpError(404, 'Product not found or unavailable.');
  }
  if (product.stockCount < quantity) {
    throw new HttpError(409, 'Requested quantity exceeds the available stock.');
  }

  const cart = await getOrCreateCart(owner);
  const existingItem = cart.items.find((item) => item.product._id.toString() === productId);

  if (existingItem) {
    const nextQuantity = existingItem.quantity + quantity;
    if (nextQuantity > product.stockCount) {
      throw new HttpError(409, 'Requested quantity exceeds the available stock.');
    }
    existingItem.quantity = nextQuantity;
    if (customNote !== undefined) existingItem.customNote = customNote;
  } else {
    cart.items.push({ product: product._id, quantity, customNote });
  }

  await cart.save();
  return cart.populate('items.product');
}

export async function updateCartItem(
  owner: CartOwner,
  productId: string,
  quantity: number,
  customNote?: string,
): Promise<CartDocument> {
  const cart = await findCart(owner);
  if (!cart) throw new HttpError(404, 'Cart not found.');

  const item = cart.items.find((cartItem) => cartItem.product._id.toString() === productId);
  if (!item) throw new HttpError(404, 'Cart item not found.');

  if (quantity <= 0) {
    cart.items = cart.items.filter((cartItem) => cartItem.product._id.toString() !== productId);
  } else {
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) throw new HttpError(404, 'Product not found or unavailable.');
    if (quantity > product.stockCount) {
      throw new HttpError(409, 'Requested quantity exceeds the available stock.');
    }
    item.quantity = quantity;
    if (customNote !== undefined) item.customNote = customNote;
  }

  await cart.save();
  return cart.populate('items.product');
}

export async function mergeGuestCart(userId: string, cartToken: string): Promise<CartDocument> {
  const guestCart = await Cart.findOne({ cartToken }).populate('items.product');
  const userCart = await getOrCreateCart({ user: userId });

  if (!guestCart) return userCart;

  for (const guestItem of guestCart.items) {
    const productId = guestItem.product._id.toString();
    const matchingItem = userCart.items.find((item) => item.product._id.toString() === productId);
    if (matchingItem) {
      matchingItem.quantity += guestItem.quantity;
      matchingItem.customNote ??= guestItem.customNote;
    } else {
      userCart.items.push({
        product: guestItem.product._id,
        quantity: guestItem.quantity,
        customNote: guestItem.customNote,
      });
    }
  }

  userCart.giftWrap ||= guestCart.giftWrap;
  userCart.giftNote ??= guestCart.giftNote;
  userCart.promoCode ??= guestCart.promoCode;
  await userCart.save();
  await guestCart.deleteOne();
  return userCart.populate('items.product');
}
