package Entities;

import java.util.Arrays;

public class Question {
    private String title;
    private String[] options;
    private String url;
    private int correct;
    private long timeAdd;

    public Question(){

    }
    public Question(String title, int correct, long timeAdd, String url, String[] options){
        this.title = title;
        this.correct = correct;
        this.timeAdd = timeAdd;
        this.options = options;
        this.url = url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getUrl() {

        return url;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setOptions(String[] options) {
        this.options = options;
    }

    public void setCorrect(int correct) {
        this.correct = correct;
    }

    public String getTitle() {

        return title;
    }

    public String[] getOptions() {
        return options;
    }

    public int getCorrect() {
        return correct;
    }

    public long getTimeAdd() {
        return timeAdd;
    }

    public void setTimeAdd(long timeAdd) {
        this.timeAdd = timeAdd;
    }

    @Override
    public String toString() {
        return "Question{" +
                "title='" + title + '\'' +
                ", options=" + Arrays.toString(options) +
                ", correct=" + correct +
                '}';
    }
}
