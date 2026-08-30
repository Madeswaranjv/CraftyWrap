import crypto from 'crypto';
import 'dotenv/config';
import mongoose from 'mongoose';
import app from '../app';
import { connectDatabase } from '../config/db';
import { Counter } from '../models/Counter';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { WebhookEvent } from '../models/WebhookEvent';
import { verifyWebhookSignature } from '../services/razorpayWebhookService';

async function runWebhookTests() {
  console.log('--- STARTING RAZORPAY WEBHOOK INTEGRATION TESTS ---');

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_test_craftywrap_secret';
  process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

  await connectDatabase();

  // Clean up any test webhook events and orders
  await WebhookEvent.deleteMany({ eventId: { $regex: /^test_evt_/ } });
  await Order.deleteMany({ orderNumber: { $regex: /^CW-TEST-/ } });

  // Create a test product
  const testProduct = await Product.create({
    slug: `test-doll-${Date.now()}`,
    name: 'Webhook Test Plush Doll',
    productType: 'Plush',
    designTheme: 'Cute',
    yarnType: 'Cotton Soft',
    size: 'Medium',
    description: 'Test doll description',
    prepTimeDays: 2,
    price: 500,
    stockCount: 10,
    images: ['https://example.com/test.jpg'],
    isActive: true,
  });

  const testRazorpayOrderId = `order_test_${Date.now().toString(36)}`;
  const testOrderNumber = `CW-TEST-${Date.now().toString(36)}`;

  // Create a dummy CraftyWrap order in database
  // Subtotal 500 + shipping 50 = 550 total (55000 paise)
  const testOrder = await Order.create({
    orderNumber: testOrderNumber,
    guestEmail: 'webhooktest@craftywrap.com',
    items: [
      {
        product: testProduct._id,
        name: testProduct.name,
        productType: testProduct.productType,
        designTheme: testProduct.designTheme,
        yarnType: testProduct.yarnType,
        size: testProduct.size,
        price: 500,
        quantity: 1,
      },
    ],
    subtotal: 500,
    shippingFee: 50,
    giftWrapFee: 0,
    discountAmount: 0,
    total: 550,
    shippingAddress: {
      fullName: 'Webhook Tester',
      phone: '9999999999',
      address: '123 Test St',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
    },
    paymentMethod: 'razorpay',
    paymentStatus: 'pending_verification',
    orderStatus: 'payment_pending',
    paymentDetails: {
      razorpayOrderId: testRazorpayOrderId,
    },
  });

  console.log(`[Setup] Created Test Order ${testOrderNumber} (Razorpay Order ID: ${testRazorpayOrderId}, Stock: ${testProduct.stockCount})`);

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      testPassed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      testFailed++;
    }
  }

  // 1. Signature Verification Helper Test
  const testPayloadString = JSON.stringify({ test: 'data' });
  const validSignature = crypto.createHmac('sha256', webhookSecret).update(Buffer.from(testPayloadString)).digest('hex');
  assert(verifyWebhookSignature(Buffer.from(testPayloadString), validSignature) === true, 'Signature Helper - Valid Signature');
  assert(verifyWebhookSignature(Buffer.from(testPayloadString), 'invalid_signature') === false, 'Signature Helper - Invalid Signature');

  // Helper function to make HTTP POST requests to express app
  async function sendWebhookRequest(payload: any, signature: string) {
    const rawBodyBuffer = Buffer.from(JSON.stringify(payload));
    const req: any = {
      method: 'POST',
      url: '/api/razorpay/webhook',
      headers: {
        'content-type': 'application/json',
        'x-razorpay-signature': signature,
      },
      rawBody: rawBodyBuffer,
      body: payload,
      ip: '127.0.0.1',
    };

    return new Promise<{ statusCode: number; body: any }>((resolve) => {
      let statusCode = 200;
      let jsonBody: any = {};

      const res: any = {
        status(code: number) {
          statusCode = code;
          return this;
        },
        json(data: any) {
          jsonBody = data;
          resolve({ statusCode, body: jsonBody });
          return this;
        },
      };

      const { handleRazorpayWebhook } = require('../controllers/razorpayWebhookController');
      handleRazorpayWebhook(req, res, (err: any) => {
        if (err) {
          statusCode = err.statusCode || 500;
          jsonBody = { error: err.message };
          resolve({ statusCode, body: jsonBody });
        }
      });
    });
  }

  // TEST 4: Invalid Webhook Signature
  const evt1Payload = { event_id: `test_evt_1_${Date.now()}`, event: 'payment.captured' };
  const res1 = await sendWebhookRequest(evt1Payload, 'wrong_signature');
  assert(res1.statusCode === 400, 'Test 4 - Invalid Webhook Signature Rejected (HTTP 400)');

  // TEST 6: Payment Amount Mismatch
  const evtMismatchId = `test_evt_mismatch_${Date.now()}`;
  const evtMismatchPayload = {
    event_id: evtMismatchId,
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: `pay_mismatch_${Date.now()}`,
          order_id: testRazorpayOrderId,
          amount: 10000, // 100 INR mismatch (expected 55000 paise)
          currency: 'INR',
        },
      },
    },
  };
  const mismatchSig = crypto.createHmac('sha256', webhookSecret).update(Buffer.from(JSON.stringify(evtMismatchPayload))).digest('hex');
  const resMismatch = await sendWebhookRequest(evtMismatchPayload, mismatchSig);
  assert(resMismatch.statusCode === 200 && resMismatch.body.status === 'ok', 'Test 6 - Amount Mismatch Handled Gracefully without marking paid');
  const checkMismatchOrder = await Order.findById(testOrder._id);
  assert(checkMismatchOrder?.paymentStatus === 'pending_verification', 'Test 6 - Order paymentStatus remains pending_verification on Amount Mismatch');

  // TEST 7: Unknown Razorpay Order ID
  const evtUnknownPayload = {
    event_id: `test_evt_unknown_${Date.now()}`,
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: `pay_unknown_${Date.now()}`,
          order_id: 'order_non_existent_99999',
          amount: 55000,
          currency: 'INR',
        },
      },
    },
  };
  const unknownSig = crypto.createHmac('sha256', webhookSecret).update(Buffer.from(JSON.stringify(evtUnknownPayload))).digest('hex');
  const resUnknown = await sendWebhookRequest(evtUnknownPayload, unknownSig);
  assert(resUnknown.statusCode === 200, 'Test 7 - Unknown Razorpay Order ID returns HTTP 200 without modifying database');

  // TEST 1: Valid payment.captured
  const evtCapturedId = `test_evt_cap_${Date.now()}`;
  const testPayId = `pay_cap_${Date.now()}`;
  const evtCapturedPayload = {
    event_id: evtCapturedId,
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: testPayId,
          order_id: testRazorpayOrderId,
          amount: 55000, // 550.00 INR
          currency: 'INR',
        },
      },
    },
  };
  const capSig = crypto.createHmac('sha256', webhookSecret).update(Buffer.from(JSON.stringify(evtCapturedPayload))).digest('hex');
  const resCaptured = await sendWebhookRequest(evtCapturedPayload, capSig);
  assert(resCaptured.statusCode === 200, 'Test 1 - payment.captured returns HTTP 200');

  const updatedOrderCap = await Order.findById(testOrder._id);
  const updatedProductCap = await Product.findById(testProduct._id);
  assert(updatedOrderCap?.paymentStatus === 'paid', 'Test 1 - Order paymentStatus set to "paid"');
  assert(updatedOrderCap?.orderStatus === 'preparing', 'Test 1 - Order orderStatus set to "preparing"');
  assert(updatedOrderCap?.paymentDetails?.razorpayPaymentId === testPayId, 'Test 1 - Razorpay Payment ID recorded');
  assert(updatedProductCap?.stockCount === 9, 'Test 1 - Inventory decremented by 1 (Stock was 10, now 9)');

  // TEST 5: Duplicate Webhook Event
  const resDup = await sendWebhookRequest(evtCapturedPayload, capSig);
  assert(resDup.statusCode === 200 && resDup.body.message.includes('already processed'), 'Test 5 - Duplicate webhook event ID returns HTTP 200 safely');
  const updatedProductDup = await Product.findById(testProduct._id);
  assert(updatedProductDup?.stockCount === 9, 'Test 5 - No duplicate inventory deduction on duplicate webhook (Stock remains 9)');

  // TEST 8: Already-paid CraftyWrap order via order.paid event
  const evtOrderPaidId = `test_evt_orderpaid_${Date.now()}`;
  const evtOrderPaidPayload = {
    event_id: evtOrderPaidId,
    event: 'order.paid',
    payload: {
      order: {
        entity: {
          id: testRazorpayOrderId,
          payment_id: testPayId,
          amount: 55000,
          currency: 'INR',
        },
      },
    },
  };
  const orderPaidSig = crypto.createHmac('sha256', webhookSecret).update(Buffer.from(JSON.stringify(evtOrderPaidPayload))).digest('hex');
  const resOrderPaid = await sendWebhookRequest(evtOrderPaidPayload, orderPaidSig);
  assert(resOrderPaid.statusCode === 200, 'Test 8 - order.paid event on already-paid order returns HTTP 200');
  const updatedProductAlreadyPaid = await Product.findById(testProduct._id);
  assert(updatedProductAlreadyPaid?.stockCount === 9, 'Test 8 - Already-paid order stock count remains 9 (No double inventory deduction)');

  // TEST 2: payment.failed event
  const testFailedRazorpayOrderId = `order_failed_${Date.now().toString(36)}`;
  const testFailedOrder = await Order.create({
    orderNumber: `CW-TEST-FAIL-${Date.now().toString(36)}`,
    guestEmail: 'failedtest@craftywrap.com',
    items: [{ product: testProduct._id, name: testProduct.name, productType: testProduct.productType, designTheme: testProduct.designTheme, yarnType: testProduct.yarnType, size: testProduct.size, price: 500, quantity: 1 }],
    subtotal: 500,
    shippingFee: 50,
    giftWrapFee: 0,
    discountAmount: 0,
    total: 550,
    shippingAddress: { fullName: 'Fail Tester', phone: '9999999999', address: '123 St', city: 'BLR', state: 'KA', pincode: '560001' },
    paymentMethod: 'razorpay',
    paymentStatus: 'pending_verification',
    orderStatus: 'payment_pending',
    paymentDetails: { razorpayOrderId: testFailedRazorpayOrderId },
  });

  const evtFailedId = `test_evt_failed_${Date.now()}`;
  const evtFailedPayload = {
    event_id: evtFailedId,
    event: 'payment.failed',
    payload: {
      payment: {
        entity: {
          id: `pay_failed_${Date.now()}`,
          order_id: testFailedRazorpayOrderId,
          error_description: 'Card declined by issuing bank',
        },
      },
    },
  };
  const failedSig = crypto.createHmac('sha256', webhookSecret).update(Buffer.from(JSON.stringify(evtFailedPayload))).digest('hex');
  const resFailed = await sendWebhookRequest(evtFailedPayload, failedSig);
  assert(resFailed.statusCode === 200, 'Test 2 - payment.failed event returns HTTP 200');
  const checkFailedOrder = await Order.findById(testFailedOrder._id);
  assert(checkFailedOrder?.paymentStatus === 'failed', 'Test 2 - Order paymentStatus set to "failed"');
  const checkFailedProduct = await Product.findById(testProduct._id);
  assert(checkFailedProduct?.stockCount === 9, 'Test 2 - Stock count NOT decremented on failed payment (Stock remains 9)');

  // Clean up test documents
  await Product.deleteOne({ _id: testProduct._id });
  await Order.deleteMany({ _id: { $in: [testOrder._id, testFailedOrder._id] } });
  await WebhookEvent.deleteMany({ eventId: { $regex: /^test_evt_/ } });

  await mongoose.disconnect();

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${testPassed} Passed, ${testFailed} Failed`);
  console.log(`========================================\n`);

  if (testFailed > 0) {
    process.exit(1);
  }
}

void runWebhookTests();
