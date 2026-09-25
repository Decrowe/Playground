import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { InMemoryTaskRepository } from './infrastructure/in-memory-task.repository';
import { TASK_REPOSITORY } from './domain/ports/task-repository.port';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: TASK_REPOSITORY, useValue: new InMemoryTaskRepository() }]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the task page', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-task-page')).toBeTruthy();
  });
});
