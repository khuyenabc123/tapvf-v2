# T-APVF — Temporal Academic Provenance Verification (my implementation)

Temporal provenance verification for academic credentials that stays
provable even when the registrar's own administrator is the attacker.
Master's thesis project — Duy Tan University.'

Because the global ValidationPipe validates LoginDto before the controller reaches AuthService, a request missing password is rejected with HTTP 400 without querying MongoDB.