# directory-credential-verification

**Phase:** 3 — Trust Directory
**Article:** 11.3.3 (Regulated professionals verified against public registers before listing)

## Outcome

Before a professional profile is listed in the directory, the platform verifies the claimed credential against the relevant public register and records the verification. The registration number is stored, displayed on the profile, and linked directly to the public register entry. Profiles with unverified credentials cannot be listed. The verification process is documented so it can be repeated when registration status changes.

## Constraints & References

- Article 11.3.3: regulated professionals verified against public registers before listing; registration number displayed and linked
- Research source: `docs/research/professional-boundaries-and-directory.md` Section 4.3 (regulatory constraints and verification model)
- Depends on: directory-vouching-data-model (phase-3)
- Verification is manual at this stage — automated register polling is out of scope
- Registers in scope (initial): FCA Register, SRA Find a Solicitor, GMC List of Registered Medical Practitioners, HCPC Register, OISC Register
- Verification must be re-checked at profile renewal or on reasonable suspicion of lapse

## Acceptance Checks

- Admin UI or documented admin process exists for verifying a credential (record register checked, date, admin user)
- `credential_verified_at` and `credential_verified_by` fields populated on verification
- `credential_number` displayed on listed profile
- `credential_number` links to the public register entry (correct URL per domain)
- A profile with `credential_verified_at IS NULL` cannot be set to `active = true` (enforced and tested)
- Verification process documented in `docs/operations/credential-verification.md`
- At least one test profile verified against each in-scope register and the link confirmed valid

## Explicit Non-Goals

- Automated real-time polling of public registers (manual verification sufficient at this stage)
- Verification of non-regulated professionals (vouch-only track for those without regulated credentials)
- Ongoing automated monitoring for registration lapses
- International register verification (UK registers only at launch)
