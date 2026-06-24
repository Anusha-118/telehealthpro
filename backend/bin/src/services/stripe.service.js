const Stripe = require('stripe');
require('dotenv').config();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const isMockStripe = !stripeSecret || stripeSecret.includes('mockkey');

let stripeInstance;
if (!isMockStripe) {
  stripeInstance = new Stripe(stripeSecret, {
    apiVersion: '2022-11-15'
  });
} else {
  console.log('Stripe API Key is missing or using a mock token. Payment flows will run in Sandbox Mock mode.');
}

const createPaymentIntent = async (amountInCents, metadata = {}) => {
  if (isMockStripe) {
    console.log(`[MOCK STRIPE] Creating Payment Intent for $${(amountInCents / 100).toFixed(2)}`);
    return {
      id: `pi_mock_${Math.random().toString(36).substring(2, 15)}`,
      client_secret: `pi_mock_secret_${Math.random().toString(36).substring(2, 15)}`,
      amount: amountInCents,
      status: 'requires_payment_method'
    };
  } else {
    try {
      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata
      });
      return paymentIntent;
    } catch (error) {
      console.error('Stripe PaymentIntent creation failure:', error);
      throw error;
    }
  }
};

const refundPayment = async (paymentIntentId) => {
  if (isMockStripe) {
    console.log(`[MOCK STRIPE] Refunding Payment Intent: ${paymentIntentId}`);
    return {
      id: `re_mock_${Math.random().toString(36).substring(2, 15)}`,
      status: 'succeeded'
    };
  } else {
    try {
      const refund = await stripeInstance.refunds.create({
        payment_intent: paymentIntentId
      });
      return refund;
    } catch (error) {
      console.error('Stripe refund failure:', error);
      throw error;
    }
  }
};

module.exports = {
  createPaymentIntent,
  refundPayment
};
