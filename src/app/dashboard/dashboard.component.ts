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
  private selectedVersion: string | null = null; // Armazena a versão selecionada pelo usuário

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
  };

  // Lista de versões
  versions: {
    id: number;
    name: string;
  }[] = [];

  // Dados originais dos gráficos
  originalRiskPredictionData = [{ project: 'Projeto', version: 'Versão', risk: 0 }];
  originalDeliveryChartData = [{ project: 'Projeto', version: 'Versão', type: 'Tipo', value: 0 }];
  originalBugPercentageData = [{ project: 'Projeto', version: 'Versão', percentage: 0 }];
  originalCriticalIssuesChartData = [
    { project: 'Projeto', version: 'Versão', type: 'Crítico', percentage: 0 },
    { project: 'Projeto', version: 'Versão', type: 'Não Crítico', percentage: 0 },
  ];
  originalPlanningVarianceData = [
    { project: 'Projeto', version: 'Versão', status: 'Done', value: 0 },
    { project: 'Projeto', version: 'Versão', status: 'Outro Status', value: 0 },
  ];
  originalEpicUsageData = [
    { project: 'Projeto', version: 'Versão', epicName: 'Épico', timeSpent: 0 },
  ];

  private chartDataMap: { [key: string]: any[] } = {
    'risk-prediction-chart': this.originalRiskPredictionData,
    'delivery-chart': this.originalDeliveryChartData,
    'bug-percentage-chart': this.originalBugPercentageData,
    'critical-issues-chart': this.originalCriticalIssuesChartData,
    'planning-variance-chart': this.originalPlanningVarianceData,
    'epic-usage-chart': this.originalEpicUsageData,
  };

  // Dados filtrados usados pelos gráficos
  riskPredictionData = [...this.originalRiskPredictionData];
  deliveryChartData = [...this.originalDeliveryChartData];
  bugPercentageData = [...this.originalBugPercentageData];
  criticalIssuesChartData = [...this.originalCriticalIssuesChartData];
  planningVarianceData = [...this.originalPlanningVarianceData];
  epicUsageData = [...this.originalEpicUsageData];

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
            switchMap(() => this.fetchRiskPredictionMetrics(versionIds)),
            switchMap(() => this.fetchEpicUsageMetrics(versionIds))
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

  /**
   * Busca as métricas de entrega de cada versão utilizando o endpoint /v1/metrics/delivery-percentage
   * @param versionIds recebe uma string com os ids de todas as versões do projeto selecionado, separados por vírgula
   * @returns 
   */
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

  /**
   * Busca as métricas de planejamento de trabalho de cada versão utilizando o endpoint /v1/metrics/work-planning-variance
   * @param versionIds recebe uma string com os ids de todas as versões do projeto selecionado, separados por vírgula
   * @returns 
   */
  fetchWorkPlanningVarianceMetrics(versionIds: string): Observable<any[]> {
    const url = `${environment.apiUrl}/v1/metrics/work-planning-variance?versionIds=${versionIds}`;
    return this.http.get<any[]>(url).pipe(
      tap((response) => {
        // Mapeia os dados retornados para o formato necessário
        const formattedData = response.map((item) => {
          const totalIssues = item.issuePlanning?.totalIssues || 0;
          const doneIssues = item.issuePlanning?.totalDoneIssues || 0;

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
            }
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

  fetchEpicUsageMetrics(versionIds: string): Observable<any[]> {
    const url = `${environment.apiUrl}/v1/metrics/epics-per-version?versionIds=${versionIds}`;
    return this.http.get<any[]>(url).pipe(
      tap((response) => {
        const formattedData = response
          .map((item) => {
            return item.epicsUsage.map((epic: any) => ({
              project: item.version.project.key || 'Projeto Desconhecido',
              version: item.version.name,
              epicName: epic.name || 'Epic Desconhecido',
              timeSpent: epic.timespent || 0, // Tempo gasto no épico
              version_epic: `${item.version.name}_${epic.name}`, // Chave composta
            }));
          })
          .reduce((acc, curr) => acc.concat(curr), []); // Junta todos os arrays

        // Ordenar por versão e depois por épico (para garantir a consistência)
        formattedData.sort((a: { version: string; epicName: string; }, b: { version: any; epicName: any; }) => {
          if (a.version === b.version) {
            return a.epicName.localeCompare(b.epicName); // Ordenar pelo nome do épico dentro da versão
          }
          return a.version.localeCompare(b.version); // Ordenar por versão
        });

        // Atualiza os dados originais e filtrados
        this.originalEpicUsageData = formattedData;
        this.epicUsageData = [...this.originalEpicUsageData];
        console.log('Dados de uso de épico:', this.epicUsageData);
      })
    );
  }

  onProjectChange(event: any): void {
    const selectedProject = event.value;

    if (selectedProject) {
      // Limpa a seleção de versão ao mudar o projeto
      this.selectedVersion = null;

      const selectedProjectId = selectedProject.id.toString();

      this.fetchVersions(selectedProjectId).subscribe(() => {
        const versionIds = this.versions.map((version) => version.id).join(',');
        this.fetchDeliveryMetrics(versionIds).subscribe(() => {
          this.fetchWorkPlanningVarianceMetrics(versionIds).subscribe(() => {
            this.fetchCriticalIssuesMetrics(versionIds).subscribe(() => {
              this.fetchBugIssuesMetrics(versionIds).subscribe(() => {
                this.fetchRiskPredictionMetrics(versionIds).subscribe(() => {
                  this.fetchEpicUsageMetrics(versionIds).subscribe(() => {
                    // Carrega os dados do projeto selecionado
                    this.loadProjectData(selectedProject.key);

                    // Recria todos os gráficos
                    this.renderCharts();
                  });
                });
              });
            });
          });
        });
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
    this.epicUsageData = [...this.originalEpicUsageData];
  }

  loadProjectData(project: string): void {
    // Filtra os dados para o projeto selecionado
    this.riskPredictionData = this.originalRiskPredictionData.filter((data) => data.project === project);
    this.deliveryChartData = this.originalDeliveryChartData.filter((data) => data.project === project);
    this.bugPercentageData = this.originalBugPercentageData.filter((data) => data.project === project);
    this.criticalIssuesChartData = this.originalCriticalIssuesChartData.filter((data) => data.project === project);
    this.planningVarianceData = this.originalPlanningVarianceData.filter((data) => data.project === project);
    this.epicUsageData = this.originalEpicUsageData.filter((data) => data.project === project);
  }

  openExplanation(title: string, description: string): void {
    this.dialog.open(ChartExplanationModalComponent, {
      data: { title, description },
    });
  }

  ngAfterViewInit(): void {
    // this.renderCharts();
  }

  renderCharts(excludeChartId?: string): void {
    const chartHeight = 320;

    const calculateChartWidth = (element: HTMLElement): number =>
      0.9 * (element?.closest('.graph-block')?.clientWidth ?? 280);

    // Se excludeChartId não for passado, destrua todos os gráficos
    if (!excludeChartId) {
      this.charts.forEach(({ chart }) => chart.destroy());
      this.charts = [];
    } else {
      // Caso contrário, destrua apenas os gráficos que não são o excluído
      this.charts = this.charts.filter(({ id, chart }) => {
        if (id !== excludeChartId) {
          chart.destroy();
          return false; // Remove o gráfico destruído da lista
        }
        return true; // Mantém o gráfico excluído
      });
    }

    const renderChart = (id: string, config: any): void => {
      // Não renderiza o gráfico excluído
      if (id === excludeChartId) return;

      const chartContainer = this.elementRef.nativeElement.querySelector(`#${id}`);
      if (chartContainer) {
        chartContainer.innerHTML = '';

        const chart = new config.chartType(chartContainer, {
          ...config.options,
          width: calculateChartWidth(chartContainer),
          height: chartHeight,
          appendPadding: 20,
        });

        chart.on('element:click', (evt: any) => this.handleChartInteraction(evt, id));
        chart.render();
        this.charts.push({ id, chart });
      }
    };

    // Renderizar os gráficos, excluindo o interagido
    renderChart('risk-prediction-chart', {
      chartType: Line, // Altera para gráfico de linha
      options: {
        data: this.riskPredictionData,
        xField: 'version', // Eixo X representará as versões
        yField: 'risk', // Eixo Y representará o risco de atraso (percentual)
        seriesField: 'project', // Permite agrupar por projetos, caso tenha mais de um
        xAxis: {
          title: { text: 'Versão', style: { fontWeight: 'bold' } }, // Adiciona título ao eixo X
          tickLine: null, // Remove as linhas de marcação
          line: { style: { stroke: '#aaa' } }, // Define o estilo do eixo
          label: {
            autoHide: true, // Oculta rótulos que se sobrepõem
            autoRotate: true,
          }
        },
        yAxis: {
          title: { text: 'Risco de Atraso (%)', style: { fontWeight: 'bold' } }, // Adiciona título ao eixo Y
          label: { formatter: (val: string) => `${val}%` }, // Formata os rótulos
          grid: { line: { style: { stroke: '#ddd', lineWidth: 1, lineDash: [4, 4] } } }, // Configura grade
        },
        tooltip: {
          formatter: (datum: any) => ({
            name: 'Risco de Atraso',
            value: `${datum.risk}%`, // Mostra o percentual de risco
          }),
        },
        legend: {
          position: 'bottom', // Move a legenda para o topo
        },
        color: ['#0072B2'], // Define a cor das linhas
        smooth: true, // Suaviza a linha
        point: {
          size: 5, // Adiciona pontos nos dados
          shape: 'circle',
          style: { fill: '#fff', stroke: '#0072B2', lineWidth: 2 },
        },
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }], // Adiciona interatividade
      },
    });

    renderChart('delivery-chart', {
      chartType: Bar,
      options: {
        data: this.deliveryChartData,
        xField: 'value',
        yField: 'version',
        seriesField: 'type',
        isStack: true,
        xAxis: { title: { text: 'Percentual (%)', style: { fontWeight: 'bold' } }, grid: null },
        yAxis: { title: { text: 'Versão', rotate: -1.55, style: { fontWeight: 'bold' } }, grid: null },
        tooltip: {
          formatter: (datum: any) => ({
            name: datum.type,
            value: `${datum.value}%`,
          }),
        },
        legend: { position: 'bottom', layout: 'horizontal' },
        color: ['#0072b2', '#5595EF', '#6FB3F5', '#5B6C8C', '#58D1B0', '#D3D3D3'],
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
      },
    });

    renderChart('bug-percentage-chart', {
      chartType: Pie,
      options: {
        data:
          this.bugPercentageData.length > 1 // Verifica se há mais de uma versão
            ? this.bugPercentageData.filter(d => d.percentage > 1) // Aplica o filtro somente se houver várias versões
            : this.bugPercentageData, // Caso contrário, usa todos os dados
        angleField: 'percentage',
        colorField: 'version',
        radius: 1,
        innerRadius: 0.5,
        label: {
          type: 'inner',
          offset: '-50%',
          content: ({ percentage }: { percentage: number }) => {
            return this.bugPercentageData.length > 1 && percentage > 6 // Aplica o filtro de label apenas com várias versões
              ? `${percentage}%`
              : `${percentage}%`;
          },
          style: { textAlign: 'center', fontSize: 12 },
        },
        legend: {
          position: 'left',
          layout: 'vertical',
          title: { text: 'Versão', style: { fontWeight: 'bold' } },
        },
        tooltip: {
          formatter: (datum: any) => ({
            name: datum.version,
            value: `${datum.percentage}%`,
          }),
        },
        color: ['#0072B2', '#56B3E9', '#009E73', '#E69F00', '#CC79A7', '#D55E00', '#F0E442'],
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
        statistic: null,
      },
    });

    renderChart('critical-issues-chart', {
      chartType: Column,
      options: {
        data: this.criticalIssuesChartData,
        xField: 'version',
        yField: 'percentage',
        seriesField: 'type',
        isStack: true,
        xAxis: {
          title: {
            text: 'Versão',
            style: { fontWeight: 'bold' }
          },
          grid: null, label: {
            autoHide: true, // Oculta rótulos que se sobrepõem
            autoRotate: true,
          }
        },
        yAxis: {
          title: { text: 'Percentual (%)', style: { fontWeight: 'bold' } },
          grid: null,
          label: { formatter: (val: string) => `${Number(val)}%` },
        },
        tooltip: {
          formatter: (datum: any) => ({
            name: datum.type,
            value: `${datum.percentage}%`,
          }),
        },
        color: ['#FEA71B', '#FFD63E'],
        legend: { position: 'bottom', layout: 'horizontal' },
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
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
        xAxis: {
          title: {
            text: 'Versão',
            style: { fontWeight: 'bold' }
          },
          grid: null,
          label: {
            autoHide: true, // Oculta rótulos que se sobrepõem
            autoRotate: true,
            formatter: (val: string) => val.length > 10 ? val.substring(0, 10) + '...' : val
          }
        },
        yAxis: {
          title: {
            text: 'Qtd de Atividades',
            style: { fontWeight: 'bold' }
          }, grid: null
        },
        legend: { position: 'bottom', layout: 'horizontal' },
        color: ['#44AA99', '#0072b2', '#56b3e9'],
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
        smooth: true, // Suaviza a linha
        point: {
          size: 3
          , // Adiciona pontos nos dados
          shape: 'circle',
          style: { fill: '#fff', stroke: '#0072B2', lineWidth: 2 },
        },
      },
    });

    renderChart('epic-usage-chart', {
      chartType: Bar,
      options: {
        data: this.epicUsageData,
        xField: 'timeSpent',
        yField: 'version',
        seriesField: 'version_epic', // Usar a chave composta version_epic para o agrupamento
        isStack: true,
        xAxis: {
          title: { text: 'Tempo Gasto (horas)', style: { fontWeight: 'bold' } },
          grid: null,
          label: { autoHide: true, autoRotate: true },
        },
        yAxis: {
          //deixar em negrito o título do eixo Y
          title: { text: 'Épicos', rotate: -1.55, style: { fontWeight: 'bold' } },
          grid: null,
          label: { autoHide: true, autoRotate: true },
        },
        tooltip: {
          formatter: (datum: any) => ({
            name: datum.version_epic, // Exibe a chave composta no tooltip
            value: `${datum.timeSpent} horas`,
          }),
        },
        legend: { position: 'bottom', layout: 'horizontal' },
        color: ['#00579D', '#0090C5', '#64C3D5', '#82A584', '#A5C860'],
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
      },
    });
  }

  handleChartInteraction(evt: any, chartId: string): void {
    const clickedVersion = evt.data?.data?.version;

    if (chartId !== 'risk-prediction-chart') {
      return;
    }

    if (this.selectedVersion === clickedVersion) {
      // Deseleciona a versão e restaura os dados originais
      this.selectedVersion = null;
      this.filterChartsByVersion(null, chartId);
    } else {
      // Define a versão selecionada e filtra os gráficos
      this.selectedVersion = clickedVersion;
      this.filterChartsByVersion(clickedVersion, chartId);
    }

    // Re-renderiza os gráficos
    this.renderCharts(chartId);
  }

  filterChartsByVersion(version: string | null, excludeChartId?: string): void {
    if (!version) {
      // Restaura todos os dados originais ao deselecionar a versão
      this.loadAllData();
    } else {
      // Filtra os dados para a versão selecionada
      if (excludeChartId !== 'risk-prediction-chart') {
        this.riskPredictionData = this.originalRiskPredictionData.filter(
          (data) => data.version === version
        );
      }

      if (excludeChartId !== 'delivery-chart') {
        this.deliveryChartData = this.originalDeliveryChartData.filter(
          (data) => data.version === version
        );
      }

      if (excludeChartId !== 'bug-percentage-chart') {
        this.bugPercentageData = this.originalBugPercentageData.filter(
          (data) => data.version === version
        );
      }

      if (excludeChartId !== 'critical-issues-chart') {
        this.criticalIssuesChartData = this.originalCriticalIssuesChartData.filter(
          (data) => data.version === version
        );
      }

      if (excludeChartId !== 'planning-variance-chart') {
        this.planningVarianceData = this.originalPlanningVarianceData.filter(
          (data) => data.version === version
        );
      }

      if (excludeChartId !== 'epic-usage-chart') {
        this.epicUsageData = this.originalEpicUsageData.filter(
          (data) => data.version === version
        );
      }
    }
  }

  capitalizeChartKey(chartId: string): string {
    return chartId
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  destroyCharts(excludeChartId?: string): void {
    this.charts.forEach((chart) => {
      if (chart.id !== excludeChartId) {
        chart.chart.destroy();
      }
    });

    this.charts = this.charts.filter((chart) => chart.id === excludeChartId);
  }
}
