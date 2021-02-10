<style lang="scss" scoped>
  @import "@/styles/audioList.scss";
</style>

<template>
    <div class="audio-list">
        <div
          v-for="(audio, index) in audios"
          :key="`audio-${index}`"
          class="movie-card" // ???
        >
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Audio, Shot } from '@/utils/movie.service';
// import { Spinner } from "@/utils/spinner.class";
// import { ImageCacheService } from "@/utils/imageCache.service";

const ProjectNS = namespace('project');

@Component
export default class StoryboardPreviewComponent extends Vue {
    @UserNS.State('seenProjects')
    public seenProjects!: SeenProject[];

    @UserNS.Action('refreshSeenProjectsMetadata')
    refreshSeenProjectsMetadata!: Function;

    
    @Prop()
    public activeShot!: Shot;

    @Prop()
    public shots!: Shot[];

    @ProjectNS.State
    public id!: string;

    @Prop()
    public audios!: Audio[];

    mounted() {
    }

    get audios() {
        return this.audiosList;
    }


    public async changeShotSynopsis() {
        const shotId = this.activeShot?.id;
        const synopsis = (this.$refs.shotSynopsis as any).value;

        await this.$store.dispatch('project/changeShotSynopsis', {
        shotId,
        synopsis,
        });
    }
}
</script>
