import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-category-card',
  standalone: true,
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.css',
})
export class CategoryCardComponent {
  @Input() title!: string;
  @Input() color!: string;
}
