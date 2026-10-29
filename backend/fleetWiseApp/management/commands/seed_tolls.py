"""
Management command to seed the trajet_peage table with comprehensive Moroccan toll routes.

Usage: python manage.py seed_tolls

This command is idempotent and can be run multiple times without creating duplicates.
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from fleetWiseApp.models import TrajetPeage


class Command(BaseCommand):
    help = 'Seeds the trajet_peage table with comprehensive Moroccan toll route data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be added without actually creating records',
        )

    def handle(self, *args, **options):
        """
        Main command handler that imports all toll route data.
        Creates bidirectional routes to ensure pricing works regardless of direction.
        """
        
        # Comprehensive toll routes data for Class 3 trucks in Morocco
        TOLL_ROUTES = [
            # Axe A1 : Rabat ↔ Casablanca ↔ Safi
            ("Rabat", "Skhirat", 14.00),
            ("Rabat", "Bouznika", 20.00),
            ("Rabat", "Mohammedia", 30.00),
            ("Rabat", "Casablanca Centre", 41.00),
            ("Rabat", "Tit Mellil", 50.00),
            ("Rabat", "Berrechid", 61.00),
            ("Rabat", "Settat", 71.00),
            ("Rabat", "El Jadida", 72.00),
            ("Rabat", "Safi", 151.00),
            ("Casablanca Centre", "El Jadida", 31.00),
            ("Casablanca Centre", "Safi", 110.00),
            ("Casablanca Centre", "Berrechid", 20.00),
            ("Casablanca Centre", "Settat", 30.00),
            ("El Jadida", "Safi", 65.00),

            # Axe A3 : Rabat ↔ Kénitra ↔ Tanger Med
            ("Rabat", "Kénitra", 27.00),
            ("Rabat", "Larache", 71.00),
            ("Rabat", "Sidi Lyamani", 90.00),
            ("Rabat", "Asilah", 99.00),
            ("Rabat", "Tanger Ouest", 118.00),
            ("Rabat", "Tanger Est", 125.00),
            ("Rabat", "Tanger Med", 138.00),
            ("Kénitra", "Larache", 44.00),
            ("Kénitra", "Asilah", 72.00),
            ("Kénitra", "Tanger Ouest", 91.00),
            ("Kénitra", "Tanger Med", 111.00),
            ("Larache", "Asilah", 28.00),
            ("Larache", "Tanger Ouest", 47.00),
            ("Larache", "Tanger Med", 67.00),
            ("Asilah", "Tanger Ouest", 19.00),
            ("Asilah", "Tanger Med", 39.00),

            # Axe A2 : Rabat ↔ Meknès ↔ Fès ↔ Oujda
            ("Rabat", "Khémisset", 25.00),
            ("Rabat", "Meknès", 50.00),
            ("Rabat", "Fès", 76.00),
            ("Rabat", "Tahla", 110.00),
            ("Rabat", "Taza", 131.00),
            ("Rabat", "Guercif", 165.00),
            ("Rabat", "Oujda", 200.00),
            ("Meknès", "Fès", 26.00),
            ("Meknès", "Taza", 81.00),
            ("Meknès", "Oujda", 150.00),
            ("Fès", "Taza", 55.00),
            ("Fès", "Guercif", 89.00),
            ("Fès", "Oujda", 120.00),
            ("Taza", "Oujda", 65.00),

            # Axe A7 : Casablanca ↔ Marrakech ↔ Agadir
            ("Casablanca", "Berrechid", 20.00),
            ("Casablanca", "Settat", 30.00),
            ("Casablanca", "Skhour Rhamna", 85.00),
            ("Casablanca", "Marrakech", 120.00),
            ("Casablanca", "Chichaoua", 160.00),
            ("Casablanca", "Imintanoute", 190.00),
            ("Casablanca", "Agadir", 253.00),
            ("Settat", "Marrakech", 90.00),
            ("Settat", "Agadir", 223.00),
            ("Marrakech", "Chichaoua", 40.00),
            ("Marrakech", "Imintanoute", 70.00),
            ("Marrakech", "Agadir", 152.00),

            # Axe A5 : Berrechid ↔ Béni Mellal & A4 (Contournement Casa)
            ("Berrechid", "Khouribga", 58.00),
            ("Berrechid", "Oued Zem", 70.00),
            ("Berrechid", "Bejaâd", 75.00),
            ("Berrechid", "Béni Mellal", 85.00),
            ("Tit Mellil", "Berrechid", 19.00),

            # Trajets Longue Distance & Inter-Axes
            ("Tanger Med", "Casablanca", 179.00),
            ("Tanger Med", "Marrakech", 299.00),
            ("Tanger Med", "Agadir", 432.00),
            ("Tanger Med", "Meknès", 188.00),
            ("Tanger Med", "Fès", 214.00),
            ("Tanger Med", "Oujda", 338.00),
            ("Tanger Med", "Béni Mellal", 223.00),
            ("Agadir", "Rabat", 294.00),
            ("Agadir", "Kénitra", 321.00),
            ("Agadir", "Tanger Ouest", 412.00),
            ("Agadir", "Fès", 329.00),
            ("Agadir", "Meknès", 303.00),
            ("Agadir", "Oujda", 494.00),
            ("Agadir", "Béni Mellal", 242.00),
            ("Oujda", "Casablanca", 241.00),
            ("Oujda", "Marrakech", 361.00),
            ("Oujda", "Agadir", 494.00),
            ("Oujda", "Tanger Med", 338.00),
            ("Marrakech", "Fès", 196.00),
            ("Casablanca", "Béni Mellal", 105.00),
            ("Tétouan", "Fnideq", 19.00),
            ("Tétouan", "Tanger Med", 30.00),
        ]

        # Additional city name variations for better matching
        CITY_VARIATIONS = {
            "Casablanca Centre": ["Casablanca", "Casa", "Casablanca-Centre"],
            "Tanger Med": ["Tanger-Med", "TangerMed"],
            "Tanger Ouest": ["Tanger", "Tangier", "Tanger-Ouest"],
            "Tanger Est": ["Tanger-Est"],
            "El Jadida": ["Jadida"],
            "Béni Mellal": ["Beni Mellal", "Béni-Mellal"],
            "Sidi Lyamani": ["Sidi-Lyamani"],
        }

        self.stdout.write(
            self.style.SUCCESS('🚛 Starting toll routes data seeding...')
        )
        
        total_routes_processed = 0
        new_routes_created = 0
        existing_routes_found = 0

        try:
            with transaction.atomic():
                # Process each toll route entry
                for ville_depart, ville_arrivee, prix in TOLL_ROUTES:
                    total_routes_processed += 1
                    
                    # Create forward route
                    forward_created = self._create_route_entry(
                        ville_depart, ville_arrivee, prix, options['dry_run']
                    )
                    if forward_created:
                        new_routes_created += 1
                    else:
                        existing_routes_found += 1

                    # Create reverse route (bidirectional)
                    reverse_created = self._create_route_entry(
                        ville_arrivee, ville_depart, prix, options['dry_run']
                    )
                    if reverse_created:
                        new_routes_created += 1
                    else:
                        existing_routes_found += 1

                    # Progress indicator for every 10 routes
                    if total_routes_processed % 10 == 0:
                        self.stdout.write(f'📍 Processed {total_routes_processed}/{len(TOLL_ROUTES)} base routes...')

                # Add city variations for better matching
                if not options['dry_run']:
                    variations_added = self._add_city_variations(CITY_VARIATIONS, TOLL_ROUTES)
                    new_routes_created += variations_added

                if options['dry_run']:
                    self.stdout.write(
                        self.style.WARNING('🔍 DRY RUN - No data was actually created')
                    )
                else:
                    self.stdout.write(
                        self.style.SUCCESS('💾 Data seeding transaction committed successfully!')
                    )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error during seeding: {str(e)}')
            )
            raise CommandError(f'Seeding failed: {str(e)}')

        # Final summary
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('✅ TOLL ROUTES SEEDING COMPLETE'))
        self.stdout.write(f'📊 Summary:')
        self.stdout.write(f'   • Base routes processed: {total_routes_processed}')
        self.stdout.write(f'   • New routes created: {new_routes_created}')
        self.stdout.write(f'   • Existing routes found: {existing_routes_found}')
        self.stdout.write(f'   • Total database entries: {TrajetPeage.objects.count()}')
        self.stdout.write('')
        self.stdout.write(
            self.style.SUCCESS('🎯 The trajet_peage table is now fully populated with comprehensive Moroccan toll data!')
        )

    def _create_route_entry(self, ville_depart, ville_arrivee, prix, dry_run=False):
        """
        Creates a single toll route entry using get_or_create for idempotency.
        Returns True if a new entry was created, False if it already existed.
        """
        if dry_run:
            exists = TrajetPeage.objects.filter(
                ville_depart__iexact=ville_depart.strip(),
                ville_arrivee__iexact=ville_arrivee.strip()
            ).exists()
            
            if not exists:
                self.stdout.write(f'[DRY RUN] Would create: {ville_depart} → {ville_arrivee} ({prix} MAD)')
                return True
            else:
                self.stdout.write(f'[DRY RUN] Already exists: {ville_depart} → {ville_arrivee}')
                return False
        
        route, created = TrajetPeage.objects.get_or_create(
            ville_depart__iexact=ville_depart.strip(),
            ville_arrivee__iexact=ville_arrivee.strip(),
            defaults={
                'ville_depart': ville_depart.strip(),
                'ville_arrivee': ville_arrivee.strip(),
                'prix': prix
            }
        )

        if created:
            self.stdout.write(f'✅ Created: {ville_depart} → {ville_arrivee} ({prix} MAD)')
        else:
            self.stdout.write(f'ℹ️  Exists: {ville_depart} → {ville_arrivee} ({route.prix} MAD)')
        
        return created

    def _add_city_variations(self, variations, base_routes):
        """
        Adds city name variations to improve route matching.
        Returns the number of variation routes added.
        """
        variations_added = 0
        
        self.stdout.write('🔄 Adding city name variations for better matching...')
        
        for canonical_name, variations_list in variations.items():
            for variation in variations_list:
                # Find all routes with the canonical name and create variations
                for ville_depart, ville_arrivee, prix in base_routes:
                    if ville_depart == canonical_name:
                        created = self._create_route_entry(variation, ville_arrivee, prix)
                        if created:
                            variations_added += 1
                    
                    if ville_arrivee == canonical_name:
                        created = self._create_route_entry(ville_depart, variation, prix)
                        if created:
                            variations_added += 1
        
        self.stdout.write(f'📝 Added {variations_added} city name variations')
        return variations_added
