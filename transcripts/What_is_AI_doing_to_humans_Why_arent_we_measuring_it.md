# What is AI doing to humans? Why aren’t we measuring it?

> Source: https://tinyurl.com/2y5ue5tv
> Date: 2026-04-27

---

We measure AIs to see whether they can pass a bar exam, write working code, and use your computer interface. We test to see how good they are at completing complex tasks, or just impressing humans.

What we don’t have is a rigorous, credible way of evaluating what AI does to us. To our minds, our thoughts, or our communities.

We’ve been here before. At CHT, we spent years working on the psychosocial risks of social media, and the lesson of that work is uncomfortable: the cast-iron evidence came too late. By the time it was strong enough to act on, an entire generation grew up with technology systems that nobody had properly assessed. We believe that technology should strengthen our relationships, support our capacity to think, and help us make better decisions. Without measurement, it’s hard to tell whether we’re getting closer to that future, or further away.

AI has already been shown to validate suicidal ideation, reinforce delusional beliefs, and create patterns of emotional dependency. But we also know it can reduce the symptoms of depression, and support learning. AI, like any powerful technology, offers real benefits alongside harms – but it can sometimes be hard to tell the difference between the two at first glance.

CHT sees this as, in part, an evaluation challenge. And we think it’s a solvable one. Right now, the tools for evaluating AI’s psychosocial impacts aren’t good enough, the challenges in improving them are complex, and the cost of failure is growing – but in sharing our diagnosis, we’d like to invite others to work with us on the fix.

What gets measured gets fixed
Robust evaluations of AI genuinely do change how tech gets developed. That’s the opportunity.

AI capability benchmarks, for instance – standardized comparisons of what AI models can do – create a ‘race to the top’ dynamic. AI companies want their models to be known as the best, or most advanced – so they watch those rankings closely, invest in improving their scores, and compete to do better.

Safety evaluations are developing fast, too. AI labs routinely test for jailbreak resistance, chemical and biological risks, and various forms of bias. Major labs publish safety frameworks, and safety groups try to hold them to account.

Ideally, we’d have the same dynamic applied to the psychosocial impacts of AI. Imagine if different AIs were scored – transparently and rigorously – on how well they support critical thinking in their users, handle mental health crises, or foster human connection. That’s the kind of evaluation which drives innovation in AI capabilities like coding, or conversational ability – by comparison, we’ve barely scratched the surface of psychosocial evaluations.

Internal teams at AI labs are almost certainly conducting their own analyses – tracking concerning incidents, user welfare, and problematic AI responses. But since they’re not publishing their data or detailed methods, the rest of us can’t compare results across companies, replicate findings, build on their work, or hold them accountable. The information might exist, but it’s locked inside organisations which have little incentive to share it.

We need a credible, independent, and influential array of AI psychosocial evaluations. Demand for them is growing – everyone from courts to regulators, and parents to educators, are asking for exactly the kind of evidence that these evaluations would provide.

The human problem
So why don’t we have it yet?

There are three major, linked problems – all of them solvable, none of them solved. (If you’d rather hear about how we could solve them, skip ahead).

First, it’s hard for us to agree on what’s actually important to measure. Second, the measurement tools we’re using are new and unvalidated. And third, the infrastructure that would help us create new tools is still immature.

Here’s what that looks like in practice.

Let’s imagine you want to measure an AI psychosocial impact – like emotional dependency, delusional thinking, or the erosion of critical thinking. You quickly run into the fact that those aren’t AI phenomena – they’re impacts in humans. To measure them directly, we need to track people’s emotions, behaviors, and AI usage over time – which is possible, but takes the kind of time, money, and expertise that isn’t always easy to come by.

So you might focus on AI behavior instead – because we can observe when an AI is being extremely sycophantic or anthropomorphic, for instance, and predict whether those behaviors increase the risk of user harm. But sycophancy and anthropomorphism are still proxies for harm, not harm itself. The link is real but indirect, and proving causation takes a lot of time and money. We might be missing other types of harm entirely.

There’s an old joke about this type of measurement bias: a police officer sees a drunk man searching for his keys under a streetlight, and offers to help. After a fruitless search, the officer eventually asks the man if he’s sure he lost them there; the drunk replies ‘no, but this is where the light is‘.

The lesson is that the AI behaviors we can measure easily aren’t necessarily the ones that drive the greatest psychosocial impacts – they just happen to be where it’s easier to search.

But let’s assume we can do better than the drunkard, and can assure ourselves we’re looking in the right place for psychosocial impacts. That’s where we run into the technical challenges.

Many of the most influential AI benchmarks are ‘single turn’, for instance; you prompt an AI, it replies, and you score its response. But social or cognitive harms might evolve over dozens or hundreds of turns, so existing evaluation approaches aren’t always transferable.

Multi-turn evaluation tools, which examine how AIs respond over longer arcs, have been developed. They introduce their own challenges.

For example, to run a multi-turn evaluation of an AI chatbot conversation, you need to either have a different AI simulate the ‘human’ side of the conversation – or have the ‘human’ be scripted, sending the same prompts regardless of what the AI replies with.

The first path is a bit more realistic; the second gives you more standardization - but neither are great analogs for actual human-AI conversations. Studying real logs of human-AI conversations is another option – but those are hard to come by, tend to be dated, and may not be fully representative either.

Whichever path you choose, you then need to assess, score, and compare how well the AIs did across thousands and thousands of responses. This is far too many for humans to do well, so evaluators use another AI model to automate the judging process.

Even if you don’t have a philosophical problem with this – “AIs judging AIs?” – it throws up new issues. AI judges, just like human ones, have known biases – including a ‘self-preference’ bias, where an AI judge will be more sympathetic to the output of a model from its own family, even when it shouldn’t be able to tell who it’s scoring.

And if you crack that problem, there’s the additional question of whether you’re even testing the AI that you think you are.

Most evaluations use APIs, sending prompts directly to a model like “o4 mini” or “Sonnet 4.6”, and scoring the responses. But that’s not the same as interacting with AI via interfaces like chatgpt.com or claude.ai – OpenAI and Anthropic layer system prompts, UI design, and model selection on top, for instance. And potentially risky ‘companion AI’ platforms, like Character.AI, don’t offer research API access at all.

It’s not all bad news
Add all of this to the standard AI evaluation challenges – like Goodharting, and the fact that AIs are becoming aware of when they’re being evaluated – and it might sound like a disheartening list. But the good news is that there are plenty of exceptionally talented and driven people working on it.

A growing body of research is showing how AI models compare on everything from child safety to mental health crisis response, as well as sycophancy and anthropomorphism, for instance. New proofs-of-concept appear on arXiv regularly, and the range of impacts being studied is expanding fast.

Infrastructure is being built and shared, too. Anthropic’s BLOOM framework offers an open-source template for multi-turn behavioral evaluations. Projects like WildChat show imaginative ways around the data problem. The WeVal platform allows anyone to spin up an evaluation with zero technical knowledge, and MIT’s Advancing Humans with AI group is developing an Open Benchmarks framework for assessing human flourishing.

But… Most psychosocial evals are still built from scratch. Each is defining its own constructs, writing its own scoring rubrics, and inventing its own terminology. There’s little shared language for characterising what’s being measured, few shared standards for what counts as basic rigour, and no collective ways of accessing high-quality, anonymised interaction data.

This matters because – in the words of METR’s Ajeya Cotra – scientific validity is never the property of a single study. It’s the property of a field, where researchers can build on each other’s work, challenge each other’s assumptions, and converge on methods that earn trust through replication and scrutiny.

For psychosocial evaluations to rapidly and meaningfully influence AI deployment, we need a wider, better-connected community of researchers, technologists, and advocates who work together on measuring these impacts. And it’s needed soon.

We’ve seen this movie before
Today’s chatbots – like Claude, Grok, and ChatGPT, but also companion AIs like Character.AI and Replika – are mostly text-based, on-demand, and use a single model family. Measuring them is going to look simple, relative to what’s around the corner.

Coming generations of agentic AI products will be persistent, proactive, deeply personal, and multi-modal. They’ll be talking in our ears, managing our schedules, drafting our messages, and mediating our relationships. The psychosocial impacts will be more significant, and more complex.

The last time measurement lagged behind tech adoption, society paid the price. The risks of social media were flagged over a decade ago – depression, body image issues, the fracturing of our shared sense of reality. But by the time the evidence was strong enough to act on, the harms were entrenched, the platforms were enormous, and an entire generation of teenagers had grown up inside systems nobody had properly evaluated. The risk now is that AI psychosocial research repeats the same mistakes: not measuring the right things, confusing correlation with causation, and not producing the evidence required in time to support meaningful policy changes.

Social media took years to reach mass adoption. ChatGPT reached 100 million users in two months. The harms are showing up faster, the adoption curve is steeper. So how do we all act differently?

Diagnosis to action
Our short answer is that we need a new interdisciplinary field of psychosocial AI evaluations – one that has genuine independence from AI developers, broad alignment on what needs to be measured, shared methods for doing so, and findings that are robust enough to influence AI use and development.

Since our inception, CHT has argued that technology should be a force for good in our society. Our role has been to provide clarity, foster agency, and elevate debate that makes that vision possible. When it comes to psychosocial evaluations, we want to do that by helping promote and accelerate this field, in partnership with anyone who shares our goals.

In practice, we see a chain of things that needs to happen.

Evaluations need to be designed around the impacts that matter – not just the data that’s easy to measure. The evidence they produce needs to be credible and legible enough for non-experts to act on. That requires shared infrastructure: common tools, shared data, and a connected community that can critique and build on each other’s work. And the findings need to reach the people who can do something with them – policymakers, safety teams, journalists, the public – so that companies face genuine pressure or rewards.

We’re starting with concrete steps: assembling a small steering group of researchers and practitioners to map the field and identify where targeted interventions – perhaps starting with improving shared research access to data – might make the biggest difference. We’re building our own psychosocial evaluation prototype to learn firsthand what the real methodological challenges are. And we know we need help.

Who’s in?
This nascent field needs researchers who can extend their methods into new territory, safety teams willing to share insights that are currently locked away, clinicians who understand AI harm pathways, tool-builders who can create reusable infrastructure, and many more.

We see this as a tractable, solvable problem if the right people work on it together. So over the coming months, we’ll be sharing more of what we’re learning and doing. Please treat this as an invitation to do the same.

If you’re working on any of this – or want to be – we’d love to hear from you.

Rigorous evaluation is how we replace intuition and instinct with empirical evidence. It’s how we get to a version of the future where AI genuinely supports our wellbeing, dignity, and agency – not because we crossed our fingers and hoped, but because we worked together to establish that it did.