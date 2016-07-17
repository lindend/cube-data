import {Component, Input} from '@angular/core';
import {Color} from '../../model/cube';

@Component({
    selector: 'cube-view',
    templateUrl: 'build/components/cube/cube-view.html'
})
export class CubeView {
    @Input() topColor: Color;
    @Input() colors: Color[];
}