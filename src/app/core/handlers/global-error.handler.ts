import { ErrorHandler, Injectable, inject, Injector } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private injector = inject(Injector);

  handleError(error: unknown): void {
    const toastService = this.injector.get(ToastService);
    
    // Log the error for developers with full detail
    console.error('Global Error Handler Captured:', error);

    // Format the display error
    let displayMessage = 'An unexpected error occurred.';
    let title = 'Application Error';
    
    if (error instanceof HttpErrorResponse) {
      title = `Server Error (${error.status})`;
      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        displayMessage = `Network error: ${error.error.message}`;
      } else {
        // Backend returned an unsuccessful response code
        if (typeof error.error === 'string') {
          displayMessage = error.error;
        } else if (error.error && error.error.message) {
          displayMessage = error.error.message;
        } else if (error.message) {
          displayMessage = error.message;
        } else {
          displayMessage = `Server returned code ${error.status}`;
        }
      }
    } else if (error instanceof Error) {
      displayMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      // Try to extract a message if it exists
      const errObj = error as Record<string, unknown>;
      console.log('Error object keys:', Object.keys(errObj));
      console.log('Error object entries:', Object.entries(errObj));
      
      if (errObj['message']) {
        displayMessage = String(errObj['message']);
      } else if (errObj['error'] && typeof errObj['error'] === 'string') {
        displayMessage = String(errObj['error']);
      } else if (errObj['error'] && typeof errObj['error'] === 'object' && errObj['error'] !== null) {
        displayMessage = JSON.stringify(errObj['error']);
      } else {
        try {
          displayMessage = JSON.stringify(error, null, 2);
        } catch {
          displayMessage = 'Object error (see console)';
        }
      }
    } else {
      displayMessage = String(error);
    }

    // Inform the user
    toastService.error(title, displayMessage.substring(0, 500)); // Limit length for UI
  }
}
