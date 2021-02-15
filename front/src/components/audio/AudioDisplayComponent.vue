<style lang="scss" scoped>
@import "@/styles/audioDisplay.scss";
</style>


<template>
  <div
    class="audioDisplay-root-div"
    dropzone=true
    @dragover="allowDrop($event);"
    @drop="handleDrop($event);"
  >

    <div class="toolbar">
      
    <!--TODO -->

    </div>
    <div 
        ref="soundContainer" class="sound-container"
    >

      <div
            v-for="titles in soundsBar"
            class="sounds"
      >
          {{ titles.title }}
      </div>
    
    </div>

    <div ref="movieContainer" class="movie-container">

    <!--TODO -->
    
    </div>
    
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Shot, Movie } from '@/utils/movie.service';

const ProjectNS = namespace('project');

@Component
export default class AudioDisplayComponent extends Vue {
    
    @Prop()
    public activeShot!: Shot;

    @Prop()
    public shots!: Shot[];

    @ProjectNS.State
    public id!: string;

    @ProjectNS.Getter
    protected movie!: Movie;

    @ProjectNS.Getter
    protected getAudioRecord!: any;

    @ProjectNS.Getter
    protected getAudioTimeline!: any;


    mounted() {
    }

    get soundsBar() {
        const audiosTimeline = this.getAudioTimeline;
        const audiosRecord = this.getAudioRecord;
        const titles = [];

        if (audiosTimeline == null) {
          return null;
        } else {
          for (let audioT in audiosTimeline) {
            for (let audioR in audiosRecord) {
              if (audiosTimeline[audioT].id == audiosRecord[audioR].id) {
                titles.push({title : audiosRecord[audioR].title,});
              }
            }
          }
        }
        return titles;
    }


    allowDrop(event: any) {
      event.preventDefault();
    }

    public async handleDrop(event: any) {
      event.preventDefault();
      
      var data = event.dataTransfer.getData("text");

      
      await this.$store.dispatch('project/createAudioTimeline', {
          audioId : data;
      });

      this.$emit('close');
      event.dataTransfer.clearData();


    }

}
</script>