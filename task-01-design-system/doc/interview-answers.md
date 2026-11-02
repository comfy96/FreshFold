Interview answers

Each answer is 200 words or fewer. Questions 1 to 8 are published interview questions. Questions 9 to 12 were written for this assessment.

1. How would you structure design tokens?

I use three tiers, in one source of truth.

Primitives hold raw values only: a palette step, a size, a duration. They carry no meaning. Names say what they are, such as teal.700.

Semantic tokens give a value a job: text.primary, status.order.ready.fg, shadow.card. Components and pages use only this tier. Semantic tokens alias primitives, so a theme change means repointing aliases, not editing components.

Component tokens come last, and only when a component needs its own decision, such as button.bg.pressed. Every one is a name someone must maintain, so I add them on demand.

I store tokens in a typed format with a type and a value for each, such as the W3C Design Tokens format, so tools can validate them. Pairs travel together: a foreground token and its background token share a parent, so nobody picks half a pair. A build step turns the file into CSS custom properties.

Two checks run in CI: every alias resolves, and every declared text pair meets its contrast ratio.

In this project's token file I skipped the primitive tier. Question 11 covers that.

2. When is a token change breaking?

A change is breaking when something that uses the token stops working or looks wrong, and the consumer did nothing.

Clearly breaking: renaming or deleting a token, changing its type or unit, or repointing a semantic token to a different role.

Less obvious: value changes. A new text colour that drops a declared pair below its contrast ratio is breaking, because it breaks accessibility. A font size or line height change of a few pixels is breaking if it wraps text, clips a button label or pushes a key element off the first screen. A colour shift that keeps contrast and layout is not.

Not breaking: adding a token.

I tie this to versioning. Removals, renames, and any change that fails the contrast or layout checks are a major version. Additions are minor. Safe value tweaks are patches. When I must rename, I keep the old name as a deprecated alias for one release and list it in the changelog.

A visual diff and the contrast check run on every token change, so the judgment does not rest on memory.

3. How would you support multiple brands and themes?

I keep component code brand blind. Components reference semantic names only. A brand or theme is a set of values behind those names.

Structure: each brand has its own primitives. A theme, such as light or dark, is a mapping from semantic tokens to primitives. Brand and theme are separate axes, so two brands with two themes are four mappings, not four codebases. In Figma this is variable collections with modes. In code it is CSS custom properties switched by an attribute on the root element, with the user's system preference as the default.

Rules I hold:

No component token may hold a brand specific value.
Every brand must define every semantic token. A build check enforces it.
Contrast is tested per combination, because a pair that passes in light can fail in dark or in another brand's palette.

Differences beyond colour, such as type or corner radius, go in the same semantic layer instead of branching in components.

FreshFold has one brand and a light theme only. The PRD does not ask for more, so I would not build the second axis until someone does.

4. Can tokens guarantee accessible contrast?

No. Tokens can make accessible contrast likely and checkable. They cannot guarantee it.

A token holds a colour. Contrast is a relationship between two colours in a particular place, at a particular size, in a particular state. A token system does not control which foreground a developer puts on which background. It also cannot see hover and disabled states, text over images or gradients, semi-transparent layers, or a user's forced colours and zoom settings. And contrast is only one part of accessibility.

What tokens do well: they let me declare approved pairs, such as text.primary on background.card, and test those pairs automatically. In this project I checked 16 text pairs, and all passed 4.5 to 1. Keeping foreground and background together, as I did for status colours, steers people toward tested pairs.

What I add: a build check that fails when a declared pair drops below its ratio, component APIs that accept only approved pairs, and a manual review of states, images and overlays. Automated tools catch some failures. People catch the rest.

5. How do you ensure that colour contrast guidelines are met within a website or application's design?

I set the targets first, then check at three points.

Targets under WCAG 2.x: 4.5 to 1 for normal text, 3 to 1 for large text (24 px, or 18.66 px bold, and up), and 3 to 1 for interface components and meaningful graphics, such as input borders and focus rings.

Design time: I choose colours in pairs and compute the ratio in the design tool or a script before anything is built. Approved pairs become tokens.

Build time: a CI check runs on every declared pair, and automated page scans cover the rest. Scanners find only part of the problems, so I treat them as a floor, not a pass.

Review time: I check every state (hover, pressed, disabled, error, focus), text on images, and the real device. A cheap phone in daylight shows problems a monitor hides.

I keep the computed ratio next to each pair, so a reviewer can verify it without trusting me.

6. Can you discuss the differences between WCAG levels A, AA and AAA?

The levels are cumulative. AA includes everything in A.

Level A is the minimum. It covers barriers that stop people entirely: text alternatives for images, everything usable by keyboard, no keyboard traps, captions for prerecorded video, and not relying on colour alone to carry meaning.

Level AA is the usual target, and the one most laws and procurement rules cite. It adds, among other things, 4.5 to 1 text contrast, 3 to 1 contrast for interface components, text resizing to 200 percent, reflow without sideways scrolling at narrow widths, a visible keyboard focus, and, in WCAG 2.2, a minimum target size of 24 by 24 pixels.

Level AAA is enhanced. It includes 7 to 1 text contrast, sign language for video, and a lower reading level. W3C notes that some AAA criteria cannot be met for all content, so it does not recommend requiring AAA across a whole site.

My default is AA everywhere, plus any AAA item that is cheap, such as clear link purpose.

The FreshFold PRD states no target. I would propose AA and ask the founder to confirm it.

7. Discuss the importance of semantic HTML in the context of accessibility.

Semantic HTML gives assistive technology the structure of a page without extra code. Browsers turn native elements into an accessibility tree, and screen readers, voice control and switch devices read that tree, not the pixels.

In the FreshFold app this decides whether a customer using a screen reader can trust her own order.

The status band and the orders sit inside main. Orders are a list, so a reader announces how many there are.
Status is text first. The words "Ready for collection" sit in the element, and colour only reinforces them. Without the text, a colour blind customer, or one in bright sun, loses the status.
Each amount is a labelled item, and "Last updated" uses the time element, so the date is announced as a date.
Pay and "Ask the shop" are button elements. They take Enter and Space and show focus with no extra script.
The PIN field has a label and a numeric input mode.

ARIA is the repair kit. I reach for it only when no native element fits, such as announcing "You are offline" when the banner appears.

8. How do you handle design handoff to developers using Figma?

I treat handoff as a shared source, not a file transfer. For FreshFold I have to be straight about one thing: this project has no Figma file yet. The tokens are a JSON file written by hand from the business brief.

What handoff looks like today. Each screen is specified in the PRD by its inputs, outputs, empty state and error state. The tokens (29 colours, 7 text styles, 3 effects) live in one file. Customer text lives in one module.

What I would do if Figma joins. Pick one direction for the tokens, file to Figma or Figma to file, never both. Name Figma variables exactly as the file names them. Draw every state for each screen, including offline, pending payment and a count mismatch. Annotate heading levels, accessible names and focus order. Use real strings from the PRD, not placeholder text.

Then a developer builds one screen, and I compare it to the frame on a real phone, not a monitor.

I would also run the check that caught my staged export: a styles only file left five colour aliases unresolved, and a reference check found them.

9. Why do AI-generated interfaces tend to look generic, and what specifically do you hand an agent to stop it?

Generic output comes from averaging. A model has seen millions of interfaces. With nothing specific to go on, it produces the most probable one: a safe sans serif, a purple or blue gradient, rounded cards, a hero image, a chat box. Nobody chose those. They are the default.

An agent also has nothing that pushes back. It does not know who the user is, what phone she holds, or what the product must feel like.

What I hand the agent on FreshFold:

The business brief: Amaka, an entry level Android, small data, and the one thing that must work.
The token file with exact values and declared text pairs. "Calm" is not an instruction. Values are.
Named defaults to reject: a chat first screen, a gradient, a stock photo hero.
Real content: the PRD strings, such as "Our records show", and real records.
Every state: empty, error, offline and pending payment.
A check it must run: contrast pairs, page weight against the first load budget, and a screenshot review against the brief.

Instructions describe intent. A check catches drift.

10. Your line height for display large is a specific number. Why that number and not one step either side of it? What would you lose with each?

My tokens have no style called display large. The nearest is heading.screen: 24 px type with a 32 px line height, a ratio of about 1.33. I answer for that. I chose it by judgment and have not tested it on devices.

Why 32, not 28 or 36.

At 28 the ratio is about 1.17. Headings at this size tend to wrap to two lines on a narrow phone, and 28 packs those lines tightly enough to feel crowded. That is harder to read for someone glancing at a screen outdoors. I would gain a few pixels of vertical space.

At 36 the ratio is 1.5, the same as my body text (16 over 24). The heading would stop looking like a heading, because leading would no longer separate it from body copy. Each line would also cost 4 more pixels, which pushes the status band lower on a small screen. The brief says status shows first.

32 sits on a 4 px grid, keeps a visible step from body leading, and leaves room if a user increases text spacing.

I would move it by 2 px if a real handset showed clipping or crowding.

11. Point at one place in your own token structure that you would build differently if you started again. Say what you would do instead and what it would cost.

I would add a primitive tier. My token file has semantic colour tokens that hold raw hex values directly, under text, accent and status. There is no palette layer underneath.

You can see the cost in the file. order.ready and payment.confirmed carry the same two hex values, typed twice. Changing that green means finding both. A second theme or brand would mean rewriting all 29 colour values, instead of repointing aliases. The font stack is also repeated inside seven text styles.

What I would do instead: a palette tier of raw values, such as green.700 and green.100. Semantic tokens such as status.order.ready.fg would alias them. The font stack becomes one token that the text styles reference.

What it costs: more tokens to name and maintain, an extra hop when someone traces where a colour comes from, and more upfront time on a product with one theme today. For a small team that opens the file once a month, the indirection can feel like ceremony.

I took the shortcut because FreshFold has one light theme. If a second theme arrives, this is the first thing I would change.

12. A candidate says: "I set up design tokens by exporting the hex values from Figma into a CSS file, so every colour in the codebase comes from one place. That makes it a single source of truth." Say precisely what is missing and what will go wrong in month four.

What is missing: a semantic layer, and an enforced single source.

Exported hex values are a flat list of colours. They say what a colour is, not what it is for. There are no role names such as text.primary, no foreground and background pairs, and no check that anything references the file. "Single source of truth" holds only if nothing else can add a colour, and nothing stops a developer pasting a hex into a component.

Month four, in FreshFold's case:

The owner asks for a dark theme. Every component holds raw hex, so each is rewritten, and 29 colour values need a second set.
A designer changes the green in Figma. The CSS file is a stale export. Order "Ready" and payment "Confirmed" share one green, so someone edits only one.
A developer puts grey caption text on a green status chip. That pair was never tested.
A partial export drops the colour variables. In my evidence file that left five unresolved aliases, and nothing failed until a reference check ran.

Fix: semantic names, declared pairs, an alias check in CI, and a lint rule banning raw hex in components.