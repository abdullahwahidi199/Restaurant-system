from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from .models import Branch, BranchDataMigrationLog


MIGRATION_TYPES = {
    "ingredients",
    "categories",
    "menu_items",
    "platters",
    "modifiers",
    "everything",
}


TYPE_ORDER = {
    "ingredients": ["units", "ingredient_categories", "ingredients"],
    "categories": ["categories"],
    "menu_items": [
        "units",
        "ingredient_categories",
        "ingredients",
        "categories",
        "menu_items",
        "recipes",
    ],
    "platters": [
        "units",
        "ingredient_categories",
        "ingredients",
        "categories",
        "menu_items",
        "recipes",
        "platters",
    ],
    "modifiers": ["modifiers"],
    "everything": [
        "units",
        "ingredient_categories",
        "ingredients",
        "categories",
        "menu_items",
        "recipes",
        "platters",
        "modifiers",
        "remaining_menu_relationships",
    ],
}


def empty_step():
    return {"imported": 0, "skipped": 0, "failed": 0}


class BranchDataMigrationService:
    def __init__(self, source_branch, destination_branch, migration_type, created_by=None):
        if migration_type not in MIGRATION_TYPES:
            raise ValueError("Invalid migration type.")
        if source_branch.restaurant_id != destination_branch.restaurant_id:
            raise ValueError("Source and destination branches must belong to the same restaurant.")
        if source_branch.id == destination_branch.id:
            raise ValueError("Source and destination branches must be different.")

        self.source_branch = source_branch
        self.destination_branch = destination_branch
        self.restaurant = destination_branch.restaurant
        self.migration_type = migration_type
        self.created_by = created_by
        self.summary = {
            "units": empty_step(),
            "ingredient_categories": empty_step(),
            "ingredients": empty_step(),
            "categories": empty_step(),
            "menu_items": empty_step(),
            "recipes": empty_step(),
            "platters": empty_step(),
            "modifiers": empty_step(),
            "remaining_menu_relationships": empty_step(),
            "inventory_stock": {
                **empty_step(),
                "copied": False,
                "note": (
                    "Inventory quantities, batches, stock movements, purchases, "
                    "transfers, and ledger records are intentionally excluded."
                ),
            },
        }
        self.category_map = {}
        self.ingredient_map = {}
        self.menu_item_map = {}
        self.platter_map = {}

    def run(self):
        log = BranchDataMigrationLog.objects.create(
            restaurant=self.restaurant,
            source_branch=self.source_branch,
            destination_branch=self.destination_branch,
            migration_type=self.migration_type,
            created_by=self.created_by,
        )

        try:
            with transaction.atomic():
                for step in TYPE_ORDER[self.migration_type]:
                    getattr(self, f"migrate_{step}")()
        except Exception as exc:
            log.status = "failed"
            log.finished_at = timezone.now()
            log.failed_count = 1
            log.summary = self.summary
            log.error_message = str(exc)
            log.save(
                update_fields=[
                    "status",
                    "finished_at",
                    "failed_count",
                    "summary",
                    "error_message",
                ]
            )
            raise

        imported = sum(step["imported"] for step in self.summary.values())
        skipped = sum(step["skipped"] for step in self.summary.values())
        failed = sum(step["failed"] for step in self.summary.values())

        log.status = "completed"
        log.finished_at = timezone.now()
        log.imported_count = imported
        log.skipped_count = skipped
        log.failed_count = failed
        log.summary = self.summary
        log.save(
            update_fields=[
                "status",
                "finished_at",
                "imported_count",
                "skipped_count",
                "failed_count",
                "summary",
            ]
        )
        return log

    def source_branch_or_legacy(self, queryset):
        branch_qs = queryset.filter(branch=self.source_branch)
        if branch_qs.exists():
            return branch_qs
        return queryset.filter(branch__isnull=True)

    def next_rank(self, rank):
        from menu.models import Category

        if rank is None:
            return None
        exists = Category.objects.filter(
            restaurant=self.restaurant,
            branch=self.destination_branch,
            rank=rank,
        ).exists()
        return None if exists else rank

    def category_key(self, category):
        return (category.name or "").strip().casefold()

    def ingredient_key(self, ingredient):
        return (ingredient.name or "").strip().casefold()

    def menu_item_key(self, item, destination_category):
        return (
            (item.name or "").strip().casefold(),
            destination_category.id if destination_category else None,
        )

    def platter_key(self, platter, destination_category):
        return (
            (platter.name or "").strip().casefold(),
            destination_category.id if destination_category else None,
        )

    def migrate_categories(self):
        from menu.models import Category

        destination_categories = {
            self.category_key(category): category
            for category in Category.objects.filter(
                restaurant=self.restaurant,
                branch=self.destination_branch,
            )
        }

        source_categories = self.source_branch_or_legacy(
            Category.objects.filter(restaurant=self.restaurant)
        ).order_by("rank", "id")

        for category in source_categories:
            key = self.category_key(category)
            existing = destination_categories.get(key)
            if existing:
                self.category_map[category.id] = existing
                self.summary["categories"]["skipped"] += 1
                continue

            target = Category.objects.create(
                restaurant=self.restaurant,
                branch=self.destination_branch,
                name=category.name,
                description=category.description,
                name_dari=category.name_dari,
                name_pashto=category.name_pashto,
                image=category.image,
                rank=self.next_rank(category.rank),
            )
            destination_categories[key] = target
            self.category_map[category.id] = target
            self.summary["categories"]["imported"] += 1

    def get_or_clone_category(self, category):
        if not category:
            return None
        if category.id in self.category_map:
            return self.category_map[category.id]
        self.migrate_categories()
        return self.category_map.get(category.id)

    def migrate_ingredients(self):
        from inventory.models import Ingredient

        self.summary["ingredients"]["stock_quantity_copied"] = False
        self.summary["ingredients"]["note"] = (
            "Only ingredient master data is copied. Destination stock quantity starts at zero."
        )

        destination_ingredients = {
            self.ingredient_key(ingredient): ingredient
            for ingredient in Ingredient.objects.filter(
                restaurant=self.restaurant,
                branch=self.destination_branch,
            )
        }

        source_ingredients = self.source_branch_or_legacy(
            Ingredient.objects.filter(restaurant=self.restaurant)
        ).order_by("id")

        for ingredient in source_ingredients:
            key = self.ingredient_key(ingredient)
            existing = destination_ingredients.get(key)
            if existing:
                self.ingredient_map[ingredient.id] = existing
                self.summary["ingredients"]["skipped"] += 1
                continue

            target = Ingredient.objects.create(
                restaurant=self.restaurant,
                branch=self.destination_branch,
                name=ingredient.name,
                unit=ingredient.unit,
                quantity_available=Decimal("0.000"),
                minimum_threshold=ingredient.minimum_threshold,
                cost_per_unit=ingredient.cost_per_unit,
                is_active=ingredient.is_active,
            )
            destination_ingredients[key] = target
            self.ingredient_map[ingredient.id] = target
            self.summary["ingredients"]["imported"] += 1

    def get_or_clone_ingredient(self, ingredient):
        if ingredient.id in self.ingredient_map:
            return self.ingredient_map[ingredient.id]
        self.migrate_ingredients()
        return self.ingredient_map.get(ingredient.id)

    def source_menu_items(self):
        from menu.models import MenuItem

        return self.source_branch_or_legacy(
            MenuItem.objects.filter(restaurant=self.restaurant)
        ).select_related("category").prefetch_related("ingredients__ingredient").order_by("id")

    def migrate_menu_items(self):
        from menu.models import MenuItem

        if not self.category_map:
            self.migrate_categories()

        destination_items = {}
        for item in MenuItem.objects.filter(
            restaurant=self.restaurant,
            branch=self.destination_branch,
        ).select_related("category"):
            destination_items[self.menu_item_key(item, item.category)] = item

        for item in self.source_menu_items():
            target_category = self.get_or_clone_category(item.category)
            key = self.menu_item_key(item, target_category)
            existing = destination_items.get(key)
            if existing:
                self.menu_item_map[item.id] = existing
                self.summary["menu_items"]["skipped"] += 1
                continue

            target = MenuItem.objects.create(
                restaurant=self.restaurant,
                branch=self.destination_branch,
                name=item.name,
                name_dari=item.name_dari,
                name_pashto=item.name_pashto,
                description=item.description,
                description_dari=item.description_dari,
                description_pashto=item.description_pashto,
                price=item.price,
                image=item.image,
                is_available=item.is_available,
                is_manually_available=item.is_manually_available,
                category=target_category,
                uses_daily_production=item.uses_daily_production,
            )
            destination_items[key] = target
            self.menu_item_map[item.id] = target
            self.summary["menu_items"]["imported"] += 1

    def migrate_recipes(self):
        from inventory.models import MenuItemIngredient

        if not self.ingredient_map:
            self.migrate_ingredients()
        if not self.menu_item_map:
            self.migrate_menu_items()

        source_item_ids = list(self.menu_item_map.keys())
        recipes = (
            MenuItemIngredient.objects.filter(menu_item_id__in=source_item_ids)
            .select_related("ingredient", "menu_item")
            .order_by("id")
        )

        for recipe in recipes:
            target_item = self.menu_item_map.get(recipe.menu_item_id)
            target_ingredient = self.get_or_clone_ingredient(recipe.ingredient)
            if not target_item or not target_ingredient:
                self.summary["recipes"]["failed"] += 1
                continue

            _, created = MenuItemIngredient.objects.get_or_create(
                menu_item=target_item,
                ingredient=target_ingredient,
                defaults={"quantity_required": recipe.quantity_required},
            )
            if created:
                self.summary["recipes"]["imported"] += 1
            else:
                self.summary["recipes"]["skipped"] += 1

    def migrate_platters(self):
        from menu.models import Platter, PlatterItem

        if not self.category_map:
            self.migrate_categories()
        if not self.menu_item_map:
            self.migrate_menu_items()
        if not self.summary["recipes"]["imported"] and not self.summary["recipes"]["skipped"]:
            self.migrate_recipes()

        destination_platters = {}
        for platter in Platter.objects.filter(
            restaurant=self.restaurant,
            branch=self.destination_branch,
        ).select_related("category"):
            destination_platters[self.platter_key(platter, platter.category)] = platter

        source_platters = self.source_branch_or_legacy(
            Platter.objects.filter(restaurant=self.restaurant)
        ).select_related("category").prefetch_related("items__menu_item").order_by("id")

        for platter in source_platters:
            target_category = self.get_or_clone_category(platter.category)
            key = self.platter_key(platter, target_category)
            existing = destination_platters.get(key)
            if existing:
                self.platter_map[platter.id] = existing
                self.summary["platters"]["skipped"] += 1
                continue

            target = Platter.objects.create(
                restaurant=self.restaurant,
                branch=self.destination_branch,
                name=platter.name,
                name_dari=platter.name_dari,
                name_pashto=platter.name_pashto,
                description=platter.description,
                description_dari=platter.description_dari,
                description_pashto=platter.description_pashto,
                price=platter.price,
                image=platter.image,
                is_available=platter.is_available,
                is_manually_available=platter.is_manually_available,
                category=target_category,
            )
            destination_platters[key] = target
            self.platter_map[platter.id] = target
            self.summary["platters"]["imported"] += 1

            platter_items = []
            for source_item in platter.items.all():
                target_menu_item = self.menu_item_map.get(source_item.menu_item_id)
                if target_menu_item:
                    platter_items.append(
                        PlatterItem(
                            platter=target,
                            menu_item=target_menu_item,
                            quantity=source_item.quantity,
                        )
                    )
            PlatterItem.objects.bulk_create(platter_items, batch_size=200)

    def migrate_modifiers(self):
        self.summary["modifiers"]["skipped"] += 1
        self.summary["modifiers"]["note"] = "No modifier model is configured in this project."

    def migrate_units(self):
        self.summary["units"]["note"] = (
            "Ingredient units are stored directly on each ingredient in this project."
        )

    def migrate_ingredient_categories(self):
        self.summary["ingredient_categories"]["note"] = (
            "No separate ingredient category model is configured in this project."
        )

    def migrate_remaining_menu_relationships(self):
        self.summary["remaining_menu_relationships"]["note"] = (
            "Menu item recipes and platter items are copied by the recipe and platter steps."
        )


def run_branch_data_migration(source_branch, destination_branch, migration_type, created_by=None):
    service = BranchDataMigrationService(
        source_branch=source_branch,
        destination_branch=destination_branch,
        migration_type=migration_type,
        created_by=created_by,
    )
    return service.run()


def available_source_branches_for(destination_branch):
    return Branch.objects.filter(
        restaurant=destination_branch.restaurant,
        is_active=True,
    ).exclude(pk=destination_branch.pk)
