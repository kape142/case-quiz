package Entities;

public class User {
    private String name="";
    private int points=0;
    private int streak=0;

    public void setName(String name) {
        this.name = name;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public void incrementPoints(){
        points++;
        streak++;
    }

    public void stopStreak(){
        streak=0;
    }

    public void setStreak(int streak) {
        this.streak = streak;
    }

    public int getStreak() {

        return streak;
    }

    public int getPoints() {

        return points;
    }

    public String getName() {

        return name;
    }

    public User(String name){
        this.name = name;
    }
    public User(String name, int points, int streak) {
        this.name = name;
        this.points = points;
        this.streak = streak;
    }

    @Override
    public String toString() {
        return "User{" +
                "name='" + name + '\'' +
                ", points=" + points +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        User user = (User) o;

        return name.equals(user.name);
    }

    @Override
    public int hashCode() {
        return name.hashCode();
    }
}
