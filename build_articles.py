import os

ROOT = "."
DS = f"{ROOT}/_ds/pa-consulting-design-system-c8c638d2-e948-4822-ae72-4e0cf94e9fb4"
OUT_DIR = f"{ROOT}/netlify-deploy"
SITE_NAME = "NewCo Community"
LOGO_HREF = "../uploads/pa-logo.png"

def read(path):
    return open(path, encoding="utf-8").read()

fonts_css = read(f"{DS}/tokens/fonts.css")
colors_css = read(f"{DS}/tokens/colors.css")
typography_css = read(f"{DS}/tokens/typography.css")
spacing_css = read(f"{DS}/tokens/spacing.css")

NAV = [
    ("Home", "index.html", "home"),
    ("Events", "events.html", "events"),
    ("Emerging practices", "emerging-practices.html", "hub"),
    ("Case studies", "case-studies.html", "insights"),
    ("Community voices", "community-voices.html", "voices"),
    ("About", "about.html", "about"),
]

def nav_html(active_key):
    items = []
    for label, href, key in NAV:
        active = key == active_key
        color = "#FFFFFF" if active else "var(--pa-grey-02)"
        weight = 450 if active else 400
        underline = "#EA0027" if active else "transparent"
        items.append(
            f'<a href="../{href}" style="font:{weight} 15px/1 var(--font-primary);color:{color};'
            f'text-decoration:none;border-bottom:2px solid {underline};cursor:pointer;padding:8px 1px 10px;'
            f'transition:color 0.15s;">{label}</a>'
        )
    return "\n      ".join(items)

def page_shell(title, active_key, body_html):
    return f'''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — {SITE_NAME}</title>
<style>
{fonts_css}
</style>
<style>
{colors_css}
</style>
<style>
{typography_css}
</style>
<style>
{spacing_css}
</style>
<style>
  body{{margin:0;background:#FFFFFF;font:400 16px/1.6 var(--font-companion);color:var(--pa-dark-blue);-webkit-font-smoothing:antialiased;}}
  a{{color:#EA0027;}}
  a:hover{{color:#C40021;}}
  :focus-visible{{outline:3px solid #EA0027;outline-offset:2px;}}
  img{{max-width:100%;}}
  @media (prefers-reduced-motion:reduce){{*{{transition-duration:0.01ms !important;animation-duration:0.01ms !important;}}}}
</style>
</head>
<body>
<header role="banner" style="position:sticky;top:0;z-index:50;background:var(--pa-dark-blue);border-bottom:1px solid rgba(255,255,255,0.08);">
  <div style="max-width:1240px;margin:0 auto;padding:8px clamp(20px,5vw,48px);min-height:52px;display:flex;align-items:center;gap:20px 28px;flex-wrap:wrap;">
    <a href="../index.html" style="display:flex;align-items:baseline;gap:14px;text-decoration:none;padding:0;">
      <img src="{LOGO_HREF}" alt="PA Consulting" style="height:34px;width:auto;display:block;align-self:center;">
    </a>
    <nav aria-label="Primary" style="display:flex;gap:12px 22px;margin-left:auto;flex-wrap:wrap;">
      {nav_html(active_key)}
    </nav>
  </div>
</header>
<main id="main-content" role="main">
{body_html}
</main>
<footer role="contentinfo" style="background:var(--pa-dark-blue);border-top:1px solid rgba(255,255,255,0.08);">
  <div style="max-width:1240px;margin:0 auto;padding:40px clamp(20px,5vw,48px) 24px;">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:32px;">
      <div>
        <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:12px;">
          <img src="{LOGO_HREF}" alt="PA Consulting" style="height:30px;width:auto;display:block;align-self:center;">
        </div>
        <p style="font:400 14px/1.7 var(--font-companion);color:var(--pa-grey-02);max-width:320px;margin:0;">A practitioner-led forum for UK government leaders, convened by PA Consulting.</p>
      </div>
      <div>
        <nav aria-label="Footer" style="display:flex;flex-direction:column;gap:6px;align-items:flex-start;">
          {"".join(f'<a href="../{href}" style="font:400 14px/1.4 var(--font-companion);color:var(--pa-grey-02);text-decoration:none;padding:0;">{label}</a>' for label, href, key in NAV)}
        </nav>
      </div>
      <div>
        <div style="font:400 13px/1.6 var(--font-primary);color:var(--pa-grey-02);">newco.community@paconsulting.com<br>10 Bressenden Place<br>London SW1E 5DN</div>
      </div>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.08);margin-top:28px;padding-top:16px;display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;">
      <span style="font:400 12px/1 var(--font-primary);color:var(--pa-grey-02);">© 2027 PA Knowledge Limited. All rights reserved.</span>
      <span style="font:400 12px/1 var(--font-primary);color:var(--pa-grey-02);">Events run under the Chatham House Rule.</span>
    </div>
  </div>
</footer>
</body>
</html>
'''

def eyebrow(text):
    return f'<div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin-bottom:20px;">{text}</div>'

def back_link(label, href):
    return (f'<a href="{href}" style="display:inline-block;font:400 13px/1 var(--font-primary);'
            f'letter-spacing:0.04em;color:var(--pa-grey-02);text-decoration:none;margin-bottom:32px;">← {label}</a>')

def paragraphs(text, color="var(--pa-dark-blue)"):
    parts = [p.strip() for p in text.split("\n\n") if p.strip()]
    return "\n".join(
        f'<p style="font:400 17px/1.7 var(--font-companion);color:{color};margin:0 0 18px;max-width:700px;">{p}</p>'
        for p in parts
    )

# ---------------------------------------------------------------------------
# ARTICLE TEMPLATE: emerging-practices / case-studies (simple article layout)
# ---------------------------------------------------------------------------

def simple_article(section_label, section_href, title, meta_line, body_text):
    return f'''
  <section style="background:var(--pa-grey-01);padding:clamp(44px,6.5vw,72px) 0 clamp(36px,5vw,56px);">
    <div style="max-width:840px;margin:0 auto;padding:0 clamp(20px,5vw,48px);">
      {back_link("All " + section_label.lower(), section_href)}
      {eyebrow(section_label)}
      <h1 style="font:400 clamp(28px,4.6vw,42px)/1.15 var(--font-primary);color:var(--pa-dark-blue);margin:0;text-wrap:pretty;">{title}</h1>
      <div style="font:400 13px/1.6 var(--font-primary);color:var(--pa-grey-04);margin-top:22px;">{meta_line}</div>
    </div>
  </section>
  <section style="background:#FFFFFF;padding:clamp(40px,6vw,64px) 0 clamp(48px,7.5vw,88px);">
    <div style="max-width:840px;margin:0 auto;padding:0 clamp(20px,5vw,48px);">
      {paragraphs(body_text)}
      <div style="border-top:1px solid var(--pa-grey-01);margin-top:36px;padding-top:24px;">
        {back_link("Back to " + section_label, section_href)}
      </div>
    </div>
  </section>
'''

# ---------------------------------------------------------------------------
# DATA
# ---------------------------------------------------------------------------

STAGES = [
    {
        "tab": "Establishing", "num": "01 / ESTABLISHING", "title": "Establishing a NewCo",
        "items": [
            {"slug": "when-newco-is-the-right-choice", "title": "When NewCo is the right choice", "read": "9 min read",
             "body": "Structural separation looks attractive to almost every department wrestling with legacy technology, fragmented accountability or a capability gap that in-place transformation hasn't closed. That doesn't mean it's the right answer.\n\nNewCos outperform in-place transformation when three conditions hold together: the constraint is structural rather than merely operational (a legacy system or governance model that no amount of extra funding will fix from inside), the mandate can be genuinely delegated (decision rights, funding and hiring authority actually move, not just an org chart box), and the department is prepared to tolerate the visible cost of separation — duplicate functions, a harder integration path back, and a period where the NewCo looks slower before it looks faster.\n\nThe warning signs that separation is the wrong answer are just as diagnostic. If the underlying problem is a leadership or prioritisation failure rather than a structural one, a NewCo will reproduce it in a new building with a new logo. If the sponsoring department isn't willing to let go of day-to-day control, the NewCo becomes a satellite office, not a separate organisation — and inherits the department's constraints without gaining its own authority. And if there's no credible reintegration plan from day one, the NewCo risks becoming a permanent transformation island: useful in isolation, disconnected from the system it was meant to change.\n\nThe community's Readiness Assessment (see Frameworks and tools) turns these conditions into seven scored criteria a leadership team can work through with a board — not to produce a yes/no answer, but to make the trade-offs explicit before the business case is written, not after."},
            {"slug": "diagnostic-criteria", "title": "Diagnostic criteria", "read": "7 min read",
             "body": "Not every delivery problem is a structural one, and treating a leadership or funding problem as if it were will waste the disruption of separation without fixing anything. The community has converged on seven tests that hold up across the transformations represented here.\n\nLegacy estate: is the technology itself the constraint, or is it a symptom of underinvestment that new funding could fix in place? Accountability: are decision rights genuinely fragmented across multiple sign-off chains, or is there a single accountable owner who simply isn't using their authority? Capability: is the skills gap structural — a pay and grading model that can't compete for the roles you need — or a hiring-plan problem? Funding: does the annual budget cycle itself prevent the pace of delivery you need, regardless of who holds the budget? Pace: would removing one layer of governance meaningfully change delivery speed, or is the bottleneck elsewhere? Culture: is the risk appetite mismatch severe enough that no amount of internal championing will shift it? Mandate: can the sponsoring department actually articulate what it's willing to delegate, in writing, before day one?\n\nA genuine case for separation clears most of these; a shaky one clears one or two and hopes the rest follow. Score honestly, and be prepared for the answer to be no — several departments represented in this community concluded a structural fix wasn't justified and pursued in-place transformation instead, successfully."},
            {"slug": "business-case-development", "title": "Business case development", "read": "11 min read",
             "body": "A NewCo business case fails for a predictable reason: it frames separation as the ambition rather than as one option among several, and Treasury reviewers notice immediately. The business cases that clear scrutiny do three things well.\n\nFirst, they cost a genuine comparator — usually in-place transformation with equivalent investment — rather than comparing separation against doing nothing. A NewCo that only looks good next to inaction won't survive a second reading.\n\nSecond, they frame benefits in terms a board can hold the organisation to later: specific decisions that will be made faster, specific capability that will exist that doesn't today, specific technical debt that will be retired on a stated date. Vague benefits like “agility” or “pace” invite vague accountability.\n\nThird, and most often missing, they cost the option of not separating — the compounding cost of the status quo, including the opportunity cost of continuing to fail to hire and retain technical talent at current pay bands. Boards under-weight this because it's a counterfactual, not a line item, but it is frequently the single biggest number in the case.\n\nThe strongest cases also name what the department is giving up — some control, some visibility, some ability to redirect resource at will — and treat that honestly as a cost, not a footnote. Reviewers trust a case more when it doesn't oversell."},
            {"slug": "leadership-models", "title": "Leadership models", "read": "8 min read",
             "body": "The leadership team that gets a NewCo off the ground is rarely the one that should run it in three years, and pretending otherwise causes some of the most damaging churn this community sees.\n\nFounding leadership needs a specific, unusual profile: comfortable with ambiguity, willing to build governance and culture from nothing, and politically capable enough to hold the sponsoring department's confidence while the NewCo is at its most fragile and least proven. That combination is genuinely rare, and boards should expect to pay for it.\n\nThe skills that matter change once the organisation exists. A NewCo two years in needs leadership that can run a functioning business — operating rhythms, a scaling org design, a measurement discipline — more than it needs a builder. Several organisations represented in this community kept their founding CEO past this transition and paid for it in stalled scaling; others planned the handover from the start and moved faster for it.\n\nThe practical implication: write the leadership transition into the founding business case, not as a contingency but as an expected event, with a defined trigger (a stage gate, a headcount threshold, a service go-live) rather than a fixed date. That gives the founding leader a dignified, planned exit and gives the board a decision point instead of a crisis."},
        ],
    },
    {
        "tab": "Incubating", "num": "02 / INCUBATING", "title": "Incubating a NewCo",
        "items": [
            {"slug": "governance-design", "title": "Governance design", "read": "10 min read",
             "body": "Governance is the design problem every NewCo underestimates at the start and over-corrects on by year two. Get the delegation framework wrong in either direction and the organisation either runs ahead of its accountability or drowns in the approval structures it was built to escape.\n\nThe boards that work well in this community share a pattern: a small number of genuinely delegated decisions (day-to-day delivery, technical architecture within agreed parameters, most hiring) sit clearly with NewCo leadership, while a short, explicit list of reserved matters (major funding changes, strategic direction, anything with material reputational risk to the parent department) sits with the board. The failure mode isn't having reserved matters — every NewCo needs some — it's leaving the boundary implicit and re-litigating it decision by decision.\n\nEscalation routes matter as much as delegation. The clearest boards define, in writing, what triggers an escalation (a cost overrun threshold, a delivery slippage of a stated size, a ministerial interest) rather than leaving it to judgement calls that erode trust when they're made too late or too often.\n\nBoard composition is the visible part but not the hardest part: the departments that got this right included at least one non-executive with genuine delivery experience outside government, specifically to stress-test delivery-versus-governance trade-offs the rest of the board wouldn't otherwise surface."},
            {"slug": "digital-office-design", "title": "Digital office design", "read": "9 min read",
             "body": "A Digital Office should be the part of a NewCo that makes delivery faster. In four transformations compared for this community, it just as often became the part that slowed delivery down — recreating, inside the NewCo, the approval bureaucracy the NewCo was meant to escape.\n\nThe pattern that distinguished the Digital Offices that worked: they behaved as a service to delivery teams rather than a control function over them. Standards existed, but as “paved roads” that made the right choice the easy choice, not toll booths that gated every decision through a review board. Authority was earned through usefulness — teams adopted the Digital Office's platforms and patterns because they were genuinely faster than building it themselves, not because policy required it.\n\nThe Digital Offices that struggled shared a different pattern: they were resourced and structured like a policy function — writing standards, running governance forums, reviewing architecture decisions — without also carrying delivery accountability of their own. Without skin in the game, standards drift toward what's easy to write rather than what's useful to build with.\n\nRecruiting technical leadership into government pay structures remains the hardest practical constraint. The Digital Offices that succeeded generally solved this by co-locating specialist roles with delivery teams rather than centralising them, which also made architectural decisions materially faster to reach."},
            {"slug": "capability-development", "title": "Capability development", "read": "8 min read",
             "body": "Every NewCo starts leaning on contractors, and every NewCo that scales successfully has a deliberate plan for when to stop. The organisations in this community that got the balance wrong tended to fail in one of two directions: never building permanent capability at all, or cutting contractors before permanent capability was actually ready to carry the work.\n\nThe useful signal isn't a headcount ratio, it's a capability test: can a permanent team member explain, unprompted, why a system was built the way it was — not just how to operate it? Contractor-heavy teams routinely pass the “how” test and fail the “why” test, and that gap is where institutional knowledge quietly leaves with the contract.\n\nRecruiting technical leadership permanently into government pay structures is the binding constraint almost everyone names first. The NewCos that made progress didn't wait for pay reform; they redesigned the role instead — genuine technical authority, a real seat in decision-making, and a mandate that a specialist can point to when explaining the job to peers outside government. Money matters, but several strong hires in this community's experience were won on mandate and autonomy where pay alone couldn't compete.\n\nThe transition plan works best when it's staged publicly — contractors know from the outset which capabilities are being transferred, and to whom, rather than discovering it at contract renewal."},
            {"slug": "culture-and-ways-of-working", "title": "Culture and ways of working", "read": "7 min read",
             "body": "The whole point of a NewCo is that it works differently from its parent department — different pace, different risk appetite, different hiring, sometimes a different physical location entirely. That difference is also exactly what makes the parent department nervous, and managing that tension well is a genuine skill, not a one-off conversation.\n\nThe NewCos that sustained a distinct culture without losing the parent department's confidence did two things consistently. They were explicit and narrow about what was different and why — “we ship weekly and we hire on a faster timeline, and here is the governance that keeps that safe” — rather than presenting difference as a general licence. And they over-invested in visible, regular reporting back to the parent, treating transparency as the price of autonomy rather than a bureaucratic tax.\n\nWhere this went wrong, it usually went wrong quietly: the NewCo drifted culturally further from the parent department than anyone had agreed to, the parent found out through an incident rather than a conversation, and the response was a wave of new controls that undid much of the autonomy that made the NewCo effective in the first place.\n\nThe practical lesson: renegotiate the cultural mandate periodically and explicitly, on a cadence, rather than letting it evolve by accretion and be corrected by crisis."},
        ],
    },
    {
        "tab": "Scaling", "num": "03 / SCALING", "title": "Scaling a NewCo",
        "items": [
            {"slug": "operating-model-evolution", "title": "Operating model evolution", "read": "10 min read",
             "body": "The operating model that gets a NewCo through incubation is, almost by design, not the one that should run it at scale — and several organisations in this community lost a year or more by not recognising the moment the two diverged.\n\nIncubation-stage operating models are necessarily improvised: a small number of people carrying broad responsibilities, informal coordination substituting for formal process, decisions made quickly because the group making them is small enough to fit in a room. That's a feature during incubation. At scale, the same pattern becomes a bottleneck — the same small group is now a queue, and informal coordination becomes invisible dependency that new joiners can't see or navigate.\n\nThe restructuring that worked best in this community's experience wasn't a single reorganisation but a staged one: formalising decision rights and team boundaries function by function, as each function actually hit its scaling limit, rather than redesigning the whole organisation pre-emptively based on a headcount forecast. Pre-emptive restructures tended to guess wrong about where the real bottlenecks would appear.\n\nThe momentum risk is real and worth naming directly: any restructuring signals uncertainty to a delivery organisation mid-flow. The NewCos that managed this best paired each structural change with a concrete, visible delivery commitment in the same announcement, so the change read as “we're organising to deliver more” rather than “things aren't working.”"},
            {"slug": "funding-models", "title": "Funding models", "read": "9 min read",
             "body": "A NewCo funded like a programme — annual settlements, business-case-by-business-case approval for anything new — will behave like a programme indefinitely, no matter how its org chart looks. Twelve departments compared their funding models for this community, and the shift to something more sustainable followed a consistent pattern.\n\nThe departments that moved successfully to business-style funding generally secured a multi-year settlement (typically three years) covering core running costs, with a separate, faster-moving mechanism for discretionary or opportunity-led spend that didn't require a full business case each time. That combination gave NewCo leadership the planning stability a business needs while keeping Treasury's appetite for scrutiny satisfied on the spend that actually carried risk.\n\nThe harder, more political shift was moving away from being funded to deliver a fixed portfolio of projects, and toward being funded to run a service — with funding tied to outcomes and service levels rather than to a list of deliverables. This mattered because project funding structurally discourages the kind of ongoing platform investment and technical debt paydown that keeps a delivery organisation healthy past its first few years.\n\nNone of the twelve achieved this in one step. The realistic path was renegotiating funding structure at each spending review, using delivery evidence from the previous settlement as the case for more flexibility in the next."},
            {"slug": "service-expansion", "title": "Service expansion", "read": "7 min read",
             "body": "The question every scaling NewCo faces is not whether to take on more services, but which ones, in what order — and the organisations in this community that got this wrong nearly all made the same mistake: sequencing by political demand rather than by absorption capacity.\n\nAbsorption capacity is a real, measurable limit: how many new services a delivery organisation can bring in and stabilise without degrading the services it already runs. It's driven by the depth of your platform (how much genuinely reusable infrastructure exists versus how much each new service needs built from scratch), the maturity of your delivery patterns, and — the constraint everyone underestimates — the capacity of your existing teams to onboard and mentor new colleagues without their own delivery slowing.\n\nThe sequencing that worked best prioritised services with the highest platform reuse first, building absorption capacity for later, harder services rather than spending it on the easiest wins. It also meant saying no, or not yet, to services that were politically attractive to bring in early but had little in common technically with what the NewCo already ran.\n\nThe practical tool several organisations adopted: a simple scoring model — platform reuse, delivery complexity, political urgency — reviewed with the board each time a new service is proposed, so sequencing decisions are visible and defensible rather than made ad hoc under pressure."},
            {"slug": "measuring-outcomes", "title": "Measuring outcomes", "read": "6 min read",
             "body": "Delivery milestones are comfortable to report and almost useless for judging whether a NewCo is succeeding. Every organisation in this community that made the shift to outcome measurement describes the same uncomfortable first step: the first honest baseline is worse than anyone expected, because milestone reporting had been quietly flattering performance for years.\n\nThe shift itself is conceptually simple — measure what the service actually does for its users (processing time, error rates, user-reported satisfaction, cost per transaction) rather than whether planned work was delivered on schedule — but it's organisationally hard, because it exposes gaps that milestone tracking had never surfaced. Teams that had been “on track” against every plan discovered their actual service performance was mediocre, and had to explain that to a board used to green status reports.\n\nThe NewCos that navigated this well treated the first outcome baseline explicitly as a reset, not a failure — communicating to the board in advance that the new measurement approach would likely show a worse starting picture, and that this was evidence the new approach was working, not that delivery had gotten worse.\n\nOnce baselined, outcome measurement changes what gets prioritised: work that improves a measured outcome earns attention regardless of whether it was in the original plan, and milestone-complete work that hasn't moved the outcome gets scrutinised rather than celebrated."},
        ],
    },
    {
        "tab": "Reintegration", "num": "04 / REINTEGRATION AND TRANSITION", "title": "Reintegration and transition",
        "items": [
            {"slug": "capability-transfer", "title": "Capability transfer", "read": "9 min read",
             "body": "Capability transfer almost never happens on the timeline anyone plans, and the NewCos in this community that transferred capability successfully share one trait: they started while the NewCo was still working well, not once winding-down had already begun.\n\nThe reasoning is straightforward once stated: capability that's still actively used is easier to document, easier to teach, and attached to people who are still motivated to explain it. Capability transfer attempted during wind-down competes with a team that's disengaged, uncertain about their own futures, and reasonably focused on what comes next for them rather than on knowledge transfer.\n\nThree things move in a genuine capability transfer, and treating them separately makes the whole exercise more tractable: people (who moves into the parent organisation, in what role, and how their pay and grading reconciles with permanent civil service structures), practices (the ways of working — delivery cadence, decision-making patterns, technical standards — that the parent organisation adopts, adapts, or explicitly declines), and platforms (the actual technical systems, and who owns and funds them once the NewCo's funding line ends).\n\nThe organisations that transferred well treated platform ownership as the hardest of the three and addressed it earliest — a system with no clear post-transfer owner becomes unsupported within months, regardless of how well the people and practices transfer."},
            {"slug": "organisational-adoption", "title": "Organisational adoption", "read": "8 min read",
             "body": "Reintegration is usually described as the NewCo transferring capability back to its parent department, which quietly assumes the parent department doesn't itself need to change to receive it. Every successful reintegration in this community disproves that assumption.\n\nA department that hasn't changed its funding cycles, hiring structures, or risk appetite in the years since it spun out a NewCo is not equipped to absorb the ways of working that NewCo developed — not because the department is unwilling, but because the structures that made separation necessary in the first place are usually still there. Reintegrating a fast-moving delivery capability into an unchanged department tends to produce one of two outcomes: the department slows the capability down to match its own pace, or the capability is quarantined as a special exception that never really integrates.\n\nThe departments that adopted well treated reintegration as a joint transformation programme, with its own sponsorship and its own changes on the department side — usually to funding flexibility, to how technical roles are graded, or to which decisions require ministerial-level sign-off versus delegated authority. This is politically harder than it sounds, because it asks the parent department to admit that some of its own structures need to change, not just receive what the NewCo built.\n\nDepartments that treated reintegration as one-sided consistently reported the transferred capability degrading within eighteen months."},
            {"slug": "operating-model-convergence", "title": "Operating model convergence", "read": "7 min read",
             "body": "Every reintegration involves a negotiation nobody quite wants to have: which parts of the NewCo's operating model bend to fit departmental standards, and which parts of the department should change to keep what the NewCo built. Treating this as a one-way convergence — the NewCo simply adopts departmental standards — is the single most common way reintegrations quietly undo years of improvement.\n\nThe organisations that navigated this well started by categorising, not negotiating: which practices were genuinely NewCo-specific (justified by the separation itself, and reasonably expected to converge back), which were generically better ways of working that had simply never been tried in the department, and which were context-specific to the NewCo's smaller scale and wouldn't survive contact with departmental scale regardless of merit.\n\nThe second category is where the real value transfer happens and where departments most often fumble it — treating a demonstrably better practice as “how the NewCo does things” rather than adopting it as how the department should do things now. Delivery cadence, decision-making patterns, and technical standards all fell into this category more often than expected.\n\nThe practical mechanism that worked: a joint convergence review, sponsored jointly by NewCo and department leadership, working through each practice explicitly rather than letting convergence happen by default toward whichever side has more institutional inertia — which, without a joint process, is almost always the department."},
            {"slug": "avoiding-transformation-islands", "title": "Avoiding transformation islands", "read": "8 min read",
             "body": "The most dangerous outcome for a NewCo isn't failure — it's success without reintegration. A NewCo that delivers well, indefinitely, but never transfers what it learned back into the wider organisation becomes a transformation island: an impressive, permanently separate exception that the rest of government can point to but never actually learn from.\n\nTransformation islands form gradually and for understandable reasons. Success reduces the pressure to reintegrate — why disrupt something that's working? The NewCo's leadership, quite reasonably, has little incentive to plan their own organisation's dissolution or absorption. And the parent department, having delegated a hard problem successfully, has little incentive to reopen it. Every incentive in the system points toward comfortable, permanent separation.\n\nThe community's clearest finding on this: reintegration planning has to be built into the NewCo's founding mandate, with a genuine trigger — a time horizon, a maturity milestone, a stated review point — rather than left as an open-ended possibility that depends on someone eventually deciding to raise it. NewCos founded with an explicit reintegration or transition clause reintegrated meaningfully more often than those founded without one, even when the clause itself was later renegotiated.\n\nThe uncomfortable question every NewCo board should ask periodically: if this organisation is still fully separate in five years, was that a plan, or did it just happen because nobody chose otherwise?"},
        ],
    },
]

INSIGHTS = [
    {"slug": "why-newcos-succeed-and-why-they-fail", "theme": "Operating models", "title": "Why NewCos succeed — and why they fail",
     "author": "Helen Carver", "role": "PA Consulting", "date": "2 July 2027", "read": "12 min read",
     "body": "A decade of government NewCos gives this community something rare: enough comparable cases to ask, with some confidence, what actually determines whether structural separation succeeds. The answer is less about structure than most business cases assume.\n\nEvery NewCo examined for this piece got faster immediately after separation — that part of the promise reliably delivers. Fewer sign-offs, a smaller leadership group, and the simple psychological effect of a fresh start all buy real pace in the first year. What separated the NewCos that sustained that speed from the ones that lost it within eighteen months wasn't the structure they were given, but the judgement of the leadership team that inherited it.\n\nSpecifically: the NewCos that succeeded made a small number of hard, early calls correctly — on leadership succession, on funding structure, on which services to take on first — and treated those calls as decisions to revisit deliberately rather than defaults to drift with. The NewCos that struggled tended to make the same category of decisions by inertia: keeping the founding CEO past the point they were the right leader for the stage, accepting whatever services were politically convenient to absorb rather than what the organisation could actually absorb well, and letting funding structures set at launch persist unquestioned for years.\n\nStructural separation, in other words, is necessary but not sufficient. It removes some genuine constraints and creates new degrees of freedom — but converting that freedom into sustained delivery improvement depends on the judgement calls that follow, most of which have nothing to do with the org chart. Departments considering a NewCo should spend as much diligence on who will lead it and how it will be governed as on the case for separating it at all."},
    {"slug": "the-reintegration-challenge", "theme": "Culture", "title": "The reintegration challenge: why NewCos must plan their own ending",
     "author": "Rachel Donnelly", "role": "PA Consulting", "date": "18 June 2027", "read": "10 min read",
     "body": "Ask a NewCo's founding team what happens at the end of the organisation's life, and the most common honest answer is: nobody has really decided. That gap — between an organisation built with urgency and an ending planned with none — is where this community has seen the most capability quietly lost.\n\nThe pattern is consistent across the cases examined: NewCos that wrote a reintegration or transition clause into their founding mandate, however loosely specified at the time, reintegrated meaningfully more often than those that left it open-ended. The clause itself mattered less than the fact of its existence — it gave leadership, department sponsors and the NewCo's own staff a shared expectation that separation was a stage, not a permanent state, and that expectation shaped decisions years before reintegration actually began.\n\nWhere reintegration wasn't planned from day one, it tended to happen only under pressure — a change in political priority, a funding cut, a change of sponsoring minister — at which point the NewCo had little runway to transfer capability well. People had built careers assuming permanence, platforms had no documented ownership plan, and practices that had genuinely improved on departmental standards were absorbed hastily or lost entirely.\n\nThe practical recommendation from every case reviewed here is the same: write the reintegration trigger into the founding business case, even provisionally, and revisit it at each major review point rather than leaving it for a future leadership team to decide under pressure."},
    {"slug": "building-product-organisations", "theme": "Evidence", "title": "Building product organisations within government",
     "author": "Aisha Rahman", "role": "PA Consulting", "date": "4 June 2027", "read": "9 min read",
     "body": "Product operating models promise continuous, outcome-led delivery. Government accountability structures are built around discrete, milestone-based programmes with a defined start and end. The collision between the two is not a communication problem that better change management fixes — it's a genuine structural mismatch, and most attempts to run “product teams” inside programme governance eventually revert to programme behaviour by default.\n\nThe organisations that sustained genuine product ways of working made the mismatch visible rather than trying to paper over it. They negotiated funding in outcome-based terms rather than milestone-based terms specifically so that programme-style reporting wouldn't pull delivery back toward a fixed scope. They accepted that some standard government reporting — the kind that assumes a project with an end date — simply didn't fit, and negotiated a different reporting format rather than forcing product delivery into programme reporting templates.\n\nThe hardest part, consistently, was accountability for outcomes that emerge gradually rather than milestones that complete on a date. Programme governance is built to ask “is this on track against the plan”; product governance has to ask “is this getting better,” which is a harder question for a board to hold someone accountable against, and requires genuinely different reporting muscle.\n\nWhere this worked, it worked because senior sponsors explicitly protected the product teams from being pulled back into programme reporting by default — a protection that had to be renewed deliberately at each funding cycle, not assumed to be permanent."},
    {"slug": "digital-office-patterns", "theme": "Digital Office", "title": "Digital Office patterns",
     "author": "Marcus Bell", "role": "Community contribution", "date": "21 May 2027", "read": "11 min read",
     "body": "Every NewCo in this comparison built a Digital Office. Only some of them built one that made delivery faster. The difference wasn't resourcing or seniority — it was whether the Digital Office carried delivery accountability of its own, or only wrote standards for others to follow.\n\nThe Digital Offices that served delivery well had real delivery responsibilities: they owned platforms teams actually used, they were measured on whether teams adopted their standards voluntarily rather than on whether standards existed, and their staff sat close to — sometimes embedded within — the delivery teams they supported. Standards earned adoption because they were the fastest path to shipping, not because policy mandated them.\n\nThe Digital Offices that quietly became bureaucracy had the opposite structure: a policy and governance function, measured on standards written and reviews completed, with no delivery outcome of its own to be judged against. Every incentive in that structure points toward writing more comprehensive standards and running more thorough reviews — activity that looks like rigor and functions as friction.\n\nThe clearest lesson from comparing four Digital Offices directly: ask what a Digital Office is accountable for, not what it's responsible for. A Digital Office accountable only for the existence of good standards will optimise for exactly that. One accountable for delivery speed, with standards as one of its tools, behaves completely differently — and that accountability, more than any specific standard or platform choice, predicted which Digital Office teams actually wanted to work with."},
    {"slug": "governance-lessons-from-transformation-programmes", "theme": "Governance", "title": "Governance lessons from transformation programmes",
     "author": "David Achebe", "role": "PA Consulting", "date": "7 May 2027", "read": "10 min read",
     "body": "Governance structures look robust on a board pack and get tested for real only under pressure — a cost overrun, a delivery failure, a change of minister. This piece compares governance frameworks across several transformation programmes specifically at the moments they were tested, rather than at the moment they were designed, because that's where the real lessons are.\n\nDelegation frameworks that looked clear on paper frequently turned out to be ambiguous exactly where it mattered: reserved matters lists that hadn't anticipated the specific situation now in front of the board, forcing an improvised escalation under time pressure that eroded confidence on both sides regardless of the outcome. The frameworks that held up under pressure were the ones written with genuine “what if” scenarios in mind at drafting time, not just categories of decision.\n\nFunding gateways were the most common point of governance failure under pressure, largely because they were designed for planned spend decisions and tested by unplanned ones — an urgent fix, an unexpected cost, a time-critical opportunity. The governance structures that survived built a genuine fast-track gateway in from the start, with its own lower threshold and faster turnaround, rather than trying to force urgent decisions through the standard process under duress.\n\nEscalation routes, similarly, worked best when the trigger for escalating was defined in advance and unambiguous — a cost threshold, a delay of a stated size — rather than left to judgement calls that, under real pressure, tend to escalate either too late or too often."},
    {"slug": "newco-versus-portfolio-transformation", "theme": "Operating models", "title": "NewCo versus portfolio transformation",
     "author": "James Whitfield", "role": "PA Consulting", "date": "23 April 2027", "read": "8 min read",
     "body": "Structural separation gets most of the attention in this community, for the obvious reason that it's the community's founding premise. It's worth saying plainly: it is not the only credible response to the problems that drive departments toward a NewCo, and portfolio-led transformation — improving delivery across existing structures through a coordinated set of programmes — succeeds more often than the NewCo conversation usually acknowledges.\n\nPortfolio-led transformation tends to outperform separation when the underlying constraint is genuinely capability or leadership rather than structure — cases where the diagnostic criteria don't clearly point to a structural cause. It also tends to work better where the department's political and funding context makes separation particularly hard to achieve cleanly, since a difficult separation can consume as much leadership attention as the transformation it was meant to enable.\n\nSeparation tends to outperform portfolio transformation specifically where the constraint is the structure itself — a technology estate that can't be worked around, an accountability model that no amount of internal reorganising will change, a pay and grading structure that a portfolio programme has no authority to alter. In these cases, portfolio-led transformation tends to produce visible activity without addressing the actual constraint.\n\nThe honest comparison, across the cases reviewed here, is that both paths succeed and fail for reasons that have more to do with leadership judgement and execution discipline than with which path was chosen. The choice of path matters most when the underlying constraint genuinely is structural — and matters much less than usually assumed when it isn't."},
    {"slug": "newco-and-gds-reform-patterns", "theme": "Governance", "title": "NewCo and GDS reform patterns",
     "author": "Helen Carver", "role": "PA Consulting", "date": "9 April 2027", "read": "9 min read",
     "body": "Central digital institutions have gone through their own cycles of centralising and devolving authority over technology standards, and those cycles offer a useful, under-used reference point for departments designing a single NewCo's relationship with the centre.\n\nThe recurring pattern at the centre has been a cycle: strong central standards-setting authority, followed by frustration from delivery teams that the standards don't fit their context, followed by devolution of authority back to individual organisations, followed eventually by a recognised need for some central coordination again as fragmentation costs become visible. NewCos designing their own standards relationship with their parent department and with the wider centre are, in effect, choosing where to sit on the same cycle — and should expect the position that fits today to need renegotiation in a few years, not assume it's a permanent settlement.\n\nThe convergence question — which standards a NewCo should simply adopt from the centre versus set independently — is best approached by asking what the standard is actually protecting against. Interoperability and security standards generally warrant convergence, since the cost of divergence is borne by others. Delivery methodology and internal tooling standards warrant more NewCo discretion, since the cost of a mismatch is borne mostly by the NewCo itself.\n\nThe practical lesson departments can take from the centre's own history: build the relationship with an explicit expectation of periodic renegotiation, rather than treating the initial standards agreement as fixed — because the centre's own experience suggests it never has been."},
]

UPCOMING = [
    {"id": "ev1", "slug": "establishing-a-government-newco", "kicker": "Upcoming event · Registration open", "date": "17 September 2027", "time": "16:00–19:00 BST",
     "loc": "PA Consulting, 10 Bressenden Place, London", "format": "In person only",
     "title": "Establishing a government NewCo: when separation is the right answer",
     "blurb": "A working session on the diagnostic case for structural separation — and the traps departments fall into when the answer should have been no.",
     "overview": ["Structural separation is a powerful response to legacy technology, fragmented accountability and constrained capability — but it is not a universal solution. This session examines the diagnostic criteria that should drive the decision, drawing on live experience from departments that chose separation, and from those that chose not to.",
                  "Participants will work through the NewCo Readiness Assessment in facilitated roundtables, applying it to their own context. The session closes with an open discussion on building the business case for separation with HM Treasury and departmental boards."],
     "speakers": [{"name": "Sarah Okafor", "role": "Transformation Director, central government department"},
                  {"name": "James Whitfield", "role": "Government transformation expert, PA Consulting"},
                  {"name": "Priya Nair", "role": "Former Chief Operating Officer, government NewCo"}],
     "agenda": [{"t": "16:00", "s": "Arrival and registration"}, {"t": "16:30", "s": "Keynote — the case for separation, and against it"},
                {"t": "17:00", "s": "Panel — diagnostic criteria in practice"}, {"t": "17:45", "s": "Roundtables — applying the readiness assessment"},
                {"t": "18:30", "s": "Drinks and open discussion"}]},
    {"id": "ev2", "slug": "designing-governance-and-accountability", "kicker": "Upcoming event · Registration open", "date": "12 November 2027", "time": "09:00–12:30 GMT",
     "loc": "PA Consulting, 10 Bressenden Place, London", "format": "In person only",
     "title": "Designing governance and accountability for NewCos",
     "blurb": "How to give a NewCo genuine decision rights without losing the accountability Parliament expects.",
     "overview": ["The hardest design problem in any NewCo is governance: enough autonomy to move at pace, enough accountability to satisfy Parliament, the National Audit Office and the parent department. Get it wrong in either direction and the NewCo becomes either a runaway or a puppet.",
                  "This roundtable brings together SROs, accounting officers and governance specialists to compare models in use across government — board composition, delegation frameworks, funding gateways and escalation routes — and to work through the governance layer of the NewCo Operating Model Canvas."],
     "speakers": [{"name": "Eleanor Hughes", "role": "Senior Responsible Owner, major transformation programme"},
                  {"name": "David Achebe", "role": "Governance and accountability expert, PA Consulting"}],
     "agenda": [{"t": "09:00", "s": "Arrival and coffee"}, {"t": "09:30", "s": "Framing — the autonomy–accountability trade-off"},
                {"t": "10:15", "s": "Roundtables — governance models in use today"}, {"t": "11:30", "s": "Working session — the Operating Model Canvas, governance layer"},
                {"t": "12:15", "s": "Close and next steps"}]},
]

PAST = [
    {"id": "pe1", "slug": "building-a-digital-office", "kicker": "Past event · 14 May 2027", "date": "14 May 2027", "time": "16:00–19:00 BST", "loc": "PA Consulting, London", "format": "In person only",
     "stats": "46 attendees · 15 departments", "glance": "46 attendees\n15 departments",
     "title": "Building a Digital Office inside a NewCo",
     "blurb": "What a Digital Office is for, where it sits, and why so many become bottlenecks.",
     "overview": ["A Digital Office should be the engine room of a NewCo — setting technical direction, owning standards and unblocking delivery. In practice, many become approval bottlenecks that recreate the bureaucracy the NewCo was built to escape. This session compared Digital Office patterns from four live transformations.",
                  "The strongest consensus of the evening: a Digital Office succeeds when it behaves as a service to delivery teams, with its authority earned through usefulness rather than granted through mandate."],
     "themes": ["Digital Office as a service, not a control function", "Standards that enable rather than gate — “paved roads, not toll booths”",
                "Recruiting technical leadership into government pay structures", "The relationship between the Digital Office and the parent department’s CDO function"],
     "insights": ["“Every approval step you add is a bet that your judgement is better than your delivery teams’. Make that bet rarely.” — panel contribution",
                  "Three of four organisations represented had restructured their Digital Office within eighteen months of establishing it — plan for evolution, not permanence.",
                  "Departments that co-located Digital Office staff with delivery teams reported materially faster architectural decisions."],
     "speakers": [{"name": "Marcus Bell", "role": "Digital Office lead, major delivery department"},
                  {"name": "Aisha Rahman", "role": "Digital office design expert, PA Consulting"},
                  {"name": "Tom Askew", "role": "Enterprise architect, government NewCo"}],
     "downloads": ["Session summary (PDF, 12 pp)", "Digital Office patterns deck (PDF, 24 pp)"]},
    {"id": "pe2", "slug": "operating-model-incubation", "kicker": "Past event · 5 March 2027", "date": "5 March 2027", "time": "09:00–12:30 GMT", "loc": "PA Consulting, London", "format": "In person only",
     "stats": "38 attendees · 12 departments", "glance": "38 attendees\n12 departments\n2 published insights\nIncubation Roadmap v2 released",
     "title": "Operating model incubation: from programme to business",
     "blurb": "The awkward adolescence between programme mobilisation and a functioning organisation.",
     "overview": ["Most NewCos begin life as programmes — funded, governed and staffed like programmes. The transition to a functioning business, with its own operating model, is where many stall. This session worked through the five stages of the Incubation Roadmap: mobilise, establish, validate, scale, transition.",
                  "Discussion centred on the “validate” stage — proving the operating model on a real service before scaling it — which most attendees identified as the stage their organisations had skipped, and later regretted skipping."],
     "themes": ["Programme funding rhythms versus business funding needs", "Validating the operating model on a real service before scaling",
                "When to stop hiring contractors and start building permanent capability", "Measuring outcomes rather than delivery milestones"],
     "insights": ["Attendees consistently reported that incubation took twice as long as their business cases assumed — eighteen to twenty-four months, not nine to twelve.",
                  "“The moment you scale an unvalidated operating model, you are scaling your problems.” — roundtable contribution",
                  "Version 2 of the Incubation Roadmap, incorporating the session’s feedback, was published in April 2027."],
     "speakers": [{"name": "Priya Nair", "role": "Former Chief Operating Officer, government NewCo"},
                  {"name": "Rachel Donnelly", "role": "Operating model expert, PA Consulting"}],
     "downloads": ["Session summary (PDF, 10 pp)", "Incubation Roadmap v2 (PDF, 16 pp)"]},
    {"id": "pe3", "slug": "lessons-from-live-transformations", "kicker": "Past event · 22 January 2027 · Launch event", "date": "22 January 2027", "time": "16:00–19:30 GMT", "loc": "PA Consulting, London", "format": "In person only",
     "stats": "52 attendees · 17 departments", "glance": "52 attendees\n17 departments\nCommunity launched\n4 published insights",
     "title": "Lessons from live transformations",
     "blurb": "The community’s launch event: candid accounts from three transformations in flight.",
     "overview": ["The community’s launch event brought together fifty-two senior leaders from seventeen departments to hear candid, unattributable accounts from three transformations in flight — one thriving, one recovering, one recently wound down.",
                  "The evening established the community’s founding premise: NewCo-style delivery models are spreading across government faster than the lessons about how to run them. The event set the programme for the year and shaped the structure of the knowledge hub."],
     "themes": ["Why departments are turning to NewCo-style models now", "What the wound-down transformation would have done differently",
                "The skills government struggles to buy — and how NewCos change that", "What this community should be, and should never become"],
     "insights": ["“We didn’t fail because the model was wrong. We failed because we treated the model as the strategy.” — speaker contribution",
                  "Attendees voted governance design and reintegration planning as the two topics the community should tackle first.",
                  "Seventeen departments represented at launch; the community’s target is twenty-five by the end of 2027."],
     "speakers": [{"name": "Three senior leaders", "role": "Speaking unattributably, under the Chatham House Rule"},
                  {"name": "Helen Carver", "role": "Head of government transformation, PA Consulting"}],
     "downloads": ["Launch summary (PDF, 8 pp)"]},
]

# ---------------------------------------------------------------------------
# RENDER: events (rich detail layout, matching the app's former isEvent view)
# ---------------------------------------------------------------------------

def render_event_page(ev, is_upcoming):
    overview_html = "".join(
        f'<p style="font:400 17px/1.7 var(--font-companion);color:var(--pa-dark-blue);margin:0 0 18px;">{p}</p>'
        for p in ev["overview"]
    )
    themes_html = ""
    if ev.get("themes"):
        themes_html = (
            '<div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin:40px 0 18px;">Key discussion themes</div>'
            '<div style="display:flex;flex-direction:column;gap:12px;">'
            + "".join(
                f'<div style="display:flex;gap:14px;align-items:baseline;"><span aria-hidden="true" style="width:8px;height:8px;background:var(--pa-aqua-04);flex:none;position:relative;top:-1px;"></span>'
                f'<span style="font:400 16px/1.5 var(--font-companion);color:var(--pa-dark-blue);">{t}</span></div>'
                for t in ev["themes"]
            ) + "</div>"
            '<div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin:40px 0 18px;">Major insights</div>'
            '<div style="display:flex;flex-direction:column;gap:16px;">'
            + "".join(
                f'<div style="border-left:2px solid var(--pa-aqua-01);padding:2px 0 2px 18px;font:400 16px/1.6 var(--font-companion);color:var(--pa-grey-04);font-style:italic;">{t}</div>'
                for t in ev["insights"]
            ) + "</div>"
        )
    agenda_html = ""
    if ev.get("agenda"):
        agenda_html = (
            '<div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin:40px 0 18px;">Agenda</div>'
            '<div style="display:flex;flex-direction:column;">'
            + "".join(
                f'<div style="display:grid;grid-template-columns:90px 1fr;gap:20px;padding:14px 0;border-bottom:1px solid var(--pa-grey-01);">'
                f'<span style="font:400 13px/1.5 var(--font-primary);color:var(--pa-grey-04);">{a["t"]}</span>'
                f'<span style="font:400 16px/1.5 var(--font-companion);color:var(--pa-dark-blue);">{a["s"]}</span></div>'
                for a in ev["agenda"]
            ) + "</div>"
        )
    speakers_html = (
        '<div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin:40px 0 18px;">Speakers</div>'
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:16px;">'
        + "".join(
            f'<div style="border:1px solid var(--pa-grey-01);padding:18px 20px;">'
            f'<div style="font:450 16px/1.3 var(--font-primary);color:var(--pa-dark-blue);margin-bottom:6px;">{s["name"]}</div>'
            f'<div style="font:400 13px/1.5 var(--font-companion);color:var(--pa-grey-04);">{s["role"]}</div></div>'
            for s in ev["speakers"]
        ) + "</div>"
    )
    downloads_html = ""
    if ev.get("downloads"):
        downloads_html = (
            '<div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin:40px 0 18px;">Materials</div>'
            '<div style="display:flex;flex-direction:column;gap:12px;">'
            + "".join(
                f'<div style="display:flex;justify-content:space-between;align-items:center;gap:20px;border:1px solid var(--pa-grey-01);padding:16px 20px;">'
                f'<span style="font:400 15px/1.4 var(--font-companion);color:var(--pa-dark-blue);">{d}</span>'
                f'<span style="font:450 14px/1 var(--font-primary);color:var(--pa-grey-03);white-space:nowrap;">PDF</span></div>'
                for d in ev["downloads"]
            ) + "</div>"
        )

    if is_upcoming:
        sidebar = f'''
          <div style="background:var(--pa-grey-01);padding:32px 32px 36px;position:sticky;top:96px;">
            <div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin-bottom:8px;">Express interest</div>
            <div style="font:550 20px/1.3 var(--font-companion);color:var(--pa-dark-blue);margin-bottom:20px;">Tell us you'd like to attend</div>
            <form name="event-registration" method="POST" data-netlify="true" style="display:flex;flex-direction:column;gap:16px;">
              <input type="hidden" name="form-name" value="event-registration">
              <input type="hidden" name="attendance" value="In person">
              <label style="display:block;font:450 14px/1.3 var(--font-primary);color:var(--pa-dark-blue);">
                <span style="display:block;margin-bottom:6px;">Full name</span>
                <input type="text" name="name" required style="display:block;width:100%;box-sizing:border-box;font:400 16px/1.4 var(--font-companion);color:var(--pa-dark-blue);padding:10px 12px;border:1px solid var(--pa-grey-03);border-radius:2px;">
              </label>
              <label style="display:block;font:450 14px/1.3 var(--font-primary);color:var(--pa-dark-blue);">
                <span style="display:block;margin-bottom:6px;">Work email</span>
                <input type="email" name="email" required style="display:block;width:100%;box-sizing:border-box;font:400 16px/1.4 var(--font-companion);color:var(--pa-dark-blue);padding:10px 12px;border:1px solid var(--pa-grey-03);border-radius:2px;">
              </label>
              <label style="display:block;font:450 14px/1.3 var(--font-primary);color:var(--pa-dark-blue);">
                <span style="display:block;margin-bottom:6px;">Department or organisation</span>
                <input type="text" name="organisation" style="display:block;width:100%;box-sizing:border-box;font:400 16px/1.4 var(--font-companion);color:var(--pa-dark-blue);padding:10px 12px;border:1px solid var(--pa-grey-03);border-radius:2px;">
              </label>
              <label style="display:block;font:450 14px/1.3 var(--font-primary);color:var(--pa-dark-blue);">
                <span style="display:block;margin-bottom:6px;">Role</span>
                <input type="text" name="role" style="display:block;width:100%;box-sizing:border-box;font:400 16px/1.4 var(--font-companion);color:var(--pa-dark-blue);padding:10px 12px;border:1px solid var(--pa-grey-03);border-radius:2px;">
              </label>
              <button type="submit" style="font:450 16px/1 var(--font-primary);padding:11px 20px;border-radius:2px;border:none;background:#EA0027;color:#fff;cursor:pointer;">Express interest</button>
              <div style="font:400 12px/1.5 var(--font-primary);color:var(--pa-grey-04);">Events run under the Chatham House Rule. Places are limited and confirmed by email.</div>
            </form>
          </div>'''
    else:
        sidebar = f'''
          <div style="background:var(--pa-grey-01);padding:32px;">
            <div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin-bottom:16px;">At a glance</div>
            <div style="font:400 14px/2 var(--font-primary);color:var(--pa-dark-blue);white-space:pre-line;">{ev["glance"]}</div>
            <div style="border-top:1px solid var(--pa-grey-02);margin:20px 0;"></div>
            <a href="establishing-a-government-newco.html" style="display:inline-block;font:450 14px/1 var(--font-primary);color:#EA0027;text-decoration:underline;text-underline-offset:3px;">See the next event →</a>
          </div>'''

    body = f'''
  <section style="background:var(--pa-dark-blue);padding:56px 0 60px;">
    <div style="max-width:1240px;margin:0 auto;padding:0 clamp(20px,5vw,48px);">
      <a href="../events.html" style="display:inline-block;font:400 13px/1 var(--font-primary);letter-spacing:0.04em;color:var(--pa-grey-02);text-decoration:none;margin-bottom:32px;">← All events</a>
      <div style="font:400 12px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-aqua-03);margin-bottom:18px;">{ev["kicker"]}</div>
      <h1 style="font:400 clamp(28px,4.6vw,42px)/1.15 var(--font-primary);color:#FFFFFF;margin:0;max-width:840px;text-wrap:pretty;">{ev["title"]}</h1>
      <div style="display:flex;gap:36px;flex-wrap:wrap;margin-top:28px;">
        <div style="font:400 13px/1.6 var(--font-primary);color:var(--pa-grey-02);">{ev["date"]}<br>{ev["time"]}</div>
        <div style="font:400 13px/1.6 var(--font-primary);color:var(--pa-grey-02);">{ev["loc"]}<br>{ev["format"]}</div>
      </div>
    </div>
  </section>
  <section style="background:#FFFFFF;padding:clamp(40px,6vw,64px) 0 clamp(48px,7.5vw,88px);">
    <div style="max-width:1240px;margin:0 auto;padding:0 clamp(20px,5vw,48px);display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:64px;align-items:start;">
      <div>
        {overview_html}
        {themes_html}
        {agenda_html}
        {speakers_html}
        {downloads_html}
      </div>
      <div>{sidebar}</div>
    </div>
  </section>
'''
    return page_shell(ev["title"], "events", body)

# ---------------------------------------------------------------------------
# BUILD
# ---------------------------------------------------------------------------

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8").write(content)
    print("wrote", path, len(content), "bytes")

for ev in UPCOMING:
    html = render_event_page(ev, is_upcoming=True)
    write(f"{OUT_DIR}/events/{ev['slug']}.html", html)

for ev in PAST:
    html = render_event_page(ev, is_upcoming=False)
    write(f"{OUT_DIR}/events/{ev['slug']}.html", html)

for stage in STAGES:
    for item in stage["items"]:
        meta = f'{stage["title"]} · {item["read"]}'
        html = page_shell(
            item["title"], "hub",
            simple_article("Emerging practices", "../emerging-practices.html", item["title"], meta, item["body"])
        )
        write(f"{OUT_DIR}/emerging-practices/{item['slug']}.html", html)

for ins in INSIGHTS:
    meta = f'{ins["author"]} · {ins["role"]} · {ins["date"]} · {ins["read"]}'
    html = page_shell(
        ins["title"], "insights",
        simple_article("Case studies", "../case-studies.html", ins["title"], meta, ins["body"])
    )
    write(f"{OUT_DIR}/case-studies/{ins['slug']}.html", html)

print("done:", len(UPCOMING) + len(PAST), "events,",
      sum(len(s["items"]) for s in STAGES), "practices,", len(INSIGHTS), "case studies")
