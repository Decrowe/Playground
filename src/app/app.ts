import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TaskPage } from './application/task-page/task-page';

@Component({
  selector: 'app-root',
  imports: [TaskPage],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {}
