# Ensure your docs directory exists
mkdir -p docs

# Create the divergences.md file and populate it using cat
cat << 'EOF' > docs/divergences.md
# Typography Divergences

## Divergence 1: Body Large Line-Height & Tracking for High-Density Receipt Logs
* **What the default was:** Material Design 3 baseline specifies a `1.5` line height multiplier and standard neutral letter tracking (`0px` or `0.5px`) for Body Large text in standard documents.
* **What you chose:** A tighter line-height multiplier of `1.4` combined with compressed letter spacing (`0.2px`) for the **Body Large** style used in order itemized lists and pickup receipt tables.
* **Why:** In Tally (laundry service management), staff and customers review itemized drop-off receipts and garment lists rapidly. Compressing vertical spacing fits more items into the viewport without excessive scrolling, improving operational scanning speed.
* **Where your choice would be the wrong one:** This fails on long-form textual content or help documentation (e.g., terms of service or care guides), where tight line heights cause continuous prose lines to bleed together, creating extreme reading fatigue.

## Divergence 2: Label Large Font Weight & Casing for Operational Status Chips
* **What the default was:** Material Design 3 baseline specifies a Medium (500) font weight and normal sentence-case capitalization for `Label Large` used in buttons and component chips.
* **What you chose:** Elevated **Label Large** (used for laundry order status badges like *“In Wash”*, *“Ready for Pickup”*, and *“Out for Delivery”*) to a bold **SemiBold (600)** weight paired with **UPPERCASE** text and expanded letter spacing (`0.5px`).
* **Why:** Laundry status badges must cut through visual noise instantly across a fast-paced dashboard where operators manage dozens of daily orders. Bumping the weight ensures strong visual hierarchy and clear operational scanning.
* **Where your choice would be the wrong one:** This fails on general form field labels or descriptive helper text under inputs. Writing standard descriptive sentences or form instructions in bold uppercase creates an aggressive, "shouting" visual tone.
EOF