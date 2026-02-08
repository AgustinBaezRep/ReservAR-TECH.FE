import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

interface SportOption {
  name: string;
  icon: string;  // 'futbol' or 'padel' or 'tenis'
  slotDuration: number; // in minutes
}

@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './search-filters.html',
  styleUrl: './search-filters.scss',
})
export class SearchFiltersComponent implements OnInit {
  @Output() search = new EventEmitter<any>();
  searchForm: FormGroup;

  sports: SportOption[] = [
    { name: 'Padel', icon: 'padel', slotDuration: 90 },
    { name: 'Tenis', icon: 'tenis', slotDuration: 60 },
    { name: 'Futbol 5', icon: 'futbol', slotDuration: 60 },
    { name: 'Futbol 7', icon: 'futbol', slotDuration: 60 },
    { name: 'Futbol 8', icon: 'futbol', slotDuration: 60 },
    { name: 'Futbol 9', icon: 'futbol', slotDuration: 60 },
    { name: 'Futbol 11', icon: 'futbol', slotDuration: 60 }
  ];

  timeSlots: string[] = [];
  selectedSport: SportOption | null = null;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      sport: [''],
      date: [new Date()],
      time: ['']
    });
  }

  ngOnInit() {
    // Generate default time slots (1 hour intervals)
    this.generateTimeSlots(60);

    // Listen for sport changes to update time slots
    this.searchForm.get('sport')?.valueChanges.subscribe((sportName: string) => {
      const sport = this.sports.find(s => s.name === sportName);
      if (sport) {
        this.selectedSport = sport;
        this.generateTimeSlots(sport.slotDuration);
        // Reset time selection when sport changes
        this.searchForm.patchValue({ time: '' });
      }
    });
  }

  generateTimeSlots(durationMinutes: number) {
    this.timeSlots = [];
    const startMinutes = 8 * 60; // 8:00 AM in minutes
    const endMinutes = 23 * 60;  // 11:00 PM in minutes

    for (let totalMinutes = startMinutes; totalMinutes + durationMinutes <= endMinutes; totalMinutes += durationMinutes) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      const formattedHour = hours.toString().padStart(2, '0');
      const formattedMin = mins.toString().padStart(2, '0');
      this.timeSlots.push(`${formattedHour}:${formattedMin}hs`);
    }
  }

  getSportIcon(): string {
    if (!this.selectedSport) return 'sports_tennis';
    switch (this.selectedSport.icon) {
      case 'futbol': return 'sports_soccer';
      case 'padel': return 'sports_tennis';
      case 'tenis': return 'sports_tennis';
      default: return 'sports_tennis';
    }
  }

  onSearch() {
    this.search.emit(this.searchForm.value);
  }
}
