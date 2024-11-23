import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-chart-explanation-modal',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-divider></mat-divider>
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
        margin-top: 16px;
      }
      mat-dialog-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 16px;
      }
      button {
        text-transform: none;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        background-color: #00579d;
        color: white;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      button:hover {
        background-color: #003366;
        transition: background-color 0.2s;
      }

      h2 {
        margin: 0;
      }
    `,
  ],
})
export class ChartExplanationModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; description: string }) {}
}
