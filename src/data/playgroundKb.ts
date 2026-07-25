/**
 * SYNTHETIC knowledge base for the agent-playground demo. Every article is
 * invented for a fictional remittance product ("DemoRemit") — none of this
 * is real ScopeX content, data, policy or internal documentation.
 */
export type KbArticle = { id: string; title: string; body: string };

export const DEMO_KB: KbArticle[] = [
  {
    id: "kb-1",
    title: "How long do transfers take?",
    body: "DemoRemit transfers from the EU to India typically settle within 1–2 business days. Transfers initiated before 14:00 CET on a business day are usually credited the same day. Weekend and bank-holiday transfers begin processing the next business day.",
  },
  {
    id: "kb-2",
    title: "Which KYC documents are accepted?",
    body: "DemoRemit accepts a valid passport, EU national ID card or residence permit as identity proof, plus a utility bill or bank statement (under 3 months old) as address proof. Verification usually completes within 30 minutes; complex cases can take up to 24 hours.",
  },
  {
    id: "kb-3",
    title: "Why did my pay-in fail?",
    body: "The most common pay-in failure causes at DemoRemit are: insufficient funds, a daily card limit set by your bank, 3-D Secure verification not completed, or a name mismatch between the card and the DemoRemit account. Failed pay-ins are automatically refunded within 3–5 business days.",
  },
  {
    id: "kb-4",
    title: "How do exchange-rate locks work?",
    body: "When you start a DemoRemit transfer, the displayed EUR→INR rate is locked for 30 minutes. If your pay-in completes within that window, the locked rate applies. After it expires, the transfer is re-quoted at the current market rate before you confirm.",
  },
  {
    id: "kb-5",
    title: "Can I cancel a transfer?",
    body: "A DemoRemit transfer can be cancelled free of charge any time before the payout leaves for the recipient bank — usually within the first hour. Once the payout is dispatched, cancellation is no longer possible, but you can contact support for recall options.",
  },
  {
    id: "kb-6",
    title: "What are the transfer limits?",
    body: "DemoRemit's standard limits are €10,000 per transfer and €30,000 per rolling 30-day window after full KYC. Un-verified accounts are limited to a single €500 transfer. Higher limits are available on request with source-of-funds documentation.",
  },
  {
    id: "kb-7",
    title: "What fees does DemoRemit charge?",
    body: "DemoRemit charges no fixed fee on transfers above €100; below that, a €0.90 flat fee applies. The exchange rate shown includes the margin — there are no hidden recipient-side deductions, and the INR amount quoted is the amount delivered.",
  },
  {
    id: "kb-8",
    title: "My recipient hasn't received the money",
    body: "If a DemoRemit transfer shows 'Paid out' but the recipient can't see the funds, ask them to check the exact account statement — IMPS credits can appear under the partner bank's name. If it's been more than 4 hours since payout, support can raise a trace with the partner bank, which resolves within 2 business days.",
  },
];
