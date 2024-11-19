import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-chart-explanation-modal',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.description }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content {
        font-size: 14px;
      }
      mat-dialog-title {
        font-size: 18px;
        font-weight: bold;
      }
    `,
  ],
})
export class ChartExplanationModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; description: string }) {}
}
