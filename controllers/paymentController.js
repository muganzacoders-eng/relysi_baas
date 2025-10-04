const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../models');
const { Payment, User } = db; 

exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency, description, metadata } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency || 'usd',
      description,
      metadata
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    next(error);
  }
};

exports.handleWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

async function handlePaymentSuccess(paymentIntent) {
  await Payment.create({
    user_id: paymentIntent.metadata.user_id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    payment_method: paymentIntent.payment_method_types[0],
    payment_status: 'completed',
    payment_gateway_id: paymentIntent.id,
    description: paymentIntent.description,
    related_entity_type: paymentIntent.metadata.entity_type,
    related_entity_id: paymentIntent.metadata.entity_id
  });
}