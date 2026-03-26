import { Component, computed, inject } from '@angular/core';
import { ContentService } from '../../../services/content.service';
import { FeaturedToolComponent } from '../../shared/featured-tool/featured-tool.component';
import { BioComponent } from "../../shared/bio/bio.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FeaturedToolComponent, BioComponent],
  templateUrl: './home.component.html' ,
  styleUrl: './home.component.scss' 
})
export class HomeComponent {
  private contentService = inject(ContentService);
  tools = this.contentService.getLatestTools;
  articles = []; // Add your articles data here
  tips = []; // Add your tips data here
  terms = []; // Add your terms data here

  handleImageError(event: any) {
    event.target.src = '../assets/images/default-profile.png';
    console.error('Failed to load profile image');
  }
}

