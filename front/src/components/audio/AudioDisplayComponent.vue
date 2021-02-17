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

    
    </div>
    
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Shot, Movie } from '@/utils/movie.service';
import TimelinesChart from 'timelines-chart';
import * as css from "@/styles/timeline.scss";

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

    private chart!: any = TimelinesChart();

    private chartData!: any;
    

    mounted() {
      this.chartData = this.genRandomData();
      
      //this.chart = TimelinesChart();
      
      this.chart.data(this.chartData)
            .xTickFormat((n: number): number => +n)
            .timeFormat('%Q')
            .maxHeight(330)
            .onSegmentClick(this.segmentClick)
            .maxLineHeight(100)
            .zQualitative(true);

      this.chart(this.$refs.movieContainer);
    }


    segmentClick(segment : any) {
      console.log(segment);
      segment.target.__data__.data.val = "Son 1";
      segment.target.__data__.labelVal = "Son 1";
      segment.target.__data__.val = "Son 1";
      this.chart.data(this.chartData);
      this.chart.refresh();
      return segment;
    }

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