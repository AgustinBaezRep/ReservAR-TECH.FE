import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ComplexSearchResult } from '../models/player.model';

@Injectable({
    providedIn: 'root'
})
export class PlayerService {

    private complexes: ComplexSearchResult[] = [
        {
            id: '1',
            name: 'Ave Fenix',
            location: 'Pres. Roca 3650, Rosario, Santa Fe',
            minPrice: 40000,
            imageUrl: 'https://placehold.co/600x400/2a9d8f/ffffff?text=Ave+Fenix',
            sports: ['Futbol 5', 'Futbol 7'],
            availableSlots: ['11:00', '11:30', '12:00', '12:30']
        },
        {
            id: '2',
            name: 'Loyal Chacabuco',
            location: 'Chacabuco 1939, Rosario',
            minPrice: 28000,
            imageUrl: 'https://placehold.co/600x400/e9c46a/ffffff?text=Loyal',
            sports: ['Padel', 'Tenis'],
            availableSlots: ['12:00', '13:30']
        },
        {
            id: '3',
            name: 'El Predio VGG',
            location: 'Buenos Aires 1906, Villa Gobernador Galvez',
            minPrice: 28000,
            imageUrl: 'https://placehold.co/600x400/f4a261/ffffff?text=El+Predio',
            sports: ['Futbol 5', 'Futbol 7', 'Futbol 11'],
            availableSlots: ['12:00', '13:30']
        },
        {
            id: '4',
            name: 'Ova Padel',
            location: 'Colectora 25 de mayo 4151, Rosario',
            minPrice: 26000,
            imageUrl: 'https://placehold.co/600x400/e76f51/ffffff?text=Ova+Padel',
            sports: ['Padel'],
            availableSlots: ['11:00', '12:30', '14:00']
        },
        {
            id: '5',
            name: 'KM 8 Club de Padel',
            location: 'Angel marino Gervaso y autopista',
            minPrice: 28000,
            imageUrl: 'https://placehold.co/600x400/264653/ffffff?text=KM+8',
            sports: ['Padel', 'Tenis'],
            availableSlots: ['11:30', '13:00']
        }
    ];

    constructor() { }

    getComplexes(): Observable<ComplexSearchResult[]> {
        return of(this.complexes);
    }

    getComplexById(id: string): Observable<ComplexSearchResult | undefined> {
        const complex = this.complexes.find(c => c.id === id);
        return of(complex);
    }
}
