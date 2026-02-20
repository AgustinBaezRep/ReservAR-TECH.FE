import { Component, EventEmitter, Output, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';

interface SportOption {
  name: string;
  icon: string;
  slotDuration: number;
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
  @ViewChild('picker') picker!: MatDatepicker<Date>;
  @ViewChild('sportSelect') sportSelect!: MatSelect;
  @ViewChild('timeSelect') timeSelect!: MatSelect;
  @ViewChild('citySelect') citySelect!: MatSelect;

  searchForm: FormGroup;
  today = new Date();

  cities: string[] = ['Rosario, Santa Fe', 'Funes, Santa Fe', 'Roldán, Santa Fe'];

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
      time: [''],
      city: ['Rosario, Santa Fe']
    });
  }

  ngOnInit() {
    this.generateTimeSlots(60);

    this.searchForm.get('sport')?.valueChanges.subscribe((sportName: string) => {
      const sport = this.sports.find(s => s.name === sportName);
      if (sport) {
        this.selectedSport = sport;
        this.generateTimeSlots(sport.slotDuration);
        this.searchForm.patchValue({ time: '' });
      }
    });
  }




  closeAllFilters() {
    if (this.picker) {
      this.picker.close();
    }
    if (this.sportSelect) {
      this.sportSelect.close();
    }
    if (this.timeSelect) {
      this.timeSelect.close();
    }
  }

  generateTimeSlots(durationMinutes: number) {
    this.timeSlots = [];
    const startMinutes = 8 * 60;
    const endMinutes = 23 * 60;

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

  getFormattedDate(): string {
    const date = this.searchForm.get('date')?.value;
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  onSearch() {
    this.search.emit(this.searchForm.value);
  }
}
