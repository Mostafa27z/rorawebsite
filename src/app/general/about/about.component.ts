import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  stats = [
    { icon: 'fa-heart', number: '10K+', label: 'Happy Customers' },
    { icon: 'fa-star', number: '500+', label: 'Products' },
    { icon: 'fa-trophy', number: '50+', label: 'Awards Won' },
    { icon: 'fa-globe', number: '20+', label: 'Countries' }
  ];

  values = [
    {
      icon: 'fa-gem',
      title: 'Quality First',
      description: 'We curate only the finest products that meet our high standards for quality and safety.'
    },
    {
      icon: 'fa-hand-holding-heart',
      title: 'Customer Care',
      description: 'Your satisfaction is our priority. We provide exceptional support every step of the way.'
    },
    {
      icon: 'fa-leaf',
      title: 'Sustainability',
      description: 'We believe in beauty that doesn\'t harm the planet. Eco-friendly is our commitment.'
    },
    {
      icon: 'fa-solid fa-lightbulb', 
      title: 'Innovation',
      description: 'Stay ahead of trends with our carefully selected, cutting-edge beauty products.'
    }
  ];

  team = [
    { name: 'Sarah Mitchell', role: 'Founder & CEO', icon: 'fa-crown' },
    { name: 'Emily Chen', role: 'Head of Product', icon: 'fa-palette' },
    { name: 'Maya Johnson', role: 'Customer Experience', icon: 'fa-comments' }
  ];
}