<style lang="scss" scoped>
  @import "@/styles/audio.scss"; 
</style>

<template>
  <div class="main-frame">
    <template>
      <div class="preview-bloc">

        <AudioListComponent
        />
        <div class="preview-container">
          
          <div class="preview-content-wrapper">


            <!--<template v-for="(image, index) in computedPreviousShotImages">
              <template v-if="getActiveShot.images[activeFrame] !== null">
                <div class="image-container">
                  <img
                    class="carrousel-thumb"
                    :alt="getActiveShot.images[activeFrame]"
                    :src="ImageCacheService.getThumbnail(getActiveShot.images[activeFrame-1].id)"
                  />
                </div>
              </template>
              <template v-else>
                <div :key="'left'+index+'-prev'" class="image-container image-container-empty">
                  <div
                    class="carrousel-thumb"
                    style="width:100%; border:none"
                  />
                </div>
              </template>
              
              
            <div class="preview-content">
              
              <template>
                <img
                  v-if="getActiveShot && getActiveShot.images[activeFrame]  > 0"
                  :src="ImageCacheService.getImage(getActiveShot.images[activeFrame].id)"
                  alt="ghostImg"
                  id="ghost-img"
                />
              </template>

              <img
                id="preview-img"
                ref="previewImg"
                src="@/assets/baku-cloud-spinner.svg"
              />
            </div>



            <div class="preview-content">
              
              <template>
                <img
                  v-if="getActiveShot && getActiveShot.images[activeFrame]  > 0"
                  :src="ImageCacheService.getImage(getActiveShot.images[activeFrame].id)"
                  alt="ghostImg"
                  id="ghost-img"
                />
              </template>

              <img
                id="preview-img"
                ref="previewImg"
                src="@/assets/baku-cloud-spinner.svg"
              />
            </div>
-->


                        <div class="preview-content">
              
              <template>
                <img
                  v-if="getActiveShot && getActiveShot.images[activeFrame]  > 0"
                  :src="ImageCacheService.getImage(getActiveShot.images[activeFrame].id)"
                  alt="ghostImg"
                  id="ghost-img"
                />
              </template>

              <img
                id="preview-img"
                ref="previewImg"
                src="@/assets/baku-cloud-spinner.svg"
              />
            </div>


          </div>
          <div class="preview-actions">
            <ImagesSelectorComponent
              ref="imageSelector"
              v-if="getActiveShot"
              :projectId="id"
              :activeShot="getActiveShot.id"
              :images="getActiveShot.images"
              :activeImage="activeFrame"
              :canEdit="canEdit"
              @activeImageChange="onActiveFrameChange"
              :activeDevice=null
              v-model="selectedImages"
            />
            <div class="media-controls">
              <div class="clock">
                <span class="clock-digit">
                  <span class="clock-digit-indicator">min</span>
                  <span ref="minutes">{{ nbMins(this.activeFrame) }}</span>
                </span>
                <span class="clock-small">:</span>
                <span class="clock-digit">
                  <span class="clock-digit-indicator">sec</span>
                  <span ref="seconds">{{ nbSecs(this.activeFrame) }}</span>
                </span>
              </div>

              <div class="play-controls">
                <i
                  class="toolbar-button icon-backward baku-button"
                  style="color:#455054;"
                  @click="moveFrame(- 1)"
                />
                <template v-if="!isMultiSelect">
                  <i
                    class="toolbar-button toolbar-button-big icon-play"
                    :class="{'baku-button primary-button': isPlaying !== 'selection', 'disabled-button': isPlaying === 'selection'}"
                    @click="playAnimation()"
                    v-if="isPlaying !== 'animation'"
                  />
                  <i
                    class="toolbar-button toolbar-button-big icon-pause baku-button"
                    @click="pauseAnimation()"
                    v-else
                  />
                </template>
                <template v-else>
                  <i
                    class="toolbar-button toolbar-button-big icon-play_loop"
                    :class="{'baku-button primary-button': isPlaying !== 'selection', 'disabled-button': isPlaying === 'selection'}"
                    @click="playSelection()"
                    v-if="isPlaying !== 'selection'"
                  />
                  <i
                    class="toolbar-button toolbar-button-big icon-pause baku-button"
                    @click="pauseAnimation()"
                    v-else
                  />
                </template>

                <i
                  class="toolbar-button icon-forward baku-button"
                  style="color:#455054;"
                  @click="moveFrame(1)"
                />
              </div>

            </div>
          </div>
        
        </div>
      

        <HistoryComponent/>

      </div>

      <AudioDisplayComponent
      />

    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, } from 'vue-property-decorator';
import ProjectSettingsPopup from '@/components/ProjectSettingsPopup.vue';
import { namespace } from 'vuex-class';
import { createProject, getVersion } from '@/api';

import HistoryComponent from '@/components/capture/HistoryComponent.vue';
import AudioDisplayComponent from '@/components/audio/AudioDisplayComponent.vue';
import AudioListComponent from '@/components/audio/AudioListComponent.vue';


import * as _ from 'lodash';

import store from '@/store';
import AbstractProjectView from '@/views/AbstractProjectView.vue';
import CarrouselComponent from '@/components/capture/CarrouselComponent.vue';
import ImagesSelectorComponent from '@/components/image-selector/ImagesSelectorComponent.vue';
import CaptureToolboxComponent from '@/components/capture/CaptureToolboxComponent.vue';
import CaptureButtonComponent from '@/components/capture/CaptureButtonComponent.vue';
import StoryboardPreviewComponent from '@/components/capture/StoryboardPreviewComponent.vue';
import { Device } from '@/utils/device.class';
import { ImageCacheService } from '@/utils/imageCache.service';
import { Movie, ReadingSliderBoundaries, Shot } from '@/utils/movie.service';
import { UploadedImage } from '@/utils/uploadedImage.class';


//const CaptureNS = namespace('capture');
const ProjectNS = namespace('project');
//const WebRTCNS = namespace('webrtc');


@Component({
    components: {
        ProjectSettingsPopup,
        HistoryComponent,
        AudioListComponent,
        AudioDisplayComponent,

      CarrouselComponent,
      CaptureButtonComponent,
      ImagesSelectorComponent,
      StoryboardPreviewComponent,
      CaptureToolboxComponent,

    },
})

export default class AudioView extends Vue {
/*
    @Prop({ required: true })
    public projectId!: string;
*/
    @ProjectNS.State
    public id!: string;

    @ProjectNS.Getter
    public movie!: Movie;

    @ProjectNS.Getter
    public synchronizing!: boolean;

    @ProjectNS.Getter
    public getActiveShot!: Shot;

    @ProjectNS.Getter
    public getActiveShotImgCount!: number;

    @ProjectNS.Getter('canEditActiveShot')
    public canEdit!: boolean;

    // Carroussel Frame
     public activeFrame: number = 0;

    // Displayed Frame (previewImg + imageSelector)
    public playingFrame: number = 0;
/*
    @CaptureNS.State
    public activeDevice!: Device;

    @CaptureNS.State
    public stream!: MediaStream | null;

    @CaptureNS.State
    public scaleX!: number | 1;

    @CaptureNS.State
    public scaleY!: number | 1;

    @CaptureNS.State('onionSkinDisplay')
    protected onionSkinDisplay!: number;

    @CaptureNS.State('onionSkinValue')
    protected onionSkinValue!: number;

    @ProjectNS.Action('addImagesToShot')
    protected addImagesToShot!: ({}) => Promise<void>;

    @WebRTCNS.State
    protected dataChannel!: RTCDataChannel;
*/
    public selectedImages: ReadingSliderBoundaries = { left: 0, right: 0 };

    public animationFrame!: number;

    public animationStart!: number;

    public animationStartFrame!: number;

    public animationBoundaries!: ReadingSliderBoundaries;

    public isPlaying: 'animation' | 'selection' | null = null;

    private previewImg!: HTMLImageElement;

    public mounted() {
      /*this.$store
        .dispatch('project/changeActiveShot', this.$route.params.shotId)
        .then(() => this.displayFrame(0));
        */
      this.previewImg = this.$refs.previewImg as HTMLImageElement;
    }

    public animate(timestamp: number) {
      if (!this.animationStart) {
        this.animationStart = timestamp;
      }
      if (!this.animationStartFrame) {
        this.animationStartFrame = this.activeFrame - this.animationBoundaries.left;
        if (this.activeFrame === this.getActiveShotImgCount) {
          this.animationStartFrame = this.animationBoundaries.left;
        }
      }

      const nextFrame = this.getNextFrame(timestamp);

      if (nextFrame !== this.playingFrame) {
        this.playingFrame = nextFrame;
        this.displayFrame(nextFrame);
      }
      if (this.isPlaying === 'animation'
        && nextFrame === this.getActiveShotImgCount /* - (this.canEdit ? 0 : 1)*/) {
        this.pauseAnimation();
        return;
      }
      this.animationFrame = requestAnimationFrame(this.animate);
    }

    private displayFrame(frame: number) {
      const activeShot = this.getActiveShot;
      if (activeShot) {
        const image = activeShot.images[frame];
        if (image) {
          console.log("this.previewImg!");
          console.log(this.previewImg!);
          console.log("ImageCacheService.getImage(image.id)");
          console.log(ImageCacheService.getImage(image.id));
          this.previewImg!.src = ImageCacheService.getImage(image.id);
        }
        const imageSelector = this.$refs.imageSelector as ImagesSelectorComponent;
        if (imageSelector) {
          imageSelector!.setFrame(frame);
        }

        (this.$refs.minutes as HTMLElement).textContent = this.nbMins(frame);
        (this.$refs.seconds as HTMLElement).textContent = this.nbSecs(frame);
      }
    }

    private setActiveFrame(frame: number) {
      this.activeFrame = frame;
      this.playingFrame = this.activeFrame;
    }

    private getNextFrame(timestamp: number) {
      const imageFromStart = Math.floor(
        (timestamp - this.animationStart) * (this.movie.fps / 1000),
      );
      const animationLength = this.animationBoundaries.right - this.animationBoundaries.left;
      return (
        this.animationBoundaries.left
        + ((this.animationStartFrame + imageFromStart) % animationLength)
      );
    }

    public togglePlay() {
      if (this.isPlaying) {
        this.pauseAnimation();
      } else if (this.isMultiSelect) {
        this.playSelection();
      } else {
        this.playAnimation();
      }
    }

    public playAnimation() {
      if (!this.isPlaying && this.getActiveShot.images.length > 0) {
        if (this.activeFrame === this.getActiveShotImgCount) {
          this.moveFrame(0);
          this.syncActiveFrame();
        }
        this.initPlay('animation');
        this.animationBoundaries = {
          left: 0,
          right: this.getActiveShot.images.length + 1,
        };
        this.animationFrame = requestAnimationFrame(this.animate);
      }
    }

    public playSelection() {
      if (!this.isPlaying && this.getActiveShot.images.length > 0) {
        if (
          this.activeFrame < this.selectedImages.left
          || this.activeFrame > this.selectedImages.right
        ) {
          this.setActiveFrame(this.selectedImages.left);
        }
        this.initPlay('selection');
        this.animationBoundaries = {
          left: this.selectedImages.left,
          right: this.selectedImages.right + (this.canEdit ? 1 : 0),
        };
        this.animationFrame = requestAnimationFrame(this.animate);
      }
    }

    public initPlay(type: 'animation' | 'selection') {
      this.isPlaying = type;
    }

    public pauseAnimation() {
      if (this.isPlaying) {
        this.isPlaying = null;
        delete this.animationStart;
        delete this.animationStartFrame;
        cancelAnimationFrame(this.animationFrame);
        this.syncActiveFrame();
      }
    }

    public stopMoving() {
      this.pauseAnimation();
      this.syncActiveFrame();
    }

    private syncActiveFrame() {
      if (!this.isPlaying) {
        if (this.activeFrame !== this.playingFrame) {
          this.activeFrame = this.playingFrame;
          ImageCacheService.startPreloading(
            this.getActiveShot.images,
            this.activeFrame,
            this.onImagePreloaded,
          );
        }
      }
    }
    @Watch('$route.params.shotId')
    public onShotIdChange(id: string) {
      this.$store
        .dispatch('project/changeActiveShot', this.$route.params.shotId)
        .then(() => this.displayFrame(0));
    }

    @Watch('stream')
    public onStreamChange(newValue: MediaStream, _oldValue: MediaStream) {
      if (newValue) {
        (this.$refs.videoCapture as HTMLVideoElement).srcObject = newValue;
        // (this.$refs.videoCaptureFullscreen as HTMLVideoElement).srcObject = newValue;
      }
    }

    @Watch('getActiveShot')
    public async onActiveShotChange(shot: Shot) {
      if (shot) {
        ImageCacheService.startPreloading(
          shot.images,
          this.activeFrame,
          this.onImagePreloaded,
        );
      }
    }


    @Watch('getActiveShotImgCount')
    public async onActiveShotImgCountChange(nb: number) {
      if (nb) {
        this.displayFrame(this.activeFrame);
      }
    }

    get onionSkinAsArray() {
      return _.range(this.onionSkinValue - 2, -1, -1);
    }

    get IsFrameLiveView() {
      return !this.isPlaying && this.activeFrame === this.getActiveShot?.images.length;
    }

    private onImagePreloaded(imageId: string): void {
      if (this.getActiveShot.images[this.activeFrame].id === imageId) {
        this.displayFrame(this.activeFrame);
      }
      if (this.$refs.carrousel) {
        (this.$refs.carrousel as CarrouselComponent).imageReady(imageId);
      }
    }

    public moveFrame(moveOffset: number) {
      const computedFrame = this.activeFrame + moveOffset;
      this.setActiveFrame(this.computeMoveFrame(computedFrame));
      this.displayFrame(this.activeFrame);
    }

    public movePlayingFrame(moveOffset: number) {
      this.initPlay('animation');
      const computedFrame = this.playingFrame + moveOffset;
      this.playingFrame = this.computeMoveFrame(computedFrame);
      this.displayFrame(this.playingFrame);
    }

    public moveHome() {
      this.onActiveFrameChange(0);
    }

    public moveToCapture() {
      this.pauseAnimation();
      this.onActiveFrameChange(this.getActiveShot.images.length);
    }

    public moveEnd() {
      this.onActiveFrameChange(this.getActiveShot.images.length - 1);
    }

    private computeMoveFrame(frame: number): number {
      const minFrame = 0;
      if (frame < minFrame) {
        return minFrame;
      }
      if (frame > this.getActiveShot.images.length) {
        return this.getActiveShot.images.length;
      }
      return frame;
    }

    public onActiveFrameChange(newActiveFrame: number) {
      if (this.isPlaying) {
        this.pauseAnimation();
      }
      if (newActiveFrame < this.selectedImages.left || newActiveFrame > this.selectedImages.right) {
        this.selectedImages.left = 0;
        this.selectedImages.right = 0;
      }
      this.setActiveFrame(this.computeMoveFrame(newActiveFrame));
      this.displayFrame(this.activeFrame);
    }

    public moveLeftBoundary() {
      this.onActiveFrameChange(this.selectedImages.left);
    }

    public moveRightBoundary() {
      this.onActiveFrameChange(this.selectedImages.right);
    }

    public increaseSelection(newFrame: number) {
      if (!this.isMultiSelect) {
        this.selectedImages.left = Math.min(this.activeFrame, newFrame);
        this.selectedImages.right = Math.max(this.activeFrame, newFrame);
      } else if (newFrame >= this.selectedImages.left && newFrame <= this.selectedImages.right) {
        this.selectedImages.left = newFrame;
        this.setActiveFrame(this.computeMoveFrame(this.selectedImages.left));
        this.displayFrame(this.activeFrame);
      } else {
        this.selectedImages.left = Math.min(this.selectedImages.left, newFrame);
        this.selectedImages.right = Math.max(this.selectedImages.right, newFrame);
      }
    }

    resetSelection() {
      this.selectedImages.left = 0;
      this.selectedImages.right = 0;
    }

    changeSelection(params: { left: number; right: number }) {
      this.selectedImages.left = params.left;
      this.selectedImages.right = params.right;
    }

    get isMultiSelect() {
      return this.selectedImages.left !== this.selectedImages.right;
    }

    public nbMins(frame: number): string {
      return `${Math.floor((frame + 1) / this.movie.fps / 60) % 60}`.padStart(2, '0');
    }

    public nbSecs(frame: number): string {
      return `${Math.floor((frame + 1) / this.movie.fps) % 60}`.padStart(2, '0');
    }

    public onUploaded(id: string) {
      ImageCacheService.startPreloadingImage(new UploadedImage(this.id, id), () => this.$forceUpdate());
      this.$store.commit('project/incAction', -1);
    }


}
</script>

