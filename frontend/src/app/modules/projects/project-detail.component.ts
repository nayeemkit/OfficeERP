import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { ProjectService } from '@core/services/project.service';
import { HrService } from '@core/services/hr.service';
import { ProjectResponse, TaskResponse, MilestoneResponse } from '@shared/models/project.model';
import { EmployeeResponse } from '@shared/models/hr.model';
import { TaskFormDialogComponent } from './task-form-dialog.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatTabsModule, MatTableModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatMenuModule, MatCardModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatProgressBarModule, MatCheckboxModule, MatDatepickerModule, MatNativeDateModule, MatChipsModule,
  ],
  template: `
    <div class="page">
      @if (project()) {
        <div class="header">
          <button mat-icon-button (click)="goBack()"><mat-icon>arrow_back</mat-icon></button>
          <div class="header-info">
            <h2>{{ project()!.name }}</h2>
            <div class="meta">
              <span class="status-chip" [class]="'status-' + project()!.status.toLowerCase()">{{ project()!.status.replace('_',' ') | titlecase }}</span>
              <span class="priority-chip" [class]="'pri-' + project()!.priority.toLowerCase()">{{ project()!.priority }}</span>
              @if (project()!.ownerName) { <span class="owner">Owner: {{ project()!.ownerName }}</span> }
            </div>
          </div>
          <div class="progress-info">
            <mat-progress-bar mode="determinate" [value]="project()!.progress"></mat-progress-bar>
            <span>{{ project()!.progress }}% · {{ project()!.completedTasks }}/{{ project()!.taskCount }} tasks</span>
          </div>
        </div>

        <mat-tab-group>
          <!-- Tasks Tab -->
          <mat-tab label="Tasks ({{ project()!.taskCount }})">
            <div class="tab-content">
              <div class="tab-toolbar">
                <mat-form-field appearance="outline" class="filter-field"><mat-label>Status</mat-label>
                  <mat-select [(ngModel)]="taskStatus" (selectionChange)="loadTasks()">
                    <mat-option [value]="null">All</mat-option>
                    <mat-option value="TODO">Todo</mat-option><mat-option value="IN_PROGRESS">In Progress</mat-option>
                    <mat-option value="IN_REVIEW">In Review</mat-option><mat-option value="DONE">Done</mat-option>
                    <mat-option value="BLOCKED">Blocked</mat-option>
                  </mat-select></mat-form-field>
                <span class="spacer"></span>
                <button mat-raised-button color="primary" (click)="openTaskDialog()"><mat-icon>add</mat-icon> Add Task</button>
              </div>
              <table mat-table [dataSource]="taskDataSource">
                <ng-container matColumnDef="title"><th mat-header-cell *matHeaderCellDef>Task</th>
                  <td mat-cell *matCellDef="let t"><div class="emp-name">{{ t.title }}</div><div class="emp-sub">{{ t.assigneeName || 'Unassigned' }}</div></td></ng-container>
                <ng-container matColumnDef="priority"><th mat-header-cell *matHeaderCellDef>Priority</th>
                  <td mat-cell *matCellDef="let t"><span class="priority-chip" [class]="'pri-' + t.priority.toLowerCase()">{{ t.priority }}</span></td></ng-container>
                <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let t">
                    <mat-select [value]="t.status" (selectionChange)="updateTaskStatus(t, $event.value)" class="inline-select">
                      <mat-option value="TODO">Todo</mat-option><mat-option value="IN_PROGRESS">In Progress</mat-option>
                      <mat-option value="IN_REVIEW">In Review</mat-option><mat-option value="DONE">Done</mat-option>
                      <mat-option value="BLOCKED">Blocked</mat-option>
                    </mat-select>
                  </td></ng-container>
                <ng-container matColumnDef="dueDate"><th mat-header-cell *matHeaderCellDef>Due</th>
                  <td mat-cell *matCellDef="let t">{{ t.dueDate ? (t.dueDate | date:'mediumDate') : '-' }}</td></ng-container>
                <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let t">
                    <button mat-icon-button (click)="deleteTask(t)"><mat-icon>delete</mat-icon></button>
                  </td></ng-container>
                <tr mat-header-row *matHeaderRowDef="taskCols"></tr>
                <tr mat-row *matRowDef="let row; columns: taskCols;"></tr>
              </table>
            </div>
          </mat-tab>

          <!-- Milestones Tab -->
          <mat-tab label="Milestones ({{ project()!.milestoneCount }})">
            <div class="tab-content">
              <div class="tab-toolbar">
                <span class="spacer"></span>
                <button mat-raised-button color="primary" (click)="showMilestoneForm = !showMilestoneForm"><mat-icon>add</mat-icon> Add Milestone</button>
              </div>
              @if (showMilestoneForm) {
                <div class="inline-form">
                  <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput [(ngModel)]="newMilestone.name" /></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Target Date</mat-label>
                    <input matInput [matDatepicker]="mp" [(ngModel)]="newMilestone.targetDate" /><mat-datepicker-toggle matSuffix [for]="mp"></mat-datepicker-toggle><mat-datepicker #mp></mat-datepicker></mat-form-field>
                  <button mat-raised-button color="primary" (click)="createMilestone()">Save</button>
                </div>
              }
              @for (m of milestones(); track m.id) {
                <div class="milestone-item" [class.completed]="m.isCompleted">
                  <mat-checkbox [checked]="m.isCompleted" (change)="toggleMilestone(m)"></mat-checkbox>
                  <div class="milestone-info">
                    <div class="emp-name" [class.done-text]="m.isCompleted">{{ m.name }}</div>
                    <div class="emp-sub">Target: {{ m.targetDate | date:'mediumDate' }}
                      @if (m.completedDate) { · Completed: {{ m.completedDate | date:'mediumDate' }} }</div>
                  </div>
                  <button mat-icon-button (click)="deleteMilestone(m)"><mat-icon>delete</mat-icon></button>
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .page{padding:24px;max-width:1200px;margin:0 auto}
    .header{display:flex;align-items:flex-start;gap:16px;margin-bottom:24px}
    .header-info{flex:1} .header-info h2{margin:0 0 8px}
    .meta{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .owner{font-size:13px;color:#666}
    .progress-info{min-width:200px;text-align:right}
    .progress-info mat-progress-bar{margin-bottom:4px}
    .progress-info span{font-size:12px;color:#666}
    .tab-content{padding:16px 0}
    .tab-toolbar{display:flex;gap:10px;align-items:center;margin-bottom:16px}
    .filter-field{width:160px}.spacer{flex:1}
    table{width:100%}.emp-name{font-weight:500}.emp-sub{font-size:12px;color:#666}
    .inline-select{width:120px;font-size:13px}
    .priority-chip{padding:3px 8px;border-radius:10px;font-size:11px;font-weight:600}
    .pri-low{background:#e8f5e9;color:#2e7d32}.pri-medium{background:#e3f2fd;color:#1565c0}
    .pri-high{background:#fff3e0;color:#e65100}.pri-critical{background:#ffebee;color:#c62828}
    .status-chip{padding:4px 10px;border-radius:12px;font-size:12px;font-weight:500}
    .status-planning{background:#f5f5f5;color:#757575}.status-in_progress{background:#e3f2fd;color:#1565c0}
    .status-completed{background:#e8f5e9;color:#2e7d32}.status-on_hold{background:#fff3e0;color:#e65100}
    .inline-form{display:flex;gap:12px;align-items:center;margin-bottom:16px;padding:12px;background:#f5f5f5;border-radius:8px}
    .milestone-item{display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid #eee}
    .milestone-item.completed{opacity:.7}.done-text{text-decoration:line-through}
    .milestone-info{flex:1}
    .loading{display:flex;justify-content:center;padding:48px}
  `],
})
export class ProjectDetailComponent implements OnInit {
  project = signal<ProjectResponse | null>(null);
  taskDataSource = new MatTableDataSource<TaskResponse>([]);
  milestones = signal<MilestoneResponse[]>([]);
  taskCols = ['title', 'priority', 'status', 'dueDate', 'actions'];
  taskStatus: string | null = null;
  showMilestoneForm = false;
  newMilestone = { name: '', targetDate: new Date() as Date | null };
  private projectId!: string;

  constructor(
    private route: ActivatedRoute, private router: Router,
    private projectService: ProjectService, private hrService: HrService,
    private dialog: MatDialog, private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id')!;
    this.loadProject(); this.loadTasks(); this.loadMilestones();
  }

  loadProject() { this.projectService.getProject(this.projectId).subscribe({ next: r => this.project.set(r.data) }); }
  loadTasks() {
    this.projectService.getTasks(this.projectId, 0, 100, this.taskStatus || undefined).subscribe({
      next: r => this.taskDataSource.data = r.data.content,
    });
  }
  loadMilestones() {
    this.projectService.getMilestones(this.projectId).subscribe({
      next: r => {
        console.log('Milestones response:', r);
        console.log('Milestones data:', r.data);
        this.milestones.set(r.data);
      }
    });
  }  goBack() { this.router.navigate(['/projects']); }

  openTaskDialog() {
    const ref = this.dialog.open(TaskFormDialogComponent, { width: '550px', data: { projectId: this.projectId } });
    ref.afterClosed().subscribe(r => { if (r) { this.loadTasks(); this.loadProject(); this.snackBar.open('Task created', 'Close', { duration: 3000 }); } });
  }

  updateTaskStatus(task: TaskResponse, newStatus: string) {
    this.projectService.updateTask(task.id, { projectId: task.projectId, title: task.title, status: newStatus } as any).subscribe({
      next: () => { this.loadTasks(); this.loadProject(); },
    });
  }

  deleteTask(task: TaskResponse) {
    if (confirm(`Delete "${task.title}"?`)) {
      this.projectService.deleteTask(task.id).subscribe({ next: () => { this.loadTasks(); this.loadProject(); } });
    }
  }

  createMilestone() {
    if (!this.newMilestone.name) return;
    const targetDate = this.newMilestone.targetDate instanceof Date
      ? this.newMilestone.targetDate.toISOString().split('T')[0] : this.newMilestone.targetDate;
    this.projectService.createMilestone({ projectId: this.projectId, name: this.newMilestone.name, targetDate: targetDate as string }).subscribe({
      next: () => { this.loadMilestones(); this.loadProject(); this.newMilestone = { name: '', targetDate: new Date() }; this.showMilestoneForm = false; },
    });
  }

  toggleMilestone(m: MilestoneResponse) {
    this.projectService.toggleMilestone(m.id).subscribe({ next: () => { this.loadMilestones(); this.loadProject(); } });
  }

  deleteMilestone(m: MilestoneResponse) {
    if (confirm(`Delete "${m.name}"?`)) {
      this.projectService.deleteMilestone(m.id).subscribe({ next: () => { this.loadMilestones(); this.loadProject(); } });
    }
  }
}
