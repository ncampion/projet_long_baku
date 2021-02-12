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
            v-for="audio in getAudioTimeline"
            class="sounds"
      >
          {{ audio.title }}
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
// import { Spinner } from "@/utils/spinner.class";
// import { ImageCacheService } from "@/utils/imageCache.service";

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

    private index: number;

    mounted() {
    }

    /*get soundsBar() {
        const audios = await this.$store.dispatch('project/getAudioTimeline');
        console.log("azoileurhioupaerzhfio_uoiaerzhufoui");
        if ( audios == null) {
          console.log('vide');
          return null;
        }
        return audios;
    }
/*
    public async createNewAudioTimeline(title: string, sound: Blop) {
      const shotId = await this.$store.dispatch('project/createAudioTimeline', { title, sound, });
      //await this.$store.dispatch('project/changeActiveShot', audioId);
      //this.$emit('close');
    }
*/
    allowDrop(event: any) {
      event.preventDefault();
    }

    public async handleDrop(event: any) {
      console.log('You dropped something!');
      event.preventDefault();
      
      var data = event.dataTransfer.getData("text");

      const title = "son 1";
      const blob = null;

      this.index=0;
      for (var audios of this.movie.audios) {
        if (audios.id == data) {
          //const aaa = this.movie.getAudio(this.movie,this.index);
          //title = audios.title;
          //blob = audios.blob;
        }
        this.index=this.index+1;
      }
      
      await this.$store.dispatch('project/createAudioTimeline', {
          title,
          sound : blob,
      });

      this.$emit('close');
      event.dataTransfer.clearData();


    }

}
</script>