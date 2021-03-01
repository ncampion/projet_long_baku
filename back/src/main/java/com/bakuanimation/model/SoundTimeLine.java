package com.bakuanimation.model;

public final class Audio {

    private final String id;
    private final String audioId;
    private final float pisteNumber;
    private final float start;
    private final float end;

    public Audio(String id, String audioId, float pisteNumber, float start, float end) {
        this.id = id;
        this.audioId = audioId;
        this.pisteNumber = pisteNumber;
        this.start = start;
        this.end = end;
    }

    public String getId() {
        return id;
    }

    public String getAudioId() {
        return audioId;
    }

    public float getPisteNumber() {
        return pisteNumber;
    }

    public float getStart() {
        return start;
    }

    public float getEnd() {
        return end;
    }
}