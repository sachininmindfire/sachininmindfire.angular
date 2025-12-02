import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  // Lifecycle hook for initialization
  ngOnInit(): void {
    this.OnInit();
  }
  
  OnInit() {
    console.log('Inside Header');
  }
}
