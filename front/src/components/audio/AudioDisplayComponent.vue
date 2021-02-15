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
            v-for="audioTimeline in soundsBar"
            draggable=true
            @dragstart="handleDragStart($event,audioTimeline.idAudioTimeline);"
            @dragover="allowDropTimeline($event);"
            @drop="handleDropTimeline($event);"
            class="sounds"
      >
          {{ audioTimeline.title }}
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
                titles.push({
                  id : audiosTimeline[audioT].id,
                  idAudioTimeline : audiosTimeline[audioT].idTimeline,
                  title : audiosRecord[audioR].title,
                });
              }
            }
          }
        }
        return titles;
    }


    // Drag and drop Timeline

    handleDragStart(event: any, id: string) {
      event.dataTransfer.setData("text", id );
    }

    allowDropTimeline(event: any) {
      event.preventDefault();
    }

    public async handleDropTimeline(event: any) {
      event.preventDefault();
      
      var data = event.dataTransfer.getData("text");
      
      await this.$store.dispatch('project/createAudioTimeline', data);

      this.$emit('close');
      event.dataTransfer.clearData();

    }





    // Drop from the Record sounds list

    allowDrop(event: any) {
      event.preventDefault();
    }

    public async handleDrop(event: any) {
      event.preventDefault();
      
      var data = event.dataTransfer.getData("text");
      
      await this.$store.dispatch('project/createAudioTimeline', data);

      this.$emit('close');
      event.dataTransfer.clearData();
    }

}
</script>