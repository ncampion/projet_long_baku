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



    <div class="horizontal-align">
      <div class="padding-button">
        <i class="button is-primary" @click="backward10">Reculer de 10</i>
      </div>

      <div class="padding-button">
        <i class="button is-primary" @click="backward1">Reculer de 1</i>
      </div>

      <div class="padding-button">
        <i class="button is-primary" @click="forward1">Avancer de 1</i>
      </div>

      <div class="padding-button">
        <i class="button is-primary" @click="forward10">Avancer de 10</i>
      </div>

      <div class="padding-button">
        <i class="button is-primary" @click="deleteAudioSegment">Supprimer un son</i>
      </div>

      <div class="padding-button">
          Mode : {{ mode }}
      </div>

      <div class="padding-button">
        <i class="button is-primary" @click="addPiste()">Ajouter une piste</i>
      </div>

      <b-dropdown
        class="toolbox-dropdown"
        append-to-body
        aria-role="menu"
      >
        <a class="navbar-item" slot="trigger" role="button" slot-scope="{ active }" style="display: flex; align-items: center">
          <span class="item-title">Piste {{activePiste}} </span>
          <i class="icon-chevron-right" :class="active ? 'menu-down' : 'menu-up'"></i>
        </a>


        <div v-for="index in listPistes">

          <b-dropdown-item class aria-role="listitem">
            <div class="option-logo" @click="goToPiste(index)">
              <span>Piste {{index}} </span>
            </div>
          </b-dropdown-item>

        </div>


      </b-dropdown>

    </div>

    <div ref="movieContainer" class="movie-container">

    </div>

  </div>
</template>


<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Movie } from '@/utils/movie.service';
import TimelinesChart from 'timelines-chart';
import { Shot } from '@/utils/movie.service';
import { clone } from 'lodash';


const ProjectNS = namespace('project');

@Component
export default class AudioDisplayComponent extends Vue {


    @ProjectNS.State
    public id!: string;

    @ProjectNS.Getter
    protected movie!: Movie;

    @ProjectNS.Getter
    protected getAudioRecord!: any;

    @ProjectNS.Getter
    protected getSoundTimeline!: any;

    @ProjectNS.Getter
    protected getMovieFps !: any;

    private chart: any = TimelinesChart();

    private chartData!: any;

    public allShots: Array<any> = [];

    private goForward10 : boolean = true;
    private goForward1 : boolean = false;
    private goBackward1 : boolean = false;
    private goBackward10 : boolean = false;
    private deleteSound : boolean = false;
    private mode : string = "Avancer de 10 frames";
    private nbTotalFrames : number = 0;
    private nbPistes : number = 1;
    private activePiste : number = 1;
    private listPistes : number[] = [1];



    mounted() {
      this.chartData = this.getChart();

      console.log(this.mode);


      this.chart.data( this.getChart())
            .xTickFormat((n: number): number => +n)
            .timeFormat('%Q')
            .maxHeight(330)
            .onSegmentClick(this.segmentClick)
            .maxLineHeight(70)
            .zQualitative(true)
            .dateMarker(1)
            .enableAnimations(false)
            .segmentTooltipContent(this.segmentTooltip);
      this.chart(this.$refs.movieContainer);
    }


    getChart(){
      return [
          {
            group: "SONS",
            data: [
              {
                label: "Piste 1",
                data: []
              },
            ],
          },
          {
            group: "PLANS",
            data: [
              {
                label: "",
                data: this.getChartFromShots(),
              },
            ],
          },
        ];
    }

    public actualizeDateMarker(newFrame: number){
      this.chart.dateMarker(newFrame);
    }

    public setAllShots(shots: Shot[]){
      this.allShots = shots;
      for (let shot of this.allShots) {
        this.nbTotalFrames = this.nbTotalFrames + shot.images.length;
      }
      this.chart.data(this.getChart());
      this.chartData = this.getChart();
    }

    getChartFromShots(){
      if(this.allShots){
        const nSegments = this.allShots.length
        let runLength = 1;

        return [...Array(nSegments).keys()].map(i => {
          const start = runLength,
            end = runLength + this.allShots[i].images.length;

          runLength = end;

          return {
            timeRange: [start, end],
            val: `Plan ${i+1}`
          };
        });
      } else {
        return [];
      }

    }


    segmentTooltip(d : any) {
      return d.labelVal+'<br>'
            + "From : " + (Math.round(d.data.timeRange[0])) + '<br>'
            + "To : "  + (Math.round(d.data.timeRange[1]));
    }

    public async segmentClick(segment : any) {
      if (this.goBackward1 || this.goBackward10 || this.goForward1 || this.goForward10) {
        let updatedStartEnd = this.moveSound(segment);
        let soundTimelineId = segment.target.__data__.data.soundTimelineId;
        await this.$store.dispatch('project/updateSoundTimelineStart', { soundTimelineId, start : updatedStartEnd[0], end : updatedStartEnd[1] });
      }
      if (this.deleteSound) {
        this.removeSoundTimeline(segment);
      }

      //segment.target.__data__.data.val = "Son 1";
      //segment.target.__data__.labelVal = "Son 2";
      //segment.target.__data__.val = "Son 2";

      this.chart.data(this.chart.data());
      this.chartData = this.chart.data();
      this.chart.refresh();
      return segment;
    }

  moveSound(segment : any) {
    let nbFrames = 0;
    if (this.goForward1 || this.goForward10) {
      if (this.goForward1) {
        nbFrames = 1;
      } else {
        nbFrames = 10;
      }

      if (segment.target.__data__.data.timeRange[0] + nbFrames >= this.nbTotalFrames) {
          segment.target.__data__.data.timeRange[1] = segment.target.__data__.data.timeRange[1] - segment.target.__data__.data.timeRange[0] + this.nbTotalFrames + 1;
          segment.target.__data__.data.timeRange[0] = this.nbTotalFrames + 1;
      } else {
          segment.target.__data__.data.timeRange[0] = segment.target.__data__.data.timeRange[0] + nbFrames;
          segment.target.__data__.data.timeRange[1] = segment.target.__data__.data.timeRange[1] + nbFrames;
      }
    } else {
      if (this.goBackward1) {
        nbFrames = 1;
      } else if (this.goBackward10) {
        nbFrames = 10;
      }
      if (segment.target.__data__.timeRange[0] - nbFrames <= 0) {
        segment.target.__data__.data.timeRange[1] = segment.target.__data__.data.timeRange[1] - segment.target.__data__.timeRange[0] + 1;
        segment.target.__data__.data.timeRange[0] = 1;
      } else {
        segment.target.__data__.data.timeRange[0] = segment.target.__data__.data.timeRange[0] - nbFrames;
        segment.target.__data__.data.timeRange[1] = segment.target.__data__.data.timeRange[1] - nbFrames;
      }
    }

    return [segment.target.__data__.data.timeRange[0], segment.target.__data__.data.timeRange[1]];
  }

  public async removeSoundTimeline(segment : any) {
    let soundTimelineId = segment.target.__data__.data.soundTimelineId;
    await this.$store.dispatch('project/removeSoundTimeline', soundTimelineId);
    let updatedData = this.chart.data();
    let pisteNumber = segment.target.__data__.label.split(" ")[1] - 1;

    if (updatedData[0].data[pisteNumber].data.length == 1 && updatedData[0].data.length > 1) {
      updatedData[0].data.splice(pisteNumber, 1);
      updatedData = this.renamePistes(updatedData);
      this.nbPistes = this.nbPistes - 1;
      this.activePiste = this.activePiste - 1;
    } else {
      let soundTimelineId = segment.target.__data__.data.soundTimelineId;
      const index = updatedData[0].data[pisteNumber].data.findIndex((p) => p.soundTimelineId === soundTimelineId);
      updatedData[0].data[pisteNumber].data.splice(index,1);
    }

    this.chart.data(updatedData)
              .segmentTooltipContent();
    await this.$store.dispatch('project/updateDataTimeline', updatedData);
  }


  renamePistes(updatedData : any) : any {
    for (let i = 1; i<=updatedData[0].data.length; i++) {
      updatedData[0].data[i-1].label = "Piste " + i;
    }
    return updatedData;
  }
/*
    genRandomData() {
      const NLINES = 3,
        MAXSEGMENTS = 4,
        MIN_X = 0,
        MAX_X = 100;

      return [{
        group: '',
        data: [...Array(NLINES).keys()].map(i => ({
          label: `line${i+1}`,
          data: getSegmentsData()
        }))
      }];

      //

      function getSegmentsData() {
        const nSegments = Math.ceil(Math.random()*MAXSEGMENTS),
          segMaxLength = Math.round((MAX_X-MIN_X)/nSegments);
        let runLength = MIN_X;

        return [...Array(nSegments).keys()].map(i => {
          const tDivide = [Math.random(), Math.random()].sort(),
            start = runLength + tDivide[0]*segMaxLength,
            end = runLength + tDivide[1]*segMaxLength;

          runLength = runLength + segMaxLength;

          return {
            timeRange: [start, end],
            val: Math.random()
          };
        });
      }
    }

*/

    backward10() {
      this.setFalse();
      this.goBackward10 = true;
      this.mode = "Reculer de 10 frames";
    }

    backward1() {
      this.setFalse();
      this.goBackward1 = true;
      this.mode = "Reculer de 1 frame";
    }

    forward1() {
      this.setFalse();
      this.goForward1 = true;
      this.mode = "Avancer de 1 frame";
    }

    forward10() {
      this.setFalse();
      this.goForward10 = true;
      this.mode = "Avancer de 10 frames";
    }

    deleteAudioSegment() {
      this.setFalse();
      this.deleteSound = true;
      this.mode = "Supprimer un son";
    }

    setFalse() {
      this.goBackward1 = false;
      this.goBackward10 = false;
      this.goForward1 = false;
      this.goForward10 = false;
      this.deleteSound = false;
    }



    // Drop from the Record sounds list

    allowDrop(event: any) {
      event.preventDefault();
    }

    public async handleDrop(event: any) {
      event.preventDefault();
      let audioId = event.dataTransfer.getData("text");
      let audios = this.getAudioRecord;
      const audioIndex = audios.findIndex((p) => p.id === audioId);
      const audio = audios.find((p) => p.id === audioId);
      let title = audio.title;
      let start = this.chart.dateMarker();
      let duration = Math.round(audio.duration*this.getMovieFps);
      let end = start + duration;
      console.log(duration);
      console.log(end);
      let addAllowed = this.checkAddOnSound(start, end);

      if (addAllowed) {
        const soundTimelineId = await this.$store.dispatch('project/createSoundTimeline', {audioId, start, end});

        this.addAudioToPiste(audioId, title, soundTimelineId, this.activePiste, start, end);
        this.updateTimelineLocal();
      }


      event.dataTransfer.clearData();
    }

    checkAddOnSound(start : number, end : number) {
      let dataChart = this.chart.data();

      for (let i = 0; i < dataChart[0].data[this.activePiste-1].data.length; i++) {
        let sound = dataChart[0].data[this.activePiste-1].data[i];
        if (!(start >= sound.timeRange[1] || end <= sound.timeRange[0])) {
          return false;
        }
      }
      return true;
    }

    public async updateTimelineLocal() {
      this.chart.data(this.chartData);
      this.chart.refresh();
      await this.$store.dispatch('project/updateDataTimeline', this.chartData);
      this.$emit('close');
    }


    addAudioToPiste (audioId : string, title : string, soundTimelineId : string, numPiste : number, start : number, end : number) {
      let timeRange = [start, end];
      let dataSound = {
          timeRange : timeRange,
          val : title,
          audioId : audioId,
          soundTimelineId : soundTimelineId,
        };
      this.chartData[0].data[numPiste-1].data.push(dataSound);
    }


    public async addPiste() {
      let numPiste = this.nbPistes + 1;
      this.nbPistes = this.nbPistes +1;
      let pistes = [... this.chartData[0].data];
      this.listPistes.push(numPiste);
      pistes.push({
        label : "Piste " + numPiste,
        data : [],
      });
      let newChartData =  JSON.parse(JSON.stringify(this.chartData));
      newChartData[0].data = pistes;
      this.chart.data(newChartData);
      this.chartData = newChartData;
      this.activePiste = numPiste;
      this.updateTimelineLocal();
    }


    removePiste(numPiste : number) {
      if (this.nbPistes > 1) {

        this.listPistes.splice(this.nbPistes , 1);
        this.nbPistes = this.nbPistes - 1;
        // Enlever la piste selectionnée, et renommer toutes les autres en fonction du chiffre choisi
        // = parcourir toutes les pistes et les renommer une par une pour etre sur

        // TODO
      }
    }

    goToPiste(n : number) {
      this.activePiste = n;
    }

}
</script>