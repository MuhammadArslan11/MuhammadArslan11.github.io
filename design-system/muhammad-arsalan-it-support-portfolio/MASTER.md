# Muhammad Arsalan Portfolio Design System

## Direction

A quiet, personal and technically credible portfolio. The interface uses confident Roboto typography, generous whitespace, a restrained warm palette and friendly IT-support illustrations. Content is deliberately brief on the homepage and detailed only where a description improves understanding.

## Content rules

- Headings are short, natural and punctuation-free
- Uppercase is reserved for roles, section labels, dates and small technical labels
- Body copy uses sentence case and concrete language
- Each section introduces one idea before supporting detail
- Avoid slogans, exaggerated claims, filler and generic AI language

## Typography

- Family: Roboto
- Hero name: weight 900, `clamp()` sizing, `-.045em` desktop tracking and `-.035em` mobile tracking
- Section headings: weight 800 with balanced wrapping
- Card headings: weight 800
- Navigation and buttons: weight 700–800
- Body: weight 400 with 1.65 line height and controlled reading width

## Color tokens

Light theme:

- Outer frame `#E8E6E1`
- Canvas `#F8F7F3`
- Surface `#FFFFFF`
- Ink `#303536`
- Muted `#666D6E`
- Warm accent `#B94F38`
- Network blue `#456F7E`
- Support green `#6F8C72`
- Border `#DEDED9`

Dark theme:

- Outer frame `#090E10`
- Canvas `#111719`
- Surface `#182124`
- Ink `#F2F0EA`
- Muted `#AEB7B8`
- Warm accent `#EF826A`
- Network blue `#79AABC`
- Support green `#93AD8E`
- Border `#344144`

## Layout and components

- The homepage sits inside a soft framed canvas on larger screens and becomes edge-to-edge on mobile
- The header groups email, LinkedIn and GitHub beside the MA brand
- A separate glass utility dock provides Projects, CV, Learn and theme shortcuts
- The dock fades during active scrolling and returns when scrolling stops or it receives focus
- The hero balances the name and introduction with Muhammad's illustrated portrait
- Portrait and compact network-diagnostic command cards move as separate depth layers
- The MA badge uses a dark or light field with cream, copper, blue and green details
- Work uses two substantial project cards rather than many small destinations
- Experience and tools use compact rows for faster scanning
- Current projects use three rounded illustrated cards
- The support assistant lives on a separate page so it does not interrupt the portfolio story
- Buttons have clear filled and outlined hierarchy with stable hover movement

## Motion

- Motion uses opacity and transforms
- Standard interaction timing is 200–350ms
- Section entrances are subtle and run once
- The hero illustration floats gently
- The hero name enters in two controlled word movements
- Pointer parallax is limited to the portrait stage and never changes scrolling
- Motion is removed under `prefers-reduced-motion`
- No loader, scroll-jacking, magnetic controls or continuous text animation

## Responsive behavior

- No horizontal overflow from 320px through wide desktop widths
- Navigation changes below 1120px
- The hero stacks below 820px
- Work, experience, tools and contact simplify to one column where needed
- The hero name keeps natural words and scales without clipping
- Touch controls remain comfortably sized
- On small screens the header keeps the logo left, contact icons centered and menu controls right
- Long assistant conversations scroll inside a fixed-height chat panel instead of expanding the page

## Protected surfaces

The Resume Builder remains unchanged with its own HTML, CSS and JavaScript. Academy OS keeps its independent styling and behavior. Its static learning UI uses the restrained portfolio palette while adding data-driven course, topic, mastery, and performance views. Homepage styling is scoped so it does not cascade into those pages.
