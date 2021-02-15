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
            <i class="baku-button" @click="openEditSoundPopup">Modifier un son</i>
          </div>


          <div class="horizontal-align">
            <i class="baku-button" @click="openEditSoundPopup">Jouer un son</i>
          </div>
        </div>
        


    </div>



    <!-- TODO Ajouter l'icone quand on l'aura = remplacer "baku-button" par "icon-name baku-button"-->
    

    <div class="record-Button">
      <button class="button is-primary" @click="openRecordPopup">Enregistrer un son</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Shot } from '@/utils/movie.service';
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

    @ProjectNS.State
    public id!: string;

    @ProjectNS.Getter
    protected getAudioRecord!: any;

    public async mounted() {
      const sound = new Blob();
      // await this.$store.dispatch('project/createAudio', { title : "son 1", sound, });
      // await this.$store.dispatch('project/createAudio', { title : "son 2", sound, });
      // await this.$store.dispatch('project/createAudio', { title : "son 3", sound, });
      // await this.$store.dispatch('project/createAudio', { title : "son 4", sound, });
    }


    handleDragStart(event: any, id: string) {
      event.dataTransfer.setData("text", id );
    }

    public async openRecordPopup() {
      this.$buefy.modal.open({
        parent: this,
        component: RecordPopup,
        hasModalCard: true,
        canCancel: ['escape', 'outside'],
      });
    }

    public async openEditSoundPopup() {
      this.$buefy.modal.open({
        parent: this,
        component: EditSoundPopup,
        hasModalCard: true,
        canCancel: ['escape', 'outside'],
      });
    }
}
</script>