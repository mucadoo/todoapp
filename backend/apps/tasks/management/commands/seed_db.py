import json
import os
from django.conf import settings
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from tasks.models import Category, Task
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds the database with initial data for development"

    def handle(self, *args, **options):
        seed_file_path = os.path.join(settings.BASE_DIR, "seed_data.json")

        if not os.path.exists(seed_file_path):
            self.stdout.write(
                self.style.ERROR(f"Seed file not found: {seed_file_path}")
            )
            return

        with open(seed_file_path, "r") as f:
            data = json.load(f)

        self.stdout.write("Seeding database...")

        # Support both old format (single user) and new format (list of users)
        users_list = data.get("users")
        if not users_list:
            # Fallback to old format
            users_list = [data.get("user", {})]
            # In old format, categories and tasks were top-level
            users_list[0]["categories"] = data.get("categories", [])
            users_list[0]["tasks"] = data.get("tasks", [])

        for user_data in users_list:
            email = user_data.get("email", "dev@example.com")
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": user_data.get("username", email.split("@")[0]),
                    "name": user_data.get("name", "Dev User"),
                },
            )
            if created:
                user.set_password(user_data.get("password", "password123"))
                user.save()
                self.stdout.write(f"Created user: {email}")
            else:
                self.stdout.write(f"User {email} already exists")

            # Create categories for this user
            categories_dict = {}
            for cat_data in user_data.get("categories", []):
                cat, created = Category.objects.get_or_create(
                    name=cat_data["name"],
                    owner=user,
                    defaults={"color": cat_data["color"]},
                )
                categories_dict[cat_data["name"]] = cat
                if created:
                    self.stdout.write(
                        f"Created category: {cat_data['name']} for {email}"
                    )

            # Create tasks for this user
            for t_data in user_data.get("tasks", []):
                due_date = None
                if t_data.get("due_days") is not None:
                    due_date = timezone.now() + timedelta(days=t_data["due_days"])
                elif t_data.get("due_hours") is not None:
                    due_date = timezone.now() + timedelta(hours=t_data["due_hours"])

                category = categories_dict.get(t_data.get("category"))

                task, created = Task.objects.get_or_create(
                    title=t_data["title"],
                    owner=user,
                    defaults={
                        "description": t_data["description"],
                        "priority": t_data["priority"],
                        "category": category,
                        "due_date": due_date,
                    },
                )

                if t_data.get("share_with"):
                    user_to_share = User.objects.filter(
                        email=t_data["share_with"]
                    ).first()
                    if user_to_share:
                        task.shared_with.add(user_to_share)

                if created:
                    self.stdout.write(f"Created task: {t_data['title']} for {email}")

        self.stdout.write(self.style.SUCCESS("Successfully seeded database"))
