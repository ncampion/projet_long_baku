import axios from 'axios';

export interface ImageRef {
  readonly id: string;
  readonly thumbUrl: string;
  readonly lightweightUrl: string;
  readonly originalUrl: string;
}

export class InMemoryImage implements ImageRef {
  readonly id: string;
  readonly thumbUrl: string;
  readonly lightweightUrl: string;
  readonly originalUrl: string;

  constructor(id: string, tinyBlob: Blob, lightweightBlob: Blob, originalBlob: Blob) {
    this.id = id;
    this.thumbUrl = URL.createObjectURL(tinyBlob);
    this.lightweightUrl = URL.createObjectURL(lightweightBlob);
    this.originalUrl = URL.createObjectURL(originalBlob);
  }
}

export class UploadedImage implements ImageRef {
  readonly projectId: string;
  readonly id: string;

  constructor(projectId: string, id: string) {
    this.projectId = projectId;
    this.id = id;
  }

  get thumbUrl(): string {
    return `/images/${this.projectId}/thumbnail/${this.id}`;
  }

  get lightweightUrl(): string {
    return `/images/${this.projectId}/lightweight/${this.id}`;
  }

  get originalUrl(): string {
    return `/images/${this.projectId}/original/${this.id}`;
  }
}

export enum BakuAction {
  MOVIE_UPDATE_TITLE,
  MOVIE_UPDATE_SYNOPSIS,
  MOVIE_UPDATE_POSTER,
  MOVIE_INSERT_IMAGE,
  SHOT_ADD,
  CHANGE_FPS
}

export interface BakuEvent {
  readonly action: BakuAction;
  readonly value: any;
  readonly user: string;
}

export class BakuService {
  private static readonly BaseUrl = '/api';

  public upload(projectId: string, shotId: string, blob: Blob, name: string): Promise<ImageRef> {
    const formData = new FormData();
    formData.set('file', blob, name);
    return axios
      .post(`${BakuService.BaseUrl}/${projectId}/upload`, formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      .then((r) => new UploadedImage(projectId, r.data[0]));
  }

  public getHistory(projectId: string): Promise<BakuEvent[]> {
    return axios
      .get(`${BakuService.BaseUrl}/${projectId}/history`)
      .then((response) => response.data);
  }

  public stack(projectId: string, event: BakuEvent): Promise<void> {
    return axios
      .post(`${BakuService.BaseUrl}/${projectId}/stack`, event);
  }
}
