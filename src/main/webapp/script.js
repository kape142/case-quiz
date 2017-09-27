$(document).ready(function() {
    var speed = 500;
    var $backButton = $("#backButton");
    var $quizList = $("#quizList");
    var $quizView = $("#quizView");
    var $activeQuiz = $("#activeQuiz");
    var $quizCreator = $("#quizCreator");
    var $quizViewTitle = $("#quizViewTitle");
    var $createButton = $("#createButton");
    var $refreshButton = $("#refreshButton");
    var $addQuestion = $("#addQuestion");
    var $latestQuestion;
    $latestQuestion = $("#createFirstQuestion");
    var $saveQuiz = $("#saveQuiz");
    var $quizTable = $("#quizTable");
    var $quizTime = $("#quizTime");
    var $playerTable = $("#playerTable");
    var $nickButton = $("#nickButton");
    var $nickInput = $("#nickInput");
    var $nickAppend = $("#nickAppend");
    var $timer = $("#timer");
    var $timerText = $("#timerText");
    var $scoreboardButton = $("#scoreboardButton");
    var $body = $("body");
    var showingScores = false;
    var currentQuiz = null;
    var nick = null;
    var timeToStart = null;
    var questionsCreated = 1;
    var optionsCreated = [2];
    var questionsDone = 0;
    var qNumber = 2;
    var selectedOption = 0;
    var delay = false;
    var optionBoxesCreated = 2;

    function back(){
        $quizList.slideDown(speed, function(){
            nickReset();
            $backButton.hide();
        });
        $quizView.slideUp(speed);
        $(this).hide();
        $activeQuiz.slideUp(speed);
        $quizCreator.slideUp(speed);
        $timer.hide();
        if(nick!==null && questionsDone===0){
            deleteNick();
        }
        nick=null;
        currentQuiz = null;
        timeToStart = null;
        questionsDone=0;
        $(".alert").hide(speed);
    }
    $backButton.click(function() {
        back()
    });

    function updateTime() {
        var date = new Date();
        date = new Date(date.getTime() + (2 * 60 * 60 * 1000) + (5 * 60 * 1000));
        $quizTime.val(date.toJSON().slice(0, 17) + "00");
    }

    $quizTable.DataTable( {
        ajax: {
            url: 'rest/quizzes',
            dataSrc: ''
        },
        columns: [
            { data: 'title' },
            { data: 'date' }
        ]
    });

    $playerTable.DataTable( {
        "order": [[1,"desc"]],

        ajax: {
            url: 'rest/quizzes/null/users',
            dataSrc: ''
        },
        columns: [
            { data: 'name' },
            { data: 'points' }
        ]
    });

    var quizTable = $quizTable.DataTable();
    var playerTable = $playerTable.DataTable();

    $quizTable.find("tbody").on('click','tr', function(){
        var title = quizTable.row(this).data().title;
        $quizViewTitle.html(title);
        $quizList.slideUp(speed);
        $quizView.slideDown(speed, function(){
            $backButton.show();
            $timer.show();
        });
        $activeQuiz.slideUp(speed);
        currentQuiz = quizTable.row(this).data();
        timeToStart = Math.round((currentQuiz.time - new Date().getTime())/1000);
        if(timeToStart<0){
            questionsDone=currentQuiz.questions.length;
            nick="";
            nickSet();
        }else{
            $timerText.html(timeToStart);
        }
        playerTable.ajax.url('rest/quizzes/'+title+'/users');
        playerTable.ajax.reload();
    });


    $createButton.click(function(){
        updateTime();
        $quizList.slideUp(speed);
        $quizCreator.slideDown(speed, function(){
            $backButton.show();
        });
    });

    $refreshButton.click(function () {
        $quizTable.DataTable().ajax.reload();
    });

    $addQuestion.click(function(){
        questionsCreated++;
        $.get("newQuestion.html", function(data){
            $latestQuestion.after(data);
            $latestQuestion = $latestQuestion.next().next();
            $latestQuestion.prev().append(qNumber);
            $("#replace").attr("id","btn"+questionsCreated);
            $("#replaceDiv").attr("id","div"+questionsCreated);
            qNumber++;
            $('html, body').animate({
                scrollTop: $("#addQuestion").offset().top
            }, speed);
        });
        optionsCreated.push(2);
    });

    $body.on("click",".addOption", function(){
        var questionNo = $(this).attr('id').slice(3,4);
        var optNo = optionsCreated[questionNo-1];
        if(optNo%2===0){
            $(this).before(createOptionGroup(optNo+1));
        }else{
            $(this).prev().children().after(createOption(optNo+1));
        }
        optionsCreated[questionNo-1]++;
    });

    function createOptionGroup(number){
        return "<div class= \"input-group\">"+createOption(number)+"</div>";
    }
    function createOption(number){
        return "<div class=\"input-group\"><span class=\"input-group-addon\">Option #"+number+"</span> <input type=\"text\" class=\"form-control\" placeholder=\"Option\"></div>";
    }

    $saveQuiz.click(function () {
        var quiz = {
            title: $("#titleInput").val(),
            time: $quizTime[0].valueAsNumber - (2*60*60*1000),
            questions: []
        };
        var $questionRead = $("#createFirstQuestion");
        for(var i = 0;i<qNumber-1;i++) {
            var question = {
                title: $questionRead.find(".findTitle").val(),
                correct: $questionRead.find(".findCorrect").val(),
                timeAdd: $questionRead.find(".findTimeAdd").val(),
                url: $questionRead.find(".findUrl").val(),
                options: []
            };
            var $optionRead = $("#div"+(i+1));
            for(var j=0;j<optionsCreated[i];j++){
                if(j%2===0){
                    question.options.push($optionRead.find("input").val());
                }else{
                    question.options.push($optionRead.find("input").last().val());
                    $optionRead = $optionRead.next();
                }
            }
            if(question.correct>question.options.length || question.correct<= 0 || ""+question.correct!==""+Math.round(question.correct)){
                $("#answerAlert").show(speed, function(){
                    $('html, body').animate({
                        scrollTop: $("#answerAlert").offset().top
                    }, speed);
                });
                return;
            }
            if(!(question.url==="" || question.url==="http://" || isValidURL(question.url))){
                $("#urlAlert").show(speed,function(){
                    $('html, body').animate({
                        scrollTop: $("#urlAlert").offset().top
                    }, speed);
                });
                return;
            }
            quiz.questions.push(question);
            $questionRead = $questionRead.next().next();
        }
        $.ajax({
            url:"rest/quizzes",
            type: "POST", //opprett ny quiz
            data: JSON.stringify(quiz),
            contentType: 'application/json; charset=utf-8',
            datatype: 'json',
            success: function(){
                quizTable.ajax.reload();
                $("input").val("");
                $(".findUrl").val("http://");
                back();
            },
            error: function(xhr, textStatus, errorThrown){
                console.log(textStatus +", "+errorThrown);
                $("#nameAlert").show(speed, function(){
                    $('html, body').animate({
                        scrollTop: $("#nameAlert").offset().top
                    }, speed);
                });
            }
        });
    });

    function isValidURL(str) {
        var a  = document.createElement('a');
        a.href = str;
        return (a.host && a.host !== window.location.host);
    }

    $scoreboardButton.click(function(){
        if(showingScores){
            $(this).html("Show scores");
            $quizView.slideUp(speed);
            showingScores = false;
        }else{
            $(this).html("Hide scores");
            $quizView.slideDown(speed);
            showingScores = true;
        }
    });

    $nickButton.click(function(){
        var name = $nickInput.val();
        $.ajax({
            url:"rest/quizzes/"+currentQuiz.title+"/users",
            type: "POST",
            data: name,
            success: function(){
                $playerTable.DataTable().ajax.reload();
                nick=name;
                nickSet();
            },
            error: function(xhr, textStatus, errorThrown){
                console.log(textStatus +", "+errorThrown);
                $("#usernameAlert").show(speed, function(){
                    $('html, body').animate({
                        scrollTop: $("#usernameAlert").offset().top
                    }, speed);
                });
            }
        });
    });

    function nickSet(){
        $nickInput.hide();
        $nickButton.hide();
        $nickAppend.html(nick);
        $nickAppend.show();
    }

    function nickReset(){
        $nickInput.show();
        $nickButton.show();
        $nickAppend.hide();
        $nickAppend.html("");
    }

    function deleteNick(){
        $.ajax({
            type: "DELETE",
            url: "rest/quizzes/" + currentQuiz.title + "/users/" + nick
        });
    }

    $(window).on("beforeunload", function() {
        if(nick!==null && questionsDone===0){
            deleteNick();
        }
    });


    $body.on("click",".option", function(){
        $(".option").removeClass("selected");
        $(this).addClass("selected");
        selectedOption=$(this).attr('id').slice(6,7);
    });

    setInterval(update,1000);

    function update(){
        if(currentQuiz===null){
            return;
        }
        if(timeToStart===10 && nick===null){
            $("#nickAlert").show(speed, function(){
                $('html, body').animate({
                    scrollTop: $("#nickAlert").offset().top
                }, speed);
            });
        }
        if(questionsDone===currentQuiz.questions.length && delay === false && timeToStart<=0){
            if(timeToStart===0){
                $quizView.slideDown(speed);
                $activeQuiz.slideUp(speed);
                timeToStart--;
                console.log("check");
            }
            $timerText.html("");
            $playerTable.DataTable().ajax.reload();
            return;
        }
        timeToStart--;
        $timerText.html(timeToString(timeToStart));
        if(timeToStart<=0){
            if(questionsDone===0){
                if(nick===null){
                    questionsDone=currentQuiz.questions.length;
                    nick="";
                    nickSet();
                    $("#spectatorAlert").show(speed, function(){
                        $('html, body').animate({
                            scrollTop: $("#spectatorAlert").offset().top
                        }, speed);
                    });
                    return;
                }
                updateActiveQuiz(questionsDone);
                $quizView.slideUp(speed);
                $activeQuiz.slideDown(speed);
                timeToStart+=currentQuiz.questions[questionsDone].timeAdd;
                questionsDone++;
                return;
            }
            var question = currentQuiz.questions[questionsDone-1];
            var $correct = $("#option"+question.correct);
            var $selected = $("#option"+selectedOption);
            if(delay===false && questionsDone>0){
                delay=true;
                timeToStart=3;
                if(""+selectedOption === ""+question.correct){
                    addPoint();
                    $playerTable.DataTable().ajax.reload();
                }else{
                    $selected.addClass("wrong")
                }
                $correct.addClass("correct");
                return;
            }

            $(".option").removeClass("wrong");
            $correct.removeClass("correct");
            $selected.removeClass("selected");
            selectedOption=0;
            if(questionsDone===currentQuiz.questions.length){
                delay = false;
                return;
            }
            updateActiveQuiz(questionsDone);
            timeToStart+=currentQuiz.questions[questionsDone].timeAdd;
            questionsDone++;
            delay=false;
        }
    }

    function addPoint(){
        $.ajax({
            type: "PUT",
            url:"rest/quizzes/"+currentQuiz.title+"/users/"+nick
        });
    }

    function updateActiveQuiz(index){
        var question = currentQuiz.questions[index];
        $("#quizTitle").html(question.title);
        $("#quizImage").attr('src',question.url);
        if(optionBoxesCreated>=question.options.length){
            for(var i = 0;i < question.options.length; i++){
                var $optionNo = $("#option"+(i+1));
                $optionNo.html(question.options[i]);
                $optionNo.show();
            }
            for(i = question.options.length; i < optionBoxesCreated; i++){
                $("#option"+(i+1)).hide();
            }
        }else{
            for(i = optionBoxesCreated; i < question.options.length; i++){
                if(i%2===0){
                    $activeQuiz.find(".row").last().after(createOptionAnswerGroup(i+1));
                }else{
                    $activeQuiz.find(".row").last().children().after(createOptionAnswer(i+1));
                }
                optionBoxesCreated++;
            }
            updateActiveQuiz(index);
        }
    }

    function createOptionAnswerGroup(number){
        return "<div class=\"row align-items-center\">"+createOptionAnswer(number)+"</div>";
    }
    function createOptionAnswer(number){
        return "<div class=\"col option\" ID =\"option"+number+"\">Option "+ number +"</div>";
    }

    $(function(){
        $("[data-hide]").on("click",function () {
            $(this).closest("."+$(this).attr("data-hide")).hide();
        })
    });
    function timeToString(timeToStart){
        var string = "";
        if(timeToStart>=86400){
            string+=Math.floor(timeToStart/86400)+"d, ";
            timeToStart%=86400;
        }
        if(timeToStart>=3600){
            string+=Math.floor(timeToStart/3600)+"h, ";
            timeToStart%=3600;
        }
        if(timeToStart>=60){
            string+=Math.floor(timeToStart/60)+"m, ";
            timeToStart%=60;
        }
        string+=timeToStart+"s";
        return string;
    }



    //Testing
    $("#title").click(function () {
        if(timeToStart>0){
            timeToStart=11;
        }
        $.ajax({
            type: "DELETE",
            url: "rest/quizzes/delete",
            success: function(){
                if(currentQuiz!==null){
                    back();
                }
                $quizTable.DataTable().ajax.reload();
            }
        });

    });
});
