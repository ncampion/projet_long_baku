<style lang="scss" scoped>
  @import "@/styles/capture.scss"; // Changer ça
</style>

<template>
  <div class="main-frame">
    <template>
        <button class="create-button" @click="openRecordPopup">Enregistrer un son</button>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, } from 'vue-property-decorator';
import ProjectSettingsPopup from '@/components/ProjectSettingsPopup.vue';
import { namespace } from 'vuex-class';
import { createProject, getVersion } from '@/api';
import RecordPopup from '@/components/RecordPopup.vue';

@Component({
    components: {
        ProjectSettingsPopup,
    },
})

export default class AudioView extends Vue {

    public async openRecordPopup() {
        this.$buefy.modal.open({
        parent: this,
        component: RecordPopup,
        hasModalCard: true,
        canCancel: ['escape', 'outside'],
      });
    }
}
</script>

