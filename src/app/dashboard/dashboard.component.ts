import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  currentChartType: string = 'bar-vertical'; // Tipo inicial
  chartData: any[] = [
    { name: 'Categoria 1', value: 8940 },
    { name: 'Categoria 2', value: 5000 },
    { name: 'Categoria 3', value: 7200 },
    { name: 'Categoria 4', value: 6200 },
  ];

  // Dados para o gráfico de linha
  lineChartData: any[] = [
    {
      name: 'Série 1',
      series: [
        { name: 'Jan', value: 50 },
        { name: 'Fev', value: 80 },
        { name: 'Mar', value: 65 }
      ]
    },
    {
      name: 'Série 2',
      series: [
        { name: 'Jan', value: 70 },
        { name: 'Fev', value: 90 },
        { name: 'Mar', value: 85 }
      ]
    }
  ];

  changeChartType(type: string) {
    this.currentChartType = type;

    // Alternar os dados conforme o tipo de gráfico
    if (type === 'line') {
      this.chartData = this.lineChartData;
    } else {
      this.chartData = [
        { name: 'Categoria 1', value: 8940 },
        { name: 'Categoria 2', value: 5000 },
        { name: 'Categoria 3', value: 7200 },
        { name: 'Categoria 4', value: 6200 }
      ];
    }
  }

}
