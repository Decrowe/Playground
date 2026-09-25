import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { TASK_REPOSITORY } from './domain/ports/task-repository.port';
import { LocalStorageTaskRepository } from './infrastructure/local-storage-task.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideNoopAnimations(),
    { provide: TASK_REPOSITORY, useClass: LocalStorageTaskRepository }
  ]
};
