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

  selectedProject: any = {
    id: 0,
    key: 'Projeto',
    boardId: 0,
  } // Projeto selecionado, por padrão "Todos"

  // Lista de versões
  versions: {
    id: number;
    name: string;
  }[] = [];

  // Dados originais dos gráficos (mock com projetos e versões)
  originalRiskPredictionData = [
    { project: 'Projeto', version: 'Versão', risk: 0 }
  ];

  originalDeliveryChartData = [
    { project: 'Projeto', version: 'Versão', type: 'Tipo', value: 0 }
  ];

  originalBugPercentageData = [
    { project: 'Projeto', version: 'Versão', percentage: 20 }
  ];

  originalCriticalIssuesChartData = [
    { project: 'Projeto', version: 'Versão', type: 'Crítico', percentage: 0 },
    { project: 'Projeto', version: 'Versão', type: 'Não Crítico', percentage: 0 }
  ];

  originalPlanningVarianceData = [
    { project: 'Projeto', version: 'Versão', status: 'Done', value: 0 },
    { project: 'Projeto', version: 'Versão', status: 'Outro Status', value: 0 },
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
        tap((projects) => {
          if (projects.length > 0) {
            this.projects = projects;
            this.selectedProject = projects[0]; // Define o primeiro projeto como padrão
          }
        }),
        switchMap(() => {
          if (this.selectedProject) {
            return this.fetchVersions(this.selectedProject.id.toString());
          } else {
            return [];
          }
        }),
        switchMap(() => {
          const versionIds = this.versions.map((version) => version.id).join(',');
          return this.fetchDeliveryMetrics(versionIds).pipe(
            switchMap(() => this.fetchWorkPlanningVarianceMetrics(versionIds)),
            switchMap(() => this.fetchCriticalIssuesMetrics(versionIds)),
            switchMap(() => this.fetchBugIssuesMetrics(versionIds)),
            switchMap(() => this.fetchRiskPredictionMetrics(versionIds))
          );
        })
      )
      .subscribe(() => {
        this.loadProjectData(this.selectedProject.key);
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

  fetchDeliveryMetrics(versionIds: string): Observable<any[]> {
    const url = `${environment.apiUrl}/v1/metrics/delivery-percentage?versionIds=${versionIds}`;
    return this.http.get<any[]>(url).pipe(
      tap((response) => {
        // Mapeia e transforma os dados sem usar flatMap
        const formattedData = response
          .map((item) => {
            return item.delieveryPercentagePerIssueType.map((metric: { issueType: any; donePercentage: any; }) => ({
              project: this.projects.find(project => project.id === item.version.project?.id)?.key || 'Projeto Desconhecido',
              version: item.version.name,
              type: metric.issueType,
              value: metric.donePercentage,
            }));
          })
          .reduce((acc, curr) => acc.concat(curr), []); // Junta os arrays resultantes

        // Atualiza os dados originais
        this.originalDeliveryChartData = formattedData;

        // Atualiza os dados filtrados
        this.deliveryChartData = [...this.originalDeliveryChartData];
      })
    );
  }

  fetchWorkPlanningVarianceMetrics(versionIds: string): Observable<any[]> {
    const url = `${environment.apiUrl}/v1/metrics/work-planning-variance?versionIds=${versionIds}`;
    return this.http.get<any[]>(url).pipe(
      tap((response) => {
        // Mapeia os dados retornados para o formato necessário
        const formattedData = response.map((item) => {
          const totalIssues = item.issuePlanning?.totalIssues || 0;
          const doneIssues = item.issuePlanning?.totalDoneIssues || 0;
          const otherIssues = item.issuePlanning?.totalOtherStatusIssues || 0;

          return [
            {
              project: item.version.project?.key || 'Projeto Desconhecido',
              version: item.version.name,
              status: 'Planejado',
              value: totalIssues,
            },
            {
              project: item.version.project?.key || 'Projeto Desconhecido',
              version: item.version.name,
              status: 'Done',
              value: doneIssues
            },
            {
              project: item.version.project?.key || 'Projeto Desconhecido',
              version: item.version.name,
              status: 'Outro Status',
              value: otherIssues
            },
          ];
        }).reduce((acc, curr) => acc.concat(curr), []); // Junta os arrays

        // Atualiza os dados originais
        this.originalPlanningVarianceData = formattedData;

        // Atualiza os dados filtrados
        this.planningVarianceData = [...this.originalPlanningVarianceData];
      })
    );
  }

  fetchCriticalIssuesMetrics(versionIds: string): Observable<any[]> {
    const url = `${environment.apiUrl}/v1/metrics/critical-issues-relation?versionIds=${versionIds}`;
    return this.http.get<any[]>(url).pipe(
      tap((response) => {
        // Mapeia os dados retornados para o formato necessário
        const formattedData = response
          .map((item) => {
            const versionName = item.version.name;
            const projectKey = item.version.project?.key || 'Projeto Desconhecido';

            return item.criticalIssueRelation.map((relation: any) => [
              {
                project: projectKey,
                version: versionName,
                type: 'Crítico',
                percentage: relation.criticalIssuesPercentage,
              },
              {
                project: projectKey,
                version: versionName,
                type: 'Não Crítico',
                percentage: relation.nonCriticalIssuesPercentage,
              },
            ]);
          })
          .reduce((acc, curr) => acc.concat(curr), []) // Achata os arrays em um único array
          .reduce((acc: string | any[], curr: any) => acc.concat(curr), []); // Achata os arrays em um único array

        // Atualiza os dados originais
        this.originalCriticalIssuesChartData = formattedData;

        // Atualiza os dados filtrados
        this.criticalIssuesChartData = [...this.originalCriticalIssuesChartData];
      })
    );
  }

  onProjectChange(event: any): void {
    const selectedProject = event.value;
  
    if (selectedProject) {
      const selectedProjectId = selectedProject.id.toString();
  
      this.fetchVersions(selectedProjectId).subscribe(() => {
        const versionIds = this.versions.map((version) => version.id).join(',');
        this.fetchDeliveryMetrics(versionIds).subscribe(() => {
          this.fetchWorkPlanningVarianceMetrics(versionIds).subscribe(() => {
            this.fetchCriticalIssuesMetrics(versionIds).subscribe(() => {
              this.fetchBugIssuesMetrics(versionIds).subscribe(() => {
                this.fetchRiskPredictionMetrics(versionIds).subscribe(() => {
                  this.loadProjectData(selectedProject.key);
                  this.renderCharts();
                });
              });
            });
          });
        });
      });
    }
  }  

  fetchBugIssuesMetrics(versionIds: string): Observable<any[]> {
    const url = `${environment.apiUrl}/v1/metrics/bug-issues-relation?versionIds=${versionIds}`;
    return this.http.get<any[]>(url).pipe(
      tap((response) => {
        // Mapeia os dados retornados para o formato necessário
        const formattedData = response
          .map((item) => {
            const versionName = item.version.name;
            const projectKey = item.version.project?.key || 'Projeto Desconhecido';

            return item.bugIssuesRelation.map((relation: any) => ({
              project: projectKey,
              version: versionName,
              percentage: relation.bugIssuesPercentage,
            }));
          })
          .reduce((acc, curr) => acc.concat(curr), []) // Junta os arrays resultantes
          .reduce((acc: string | any[], curr: any) => acc.concat(curr), []); // Achata os arrays em um único array

        // Atualiza os dados originais
        this.originalBugPercentageData = formattedData;

        // Atualiza os dados filtrados
        this.bugPercentageData = [...this.originalBugPercentageData];
      })
    );
  }

  fetchRiskPredictionMetrics(versionIds: string): Observable<any[]> {
    const url = `${environment.apiUrl}/v1/metrics/predict-delay?versionIds=${versionIds}`;
    return this.http.get<any[]>(url).pipe(
      tap((response) => {
        const formattedData = response.map((item) => ({
          project: item.version.project?.key || 'Projeto Desconhecido',
          version: item.version.name,
          risk: item.delayRiskPercentage,
        }));

        // Atualiza os dados originais e filtrados
        this.originalRiskPredictionData = formattedData;
        this.riskPredictionData = [...this.originalRiskPredictionData];
      })
    );
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
          position: 'bottom', // Posiciona a legenda abaixo
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
        // label: {
        //   position: 'middle', // Mostra os rótulos dentro das barras
        //   formatter: (datum: any) => `${datum.value}%`, // Mostra o valor percentual
        //   style: { fill: '#fff', fontSize: 12 }, // Ajusta estilo do rótulo
        // },
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
        color: ['#44AA99', '#0072b2', '#56b3e9'],
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
