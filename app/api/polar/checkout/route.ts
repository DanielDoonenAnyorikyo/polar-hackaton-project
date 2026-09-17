import { NextRequest, NextResponse } from 'next/server';

const POLAR_SANDBOX_API = 'https://sandbox-api.polar.sh/v1';
const POLAR_PRODUCT_ID = '7f9b4691-7146-4520-8d9b-4d4961551255';

export async function POST(request: NextRequest) {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'POLAR_ACCESS_TOKEN is not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { items, total } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    // Build cart summary for metadata
    const cartSummary = items
      .map(
        (item: { productId: string; quantity: number; price: number }) =>
          `${item.quantity}x ${item.productId} ($${(item.price / 100).toFixed(2)} each)`
      )
      .join('; ');

    // Create checkout session with Polar
    const checkoutPayload = {
      products: [POLAR_PRODUCT_ID],
      prices: [
        {
          amount: total,
          currency: 'usd',
          recurring_interval: null,
        },
      ],
      metadata: {
        cart_summary: cartSummary,
        item_count: items.length,
        total_cents: total,
      },
    };

    const response = await fetch(`${POLAR_SANDBOX_API}/checkouts/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutPayload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Polar API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      checkoutUrl: data.url,
      checkoutId: data.id,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
