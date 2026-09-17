import { NextResponse } from 'next/server';
import { Polar } from '@polar-sh/sdk';

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || '',
  server: 'sandbox', // Ensure you are using sandbox mode
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, amount, items } = body;

    // Fallback to your active sandbox product ID if none provided
    const targetProductId = productId || '7f9b4691-7146-4520-8d9b-4d4961551255';

    // Create the checkout session via Polar SDK
    const checkout = await polar.checkouts.create({
      productId: targetProductId,
      // If your cart total needs to be passed or custom amount is supported by your product:
      // amount: amount, 
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err: any) {
    // This will print the exact Polar API error to your Netlify function logs
    console.error('Detailed Polar Checkout Error:', err?.body || err.message || err);
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 422 }
    );
  }
}
