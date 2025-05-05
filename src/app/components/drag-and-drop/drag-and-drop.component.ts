import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-drag-and-drop',
  template: `
    <div
      class="drag-drop-container"
      (dragover)="onDragOver($event)"
      (drop)="onDrop($event)">
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./drag-and-drop.component.css']
})
export class DragAndDropComponent {
  @Output() fileDropped = new EventEmitter<File>();

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.fileDropped.emit(file);
    }
  }
}
