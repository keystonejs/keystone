import Stripe from 'stripe';

const stripeConfig = new Stripe(process.env.STRIPE_SECRET);
export default stripeConfig;
