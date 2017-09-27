package Entities;

import javax.ws.rs.NotFoundException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;

public class Quiz {
    private Question[] questions;
    private String title;
    private long time;
    private String date = "";
    private ArrayList<User> users = new ArrayList<>();

    public Quiz(){

    }
    public Quiz(String title, long time, Question[] questions){
        this.title = title;
        this.time = time;
        this.questions = questions;
        this.date = new Date(time).toString();
        System.out.println(date);
    }

    public void addUser(User user){
        users.add(user);
    }

    public void incrementUser(String name){
        for(User u: users){
            if(u.getName().equals(name)){
                u.incrementPoints();
                return;
            }
        }
        throw new NotFoundException("Could not find specified User");
    }
    public void setQuestions(Question[] questions) {
        this.questions = questions;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Question[] getQuestions() {

        return questions;
    }

    public String getTitle() {
        return title;
    }

    public long getTime() {
        return time;
    }

    public void setTime(long time) {
        this.time = time;
    }

    public void setUsers(ArrayList<User> users) {
        this.users = users;
    }

    public ArrayList<User> getUsers() {

        return users;
    }

    public String getDate() {
        return new Date(time).toString();
    }

    public void setDate(String date) {
        this.date = date;
    }

    @Override
    public String toString() {
        return "Quiz{" +
                "questions=" + Arrays.toString(questions) +
                ", title='" + title + '\'' +
                ", time=" + time +
                ", date='" + date + '\'' +
                ", users=" + users +
                '}';
    }
}
