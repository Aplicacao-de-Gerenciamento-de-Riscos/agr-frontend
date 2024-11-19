import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Column, Line } from '@antv/g2plot';
import { ChartExplanationModalComponent } from '../chart-explanation-modal/chart-explanation-modal.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  constructor(private dialog: MatDialog) {}

  openExplanation(title: string, description: string): void {
    this.dialog.open(ChartExplanationModalComponent, {
      data: { title, description },
    });
  }

  // Dados dos gráficos
  riskPredictionData = [
    { version: 'MFM - V3.0', risk: 70, type: 'MFM - V3.0' },
    { version: 'MFM - V4.0', risk: 80, type: 'MFM - V4.0' },
    { version: 'MFM - V5.0', risk: 95, type: 'MFM - V5.0' },
    { version: 'MFM - V6.0', risk: 65, type: 'MFM - V6.0' },
    { version: 'MFM - V7.0', risk: 50, type: 'MFM - V7.0' },
  ];

  deliveryChartData = [
    { version: 'MFM - V3.0', type: 'Improvement', value: 85.1 },
    { version: 'MFM - V3.0', type: 'Bug', value: 100 },
    { version: 'MFM - V4.0', type: 'Improvement', value: 60.1 },
    { version: 'MFM - V4.0', type: 'Bug', value: 100 },
  ];

  bugPercentageData = [
    { version: 'MFM - V2.6', percentage: 18.95 },
    { version: 'MFM - V3.0', percentage: 15.23 },
    { version: 'MFM - V4.0', percentage: 12.5 },
    { version: 'MFM - V5.0', percentage: 9.5 },
  ];

  criticalIssuesChartData = [
    { version: 'MFM - V3.0', type: 'Críticas', value: 20 },
    { version: 'MFM - V3.0', type: 'Não Críticas', value: 80 },
  ];

  planningVarianceData = [
    { version: 'MFM - V3.0', status: 'Done', value: 704 },
    { version: 'MFM - V3.0', status: 'Outros', value: 118 },
    { version: 'MFM - V4.0', status: 'Done', value: 600 },
    { version: 'MFM - V4.0', status: 'Outros', value: 200 },
  ];

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    const chartWidth = 0.5 * (document.querySelector('.graph-block')?.clientWidth ?? 280); // 80% da largura do contêiner
    const chartHeight = 280; // Altura fixa do contêiner

    // Gráfico de Risco de Atraso
    new Column('risk-prediction-chart', {
      data: this.riskPredictionData,
      xField: 'version',
      yField: 'risk',
      label: {
        position: 'middle',
        style: { fill: '#fff' },
      },
      seriesField: 'type',
      width: chartWidth,
      height: chartHeight,
      appendPadding: 20, // Margem interna para evitar corte
    }).render();

    // Gráfico de Percentual de Entrega
    new Column('delivery-chart', {
      data: this.deliveryChartData,
      xField: 'version',
      yField: 'value',
      seriesField: 'type',
      isGroup: true,
      width: chartWidth,
      height: chartHeight,
      appendPadding: 20, // Margem interna para evitar corte
    }).render();

    // Gráfico de Porcentagem de Bugs
    new Line('bug-percentage-chart', {
      data: this.bugPercentageData,
      xField: 'version',
      yField: 'percentage',
      label: {
        style: { fill: '#555' },
      },
      width: chartWidth,
      height: chartHeight,
      appendPadding: 20, // Margem interna para evitar corte
    }).render();

    // Gráfico de Issues Críticas
    new Column('critical-issues-chart', {
      data: this.criticalIssuesChartData,
      xField: 'version',
      yField: 'value',
      seriesField: 'type',
      isStack: true,
      width: chartWidth,
      height: chartHeight,
      appendPadding: 20, // Margem interna para evitar corte
    }).render();

    // Gráfico de Variância de Planejamento
    new Column('planning-variance-chart', {
      data: this.planningVarianceData,
      xField: 'version',
      yField: 'value',
      seriesField: 'status',
      isStack: true,
      width: chartWidth,
      height: chartHeight,
      appendPadding: 20, // Margem interna para evitar corte
    }).render();
  }
}
