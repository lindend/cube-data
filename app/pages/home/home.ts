import {Component} from '@angular/core';
import {Camera} from 'ionic-native';
import {Cube, Color, Axis} from '../../model/cube';
import {CubeView} from '../../components/cube/cube-view';
import {NavController, Toast, Alert} from 'ionic-angular';


@Component({
  selector: 'home-page',
  templateUrl: 'build/pages/home/home.html',
  directives: [CubeView]
})
export class HomePage {
  public cube: Cube = Cube.create();
  public frontColors: Color[][] = [];
  public topColor: Color[];
  public previousMove: string = '';
  public sideIndex = 0;

  public imageUrl: string;

  constructor(private nav: NavController) {
    this.updateColors();
  }

  updateColors() {
    this.frontColors = [this.cube.getSide(Axis.x, -1, Axis.y), 
                        this.cube.getSide(Axis.x, 1, Axis.y),
                        this.cube.getSide(Axis.z, -1, Axis.y),
                        this.cube.getSide(Axis.z, 1, Axis.y),
                        this.cube.getSide(Axis.y, -1, Axis.x),
                        this.cube.getSide(Axis.y, 1, Axis.x),
                        ];
    this.topColor = [this.cube.getSide(Axis.y, -1, Axis.x)[4], 
                     this.cube.getSide(Axis.y, -1, Axis.x)[4],
                     this.cube.getSide(Axis.y, -1, Axis.x)[4],
                     this.cube.getSide(Axis.y, -1, Axis.x)[4],
                     this.cube.getSide(Axis.x, -1, Axis.y)[4],
                     this.cube.getSide(Axis.x, -1, Axis.y)[4],
                    ];
  }

  takePicture() {
    Camera.getPicture({
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      targetHeight: 1000,
      targetWidth: 1000,
      saveToPhotoAlbum: false,
      allowEdit: false,
      encodingType: Camera.EncodingType.PNG,
    }).then(imageData => {
      this.uploadImage(imageData);
      this.nextSide();
      if (this.sideIndex === 0) {
        this.doRandomRotation();
      }
      // this.imageUrl = 'data:image/jpeg;base64,' + imageData;
    }, err => {
      let alert = Alert.create({
        title: 'Taking a picture failed',
        subTitle: err,
        buttons: ['OK']
      });
      this.nav.present(alert);
    });
  }

  getCurrentSideData(): string {
    let colors = this.frontColors[this.sideIndex];
    return colors.join(',');
  }

  uploadImage(imageUri: string) {
    let server = 'http://192.168.0.138:8080/cube?data=' + this.getCurrentSideData();
    let options: FileUploadOptions = {
            fileKey: "data-file",
            fileName: imageUri.substr(imageUri.lastIndexOf('/')+1),
            chunkedMode: false,
            mimeType: "image/png",
        };
    let ft = new FileTransfer();
    ft.upload(imageUri, encodeURI(server), res => {
      let toast = Toast.create({
        message: 'Image uploaded',
        position: 'top',
        showCloseButton: true,
        closeButtonText: 'x',
        duration: 3000
      });
      this.nav.present(toast);
    },
    err => {
      let alert = Alert.create({
        title: 'Upload failed',
        subTitle: 'Image upload failed:\r\n' + err.code + ' ' + err.exception,
        buttons: ['OK']
      });
      this.nav.present(alert);
    }, options);
  }

  resetCube() {
    this.cube = Cube.create();
  }

  doRandomRotation() {
    let move = this.getRandomMove();
    this.moveCube(move);
    this.previousMove = move;
    this.updateColors();
    this.sideIndex = 0;
  }

  nextSide() {
    this.sideIndex = (this.sideIndex + 1) % 6;
  }

  getRandomMoves(numMoves: number): string[] {
    let result = [];
    for (let i = 0; i < numMoves; ++i) {
      result.push(this.getRandomMove());
    }
    return result;
  }

  getRandomMove(): string {
    let moves = ['U', 'D', 'L', 'R', 'F', 'B'];
    let rnd = Math.floor(Math.random() * moves.length);
    let move = moves[rnd];
    if (Math.random() < 0.5) {
      return move + '\'';
    } else {
      return move;
    }
  }

  moveCube(move: string) {
    switch (move) {
      case 'U\'':
        this.rotateOnce(Axis.y, -1); 
        break;
      case 'U':
        this.rotateThrice(Axis.y, -1);
        break;
      case 'D\'':
        this.rotateThrice(Axis.y, 1);
        break;
      case 'D':
        this.rotateOnce(Axis.y, 1);
        break;
      case 'L':
        this.rotateThrice(Axis.z, -1);
        break;
      case 'L\'':
        this.rotateOnce(Axis.z, -1);
        break;
      case 'R':
        this.rotateOnce(Axis.z, 1);
        break;
      case 'R\'':
        this.rotateThrice(Axis.z, 1);
        break;
      case 'F':
        this.rotateThrice(Axis.x, -1);
        break;
      case 'F\'':
        this.rotateOnce(Axis.x, -1);
        break;
      case 'B':
        this.rotateOnce(Axis.x, 1);
        break;
      case 'B\'':
        this.rotateThrice(Axis.x, 1);
        break;
    }
  }

  rotateOnce(axis: Axis, layer: number) {
    this.cube.rotateAxis(axis, layer);
  }

  rotateThrice(axis: Axis, layer: number) {
    this.cube.rotateAxis(axis, layer);
    this.cube.rotateAxis(axis, layer);
    this.cube.rotateAxis(axis, layer);
  }
}
