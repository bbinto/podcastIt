# Hybrid Pricing in SaaS 2026: Seats, Usage - Outcomes

> Source: https://www.saasmag.com/hybrid-pricing-saas-growth-2026/
> Date: 2026-04-20

---

The Rise of Hybrid Pricing: Why SaaS Companies Are Blending Seats, Usage, and Outcomes
BY SAAS MAG | APR 19, 2026 | BUSINESS, TECHNOLOGY

Seventy-nine companies in the PricingSaaS 500 Index now offer a credit-based pricing model, up from 35 at the end of 2024, a 126% year-over-year increase tracked by Kyle Poyar’s Growth Unhinged. Figma, HubSpot, and Salesforce all joined the list in 2025. This is not a pricing tweak. It is a structural shift in how SaaS companies capture value, and the companies doing it best are not choosing between subscriptions and consumption. They are combining them.

The per-seat model served SaaS well for two decades. It was simple, predictable, and easy to benchmark. But AI workloads do not scale by headcount. A single user can trigger thousands of API calls, token generations, or agent actions in minutes. Charging per seat for that kind of variable output creates a misalignment between what customers pay and the value they receive. Hybrid pricing, the blend of a subscription base with usage or outcome layers, is the model closing that gap.

What Hybrid Pricing Actually Looks Like
Hybrid pricing is not one model. It is a spectrum. At one end, a SaaS company charges a flat platform fee plus metered overage for specific features. At the other, it layers subscription access with credit-based consumption and outcome-based success fees.

Clay, the GTM data enrichment platform, is a clean example. It sells feature-gated tiers (subscription) but charges for data enrichment credits on top (usage). Customers know their base cost but pay more as they extract more value. Poyar’s analysis highlights Clay as a model for how credits can sit comfortably on top of a subscription without confusing buyers.

Datadog runs a different version. Its core monitoring product charges per host (a proxy for usage), but log management bills per GB ingested and APM charges per traced request. The result: Datadog generated $3.43 billion in revenue in 2025, up 28%, with multiple usage vectors expanding wallet share inside existing accounts.

Snowflake takes consumption further. Storage bills per terabyte, compute bills per second per warehouse, and there is no per-seat metric at all. That model helped Snowflake achieve a 158% net revenue retention rate, one of the highest in public SaaS.

The Numbers Behind the Shift
OpenView’s research shows more than 60% of SaaS companies now offer some form of usage-based billing, up from 27% in 2018. But pure usage-based is not the dominant move. According to Chargebee’s 2025 State of Subscriptions Report, 43% of companies use hybrid models today, with adoption projected to reach 61% by the end of 2026.

The performance gap is stark. Companies using hybrid pricing report 38% higher revenue growth and 38% higher net revenue retention compared to pure subscription firms. High-growth SaaS companies (40%+ year-over-year) using hybrid models show a 21% median growth rate, outperforming both pure subscription and pure consumption peers.

Among the top 500 SaaS and AI companies with transparent pricing, there were more than 1,800 pricing changes in 2025 alone, an average of 3.6 per company. That velocity tells you something: the industry has not settled on a single model. It is iterating in real time.

AI Is the Catalyst, Not the Cause
The pricing shift predates the AI wave. Twilio, AWS, and Stripe have run consumption models for over a decade. But AI has compressed the timeline. When your product can spin up autonomous agents that execute variable workloads, the gap between a flat per-seat fee and the actual infrastructure cost balloons.

Andreessen Horowitz notes that AI is driving “yet another and possibly more dramatic pricing shift” in SaaS. Even large enterprises are pushing for outcome-based structures, tying spend directly to results. The challenge: outcome-based pricing is still nascent. a16z’s field research found that despite the excitement, most companies have not adopted pure outcome-based models yet, though AI-agent companies show more traction with them.

Spending on AI-native SaaS applications surged 108% year-over-year according to Zylo’s 2026 SaaS Management Index. That growth creates a billing problem: seats do not capture the cost of tokens, context windows, tool calls, or agent steps. Bessemer Venture Partners flags new cost primitives like CPT (cost per thousand tokens), CPR (cost per resolved request), and CPAM (cost per agent minute) that are now driving pricing architecture decisions.

The Credit Model: Hybrid’s Breakout Mechanism
Credits have become the bridge between subscriptions and consumption. A credit is an abstraction layer: the customer buys a block of credits upfront (predictable for the buyer, committed revenue for the seller) and burns them against usage (aligned with value delivered).

HubSpot’s move is telling. The company added AI credits to its existing per-seat tiers in 2025, letting customers access AI-powered features without a separate billing line. Poyar calls this the “great re-bundling”: companies that launched AI as a paid add-on are now folding it into their core pricing via credits, reducing friction and increasing adoption.

Salesforce took a different path, introducing Agentforce credits priced per conversation. That model ties directly to the work the AI performs rather than the number of humans using the platform.

One caveat that gets overlooked: credits work best when the usage metric is intuitive to the buyer. If your customer cannot mentally map one credit to one unit of value, you end up with the same confusion that complex enterprise pricing has always created. The companies winning with credits are the ones whose value metric is obvious: one enrichment, one conversation, one generation.

Where Hybrid Pricing Falls Apart
Hybrid pricing is not a free lunch. Revenue predictability takes a hit. When 78% of IT leaders report unexpected charges on SaaS bills tied to consumption or AI pricing, you have a trust problem. Customers burned by surprise invoices renegotiate, churn, or demand caps, all of which erode the expansion revenue that makes hybrid attractive in the first place.

There is also a finance and ops burden. Metered billing requires real-time usage tracking, invoice reconciliation, and revenue recognition complexity that most early-stage SaaS companies are not staffed to handle. Bessemer notes that FinOps is becoming central to the business model for any company with AI in the product, adding headcount and tooling costs that eat into the margin gains hybrid pricing is supposed to deliver.

For enterprise SLG (sales-led growth) companies selling to procurement teams that demand annual commit pricing, a pure consumption layer can actually slow deal cycles. The hybrid structure works when the base subscription is large enough to satisfy procurement’s need for a PO-friendly number, with the usage layer treated as overage rather than the primary billing mechanism.

Building a Hybrid Model: The Operator’s Playbook
The companies making hybrid pricing work share a few patterns.

Start with the value metric. Lenny Rachitsky’s pricing framework emphasizes that the value metric, what you charge for, matters more than the price point. Per seat, per 1,000 visits, per GB, per transaction: the right metric scales naturally with customer success. If your metric does not correlate with the outcome the customer cares about, hybrid pricing will not save you.

Keep the base simple. The subscription layer should cover platform access and a baseline of functionality. The usage layer should be one metric, maybe two. OpenView’s research on UBP 2.0 found that 86% of SaaS companies valued above $100M employ at least three pricing dimensions, but those companies also have the go-to-market infrastructure to explain complex pricing. Most Series A and B companies do not.

Instrument before you price. You cannot charge for what you cannot measure. Dev tools show 78% adoption of consumption models in 2026 because API calls and compute hours are inherently measurable. If your product’s value metric is hard to track in real time, fix the instrumentation first.

Communicate proactively. Usage alerts, spend dashboards, and billing forecasts are not nice-to-haves. They are table stakes for any company charging by consumption. The 78% surprise-billing stat is a signal that the industry still has not solved the communication gap.

What Comes Next: The Swing Back Toward Simplicity
Poyar predicts that while the pendulum swung toward credits and complexity in 2025, 2026 will see a correction toward simplicity and predictability. That does not mean hybrid pricing goes away. It means the winners will be the companies that blend models without burdening the buyer with cognitive overhead.

SaaS Mag has covered pricing experimentation before, and the core principle holds: the best pricing model is the one your customer can explain to their CFO in one sentence. Hybrid pricing earns its complexity only when each layer maps to a value the buyer already understands.

The seat is not dead. As SaaS Mag’s pricing masterclass noted, scalable pricing means the price grows as usage and derived value grow. For many products, seats remain the most intuitive proxy for that growth. The shift is not away from seats entirely. It is toward layering additional capture mechanisms, usage, credits, outcomes, on top of a seat or platform base.

Gartner’s projection that 70% of businesses will prefer usage-based pricing over pure per-seat models by end of 2026 may prove directionally correct even if the number lands closer to 55% or 60%. The direction is clear. The speed depends on how quickly the billing infrastructure and customer communication catch up to the pricing ambition.

Frequently Asked Questions
What is hybrid pricing in SaaS?
Hybrid pricing combines a recurring subscription fee with one or more variable components tied to usage, credits, or outcomes. The subscription provides revenue predictability and covers baseline platform access, while the variable layer captures expansion revenue as customers consume more. This model is gaining traction because it aligns pricing with the value delivered, particularly for AI-powered features where per-seat billing does not reflect actual infrastructure costs or customer outcomes.

How does hybrid pricing affect net revenue retention?
Companies using hybrid pricing models report 38% higher net revenue retention compared to pure subscription firms, according to OpenView’s research. The usage component creates a natural expansion path: as customers adopt more features or process more volume, their spend increases without requiring a formal upsell or contract renegotiation. This built-in expansion mechanism is why Snowflake achieved 158% NRR and Datadog sustains strong net retention quarter after quarter.

Should early-stage SaaS companies adopt hybrid pricing?
It depends on your value metric and ops maturity. If your product has a clear, measurable usage dimension (API calls, data processed, tasks completed), hybrid pricing can accelerate growth. But metered billing adds complexity to revenue recognition, invoicing, and financial forecasting. Most Series A companies are better served starting with a simple subscription model, instrumenting usage data from day one, and layering consumption pricing once the go-to-market motion and billing infrastructure are solid.

What is the difference between usage-based pricing and credit-based pricing?
Usage-based pricing charges customers based on actual consumption measured in real time, such as per API call or per GB stored. Credit-based pricing adds an abstraction layer: customers purchase credits upfront at a fixed cost and then spend those credits against usage. Credits offer more revenue predictability for the vendor and more cost predictability for the buyer, which is why 79 of the top 500 SaaS companies now use credit models, up 126% from 2024.

Will per-seat pricing disappear in SaaS?
No. Per-seat pricing remains the most intuitive model for products where value scales with the number of users, including collaboration tools, CRMs, and project management software. What is changing is that companies are adding usage or credit layers on top of seat-based tiers rather than replacing seats entirely. The future is not seats versus usage. It is seats plus usage, with the balance shifting depending on how much of the product’s value comes from AI-driven, variable workloads versus human-driven workflows.