import { Component, NgZone } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { LoadingController } from 'ionic-angular';

/**
 * Generated class for the ScanPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
    selector: 'page-scan',
    templateUrl: 'scan.html',
})
export class ScanPage {
    light = false; // 判断闪光灯
    isShow = false; // 控制显示背景，避免切换页面卡顿
    scanSub: any;
    resultText: string;
    showResultBox = false
    showResultText = false;

    constructor(
        private qrScanner: QRScanner,
        private ngZone: NgZone,
        private loadingCtrl: LoadingController
    ) {
    }

    ionViewDidLoad() {
        this.prepare();
    }

    ionViewDidEnter() {
        //页面可见时才执行
        this.showCamera();
        this.isShow = true;//显示背景
    }

    prepare() {
        this.qrScanner.prepare()
            .then((status: QRScannerStatus) => {
                if (status.authorized) {
                    // camera permission was granted
                    // start scanning
                    this.scan();
                    // show camera preview
                    this.qrScanner.show();

                    // wait for user to scan something, then the observable callback will be called
                } else if (status.denied) {
                    // camera permission was permanently denied
                    // you must use QRScanner.openSettings() method to guide the user to the settings page
                    // then they can grant the permission from there
                } else {
                    // permission was denied, but not permanently. You can ask for permission again at a later time.
                }
            })
            .catch((e: any) => console.log('Error is', e));
    }

    scan() {
        this.scanSub = this.qrScanner.scan().subscribe((text: string) => {
            this.scanSub.unsubscribe(); // stop scanning
            this.showLoading(text);
        });
    }

    showLoading(text) {
        const loader = this.loadingCtrl.create({
            content: "Please wait...",
        });
        loader.present();
        setTimeout(() => {
            loader.dismiss();
            this.ngZone.run(() => {
                this.showResultText = false;
                this.resultText = text;
                console.log(`this.resultText: ${this.resultText}`);
                this.showResultBox = true;
                this.showResultText = true;
            });
            this.scan();
        }, 2000);
    }



    /**
     * 闪光灯控制，默认关闭
     */
    toggleLight() {
        if (this.light) {
            this.qrScanner.disableLight();
        } else {
            this.qrScanner.enableLight();
        }
        this.light = !this.light;
    }

    showCamera() {
        (window.document.querySelector('ion-app') as HTMLElement).classList.add('cameraView');
    }
    hideCamera() {
        (window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');
        this.qrScanner.hide();//需要关闭扫描，否则相机一直开着
        this.qrScanner.destroy();//关闭
    }

    ionViewWillLeave() {
        this.hideCamera();
    }
}