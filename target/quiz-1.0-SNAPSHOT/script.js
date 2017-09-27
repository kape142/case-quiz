$(document).ready(function() {
    var speed = 500;
    var $backButton = $("#backButton");
    var $quizList = $("#quizList");
    var $quizView = $("#quizView");
    var $activeQuiz = $("#activeQuiz");
    var $quizCreator = $("#quizCreator");
    var $joinButton = $(".joinButton");
    var $quizViewTitle = $("#quizViewTitle");
    var $startButton = $("#startButton");
    var $createButton = $("#createButton");
    var $addQuestion = $("#addQuestion");
    var $latestQuestion;
    $latestQuestion = $("#createFirstQuestion");
    var qNumber = 2;
    $backButton.click(function(){
        $quizList.slideDown(speed);
        $quizView.slideUp(speed);
        $(this).hide();
        $activeQuiz.slideUp(speed);
        $quizCreator.slideUp(speed);
    });

    $joinButton.click(function(){
        var title = $(this).parent().siblings(".quizName").text();
        $quizViewTitle.html(title);
        $quizList.slideUp(speed);
        $quizView.slideDown(speed, function(){
            $backButton.show();
        });
        $activeQuiz.slideUp(speed);
        console.log(title);
    });
    $startButton.click(function(){
        $quizView.slideUp(speed);
        $activeQuiz.slideDown(speed, function(){
            $backButton.show();
        });
    });
    $createButton.click(function(){
        $quizList.slideUp(speed);
        $quizCreator.slideDown(speed, function(){
            $backButton.show();
        });
        console.log("create");
    });
    $addQuestion.click(function(){
        $.get("newQuestion.html", function(data){
            $latestQuestion.after(data);
            $latestQuestion = $latestQuestion.next().next();
            $latestQuestion.prev().append(qNumber);
            qNumber++;
            $('html, body').animate({
                scrollTop: $("#addQuestion").offset().top
            }, speed);
        });
    });
    //Testing
    $("#title").click(function () {
        $.ajax({
            type: "GET",
            url:"rest/klient/quizzes",
            success: function(data){
                console.log(data);
            }
        });
    })

});