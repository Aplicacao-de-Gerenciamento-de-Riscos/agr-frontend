import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Area, Bar, Column, Line, Pie } from '@antv/g2plot';
import { ChartExplanationModalComponent } from '../chart-explanation-modal/chart-explanation-modal.component';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  constructor(private http: HttpClient, private dialog: MatDialog, private elementRef: ElementRef) { }

  private charts: any[] = []; // Armazena as instâncias dos gráficos criados

  // Lista de projetos
  projects: {
    id: number;
    key: string;
    boardId: number;
  }[] = [];

  selectedProject: string = 'all'; // Projeto selecionado, por padrão "Todos"

  // Lista de versões
  versions: {
    id: number;
    name: string;
  }[] = [];

  // Dados originais dos gráficos (mock com projetos e versões)
  originalRiskPredictionData = [
    { project: 'MFM', version: 'MFM - V1.0', risk: 70 },
    { project: 'MFM', version: 'MFM - V2.0', risk: 65 },
    { project: 'MFM', version: 'MFM - V3.0', risk: 75 },
    { project: 'MFM', version: 'MFM - V4.0', risk: 80 },
    { project: 'MFM', version: 'MFM - V5.0', risk: 85 },
    { project: 'MFM', version: 'MFM - V6.0', risk: 60 },
    { project: 'MFM', version: 'MFM - V7.0', risk: 50 },
    { project: 'MFM', version: 'MFM - V8.0', risk: 55 },

    { project: 'TFM', version: 'TFM - V1.0', risk: 60 },
    { project: 'TFM', version: 'TFM - V2.0', risk: 65 },
    { project: 'TFM', version: 'TFM - V3.0', risk: 70 },
    { project: 'TFM', version: 'TFM - V4.0', risk: 75 },
    { project: 'TFM', version: 'TFM - V5.0', risk: 80 },
    { project: 'TFM', version: 'TFM - V6.0', risk: 85 },
    { project: 'TFM', version: 'TFM - V7.0', risk: 50 },
    { project: 'TFM', version: 'TFM - V8.0', risk: 55 },

    { project: 'WSM', version: 'WSM - V1.0', risk: 50 },
    { project: 'WSM', version: 'WSM - V2.0', risk: 45 },
    { project: 'WSM', version: 'WSM - V3.0', risk: 55 },
    { project: 'WSM', version: 'WSM - V4.0', risk: 60 },
    { project: 'WSM', version: 'WSM - V5.0', risk: 65 },
    { project: 'WSM', version: 'WSM - V6.0', risk: 70 },
    { project: 'WSM', version: 'WSM - V7.0', risk: 75 },
    { project: 'WSM', version: 'WSM - V8.0', risk: 80 },
  ];

  originalDeliveryChartData = [
    { project: 'MFM', version: 'MFM - V1.0', type: 'New Feature', value: 25 },
    { project: 'MFM', version: 'MFM - V1.0', type: 'Bug', value: 30 },
    { project: 'MFM', version: 'MFM - V2.0', type: 'New Feature', value: 20 },
    { project: 'MFM', version: 'MFM - V2.0', type: 'Bug', value: 25 },
    { project: 'MFM', version: 'MFM - V3.0', type: 'New Feature', value: 15 },
    { project: 'MFM', version: 'MFM - V3.0', type: 'Bug', value: 20 },
    // Mais versões para MFM...
    { project: 'MFM', version: 'MFM - V8.0', type: 'New Feature', value: 30 },
    { project: 'MFM', version: 'MFM - V8.0', type: 'Bug', value: 25 },

    { project: 'TFM', version: 'TFM - V1.0', type: 'New Feature', value: 25 },
    { project: 'TFM', version: 'TFM - V1.0', type: 'Bug', value: 35 },
    { project: 'TFM', version: 'TFM - V2.0', type: 'New Feature', value: 20 },
    { project: 'TFM', version: 'TFM - V2.0', type: 'Bug', value: 30 },
    // Mais versões para TFM...
    { project: 'TFM', version: 'TFM - V8.0', type: 'New Feature', value: 40 },
    { project: 'TFM', version: 'TFM - V8.0', type: 'Bug', value: 35 },

    { project: 'WSM', version: 'WSM - V1.0', type: 'New Feature', value: 15 },
    { project: 'WSM', version: 'WSM - V1.0', type: 'Bug', value: 20 },
    { project: 'WSM', version: 'WSM - V2.0', type: 'New Feature', value: 10 },
    { project: 'WSM', version: 'WSM - V2.0', type: 'Bug', value: 25 },
    // Mais versões para WSM...
    { project: 'WSM', version: 'WSM - V8.0', type: 'New Feature', value: 35 },
    { project: 'WSM', version: 'WSM - V8.0', type: 'Bug', value: 40 },
  ];

  originalBugPercentageData = [
    { project: 'MFM', version: 'MFM - V1.0', percentage: 20 },
    { project: 'MFM', version: 'MFM - V2.0', percentage: 15 },
    { project: 'MFM', version: 'MFM - V3.0', percentage: 25 },
    { project: 'MFM', version: 'MFM - V4.0', percentage: 30 },
    { project: 'MFM', version: 'MFM - V5.0', percentage: 35 },
    { project: 'MFM', version: 'MFM - V6.0', percentage: 40 },
    { project: 'MFM', version: 'MFM - V7.0', percentage: 50 },
    { project: 'MFM', version: 'MFM - V8.0', percentage: 55 },

    { project: 'TFM', version: 'TFM - V1.0', percentage: 25 },
    { project: 'TFM', version: 'TFM - V2.0', percentage: 30 },
    { project: 'TFM', version: 'TFM - V3.0', percentage: 35 },
    { project: 'TFM', version: 'TFM - V4.0', percentage: 40 },
    { project: 'TFM', version: 'TFM - V5.0', percentage: 45 },
    { project: 'TFM', version: 'TFM - V6.0', percentage: 50 },
    { project: 'TFM', version: 'TFM - V7.0', percentage: 55 },
    { project: 'TFM', version: 'TFM - V8.0', percentage: 60 },

    { project: 'WSM', version: 'WSM - V1.0', percentage: 15 },
    { project: 'WSM', version: 'WSM - V2.0', percentage: 20 },
    { project: 'WSM', version: 'WSM - V3.0', percentage: 25 },
    { project: 'WSM', version: 'WSM - V4.0', percentage: 30 },
    { project: 'WSM', version: 'WSM - V5.0', percentage: 35 },
    { project: 'WSM', version: 'WSM - V6.0', percentage: 40 },
    { project: 'WSM', version: 'WSM - V7.0', percentage: 45 },
    { project: 'WSM', version: 'WSM - V8.0', percentage: 50 },
  ];

  originalCriticalIssuesChartData = [
    { project: 'MFM', version: 'MFM - V1.0', type: 'Critical', percentage: 10 },
    { project: 'MFM', version: 'MFM - V1.0', type: 'Non-Critical', percentage: 15 },
    { project: 'MFM', version: 'MFM - V2.0', type: 'Critical', percentage: 15 },
    { project: 'MFM', version: 'MFM - V2.0', type: 'Non-Critical', percentage: 20 },
    { project: 'MFM', version: 'MFM - V3.0', type: 'Critical', percentage: 20 },
    { project: 'MFM', version: 'MFM - V3.0', type: 'Non-Critical', percentage: 25 },
    // Mais versões para MFM...
    { project: 'MFM', version: 'MFM - V8.0', type: 'Critical', percentage: 25 },
    { project: 'MFM', version: 'MFM - V8.0', type: 'Non-Critical', percentage: 30 },

    { project: 'TFM', version: 'TFM - V1.0', type: 'Critical', percentage: 10 },
    { project: 'TFM', version: 'TFM - V1.0', type: 'Non-Critical', percentage: 20 },
    { project: 'TFM', version: 'TFM - V2.0', type: 'Critical', percentage: 20 },
    { project: 'TFM', version: 'TFM - V2.0', type: 'Non-Critical', percentage: 25 },
    // Mais versões para TFM...
    { project: 'TFM', version: 'TFM - V8.0', type: 'Critical', percentage: 30 },
    { project: 'TFM', version: 'TFM - V8.0', type: 'Non-Critical', percentage: 35 },

    { project: 'WSM', version: 'WSM - V1.0', type: 'Critical', percentage: 5 },
    { project: 'WSM', version: 'WSM - V1.0', type: 'Non-Critical', percentage: 10 },
    { project: 'WSM', version: 'WSM - V2.0', type: 'Critical', percentage: 10 },
    { project: 'WSM', version: 'WSM - V2.0', type: 'Non-Critical', percentage: 15 },
    // Mais versões para WSM...
    { project: 'WSM', version: 'WSM - V8.0', type: 'Critical', percentage: 30 },
    { project: 'WSM', version: 'WSM - V8.0', type: 'Non-Critical', percentage: 35 },
  ];

  originalPlanningVarianceData = [
    { project: 'MFM', version: 'MFM - V1.0', status: 'Planned', value: 10 },
    { project: 'MFM', version: 'MFM - V1.0', status: 'Actual', value: 15 },
    { project: 'MFM', version: 'MFM - V2.0', status: 'Planned', value: 15 },
    { project: 'MFM', version: 'MFM - V2.0', status: 'Actual', value: 20 },
    { project: 'MFM', version: 'MFM - V3.0', status: 'Planned', value: 20 },
    { project: 'MFM', version: 'MFM - V3.0', status: 'Actual', value: 25 },
    // Mais versões para MFM...
    { project: 'MFM', version: 'MFM - V8.0', status: 'Planned', value: 25 },
    { project: 'MFM', version: 'MFM - V8.0', status: 'Actual', value: 30 },

    { project: 'TFM', version: 'TFM - V1.0', status: 'Planned', value: 10 },
    { project: 'TFM', version: 'TFM - V1.0', status: 'Actual', value: 20 },
    { project: 'TFM', version: 'TFM - V2.0', status: 'Planned', value: 20 },
    { project: 'TFM', version: 'TFM - V2.0', status: 'Actual', value: 25 },
    // Mais versões para TFM...
    { project: 'TFM', version: 'TFM - V8.0', status: 'Planned', value: 30 },
    { project: 'TFM', version: 'TFM - V8.0', status: 'Actual', value: 35 },

    { project: 'WSM', version: 'WSM - V1.0', status: 'Planned', value: 5 },
    { project: 'WSM', version: 'WSM - V1.0', status: 'Actual', value: 10 },
    { project: 'WSM', version: 'WSM - V2.0', status: 'Planned', value: 10 },
    { project: 'WSM', version: 'WSM - V2.0', status: 'Actual', value: 15 },
    // Mais versões para WSM...
    { project: 'WSM', version: 'WSM - V8.0', status: 'Planned', value: 30 },
    { project: 'WSM', version: 'WSM - V8.0', status: 'Actual', value: 35 },
  ];

  // Dados filtrados usados pelos gráficos
  riskPredictionData = [...this.originalRiskPredictionData];
  deliveryChartData = [...this.originalDeliveryChartData];
  bugPercentageData = [...this.originalBugPercentageData];
  criticalIssuesChartData = [...this.originalCriticalIssuesChartData];
  planningVarianceData = [...this.originalPlanningVarianceData];

  ngOnInit(): void {
    this.fetchProjects()
      .pipe(
        switchMap((projects) => {
          // Atualiza a lista de projetos
          this.projects = projects;
          // Buscar todas as versões ao entrar na tela
          const allProjectIds = this.projects.map(project => project.id).join(',');
          return this.fetchVersions(allProjectIds);
        })
      )
      .subscribe(() => {
        // Carregar os dados e renderizar gráficos após a conclusão das chamadas HTTP
        this.loadAllData();
        this.renderCharts();
      });
  }

  fetchProjects(): Observable<any[]> {
    const url = `${environment.apiUrl}/v1/project/all`;
    return this.http.get<any[]>(url).pipe(
      tap((projects) => {
        this.projects = projects.map((project) => ({
          key: project.key,
          id: project.id,
          boardId: project.boardId,
        }));
      })
    );
  }

  // Requisição para buscar as versões na API
  fetchVersions(projectIds: string): Observable<any> {
    const url = `${environment.apiUrl}/v1/version/all?projectId=${projectIds}`;
    return this.http.get<any[]>(url).pipe(
      tap((versions) => {
        // Atualiza a lista de versões
        this.versions = versions.map(version => ({
          id: version.id,
          name: version.name,
        }));
      })
    );
  }

  onProjectChange(event: any): void {
    const selected = event.value;
    if (selected === 'all') {
      const allProjectIds = this.projects.map(project => project.id).join(',');
      this.fetchVersions(allProjectIds).subscribe(() => {
        this.loadAllData();
        this.renderCharts();
      });
    } else {
      const selectedProjectIds = this.projects
        .filter(project => selected.id === project.id)
        .map(project => project.id)
        .join(',');

      this.fetchVersions(selectedProjectIds).subscribe(() => {
        this.loadProjectData(selected.key);
        this.renderCharts();
      });
    }
  }

  loadAllData(): void {
    // Carrega todos os dados originais
    this.riskPredictionData = [...this.originalRiskPredictionData];
    this.deliveryChartData = [...this.originalDeliveryChartData];
    this.bugPercentageData = [...this.originalBugPercentageData];
    this.criticalIssuesChartData = [...this.originalCriticalIssuesChartData];
    this.planningVarianceData = [...this.originalPlanningVarianceData];
  }

  loadProjectData(project: string): void {
    // Filtra os dados para o projeto selecionado
    this.riskPredictionData = this.originalRiskPredictionData.filter((data) => data.project === project);
    this.deliveryChartData = this.originalDeliveryChartData.filter((data) => data.project === project);
    this.bugPercentageData = this.originalBugPercentageData.filter((data) => data.project === project);
    this.criticalIssuesChartData = this.originalCriticalIssuesChartData.filter((data) => data.project === project);
    this.planningVarianceData = this.originalPlanningVarianceData.filter((data) => data.project === project);
  }

  openExplanation(title: string, description: string): void {
    this.dialog.open(ChartExplanationModalComponent, {
      data: { title, description },
    });
  }

  ngAfterViewInit(): void {
    // this.renderCharts();
  }

  renderCharts(): void {
    const chartHeight = 280; // Altura fixa do contêiner

    // Função para calcular a largura do gráfico com base no elemento pai
    const calculateChartWidth = (element: HTMLElement): number => 0.9 * (element?.parentElement?.clientWidth ?? 280);

    // Limpa os gráficos antigos antes de renderizar novos
    this.destroyCharts();

    // Função genérica para renderizar gráficos
    const renderChart = (id: string, config: any): void => {
      const chartContainer = this.elementRef.nativeElement.querySelector(`#${id}`);
      if (chartContainer) {
        // Limpa o contêiner do gráfico
        chartContainer.innerHTML = '';

        // Cria e armazena a instância do gráfico
        const chart = new config.chartType(chartContainer, {
          ...config.options,
          width: calculateChartWidth(chartContainer),
          height: chartHeight,
          appendPadding: 20, // Margem interna para evitar cortes
        });
        chart.render();
        this.charts.push(chart); // Armazena a instância do gráfico para destruição futura
      }
    };

    // Renderizar gráficos
    renderChart('risk-prediction-chart', {
      chartType: Pie, // Tipo de gráfico de rosca
      options: {
        data: this.riskPredictionData, // Dados do gráfico
        angleField: 'risk', // Campo que representa os valores numéricos
        colorField: 'version', // Campo que representa as categorias
        radius: 1, // Define o tamanho da rosca
        innerRadius: 0.4, // Define o tamanho do "furo" interno
        label: {
          type: 'inner', // Exibe os rótulos dentro das seções da rosca
          offset: '-50%', // Centraliza os rótulos
          content: '{value}%', // Mostra o valor percentual dentro da rosca
          style: { textAlign: 'center', fontSize: 12 },
        },
        tooltip: {
          formatter: (datum: any) => ({
            name: 'Risco de Atraso',
            value: `${datum.risk}%`, // Exibe o valor percentual
          }),
        },
        legend: {
          position: 'top', // Posiciona a legenda no topo
          layout: 'horizontal',
        },
        color: ['#882255', '#DDCC77', '#e69f00', '#d55e00', '#44AA99', '#009e74', '#117733'], // Paleta de cores
        statistic: null, // Remove a estatística no meio do gráfico
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }], // Adiciona interatividade
      },
    });

    renderChart('delivery-chart', {
      chartType: Bar, // Mantém o gráfico de barras horizontais
      options: {
        data: this.deliveryChartData, // Dados normalizados
        xField: 'value', // Campo que representa os valores no eixo X
        yField: 'version', // Campo que representa as categorias no eixo Y
        seriesField: 'type', // Agrupamento por tipo de tarefa
        isStack: true, // Torna as barras empilhadas
        xAxis: {
          title: { text: 'Percentual (%)' }, // Título do eixo X
          grid: null, // Remove a grade
        },
        yAxis: {
          title: { text: 'Versão' }, // Título do eixo Y
          grid: null, // Remove a grade
        },
        tooltip: {
          formatter: (datum: any) => ({
            name: datum.type, // Nome do tipo de tarefa
            value: `${datum.value}%`, // Exibe o percentual
          }),
        },
        legend: {
          position: 'bottom', // Posiciona a legenda abaixo
          layout: 'horizontal',
        },
        color: ['#cc79a7', '#AA4499', '#CC6677', '#882255'], // Paleta de cores atualizada
        label: {
          position: 'middle', // Mostra os rótulos dentro das barras
          formatter: (datum: any) => `${datum.value}%`, // Mostra o valor percentual
          style: { fill: '#fff', fontSize: 12 }, // Ajusta estilo do rótulo
        },
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }], // Adiciona interatividade ao gráfico
      },
    });

    renderChart('bug-percentage-chart', {
      chartType: Pie, // Altera o tipo do gráfico para rosca
      options: {
        data: this.bugPercentageData, // Os dados usados para o gráfico
        angleField: 'percentage', // Campo que representa os valores
        colorField: 'version', // Campo que representa as categorias
        radius: 1, // Define o tamanho da rosca (1 significa preenchida até a borda)
        innerRadius: 0, // Define o tamanho do "furo" interno para formar a rosca
        label: {
          type: 'inner', // Exibe os rótulos dentro das seções da rosca
          offset: '-50%', // Centraliza os rótulos
          content: '{value}%', // Mostra o valor percentual dentro da rosca
          style: { textAlign: 'center', fontSize: 12 },
        },
        legend: {
          position: 'bottom', // Posiciona a legenda abaixo
          layout: 'horizontal',
        },
        tooltip: {
          formatter: (datum: any) => ({
            name: datum.version, // Nome da versão
            value: `${datum.percentage}%`, // Exibe o percentual
          }),
        },
        color: ['#0072B2', '#56B3E9', '#009E73', '#F0E442', '#E69F00', '#D55E00', '#CC79A7'], // Paleta de cores
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }], // Adiciona interatividade ao gráfico
      },
    });

    renderChart('critical-issues-chart', {
      chartType: Column,
      options: {
        data: this.criticalIssuesChartData, // Dados normalizados
        xField: 'version', // Versões no eixo X
        yField: 'percentage', // Percentual acumulado
        seriesField: 'type', // Críticas e Não Críticas
        isStack: true, // Torna as barras empilhadas
        xAxis: { title: { text: 'Versão' }, grid: null },
        yAxis: {
          title: { text: 'Percentual (%)' },
          grid: null,
          label: {
            formatter: (val: string) => `${Number(val)}%`, // Adiciona o símbolo de porcentagem
          },
        },
        tooltip: {
          formatter: (datum: any) => ({
            name: datum.type, // Tipo (Críticas ou Não Críticas)
            value: `${datum.percentage}%`, // Exibe o percentual
          }),
        },
        label: {
          position: 'middle', // Mostra os rótulos no meio das barras
          style: { fill: '#fff' },
          formatter: (datum: any) => `${datum.percentage}%`, // Formato do rótulo
        },
        color: ['#0072b2', '#56b3e9'], // Cores para Críticas e Não Críticas
        legend: { position: 'bottom', layout: 'horizontal' }, // Legenda abaixo
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }], // Adiciona interatividade
      },
    });

    renderChart('planning-variance-chart', {
      chartType: Area,
      options: {
        data: this.planningVarianceData,
        xField: 'version',
        yField: 'value',
        seriesField: 'status',
        isStack: true,
        xAxis: { grid: null },
        yAxis: { grid: null },
        legend: { position: 'bottom', layout: 'horizontal' },
        color: ['#44AA99', '#0072b2'],
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
      },
    });
  }

  // Destroi todos os gráficos antigos
  private destroyCharts(): void {
    // Destroi as instâncias de gráficos
    this.charts.forEach((chart) => chart.destroy());
    this.charts = []; // Limpa a lista de gráficos

    // Limpa o conteúdo dos contêineres dos gráficos
    const chartContainers = this.elementRef.nativeElement.querySelectorAll('.chart-container');
    chartContainers.forEach((container: HTMLElement) => {
      container.innerHTML = ''; // Remove o conteúdo do contêiner
    });
  }
}
