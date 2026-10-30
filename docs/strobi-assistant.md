# Strobi in the editor and Pro

Strobi uses local, deterministic context rules. No user content is sent to a language model.
The landing keeps its existing speech and hover interactions; its actor still loads after the idle delay.
Editor and Pro load that same singleton actor as soon as their companion mounts.

## Interaction

- Editor advice follows the Zustand stores: widget additions/removals, template changes, selection, global styles and preview mode. Bio, projects, stack, social links, ASCII, locked widgets and multiple selections have specific guidance.
- Actions open existing controls. Styles deselects the current widget and opens global properties; this also switches to the correct panel on mobile. The tour and export guide use their existing events.
- Publication feedback listens to `gitascii:saved`, emitted after a successful GitHub response, and `gitascii:publish-error`. Local edits never claim to be published.
- Pro visitors get explanations of actual benefits and links to the offer, comparison and FAQ. Assistant actions never initiate checkout. Subscribers get operational guidance instead.

## Attention and accessibility

Automatic suggestions debounce for 1.6 seconds, have a 45-second cooldown and a maximum of five distinct tips per surface per browser session. Outcomes can bypass this budget but still respect typing, dragging and dialogs. There is no repeating idle tip timer or message backlog.

Closing a suggestion dismisses the current tip. Tips close after 14 seconds, with the timer paused during hover or keyboard focus. Context changes discard obsolete advice.

Tours, dialogs and overlays carrying `data-strobi-blocking` suppress the companion and actor. Add that attribute to new overlays that need protected focus. Hidden tabs suspend actor rendering. Reduced motion removes the companion's spring and reaction choreography. Escape closes the suggestion and restores mascot focus.

## Extending

`src/features/mascot/constants/assistantCatalog.ts` contains typed messages and actions, with Portuguese and English copy. Keys are passed through the existing i18n system (`mascot.assistant.*`); other languages currently fall back to English. Add a localized dictionary key to override any title, body or action.

`assistant/context.ts` selects editor and Pro guidance and defines the attention policy. `useAssistant.ts` handles scheduling and dismissal. `StrobiAssistant.tsx` renders the accessible conversation and dock; the existing `StrobiHost` remains the only visual actor.
