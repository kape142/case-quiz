$(document).ready(function() {
    var speed = 500;
    var $backButton = $("#backButton");
    var $quizList = $("#quizList");
    var $quizView = $("#quizView");
    var $activeQuiz = $("#activeQuiz");
    var $quizCreator = $("#quizCreator");
    var $quizViewTitle = $("#quizViewTitle");
    var $createButton = $("#createButton");
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
    var $nickSpan = $("#nickSpan");
    var $timer = $("#timer");
    var $timerText = $("#timerText");
    var $body = $("body");
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
            $(this).parent().before(createOptionGroup(optNo+1));
        }else{
            $(this).parent().prev().children().after(createOption(optNo+1));
        }
        optionsCreated[questionNo-1]++;
    });

    function createOptionGroup(number){
        return "<div class= \"input-group row\">"+createOption(number)+"</div>";
    }
    function createOption(number){
        return "<div class=\"input-group col\"><span class=\"input-group-addon \">#"+number+"</span> <input type=\"text\" class=\"form-control option-input\" placeholder=\"Option\"></div>";
    }

    $saveQuiz.click(function () {
        var quiz = {
            title: $("#titleInput").val(),
            time: $quizTime[0].valueAsNumber - (2*60*60*1000),
            questions: []
        };
        if(quiz.title.trim()===""){
            showAlert("titleAlert");
            return;
        }
        if(quiz.time <= new Date().getTime()){
            showAlert("timeAlert");
            return;
        }
        var $questionRead = $("#createFirstQuestion");
        for(var i = 0;i<qNumber-1;i++) {
            var question = {
                title: $questionRead.find(".findTitle").val(),
                correct: $questionRead.find(".findCorrect").val(),
                timeAdd: $questionRead.find(".findTimeAdd").val(),
                url: $questionRead.find(".findUrl").val(),
                options: []
            };
            if(question.title.trim()===""){
                $("#alertQuestionTitleNumber").html(""+(i+1));
                showAlert("questionTitleAlert");
                return;
            }
            var $optionRead = $("#div"+(i+1));
            for(var j=0;j<optionsCreated[i];j++){
                var t;
                if(j%2===0){
                    t = $optionRead.find("input").val();
                }else{
                    t = $optionRead.find("input").last().val();
                    $optionRead = $optionRead.next();
                }
                if(t.trim()===""){
                    $("#alertQuestionNumber").html(""+(i+1));
                    $("#alertQuestionOptionNumber").html(""+(j+1));
                    showAlert("questionOptionAlert");
                    return;
                }
                question.options.push(t);
            }
            if(question.correct>question.options.length || question.correct<= 0 || ""+question.correct!==""+Math.round(question.correct)){
                showAlert("answerAlert");
                return;
            }
            if(question.url==="http://"){
                question.url = "";
            }
            if(!(question.url==="" || isValidURL(question.url))){
                showAlert("urlAlert");
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
                showAlert("nameAlert");
            }
        });
    });

    function isValidURL(str) {
        var a  = document.createElement('a');
        a.href = str;
        return (a.host && a.host !== window.location.host);
    }

    function showAlert(alertName){
        $("#"+alertName).show(speed,function(){
            $('html, body').animate({
                scrollTop: $("#"+alertName).offset().top
            }, speed);
        });
    }
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
        $nickInput.slideUp(speed);
        $nickButton.slideUp(speed);
        $nickSpan.slideUp(speed);
        $nickAppend.html(nick);
        $nickAppend.slideDown(speed);
    }

    function nickReset(){
        $nickInput.show();
        $nickButton.show();
        $nickSpan.hide();
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
            $quizTable.DataTable().ajax.reload();
            return;
        }
        if(timeToStart===10 && nick===null){
            showAlert("nickAlert");
        }
        if(questionsDone===currentQuiz.questions.length && delay === false && timeToStart<=0){
            if(timeToStart===0){
                $quizView.slideDown(speed);
                $activeQuiz.slideUp(speed);
                timeToStart--;
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
                    showAlert("spectatorAlert");
                    return;
                }
                updateActiveQuiz(questionsDone);
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
            $playerTable.DataTable().ajax.reload();
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
        $("#quizTitleText").html(question.title);
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
        if(timeToStart>=86400*365){
            string+=Math.floor(timeToStart/(86400*365))+"y, ";
            timeToStart%=(86400*365);
        }
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


    /*
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
    */
});

function deleteAllQuizzes(){
    $.ajax({
        url:"rest/quizzes/",
        type: "DELETE"
    });
}

function postponeQuiz(title,time) {
    $.ajax({
        url: "rest/quizzes/" + title,
        type: "PUT",
        data: "" + time
    });
}

function addStandardQuiz(){
    var quiz = {
        title: "Standard Quiz",
        time: new Date().getTime() + (20*1000),
        questions: []
    };
    var question = {
        title: "Hva er det latinske navnet for en vanlig brunrotte?",
        correct: 2,
        timeAdd: 20,
        url: "https://upload.wikimedia.org/wikipedia/commons/2/27/London_Scruffy_Rat.jpg",
        options: ["Rattus Rattus","Rattus Norvegicus","Rattus Brunneis","Rattus Arctos"]
    };
    quiz.questions.push(question);
    question = {
        title: "Hvem er denne karen med sekk og lue på?",
        correct: 2,
        timeAdd: 15,
        url: "https://gfx.nrk.no/iGO6JwTOj58wB08mo2wgZwoBuUw6xbFC7tIAy6orVBNA",
        options: ["Nissen","Jon Blund"]
    };
    quiz.questions.push(question);
    question = {
        title: "Hva er hovedstaden i Nepal?",
        correct: 4,
        timeAdd: 30,
        url: "",
        options: ["Ulan Bator","Kuala Lumpur","Manila","Katmandu"]
    };
    quiz.questions.push(question);
    $.ajax({
        url:"rest/quizzes",
        type: "POST", //opprett ny quiz
        data: JSON.stringify(quiz),
        contentType: 'application/json; charset=utf-8',
        datatype: 'json',
        error: function(xhr, textStatus, errorThrown){
            $.ajax({
                url:"rest/quizzes/Standard Quiz",
                type: "DELETE"
            });
            addStandardQuiz();
        }
    });
}