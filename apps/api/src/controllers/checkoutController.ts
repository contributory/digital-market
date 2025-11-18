import { Request, Response } from 'express';
import Stripe from 'stripe';
import { env } from '../config/env';
import { cartStore } from '../models/cartStore';
import { orderStore } from '../models/orderStore';
import { CreateCheckoutSessionSchema } from '@repo/shared';

const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: '2024-11-20.acacia',
});

export const getDeliveryOptions = (_req: Request, res: Response) => {
  const options = orderStore.getDeliveryOptions();
  res.json({ status: 'success', data: options });
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  const result = CreateCheckoutSessionSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid request data',
      errors: result.error.errors,
    });
  }

  const { shippingAddress, deliveryOptionId, guestEmail } = result.data;
  const userId = req.user?.id;
  const guestToken = req.headers['x-guest-token'] as string | undefined;

  if (!userId && !guestEmail) {
    return res.status(400).json({
      status: 'error',
      message: 'Guest email is required for guest checkout',
    });
  }

  const cart = cartStore.getCart(userId, guestToken);
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Cart is empty',
    });
  }

  const order = orderStore.createOrder(
    shippingAddress,
    deliveryOptionId,
    userId,
    guestToken,
    guestEmail
  );

  if (!order) {
    return res.status(400).json({
      status: 'error',
      message: 'Failed to create order',
    });
  }

  try {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      order.items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.productName,
            images: item.productImage ? [item.productImage] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: order.deliveryOption.name,
          description: order.deliveryOption.description,
        },
        unit_amount: Math.round(order.deliveryOption.price * 100),
      },
      quantity: 1,
    });

    if (order.discount && order.discount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Discount (${order.promoCode})`,
          },
          unit_amount: -Math.round(order.discount * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${env.corsOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.corsOrigin}/checkout/cancel?order_id=${order.id}`,
      metadata: {
        orderId: order.id,
      },
      customer_email: guestEmail || req.user?.email,
    });

    orderStore.updateOrderStripeSession(order.id, session.id);

    res.json({
      status: 'success',
      data: {
        sessionId: session.id,
        url: session.url,
        orderId: order.id,
      },
    });
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create checkout session',
    });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing stripe signature',
    });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.stripeWebhookSecret
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          orderStore.updateOrderStatus(orderId, 'processing');
          if (session.payment_intent) {
            orderStore.updateOrderPaymentIntent(
              orderId,
              session.payment_intent as string
            );
          }

          const order = orderStore.getOrderById(orderId);
          if (order) {
            cartStore.clearCart(order.userId, undefined);
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('PaymentIntent failed:', paymentIntent.id);
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({
      status: 'error',
      message: 'Webhook error',
    });
  }
};

export const getOrderById = (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = orderStore.getOrderById(orderId);

  if (!order) {
    return res.status(404).json({
      status: 'error',
      message: 'Order not found',
    });
  }

  const userId = req.user?.id;
  if (order.userId && order.userId !== userId) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied',
    });
  }

  res.json({ status: 'success', data: order });
};

export const getOrderBySession = (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const order = orderStore.getOrderByStripeSession(sessionId);

  if (!order) {
    return res.status(404).json({
      status: 'error',
      message: 'Order not found',
    });
  }

  res.json({ status: 'success', data: order });
};

export const getUserOrders = (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    });
  }

  const orders = orderStore.getOrdersByUser(userId);

  res.json({ status: 'success', data: orders });
};
