import { Component, Input, OnInit } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard-graph',
  templateUrl: './dashboard-graph.component.html',
  styleUrls: ['./dashboard-graph.component.scss']
})
export class DashboardGraphComponent implements OnInit {
  @Input() chartType: string = 'bar-vertical'; // Tipo de gráfico padrão
  @Input() chartData: any[] = [];
  @Input() chartLabels: string[] = [];

  view: [number, number] = [700, 400]; // Tamanho do gráfico

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  ngOnInit(): void {
    if (!this.chartData.length) {
      console.warn('Nenhum dado foi fornecido para o gráfico.');
    }
  }
}
