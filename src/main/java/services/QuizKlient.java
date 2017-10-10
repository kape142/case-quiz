package services;

import Entities.*;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.awt.image.AreaAveragingScaleFilter;
import java.util.ArrayList;

@Path("/quizzes/")
public class QuizKlient {
    private static ArrayList<Quiz> quizzes = new ArrayList<>();

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public ArrayList<Quiz> getQuizzes() {
        return quizzes;
    }

    @Path("/{title}/users")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public ArrayList<User> getUsers(@PathParam("title") String title){
        if (title.equals("null")) {
            return new ArrayList<>();
        }
        Quiz q = findQuiz(title);
        if(q!=null){
            return q.getUsers();
        }else{
            throw new NotFoundException();
        }
    }

    @Path("/{title}/users")
    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public void addUser(@PathParam("title") String title, String name){
        Quiz q = findQuiz(title);
        if(q!=null){
            if(q.getUsers().contains(new User(name,0))){
                throw new IllegalArgumentException("User already exists");
            }
            q.addUser(new User(name,0));
        }else{
            throw new NotFoundException("Could not find specified Quiz");
        }
    }

    @Path("/{title}/users/{name}")
    @PUT
    @Consumes(MediaType.TEXT_PLAIN)
    public void addPoints(@PathParam("title") String title,@PathParam("name") String name){
        Quiz q = findQuiz(title);
        if(q!=null){
            q.incrementUser(name);
        }else{
            throw new NotFoundException("Could not find specified Quiz");
        }
    }

    @Path("/{title}")
    @PUT
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public void postponeQuiz(@PathParam("title") String title, String time){
        Quiz q = findQuiz(title);
        if(q!=null){
            q.setTime(q.getTime()+Integer.parseInt(time)*1000);
        }else{
            throw new NotFoundException("Could not find specified Quiz");
        }
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public void addQuiz(Quiz quiz){
        if(findQuiz(quiz.getTitle())==null) {
            quizzes.add(quiz);
        }else{
            throw new IllegalArgumentException("Quiz already exists");
        }
    }

    @Path("{title}")
    @DELETE
    @Consumes(MediaType.TEXT_PLAIN)
    public void deleteQuiz(@PathParam("title") String title){
        Quiz q = findQuiz(title);
        if(q!=null){
            quizzes.remove(q);
        }else{
            throw new NotFoundException("Could not find specified Quiz");
        }
    }

    @DELETE
    public void deleteAllQuizzes(){
        quizzes = new ArrayList<>();
    }

    @Path("{title}/users/{user}")
    @DELETE
    @Consumes(MediaType.TEXT_PLAIN)
    public void deleteUser(@PathParam("title") String title, @PathParam("user") String name){
        Quiz q = findQuiz(title);
        if(q!=null){
            q.getUsers().remove(new User(name,0));
        }else{
            throw new NotFoundException("Could not find specified Quiz");
        }
    }

    private Quiz findQuiz(String name){
        for(Quiz q: quizzes){
            if(q.getTitle().equals(name)){
                return q;
            }
        }
        return null;
    }


}


