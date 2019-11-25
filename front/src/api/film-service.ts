import {BakuAction, BakuEvent, BakuService} from "@/api/baku-service";
import {List} from "immutable";

export type ImageRef = string;

export interface Film {
    readonly title: string;
    readonly synopsis: string;
    readonly poster?: ImageRef;
    readonly plans: List<Plan>;
}

export interface Plan {
    readonly name: string;
    readonly images: List<ImageRef>;
}

export class FilmService {

    private static merge(events: BakuEvent[]): Film {
        let title = "Unnamed";
        let synopsis = "Please fill a synopsis";
        let poster;
        let plans: List<Plan> = List();

        for (const event of events) {
            switch (event.action) {
                case BakuAction.UPDATE_TITLE:
                    title = event.value;
                    break;
                case BakuAction.UPDATE_SYNOPSIS:
                    synopsis = event.value;
                    break;
                case BakuAction.UPDATE_POSTER:
                    poster = event.value;
                    break;
                case BakuAction.ADD_PLAN:
                    plans = plans.push({name: event.value, images: List()});
                    break;
                case BakuAction.INSERT_IMAGE:
                    const {planIndex, imageIndex, image} =
                        event.value as { planIndex: number, imageIndex: number, image: ImageRef };
                    const plan = plans.get(planIndex);
                    if (!plan) {
                        throw new Error(`Plan ${planIndex} should exist for project ${title}`);
                    }
                    const images = plan.images.splice(imageIndex, 0, image);
                    plans.splice(planIndex, 1, {...plan, images});
                    break;
            }
        }

        return {title, synopsis, poster, plans};
    }

    private readonly bakuService: BakuService = new BakuService();

    public async get(id: string): Promise<Film> {
        const events = await this.bakuService.getHistory(id);
        return FilmService.merge(events);
    }

    public async updateTitle(projectId: string, title: string): Promise<void> {
        await this.bakuService.stack(projectId, {action: BakuAction.UPDATE_TITLE, value: title});
    }

    public async updateSynopsis(projectId: string, synopsis: string): Promise<void> {
        await this.bakuService.stack(projectId, {action: BakuAction.UPDATE_SYNOPSIS, value: synopsis});
    }

    public async updatePoster(projectId: string, poster: ImageRef): Promise<void> {
        await this.bakuService.stack(projectId, {action: BakuAction.UPDATE_SYNOPSIS, value: poster});
    }

    public async addPlan(projectId: string, name: string): Promise<void> {
        await this.bakuService.stack(projectId, {action: BakuAction.ADD_PLAN, value: name});
    }

    public async insertImage(projectId: string, image: ImageRef): Promise<void> {
        await this.bakuService.stack(projectId, {action: BakuAction.ADD_PLAN, value: image});
    }
}
