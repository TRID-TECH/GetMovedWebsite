/**
 * Test Quick Quote delivery: both jack@ and djakovic@ as primary To recipients.
 * Uses the same AWS SES SDK settings as php/quick-quote-config.local.php.
 *
 * Run from Back/: node ../getmoved-landing/scripts/test-quick-quote-mail.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../Back/.env') });
const emailService = require('../../Back/src/services/emailService');

async function main() {
  const result = await emailService.sendQuickQuoteEmail({
    fullName: 'Website PHP mail test',
    email: 'test-customer@example.com',
    phone: '+1 (555) 000-0000',
    moveFrom: 'Sacramento, CA',
    moveTo: 'Podgorica, ME',
    movingDate: '2026-07-20',
    propertyType: '2 Bedrooms',
    details: 'Test after switching landing site to direct PHP/SES mail (both To recipients).',
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
