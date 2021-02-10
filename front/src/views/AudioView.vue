<style lang="scss" scoped>
  @import "@/styles/capture.scss"; // Changer ça
</style>

<template>
  <div class="main-frame">
    <template>
        Bonjour monde
      <div class="preview-bloc">
        <StoryboardPreviewComponent
          ref="previewComponent"
          :shots="movie.shots"
          :activeShot="getActiveShot"
        />
        <div class="preview-container">
          <div class="preview-content-wrapper">
            <div class="preview-content">
              <template v-if="onionSkinDisplay">
                <img
                  v-if="getActiveShot && getActiveShot.images[activeFrame - onionSkinValue] && activeDevice && IsFrameLiveView && onionSkinDisplay > 0"
                  alt="ghostImg"
                  id="ghost-img"
                  :src="ImageCacheService.getImage(getActiveShot.images[activeFrame - onionSkinValue].id)"
                />
                <template v-for="ghostIndex in onionSkinAsArray">
                  <img
                    :key="ghostIndex"
                    v-if="getActiveShot && getActiveShot.images[activeFrame - ghostIndex] && activeDevice && IsFrameLiveView"
                    alt="ghostImg"
                    class="onion-skin"
                    :src="ImageCacheService.getImage(getActiveShot.images[activeFrame - ghostIndex].id)"
                  />
                </template>
              </template>
              <video
                v-if="activeDevice"
                :class="{hidden: !IsFrameLiveView}"
                id="video-capture"
                ref="videoCapture"
                :style="{transform: 'scale(' + scaleX +', ' +scaleY +')', 'opacity': onionSkinDisplay ? 0.4 : 1}"
                autoplay
                muted
                playsinline
              />
              <img
                id="preview-img"
                ref="previewImg"
                src="@/assets/baku-cloud-spinner.svg"
                :class="{hidden: IsFrameLiveView}"
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
              :activeDevice="activeDevice"
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

                <CaptureButtonComponent
                  class="baku-button toolbar-button toolbar-button-big"
                  v-if="canEdit"
                  :device="activeDevice"
                  :projectId="id"
                  :canCapture="activeFrame === getActiveShotImgCount"
                  @captured="onCaptured"
                  @uploaded="onUploaded"
                  @moveToCapture="moveToCapture()"
                />
                <i
                  class="toolbar-button icon-forward baku-button"
                  style="color:#455054;"
                  @click="moveFrame(1)"
                />
              </div>

              <!-- <div
              class="baku-button toolbar-button toolbar-capture-button"
              :class="{'active-capture': activeDevice, 'disabled' : !!isPlaying}"
              @click="setactiveDevice(activeDevice)"
              >Mode Capture</div>-->
              <div class="toolbar-button toolbox-control">
                <img
                  style="height: 28px; width:28px"
                  v-if="synchronizing"
                  alt="loading"
                  id="synchronization"
                  src="@/assets/baku-balls-spinner.svg"
                />
                <CaptureToolboxComponent v-if="getActiveShot && canEdit" :isCapturing="true"/>
              </div>
            </div>
          </div>
        </div>
        <HistoryComponent/>
      </div>

      <CarrouselComponent
        v-if="getActiveShot"
        ref="carrousel"
        :projectId="id"
        :activeShot="getActiveShot.id"
        :images="getActiveShot.images"
        :activeImage="activeFrame"
        :isPlaying="isPlaying"
        :isFrameLiveView="IsFrameLiveView"
        @activeImageChange="onActiveFrameChange"
        @moveFrame="movePlayingFrame"
        @moveHome="moveHome"
        @moveEnd="moveEnd"
        @stopMovingFrame="stopMoving"
        @togglePlay="togglePlay"
        @increaseSelection="increaseSelection($event)"
        @resetSelection="resetSelection()"
        @changeSelection="changeSelection($event)"
        :selectedImages="selectedImages"
      />
    </template>
  </div>
</template>