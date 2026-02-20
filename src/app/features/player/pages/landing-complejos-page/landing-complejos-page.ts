import { Component, AfterViewInit, OnDestroy, ElementRef, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-landing-complejos-page',
    standalone: true,
    imports: [CommonModule, MatIconModule, FormsModule],
    templateUrl: './landing-complejos-page.html',
    styleUrl: './landing-complejos-page.scss'
})
export class LandingComplejosPageComponent implements AfterViewInit, OnDestroy {
    private el = inject(ElementRef);
    private doc = inject(DOCUMENT);
    private cdr = inject(ChangeDetectorRef);
    private ngZone = inject(NgZone);
    private observer!: IntersectionObserver;

    contactForm = {
        nombre: '',
        email: '',
        telefono: '',
        complejo: '',
        mensaje: ''
    };

    features = [
        {
            icon: 'calendar_month',
            title: 'Gestión de Reservas',
            description: 'Administrá todas tus reservas desde un solo lugar. Creá, editá y cancelá turnos con facilidad. Evitá la doble reserva automáticamente.'
        },
        {
            icon: 'sports_tennis',
            title: 'Administración de Canchas',
            description: 'Configurá tus canchas por deporte, establecé horarios de disponibilidad y activá o desactivá canchas según la temporada.'
        },
        {
            icon: 'attach_money',
            title: 'Precios por Intervalos',
            description: 'Definí precios diferenciados por franja horaria. Cobrá más en horarios pico y ofrecé descuentos en los horarios de menor demanda.'
        },
        {
            icon: 'point_of_sale',
            title: 'Caja y Reportes',
            description: 'Registrá ingresos y egresos vinculados a reservas. Generá reportes diarios con filtros avanzados para un control total de tu negocio.'
        },
        {
            icon: 'group',
            title: 'Gestión de Usuarios',
            description: 'Administrá el acceso de tu equipo. Asigná roles de administrador o empleado con permisos diferenciados para cada función.'
        },
        {
            icon: 'storefront',
            title: 'Perfil del Complejo',
            description: 'Personalizá tu perfil público con fotos, descripción, deportes disponibles y ubicación para atraer más jugadores a tu complejo.'
        },
        {
            icon: 'inventory_2',
            title: 'Control de Productos',
            description: 'Gestioná tu stock de productos para venta en el complejo. Importá productos masivamente por Excel y mantené el inventario actualizado.'
        },
        {
            icon: 'visibility',
            title: 'Visibilidad Online',
            description: 'Tu complejo aparece en nuestro marketplace, donde miles de jugadores buscan canchas. Más visibilidad, más reservas, más ingresos.'
        }
    ];

    steps = [
        {
            number: '01',
            title: 'Registrá tu complejo',
            description: 'Completá el formulario de contacto y nuestro equipo te guiará en el proceso de alta.'
        },
        {
            number: '02',
            title: 'Configurá tus canchas',
            description: 'Agregá tus canchas, definí horarios, precios y deportes disponibles para cada una.'
        },
        {
            number: '03',
            title: 'Empezá a recibir reservas',
            description: 'Tu complejo aparecerá en el marketplace y los jugadores podrán reservar directamente.'
        },
        {
            number: '04',
            title: 'Gestioná todo desde un panel',
            description: 'Controlá reservas, caja, productos y usuarios desde un panel de administración intuitivo.'
        }
    ];

    formSubmitted = false;

    // Counter animation values
    counterComplejos = 0;
    counterReservas = 0;
    counterSatisfaccion = 0;
    private countersAnimated = false;

    ngAfterViewInit() {
        this.setupScrollAnimations();
    }

    ngOnDestroy() {
        this.observer?.disconnect();
    }

    private setupScrollAnimations() {
        // Run outside angular to avoid excessive change detection during observation setup
        this.ngZone.runOutsideAngular(() => {
            const animatedEls = this.el.nativeElement.querySelectorAll('[data-animate]');

            this.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const el = entry.target as HTMLElement;

                            // Re-enter Angular zone to update UI
                            this.ngZone.run(() => {
                                el.classList.add('is-visible');

                                // Trigger counter animation for stats
                                if (el.classList.contains('hero-stats') && !this.countersAnimated) {
                                    this.countersAnimated = true;
                                    this.animateCounters();
                                }

                                this.cdr.markForCheck();
                            });

                            this.observer.unobserve(el);
                        }
                    });
                },
                { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
            );

            animatedEls.forEach((el: Element) => this.observer.observe(el));
        });
    }

    private animateCounters() {
        this.animateValue('counterComplejos', 0, 100, 2000);
        this.animateValue('counterReservas', 0, 5000, 2200);
        this.animateValue('counterSatisfaccion', 0, 98, 1800);
    }

    private animateValue(prop: 'counterComplejos' | 'counterReservas' | 'counterSatisfaccion', start: number, end: number, duration: number) {
        const startTime = performance.now();
        const step = (timestamp: number) => {
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease-out quad
            const eased = 1 - (1 - progress) * (1 - progress);

            this.ngZone.run(() => {
                this[prop] = Math.floor(start + (end - start) * eased);
                if (progress >= 1) {
                    this[prop] = end;
                }
                this.cdr.detectChanges(); // Ensure visual update on every frame
            });

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    }

    scrollToContact() {
        const el = this.doc.querySelector('#contact-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    onSubmit() {
        if (this.contactForm.nombre && this.contactForm.email && this.contactForm.telefono) {
            console.log('Formulario enviado:', this.contactForm);
            this.formSubmitted = true;
        }
    }
}
