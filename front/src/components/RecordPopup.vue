<template>
  <div class="modal-card" style="width: 700px; height: 500px;">
    <header class="modal-card-head">
      <p class="modal-card-title">Capturer un son</p>
    </header>
    <section class="modal-card-body">
      <b-field>
        <b-select
          icon="video"
          :loading="!devices.length"
          @input="onCaptureDeviceChange()"
          v-model="selectedDeviceId"
          placeholder="Sélectionner une caméra"
        >
          <option>tamer</option>
        </b-select>
      </b-field>
      <button class="button" id="recordAction" type="button" @click="recordAction()">Record</button>
      <button class="button" id="playAction" type="button" @click="playAction()">Play</button>
      
    </section>
    <footer class="modal-card-foot">
      <button class="button" type="button" @click="$parent.close()">Annuler</button>
      <button class="button is-primary" @click="recordSound()">Valider</button>
    </footer>
  </div>
</template>


<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import WaveSurfer from "wavesurfer.js";

const UserNS = namespace('user');

@Component
export default class RecordPopup extends Vue {
  public devices: Device[] = [];

</script>
