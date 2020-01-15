import { Spinner } from '@/api/spinner.class';
import { ImageRef, Quality } from './uploadedImage.class';
import Axios from 'axios';

type ImgDict = { [id: string]: string };

class ImageCacheServiceImpl {
  private cachedImages: { [quality: string]: ImgDict } = {
    [Quality.Thumbnail]: {},
    [Quality.Lightweight]: {},
    [Quality.Original]: {},
  };

  private ongoingQueries:  { [quality: string]: ImgDict } = {
    [Quality.Thumbnail]: {},
    [Quality.Lightweight]: {},
    [Quality.Original]: {},
  };

  public async startPreloading(imageRefs: ImageRef[], activeIndex: number) {
    const imageRefsSliced = imageRefs.slice(activeIndex).concat(imageRefs.slice(0, activeIndex));
    await asyncForEach(imageRefsSliced, (async (image: ImageRef) => {
      await this.preloadImage(image, Quality.Thumbnail);
    }));
    await asyncForEach(imageRefsSliced, (async (image: ImageRef) => {
      await this.preloadImage(image, Quality.Lightweight);
    }));
    await asyncForEach(imageRefsSliced, (async (image: ImageRef) => {
      await this.preloadImage(image, Quality.Original);
    }));
  }

  public putImageInCache(imageRef: ImageRef) {
    Object.values(Quality).forEach((quality) => {
      this.putImageInCacheInternal(imageRef, quality);
    });
  }

  private putImageInCacheInternal(imageRef: ImageRef, quality: Quality) {
    this.cachedImages[quality] = {
      ...this.cachedImages[quality],
      [imageRef.id]: imageRef.getUrl(quality),
    };
  }


  private putImageB64InCacheInternal(imageRef: ImageRef, quality: Quality, b64: string) {
    this.cachedImages[quality] = {
      ...this.cachedImages[quality],
      [imageRef.id]: b64,
    };
  }

  public startPreloadingImage(image: ImageRef, onLoad?: (image: ImageRef, quality: Quality) => void) {
    Object.values(Quality).forEach(async (quality) => {
      await this.preloadImage(image, quality);
      if (onLoad) {
        onLoad(image, quality);
      }
    });
  }

  private async preloadImage(image: ImageRef, quality: Quality) {
    if (this.isQueryOngoing(image.id, quality)) {
      return;
    }
    this.ongoingQueries[quality] = {
      ...this.ongoingQueries[quality],
      [image.id]: 'true'
    }
    const res = await Axios.get(image.getUrl(quality), { responseType: 'arraybuffer' });
    let imgB64 = 'data:image/jpeg;base64,' + btoa(new Uint8Array(res.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    this.putImageB64InCacheInternal(image, quality, imgB64);
    delete this.ongoingQueries[quality][image.id];
    // return new Promise<void>((resolve) => {
    //   if(this.isQueryOngoing(image.id, quality)) {
    //     resolve();
    //   }
    //   this.ongoingQueries[quality] = {...this.ongoingQueries[quality],
    //     [image.id]: 'true'
    //   }
    //   const tempImage = new Image();
    //   tempImage.src = image.getUrl(quality);
    //   tempImage.onload = () => {
    //     this.putImageInCacheInternal(image, quality);
    //     delete this.ongoingQueries[quality][image.id];
    //     resolve();
    //   };
    // });
  }

  public getImage(imageId: string): string {
    if (this.isCached(imageId, Quality.Original)) {
      return this.cachedImages[Quality.Original][imageId];
    }
    if (this.isCached(imageId, Quality.Lightweight)) {
      return this.cachedImages[Quality.Lightweight][imageId];
    }
    if (this.isCached(imageId, Quality.Thumbnail)) {
      return this.cachedImages[Quality.Thumbnail][imageId];
    }
    return Spinner;
  }

  public getThumbnail(imageId: string): string {
    if (this.isCached(imageId, Quality.Thumbnail)) {
      return this.cachedImages[Quality.Thumbnail][imageId];
    }
    return Spinner;
  }

  public isCached(imageId: string, quality: Quality): boolean {
    return this.cachedImages[quality].hasOwnProperty(imageId);
  }

  public isQueryOngoing(imageId: string, quality: Quality): boolean {
    return this.ongoingQueries[quality].hasOwnProperty(imageId);
  }
}

export const ImageCacheService = new ImageCacheServiceImpl();

async function asyncForEach(array: any[], callback: Function) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
