import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
    id: number;
    message: string;
    action?: string;
    data?: any;
    duration?: number;
    onUndo?: () => void;
    onCommit?: () => void;
    timeoutId?: any;
}

@Injectable({
    providedIn: 'root'
})
export class ComplexToastService {
    private toastsSubject = new BehaviorSubject<Toast[]>([]);
    toasts$ = this.toastsSubject.asObservable();

    show(message: string, onUndo: () => void, onCommit: () => void, duration: number = 10000) {
        const id = Date.now() + Math.random();
        const toast: Toast = {
            id,
            message,
            onUndo,
            onCommit,
            duration
        };

        toast.timeoutId = setTimeout(() => {
            this.remove(id);
            if (onCommit) {
                onCommit();
            }
        }, duration);

        const currentToasts = this.toastsSubject.value;
        this.toastsSubject.next([...currentToasts, toast]);
    }

    remove(id: number) {
        const currentToasts = this.toastsSubject.value;
        const toastIndex = currentToasts.findIndex(t => t.id === id);

        if (toastIndex !== -1) {
            const toast = currentToasts[toastIndex];
            if (toast.timeoutId) {
                clearTimeout(toast.timeoutId);
            }

            const updatedToasts = [...currentToasts];
            updatedToasts.splice(toastIndex, 1);
            this.toastsSubject.next(updatedToasts);
        }
    }

    undo(id: number) {
        const currentToasts = this.toastsSubject.value;
        const toast = currentToasts.find(t => t.id === id);

        if (toast) {
            if (toast.onUndo) {
                toast.onUndo();
            }
            this.remove(id);
        }
    }
}
