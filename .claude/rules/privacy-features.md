# Feature Compliance Checklist

## When this fires

Before marking any feature as done, check if it:
- Stores new PII or personal data
- Emails new categories of data subjects (not just existing users)
- Adds a new external processor (see also: `processor-gate.md`)
- Creates a new user-facing flow (pages, emails, API endpoints handling personal data)
- Changes how existing PII is processed, stored, or shared

If **any** of the above apply, complete the checklist below before closing the task.

## Checklist

1. **ROPA** (`docs/operations/ropa.md`): Does this create or modify a processing activity? Update the entry.
2. **Privacy policy** (`public/privacy.html`): Does the user need to know about this processing? Update if yes.
3. **Terms of service** (`public/terms.html`): Does this create new obligations or rights? Update if yes.
4. **DPIA** (`docs/operations/dpia.md`): Does this introduce new risk to data subjects? Add an addendum or note.
5. **DPA register** (`docs/operations/processor-dpas.md`): Is a new processor involved? Add entry (see `processor-gate.md`).
6. **Data export** (`src/services/account.js`): Is new personal data stored? Add to `getExportData()`.
7. **Deletion cascade** (`src/services/account.js`): Is new personal data stored? Add to deletion cascade.
8. **Data retention** (`scripts/data-retention.js`): Does new data need a retention/purge policy?

## How to apply

Add a line to the task's completion notes: "Privacy checklist: [items checked / N/A]". If unsure whether the feature triggers this checklist, err on the side of checking.
