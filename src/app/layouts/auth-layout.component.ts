import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Background Decorative Elements -->
      <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <!-- Content Wrapper -->
      <div class="z-10 w-full max-w-md">
        <div class="mb-8 text-center text-white">
          <h1 class="text-3xl font-display font-extrabold tracking-tighter text-primary">Vanguard</h1>
          <p class="text-neutral-400 mt-2 font-mono text-sm">Inventory Management System</p>
        </div>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthLayoutComponent {}
