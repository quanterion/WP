import { Injectable, ErrorHandler } from "@angular/core";
import * as Sentry from "@sentry/browser";
import { environment } from "environments/environment";
import { commit } from "git-version";

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor() {}
  handleError(error) {
    Sentry.captureException(error.originalError || error);
    throw error;
  }
}

export let sentryErrorHandlers = [];

export function initSentry() {
  if (environment.raven) {
    Sentry.init({ dsn: environment.raven, release: commit });
    sentryErrorHandlers = [{ provide: ErrorHandler, useClass: SentryErrorHandler }];
  }
}
