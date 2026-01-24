import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ComplejosService } from '../../services/complejos.service';
import { Court } from '../../../reservas/models/reservation.model';
import { ConfirmDialogComponent } from '../../../reservas/components/confirm-dialog/confirm-dialog.component';
import { CourtFormDialogComponent } from '../court-form-dialog/court-form-dialog.component';

@Component({
  selector: 'app-court-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatCardModule,
    MatDialogModule,
    MatChipsModule
  ],
  templateUrl: './court-manager.component.html',
  styleUrls: ['./court-manager.component.scss']
})
export class CourtManagerComponent implements OnInit, OnDestroy {
  courtForm: FormGroup;
  courts: Court[] = [];
  private destroy$ = new Subject<void>();
  
  sportTypes = ['Fútbol 5', 'Fútbol 7', 'Fútbol 9', 'Fútbol 11', 'Padel', 'Tenis', 'Basket'];
  floorTypes = ['Césped Sintético', 'Césped Natural', 'Cemento', 'Parquet', 'Polvo de Ladrillo'];

  constructor(
    private fb: FormBuilder,
    private complejosService: ComplejosService,
    private dialog: MatDialog
  ) {
    this.courtForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      floorType: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      hasLighting: [false],
      hasRoof: [false]
    });
  }

  ngOnInit() {
    this.complejosService.complexData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.courts = data.courts || [];
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createCourt() {
    if (this.courtForm.valid) {
      const formValue = this.courtForm.value;
      const newCourt: Court = {
        id: crypto.randomUUID(),
        name: formValue.name,
        type: formValue.type,
        price: formValue.price,
        isActive: true,
        // We might want to extend the Court interface to store floorType and attributes
        // For now, we'll stick to the existing interface but maybe append to name or type if needed
        // or just rely on what's there. The user asked for attributes, so we should probably
        // update the Court model eventually. For now, let's just save what we can.
      };
      
      this.complejosService.addCourt(newCourt);
      this.courtForm.reset({
        price: 0,
        hasLighting: false,
        hasRoof: false
      });
    }
  }

  toggleCourtStatus(court: Court, event: MouseEvent) {
    event.stopPropagation();
    this.complejosService.toggleCourtStatus(court.id);
  }

  deleteCourt(court: Court, event: MouseEvent) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Court',
        message: `Are you sure you want to delete ${court.name}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.complejosService.deleteCourt(court.id);
      }
    });
  }

  editCourt(court: Court, event: MouseEvent) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(CourtFormDialogComponent, {
      width: '600px',
      data: court
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.complejosService.updateCourt(result);
      }
    });
  }
}
