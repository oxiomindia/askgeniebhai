# Ask Genie Bhai — Partner Quality Standards

Status: Canonical
Repository: `oxiomindia/askgeniebhai`
Phase: Documentation-only foundation

> Trust is Ask Genie Bhai's core differentiator (see
> [Product Differentiation](./00_ASK_GENIE_BHAI_BLUEPRINT.md#product-differentiation)).
> This document is the SOP that trust is built on. No partner or partner
> location may be listed for a service without passing the verification
> checklist defined here.
>
> If anything in this document conflicts with the Master Blueprint, the
> Master Blueprint is the canonical source and this document must be
> updated accordingly.

---

## Verification SOP

Every `partner_location` (see
[DATABASE_BLUEPRINT.md](./DATABASE_BLUEPRINT.md)) must pass an initial
verification before it can be listed, and must be re-verified on a
recurring basis.

| Step | Description |
|---|---|
| 1. Application | Partner submits location details and the service(s) they intend to offer. |
| 2. Document check | Ownership/operating documents, insurance, and applicable licenses are reviewed. |
| 3. Physical/photo audit | Location is audited in person or via a structured, time-stamped photo/video submission against the checklist for its category (below). |
| 4. Scoring | The location receives a quality score (below) based on the audit. |
| 5. Approval | Locations meeting the minimum score are approved and listed; those below are rejected or given a remediation path. |
| 6. Re-verification | Every approved location is re-audited on a recurring cadence (minimum: quarterly) and after any customer complaint pattern emerges. |

A `verification` record is created for every audit — approved, rejected,
or re-verified — so the full trust history of a location is always
available (see [DATABASE_BLUEPRINT.md](./DATABASE_BLUEPRINT.md#design-principles)).

---

## Quality Scoring

Each `partner_location` and `partner_service` is scored against the
dimensions below. Scoring is deliberately weighted toward the dimensions
travelers care about most in a time-pressured moment: cleanliness,
security, and reliability.

| Dimension | What is checked |
|---|---|
| **Cleanliness** | Visible cleanliness of the space, fixtures, and any provided linens/amenities at time of audit. |
| **Security** | Physical security of the premises and, where applicable, of stored belongings (locks, monitoring, staff presence). |
| **Photos** | Submitted photos are recent, accurate, and representative of the actual space a traveler will experience — not stock or misleading imagery. |
| **Noise** | Ambient noise level appropriate to the service (critical for Rest; less critical for Cab). |
| **Water** | Functioning hot/cold water where applicable (critical for Freshen Up). |
| **Reception** | Staff are present, responsive, and able to handle a booking handoff without delay. |
| **Insurance** | Valid liability/insurance coverage appropriate to the service category, particularly for Bag Storage and Room. |
| **Operating hours** | Stated operating hours are accurate and match actual availability; no listed availability outside real operating hours. |

A location failing any **critical** dimension for its category (see
per-category standards below) is rejected regardless of its score on
other dimensions — quality is a floor, not an average.

---

## Per-Category Standards

Category names below are the Internal Partner Category labels defined in
[00_ASK_GENIE_BHAI_BLUEPRINT.md](./00_ASK_GENIE_BHAI_BLUEPRINT.md#naming-convention-intent-vs-partner-category),
shown alongside their traveler-facing Intent name.

### Freshen Up

| Requirement | Detail |
|---|---|
| Water | Functioning hot and cold water, consistent pressure. Critical. |
| Cleanliness | Visibly clean shower/washroom, no mold, no standing water outside drainage. Critical. |
| Privacy | Fully private or clearly partitioned space; lockable door. Critical. |
| Amenities | Clean towel provided or available for rent; basic toiletries available for purchase. |
| Reception | Clear handoff process; no ambiguity about which facility is reserved. |

### Bag Storage (Keep My Bags)

| Requirement | Detail |
|---|---|
| Security | Monitored storage area; tamper-evident tagging or locked storage. Critical. |
| Insurance | Valid liability coverage for stored items, with clear terms communicated to the traveler. Critical. |
| Reception | Staffed during all listed availability hours; clear claim-check process. Critical. |
| Operating hours | Storage/retrieval hours match listed availability exactly. |

### Rest

| Requirement | Detail |
|---|---|
| Noise | Ambient noise suitable for rest; isolated from high-traffic areas. Critical. |
| Cleanliness | Clean bedding/seating, no visible pest or hygiene issues. Critical. |
| Privacy | Private or semi-private space appropriate to what was listed. |
| Security | Space is lockable or monitored; belongings can be kept safely while resting. |

### Cab (Book a Cab)

| Requirement | Detail |
|---|---|
| Driver verification | Valid license and background verification on file. Critical. |
| Vehicle condition | Vehicle is clean, functioning, and matches the listed vehicle class. Critical. |
| Reliability | On-time pickup track record meets the minimum threshold; repeated lateness triggers re-verification. Critical. |
| Insurance | Valid vehicle and passenger insurance coverage. |

### Room (Book a Room)

| Requirement | Detail |
|---|---|
| Cleanliness | Room matches or exceeds the cleanliness standard shown in photos. Critical. |
| Security | Functioning locks, safe access to the room and building. Critical. |
| Accuracy | Room, amenities, and photos accurately represent what the traveler will receive. Critical. |
| Water | Functioning hot/cold water in attached facilities. |
| Reception | Check-in process is clear and available at the listed hours. |
| Insurance | Applicable property insurance/liability coverage in place. |

---

## Consequences of Failing Standards

- **Below minimum score, no critical failure:** location is placed on a
  remediation path with a defined re-audit window before it can be
  listed.
- **Any critical failure:** location is rejected outright and may not be
  listed until the specific critical issue is resolved and re-verified.
- **Post-listing complaint pattern:** triggers an out-of-cycle
  re-verification; a confirmed regression results in immediate
  suspension from new bookings pending remediation.
- **Repeated failure across cycles:** partner location is permanently
  delisted.

Quality scoring, verification records, and consequences are all tracked
through the `verification` entity defined in
[DATABASE_BLUEPRINT.md](./DATABASE_BLUEPRINT.md), preserving a full
history rather than a single current-state flag.
