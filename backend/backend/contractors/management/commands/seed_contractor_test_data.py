"""Small, explicitly scoped September/October 2026 fixture; no schema changes."""
import hashlib
import json
from datetime import date, timedelta

from django.core import signing
from django.core.management.base import BaseCommand, CommandError
from django.core.serializers.json import DjangoJSONEncoder
from django.db import transaction

from contractors.models import (
    Contractor, ContractorInvoice, ContractorInvoiceLine, ContractorPayment, ServiceContract,
)
from contractors.services import create_contractor_invoice, create_contractor_payment
from restaurants.models import Branch, Restaurant


TAG = "[TEST:contractors-sep-oct-2026-v1]"
SALT = "contractors.seed-test-data.v1"
MODELS = (Contractor, ServiceContract, ContractorInvoice, ContractorInvoiceLine, ContractorPayment)
NAMES = ("Kabul Cooling Services", "Safai Kitchen Care", "Balkh Electrical Works", "Pamir Pest Control")


def snapshot(objects):
    """Fingerprint every field, except the root's self-referential manifest."""
    rows = []
    for obj in objects:
        fields = {f.attname: getattr(obj, f.attname) for f in obj._meta.concrete_fields}
        if isinstance(obj, Contractor) and obj.name == f"{TAG} {NAMES[0]}":
            fields["notes"] = TAG
        rows.append([obj._meta.label, obj.pk, fields])
    payload = json.dumps(sorted(rows, key=lambda r: (r[0], r[1])), cls=DjangoJSONEncoder, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()


def owned_graph(root, restaurant, branch):
    try:
        manifest = signing.loads(root.notes.removeprefix(TAG + "\n"), salt=SALT)
        if manifest["scope"] != [restaurant.pk, branch.pk]:
            raise ValueError("scope mismatch")
        objects = []
        for model in MODELS:
            ids = manifest["ids"][model._meta.label]
            rows = list(model.objects.select_for_update().filter(pk__in=ids))
            if len(rows) != len(ids):
                raise ValueError("missing seed records")
            objects.extend(rows)
        if snapshot(objects) != manifest["fingerprint"]:
            raise ValueError("seed records have been edited")
        # Check every reverse relation, including SET_NULL dependencies.
        for obj in objects:
            for relation in obj._meta.related_objects:
                related = relation.related_model.objects.filter(**{relation.field.attname: obj.pk})
                allowed = manifest["ids"].get(relation.related_model._meta.label, [])
                if related.exclude(pk__in=allowed).exists():
                    raise ValueError("additional dependent records exist")
        return objects, manifest
    except (signing.BadSignature, KeyError, TypeError, ValueError) as exc:
        raise CommandError(f"Refusing to change seed data: {exc}. No records changed.") from exc


class Command(BaseCommand):
    help = "Seed or safely clean up minimal, marked Contractors test data for Sep/Oct 2026."

    def add_arguments(self, parser):
        parser.add_argument("--restaurant", type=int, required=True)
        parser.add_argument("--branch", type=int, required=True)
        parser.add_argument("--dry-run", action="store_true", help="Read-only plan; never inserts/deletes rows.")
        parser.add_argument("--cleanup", action="store_true")
        parser.add_argument("--confirm", help="Explicit confirmation: seed:RESTAURANT:BRANCH or cleanup:RESTAURANT:BRANCH")

    @transaction.atomic
    def handle(self, *args, **options):
        try:
            restaurant = Restaurant.objects.get(pk=options["restaurant"])
            # Serialize concurrent invocations without updating the branch.
            branch = Branch.objects.select_for_update().get(pk=options["branch"], restaurant=restaurant)
        except (Restaurant.DoesNotExist, Branch.DoesNotExist) as exc:
            raise CommandError("Select an existing restaurant and a branch belonging to it.") from exc
        action = "cleanup" if options["cleanup"] else "seed"
        token = f"{action}:{restaurant.pk}:{branch.pk}"
        self.stdout.write(f"{action}: restaurant {restaurant.pk} ({restaurant.name}), branch {branch.pk} ({branch.name})")
        root = Contractor.objects.filter(restaurant=restaurant, branch=branch, name=f"{TAG} {NAMES[0]}").first()
        objects = []
        if root:
            objects, manifest = owned_graph(root, restaurant, branch)
            self.stdout.write(json.dumps(manifest["ids"], sort_keys=True))
        elif Contractor.objects.filter(restaurant=restaurant, branch=branch, name__startswith=TAG).exists():
            raise CommandError("Incomplete or conflicting seed markers; refusing to change existing records.")
        if options["dry_run"]:
            self.stdout.write("DRY RUN: " + (f"would remove {len(objects)} owned records" if options["cleanup"] else
                              "already seeded; no changes" if root else "would create 4 contractors, 4 contracts, 6 invoices, 8 lines, 5 payments"))
            self.stdout.write(f"To write, pass --confirm {token}")
            return
        if options["confirm"] != token:
            raise CommandError(f"Explicit scope confirmation required: --confirm {token}")
        if options["cleanup"]:
            # Delete only manifest IDs in dependency order, after checking all relations.
            for model in reversed(MODELS):
                model.objects.filter(pk__in=[o.pk for o in objects if type(o) is model]).delete()
            self.stdout.write(self.style.SUCCESS(f"Removed {len(objects)} owned records; other data untouched."))
            return
        if root:
            self.stdout.write(self.style.SUCCESS("Already seeded; no records changed."))
            return
        providers = []
        for index, name in enumerate(NAMES):
            providers.append(Contractor.objects.create(
                restaurant=restaurant, branch=branch, name=f"{TAG} {name}",
                contact_person=("Ahmad Rahimi", "Farida Azizi", "Omar Noori", "Nasir Wardak")[index],
                email=f"contractor-test-{index + 1}@example.invalid", address="Kabul (synthetic test address)", notes=TAG))
        objects.extend(providers)
        contracts = []
        for index, (title, value, status, start, end) in enumerate([
            ("Refrigeration preventive maintenance", "18000", "active", "2026-09-01", "2026-12-31"),
            ("Kitchen deep cleaning", "9000", "completed", "2026-09-01", "2026-10-20"),
            ("Electrical safety inspection", "4000", "draft", "2026-10-01", "2026-11-30"),
            ("Seasonal pest control", "6000", "expired", "2026-09-01", "2026-09-30"),
        ]):
            contracts.append(ServiceContract.objects.create(
                restaurant=restaurant, branch=branch, contractor=providers[index], title=f"{TAG} {title}",
                contract_value=value, status=status, start_date=start, end_date=end, notes=TAG))
        objects.extend(contracts)
        invoices = []
        specs = [
            (0, "2026-09-05", False, [("Maintenance", "Cold-room servicing", "2", "2000"), ("Maintenance", "Refrigerant refill", "1", "2000")]),
            (1, "2026-09-12", False, [("Cleaning", "Hood degreasing", "1", "2000"), ("Cleaning", "Kitchen deep clean", "1", "1000")]),
            (3, "2026-09-18", False, [("Pest Control", "Dining and storage treatment", "1", "2500")]),
            (0, "2026-10-05", False, [("Maintenance", "October refrigeration servicing", "2", "2000")]),
            (1, "2026-10-12", False, [("Cleaning", "October kitchen deep clean", "1", "3500")]),
            (2, "2026-10-20", True, [("Electrical", "Proposed wiring safety inspection", "1", "1800")]),
        ]
        for index, (provider, day, draft, lines) in enumerate(specs, 1):
            invoice = create_contractor_invoice({
                "contractor": providers[provider].pk, "contract": contracts[provider].pk,
                "invoice_number": f"TEST-CS26-{index:02d}", "invoice_date": day,
                "due_date": date.fromisoformat(day) + timedelta(days=14), "description": TAG,
                "status": "draft" if draft else "approved",
                "lines": [dict(service_type=s, description=d, quantity=q, unit_price=p) for s, d, q, p in lines],
            }, restaurant, branch)
            invoices.append(invoice)
        for index, (inv, day, amount, method) in enumerate([
            (0, "2026-09-10", "2000", "cash"),
            (1, "2026-09-15", "3000", "bank_transfer"),
            (0, "2026-10-02", "1000", "bank_transfer"),
            (3, "2026-10-10", "4000", "card"),
            (4, "2026-10-15", "1500", "mobile_money"),
        ], 1):
            objects.append(create_contractor_payment({
                "contractor": invoices[inv].contractor_id, "invoice": invoices[inv].pk,
                "date": day, "amount": amount, "payment_method": method,
                "reference_number": f"TEST-CS26-P{index:02d}", "notes": TAG,
            }, restaurant, branch))
        # Retired provider has a valid historical approved invoice but no payments.
        providers[3].is_active = False
        providers[3].save(update_fields=["is_active", "updated_at"])
        for invoice in invoices:
            invoice.refresh_from_db()
            objects.extend([invoice, *invoice.lines.all()])
        # Normalize assigned strings/Decimals to the database's field precision
        # before hashing, so a later read produces the same fingerprint.
        for obj in objects:
            obj.refresh_from_db()
        ids = {model._meta.label: sorted(o.pk for o in objects if type(o) is model) for model in MODELS}
        manifest = {"scope": [restaurant.pk, branch.pk], "ids": ids, "fingerprint": snapshot(objects)}
        providers[0].notes = TAG + "\n" + signing.dumps(manifest, salt=SALT, compress=True)
        providers[0].save(update_fields=["notes"])
        self.stdout.write(self.style.SUCCESS("Created 4 contractors, 4 contracts, 6 invoices, 8 lines, 5 payments."))
        self.stdout.write(json.dumps(ids, sort_keys=True))
        self.stdout.write("Recognized charges 19000.00; payments 11500.00; outstanding 7500.00; draft 1800.00.")
