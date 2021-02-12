export enum BakuAction {
  MOVIE_UPDATE_TITLE,
  MOVIE_UPDATE_SYNOPSIS,
  MOVIE_UPDATE_POSTER,
  MOVIE_INSERT_IMAGE,
  SHOT_ADD,
  CHANGE_FPS,
  MOVIE_REMOVE_IMAGE,
  SHOT_REMOVE,
  MOVIE_LOCK,
  SHOT_LOCK,
  SHOT_UPDATE_SYNOPSIS,
  SHOT_UPDATE_STORYBOARD,
  MOVIE_REVERSE_IMAGES,
  DELETE_MOVIE,
  SHOT_MOVE,
  AUDIO_ADD,
  AUDIO_REMOVE,
  AUDIO_UPDATE_TITLE,
  AUDIO_UPDATE_SOUND,
  AUDIO_TIMELINE_ADD,
  AUDIO_TIMELINE_REMOVE,
  AUDIO_UPDATE_TIMECODE,
}

export interface BakuEvent {
  readonly action: BakuAction;
  readonly value: any;
  readonly user: string;
  readonly timestamp: Date;
}

export enum VideoStatusEnum {
  UpToDate = "UpToDate",
  NotUpToDate = "NotUpToDate",
  Pending = "Pending",
  NotGenerated = "NotGenerated"
}

export interface VideoStatus {
  readonly status: VideoStatusEnum;
  readonly lastModified: number;
}

export type Duration = {
  hours: number;
  minutes: number;
  seconds: number;
};
