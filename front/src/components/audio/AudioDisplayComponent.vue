<style lang="scss" scoped>
@import "@/styles/audioDisplay.scss";
</style>


<template>
  <div
    class="audioDisplay-root-div"
    dropzone=true
    ondragover="allowDrop(event);"
    ondrop="handleDrop(event);"
  >

    <div class="toolbar">
      
    <!--TODO -->

    </div>
    <div 
        ref="soundContainer" class="sound-container"
    >

      <div
            v-for="audio in soundsBar"
            class="sounds"
      >
          azer
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
import { Audio, Shot } from '@/utils/movie.service';
// import { Spinner } from "@/utils/spinner.class";
// import { ImageCacheService } from "@/utils/imageCache.service";
import RecordPopup from '@/components/RecordPopup.vue';
import EditSoundPopup from '@/components/EditSoundPopup.vue';
const ProjectNS = namespace('project');
@Component
export default class AudioDisplayComponent extends Vue {
    
    @Prop()
    public activeShot!: Shot;
    @Prop()
    public shots!: Shot[];
    @ProjectNS.State
    public id!: string;
    private Audio[] audioList;
    mounted() {
    }
    get soundsBar() {
        if (this.$store.audios == null) {  
          return null;
        }
        return this.audioList;
    }
    allowDrop = (event) => {
      event.preventDefault();
      console.log('Enfin ça marche');
    }
    handleDrop = (event) => {
      console.log('You dropped something!');
    }
    /*public onDrop(event) {
      console.log("azert");
      const id = event.dataTransfer.getData('text');
      const draggableElement = document.getElementById(id);
      const dropzone = event.target;
      //dropzone.appendChild(draggableElement);
      audioList.add(draggableElement);
      event.dataTransfer.clearData();
      }*/
}
</script>