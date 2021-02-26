package com.bakuanimation.model;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableListMultimap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ListMultimap;

import java.nio.file.Path;
import java.util.List;
import java.util.Set;

public final class Movie {
    private final String projectId;
    private final String name;
    private final String synopsis;
    private final int fps;
    private final boolean locked;
    private final ImmutableSet<String> lockedShots;
    private final ImmutableList<String> shots;
    private final ImmutableListMultimap<String, Path> images;
    private final ImmutableList<String> audios;
    private final ImmutableList<String> soundsTimeline;
    private final ImmutableList<Object> dataTimeline;

    public Movie(String projectId, String name, String synopsis, int fps, boolean locked,
                 Set<String> lockedShots, List<String> shots, ListMultimap<String, Path> images,
                 List<String> audios, List<String> soundsTimeline, List<Object> dataTimeline) {
        this.locked = locked;
        this.lockedShots = ImmutableSet.copyOf(lockedShots);
        this.shots = ImmutableList.copyOf(shots);
        this.images = ImmutableListMultimap.copyOf(images);
        this.projectId = projectId;
        this.name = name;
        this.synopsis = synopsis;
        this.fps = fps == 0 ? 12 : fps;
        this.audios = ImmutableList.copyOf(audios);
        this.soundsTimeline = ImmutableList.copyOf(soundsTimeline);
        this.dataTimeline = ImmutableList.copyOf(dataTimeline);
    }

    public String getProjectId() {
        return projectId;
    }

    public String getName() {
        return name.isBlank() ? projectId : name;
    }

    public String getSynopsis() {
        return synopsis;
    }

    public int getFps() {
        return fps;
    }

    public boolean isLocked() {
        return locked;
    }

    public ImmutableSet<String> getLockedShots() {
        return lockedShots;
    }

    public ImmutableList<String> getShots() {
        return shots;
    }

    public ImmutableListMultimap<String, Path> getImages() {
        return images;
    }

    public ImmutableList<String> getAudios() {
        return audios;
    }

    public ImmutableList<String> getSoundsTimeline() {
        return soundsTimeline;
    }

    public ImmutableList<Object> getDataTimeline() {
        return dataTimeline;
    }
}
