package com.bakuanimation.model;

public final class Audio {
    private final String id;
    private final String title;
    private final Blob sound;
    private final Blob waveform;
    private final float volume;
    private final float duration;

    public Audio(String id, String title, Blob sound, Blob waveform, float volume, float duration) {
        this.id = id;
        this.title = title;
        this.sound = sound;
        this.waveform = waveform;
        this.volume = volume;
        this.duration = duration;
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public Blob getSound() {
        return sound;
    }

    public Blob getWaveform() {
        return waveform;
    }

    public float getVolume() {
        return volume;
    }

    public float getDuration() {
        return duration;
    }
}