<style lang="scss" scoped>
  @import "@/styles/audioList.scss";
</style>

<template>
  <div class="audio-list">
    <div class="audio-list-container">
        <div
          v-for="audio in sounds"
          class="sounds"
        >
          
          <div class="horizontal-align">
              Son 1
          </div>
          
          <div class="horizontal-align">
            <i class="baku-button" @click="openEditSoundPopup">Modifier un son</i>
          </div>


          <div class="horizontal-align">
            <i class="baku-button" @click="openEditSoundPopup">Jouer un son</i>
          </div>
        </div>
        


    </div>


    <!-- TODO Bouton "Modifier un son à inclure dans chaque element de la liste-->
    <!-- TODO Ajouter l'icone quand on l'aura = remplacer "baku-button" par "icon-name baku-button"-->
    

    <div class="record-Button">
      <button class="button is-primary" @click="openRecordPopup">Enregistrer un son</button>
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
export default class StoryboardPreviewComponent extends Vue {
    
    @Prop()
    public activeShot!: Shot;

    @Prop()
    public shots!: Shot[];

    @ProjectNS.State
    public id!: string;

    mounted() {
      create
    }

    public async createNewAudio(title : string, sound : Blop) {
      const shotId = await this.$store.dispatch('project/createAudio', { sound, title, });
      //await this.$store.dispatch('project/changeActiveShot', audioId);
      //this.$emit('close');
    }

    get sounds() {
        if (this.$store.audios == null) {
          return [null, null, null];
        }
        return this.$store.audios;
    }

    

    public async changeShotSynopsis() {
        const shotId = this.activeShot?.id;
        const synopsis = (this.$refs.shotSynopsis as any).value;

        await this.$store.dispatch('project/changeShotSynopsis', {
        shotId,
        synopsis,
        });
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
