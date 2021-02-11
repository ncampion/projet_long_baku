<template>
  <div class="modal-card" style="width: 700px; height: 500px;">
    <header class="modal-card-head">
      <p class="modal-card-title">Capturer un son</p>
    </header>
    <section class="modal-card-body">
      <b-field>
        <b-select
          :loading="!devices.length"
          v-model="selectedDeviceId"
          placeholder="Sélectionner un microphone"
        >
          <option v-for="device in devices" :key="device.id" :value="device.id">{{device.label}}</option>
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
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const UserNS = namespace('user');


export class AudioDevice{
  public id: string;
  public label: string;

  constructor(input: MediaDeviceInfo) {
    this.id = input.deviceId;
    this.label = input.label;
  }
}

@Component
export default class RecordPopup extends Vue {

  public devices: AudioDevice[] = [];

  public selectedDeviceId: string | null = null;

  public async mounted() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
    } catch (e) {
      console.info(e);
    }
    const devices = (await navigator.mediaDevices.enumerateDevices()) || [];

    const audioDevices = devices
      .filter(
        (input: MediaDeviceInfo) => input.kind === 'audioinput' && input.deviceId !== '',
      );
    this.devices = audioDevices.map((input: MediaDeviceInfo) => new AudioDevice(input));
    this.selectedDeviceId = this.devices[0].id ?? undefined;
  }

}

</script>
