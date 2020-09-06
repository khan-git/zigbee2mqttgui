import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'z2mModelImageSrc'})
export class ModelNamePipe implements PipeTransform {
    transform(model: string) {
        return model.replace('/', '-');
    }
}

@Pipe({ name: 'filterDevice'})
export class FilterDevicePipe implements PipeTransform {
    transform(devices: Array<any>, devType: string): any {
        return devices.filter((val, index, arr) => {
            return val.type === devType;
        });
    }
}
