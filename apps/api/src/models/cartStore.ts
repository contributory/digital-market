import { Cart, CartItem } from '@repo/shared';
import { v4 as uuidv4 } from 'uuid';
import { productStore } from './productStore';

class CartStore {
  private carts: Map<string, Cart> = new Map();

  private calculateTotals(items: CartItem[]): {
    subtotal: number;
    tax: number;
    total: number;
  } {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }

  private getCartKey(userId?: string, guestToken?: string): string {
    return userId || guestToken || '';
  }

  getCart(userId?: string, guestToken?: string): Cart | undefined {
    const key = this.getCartKey(userId, guestToken);
    return this.carts.get(key);
  }

  getOrCreateCart(userId?: string, guestToken?: string): Cart {
    const key = this.getCartKey(userId, guestToken);
    let cart = this.carts.get(key);

    if (!cart) {
      const now = new Date().toISOString();
      cart = {
        id: uuidv4(),
        userId,
        guestToken,
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        createdAt: now,
        updatedAt: now,
      };
      this.carts.set(key, cart);
    }

    return cart;
  }

  addItem(
    productId: string,
    quantity: number,
    variantId?: string,
    userId?: string,
    guestToken?: string
  ): Cart | null {
    const product = productStore.getProductById(productId);
    if (!product) {
      return null;
    }

    if (product.stock < quantity) {
      return null;
    }

    const cart = this.getOrCreateCart(userId, guestToken);
    const existingItem = cart.items.find(
      (item) => item.productId === productId && item.variantId === variantId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return null;
      }
      existingItem.quantity = newQuantity;
    } else {
      const newItem: CartItem = {
        id: uuidv4(),
        productId,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.images[0] || '',
        price: product.price,
        quantity,
        stock: product.stock,
        variantId,
      };
      cart.items.push(newItem);
    }

    const totals = this.calculateTotals(cart.items);
    cart.subtotal = totals.subtotal;
    cart.tax = totals.tax;
    cart.total = totals.total;
    cart.updatedAt = new Date().toISOString();

    return cart;
  }

  updateItemQuantity(
    itemId: string,
    quantity: number,
    userId?: string,
    guestToken?: string
  ): Cart | null {
    const cart = this.getCart(userId, guestToken);
    if (!cart) {
      return null;
    }

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      return null;
    }

    const product = productStore.getProductById(item.productId);
    if (!product || product.stock < quantity) {
      return null;
    }

    item.quantity = quantity;

    const totals = this.calculateTotals(cart.items);
    cart.subtotal = totals.subtotal;
    cart.tax = totals.tax;
    cart.total = totals.total;
    cart.updatedAt = new Date().toISOString();

    return cart;
  }

  removeItem(
    itemId: string,
    userId?: string,
    guestToken?: string
  ): Cart | null {
    const cart = this.getCart(userId, guestToken);
    if (!cart) {
      return null;
    }

    cart.items = cart.items.filter((item) => item.id !== itemId);

    const totals = this.calculateTotals(cart.items);
    cart.subtotal = totals.subtotal;
    cart.tax = totals.tax;
    cart.total = totals.total;
    cart.updatedAt = new Date().toISOString();

    return cart;
  }

  clearCart(userId?: string, guestToken?: string): boolean {
    const key = this.getCartKey(userId, guestToken);
    return this.carts.delete(key);
  }

  mergeGuestCartToUser(guestToken: string, userId: string): Cart {
    const guestCart = this.getCart(undefined, guestToken);
    const userCart = this.getOrCreateCart(userId);

    if (guestCart && guestCart.items.length > 0) {
      guestCart.items.forEach((guestItem) => {
        const existingItem = userCart.items.find(
          (item) =>
            item.productId === guestItem.productId &&
            item.variantId === guestItem.variantId
        );

        if (existingItem) {
          existingItem.quantity += guestItem.quantity;
        } else {
          userCart.items.push({ ...guestItem, id: uuidv4() });
        }
      });

      const totals = this.calculateTotals(userCart.items);
      userCart.subtotal = totals.subtotal;
      userCart.tax = totals.tax;
      userCart.total = totals.total;
      userCart.updatedAt = new Date().toISOString();

      this.carts.delete(guestToken);
    }

    return userCart;
  }

  getCartItemCount(userId?: string, guestToken?: string): number {
    const cart = this.getCart(userId, guestToken);
    if (!cart) {
      return 0;
    }
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  applyPromoCode(
    promoCode: string,
    userId?: string,
    guestToken?: string
  ): Cart | null {
    const cart = this.getCart(userId, guestToken);
    if (!cart) {
      return null;
    }

    const validPromoCodes: Record<string, number> = {
      SAVE10: 0.1,
      SAVE20: 0.2,
      FREESHIP: 0,
    };

    const discount = validPromoCodes[promoCode.toUpperCase()];
    if (discount === undefined) {
      return null;
    }

    cart.promoCode = promoCode.toUpperCase();
    cart.discount = cart.subtotal * discount;
    cart.total = cart.subtotal + cart.tax - cart.discount;
    cart.updatedAt = new Date().toISOString();

    return cart;
  }

  removePromoCode(userId?: string, guestToken?: string): Cart | null {
    const cart = this.getCart(userId, guestToken);
    if (!cart) {
      return null;
    }

    cart.promoCode = undefined;
    cart.discount = undefined;
    cart.total = cart.subtotal + cart.tax;
    cart.updatedAt = new Date().toISOString();

    return cart;
  }
}

export const cartStore = new CartStore();
