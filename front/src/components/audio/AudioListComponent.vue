<style lang="scss" scoped>
  @import "@/styles/audioList.scss";
</style>

<template>
  <div class="audio-list">
    <div class="audio-list-container">
        <div
          v-for="audio in getAudioRecord"
          class="sounds"
        >
          
          <div
            class="horizontal-align"
            draggable="true"
            @dragstart="handleDragStart($event,audio.id);"
          >
              {{ audio.title }}
          </div>
          
          <div class="horizontal-align">
            <i class="baku-button" @click="openEditSoundPopup(audio.id)">Modifier le son</i>
          </div>


          <div class="horizontal-align">
            <i class="baku-button" @click="playSound(audio.id)">Jouer le son</i>
          </div>

          <div class="horizontal-align">
            <i class="baku-button" @click="deleteSound(audio.id)">Supprimer le son</i>
          </div>
        </div>
        


    </div>



    <!-- TODO Ajouter l'icone quand on l'aura = remplacer "baku-button" par "icon-name baku-button"-->
    

    <div class="record-Button">
      <button class="button is-primary" @click="openRecordPopup(projectId)">Enregistrer un son</button>
      <button class="button is-primary" @click="stopPlayer()">Stopper la lecture des sons</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Shot } from '@/utils/movie.service';
import { Howl } from 'howler';
// import { Spinner } from "@/utils/spinner.class";
// import { ImageCacheService } from "@/utils/imageCache.service";
import RecordPopup from '@/components/RecordPopup.vue';
import EditSoundPopup from '@/components/EditSoundPopup.vue';
const ProjectNS = namespace('project');
@Component
export default class AudioListComponent extends Vue {
    
    @Prop()
    public activeShot!: Shot;

    @Prop()
    public shots!: Shot[];

    @Prop()
    public isPlaying: 'animation' | 'selection' | null = null;

    @Prop()
    public projectId!: String;

    @ProjectNS.State
    public id!: string;

    @ProjectNS.Getter
    protected getAudioRecord!: any;

    private sound!: Howl;

    private alreadyPlayedOnce: boolean = false;

    public async mounted() {
      // const sound = new Blob();
      // await this.$store.dispatch('project/createAudio', { title : "son 1", sound, });
      // await this.$store.dispatch('project/createAudio', { title : "son 2", sound, });
      // await this.$store.dispatch('project/createAudio', { title : "son 3", sound, });
      // await this.$store.dispatch('project/createAudio', { title : "son 4", sound, });
    }


    handleDragStart(event: any, id: string) {
      event.dataTransfer.setData("text", id);
    }

    public async openRecordPopup(projectId) {
      this.$buefy.modal.open({
        parent: this,
        component: RecordPopup,
        hasModalCard: true,
        canCancel: ['escape', 'outside'],
        props: {
          "projectId": projectId
        }
      });
    }

    public async openEditSoundPopup(id: String) {
      this.$buefy.modal.open({
        parent: this,
        component: EditSoundPopup,
        hasModalCard: true,
        canCancel: ['escape', 'outside'],
        props: {
          "id": id
        }
      });
    }

    public playSound(audioId : string) {
      if (this.alreadyPlayedOnce) {
        if (this.sound.playing()) {
          this.sound.stop();
          let url = (window.URL || window.webkitURL ).createObjectURL(this.getAudioRecord.find((audio: any) => audio.id === audioId).sound);
          let volume = this.getAudioRecord.find((audio: any) => audio.id === audioId).volume;
          this.sound = new Howl({
            src: [url],
            format: ['wav'],
            volume: parseFloat((volume/100).toFixed(2))
        });
          this.sound.play();
        } else {
          let url = (window.URL || window.webkitURL ).createObjectURL(this.getAudioRecord.find((audio: any) => audio.id === audioId).sound);
          let volume = this.getAudioRecord.find((audio: any) => audio.id === audioId).volume;
          this.sound = new Howl({
            src: [url],
            format: ['wav'],
            volume: parseFloat((volume/100).toFixed(2))
          });
          this.sound.play();
        }
      } else {
        let url = (window.URL || window.webkitURL ).createObjectURL(this.getAudioRecord.find((audio: any) => audio.id === audioId).sound);
        let volume = this.getAudioRecord.find((audio: any) => audio.id === audioId).volume;
        this.sound = new Howl({
            src: [url],
            format: ['wav'],
            volume: parseFloat((volume/100).toFixed(2))
        });
        this.sound.play();
        this.alreadyPlayedOnce = true;
      }
    }

    public async deleteSound(audioId: string) {   
      if (!this.isPlaying) {
        await this.$store.dispatch('project/removeAudio', audioId);
      }   
    }

    public stopPlayer() {
      if (this.alreadyPlayedOnce) {
        this.sound.stop();
      }
    }
}
</script>