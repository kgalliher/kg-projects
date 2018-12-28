$(document).ready(function(){
    

    //Just get the pertinent data:
    //Date stuff
    function getTomorrow(currentDate){
        var newdate = new Date(currentDate);
        newdate.setDate(newdate.getDate() + 1);
        var dd = newdate.getDate();
        var mm = newdate.getMonth();
        var y = newdate.getFullYear();

        var tomorrow = new Date(y, mm, dd);
        return tomorrow;
    }

    function fetchDateParts(){
        var moment = moment();
        console.log(moment);
        var now = new Date(2018,5,5,4);
        var tomorrow = getTomorrow(now);
        var monthNames = [ "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC" ];
        var flipMonthNums = [1,2,3,4,5,6,7,8,9,10,11,12];
        var dateParts = {
            "now" : now,
            "todayFormatted" : now.getFullYear() + "-" + flipMonthNums[now.getMonth()] + "-" + now.getDate(),
            "year" : now.getFullYear().toString(),
            "monthString" : monthNames[now.getMonth()],
            "monthNum" : now.getMonth() + 1,
            "hour" : now.getHours(),
            "minutes" : now.getMinutes(),
            "day" : now.getDate(),
            "seconds" : now.getSeconds(),
            "tomorrow" : tomorrow,
            "tomorrowFormatted" : tomorrow.getFullYear() + "-" + flipMonthNums[tomorrow.getMonth()] + "-" + tomorrow.getDate(),
        };
        return dateParts;
    }

    // Get the game schedule url
    function fetchTodaysGameSchedule(){
        var currentTime = fetchDateParts();
        var tomorrowTime = fetchDateParts().tomorrow;

        // Testing only:
        currentTime.year = 2018;
        currentTime.monthNum = 6;
        currentTime.day = 5;

        var fakeTomorrow = new Date(currentTime.year, currentTime.monthNum, currentTime.day);
        fakeTomorrow.setDate(fakeTomorrow.getDate() + 1);
        ////////////////

        var monthIdx = currentTime.monthNum;
        var base_url = "http://statsapi.mlb.com/api/v1/schedule/games/?sportId=1&teamId=111&season=2018&";

        //Build up date for url.  Pad days and months if necessary.
        base_url += "startDate=";
        base_url += currentTime.year + "-" + monthIdx + "-" + currentTime.day;
        if(monthIdx == 123 /*> 10 || monthIdx < 3*/){
            base_url += "&endDate=";
            base_url += (currentTime.year + 1).toString() + "-2-22";
        }
        else{
            base_url += "&endDate=";
            base_url += fakeTomorrow.getFullYear() + "-" + fakeTomorrow.getMonth() + "-" + fakeTomorrow.getDate();
        }
        console.log(base_url);
        return base_url;
    }

    // Function that checks schedule for game data.
    function getSchedule(){
        games = {}
        $.ajax({
            url: fetchTodaysGameSchedule(),
            async: false,
            dataType: "json",
        }).done(function(data){
            games = data;
        });
        return games;
    }
    
    var schedule = getSchedule();
    console.log(schedule);
    
    // Displays the time if no game, starts game action when it's game time.
    (function gameData(){
        var base_url = fetchTodaysGameSchedule();
        var times = fetchDateParts();
        var today = times.todayFormatted;
        
        $.ajax(base_url, function() {
        }).done(function(schedule){
            if(schedule.totalItems == 0){
                if(schedule.dates[0].date != today){
                    setTimeOnScoreboard();
                    $(".count").empty();
                    $(".count").html("<p>No game today</p>");
                }
            }
            if(schedule.totalItems == 1 || schedule.totalItems == 2){
                if(schedule.dates[0].date.format("YYYY-M-D") === today){
                    var status = schedule["dates"][0]["games"][0].status.detailedState;
                    console.log("Status: " + status);
                    //Check to see if the game is over.  Set the time if that's the case.
                    if(status == "Final"){
                        setFinalInfo(linescore);
                        setTimeOnScoreboard();
                    }
                    
                }
                else{
                    setTimeOnScoreboard();
                    $(".count").empty();
                    $(".count").html("<p>Next game: <span>" + times.tomorrowFormatted + "</span></p>");
                    
                }
            } 
            
            else{
                
                var live_url = "";
                var awayTeamId = schedule.dates[0].games[0].teams["away"].team.id;
                var homeTeamId = schedule.dates[0].games[0].teams["home"].team.id;
                setTeamCssId(homeTeamId, "home");
                setTeamCssId(awayTeamId, "away");
                game_id = schedule["dates"][0]["games"][0]["gamePk"];
                live_url = "http://statsapi.mlb.com/api/v1/game/" + game_id + "/feed/live";
                //getGameAction(live_url, status);
            }
            
        }).fail(function(){
            setTimeOnScoreboard();
        }).always(function(){
            setTimeout(gameData,20000);
        });
    }());

    function getGameAction(live_url, status){
        $.getJSON(live_url, function( data ) {
            game_data = data.liveData;
        }).done(function(){
            var up = "Bottom";
            var linescore = game_data.linescore;
            var current_inning = linescore.currentInning;
            var current_half = linescore.inningHalf;
            if(current_half != "Bottom")
                up = "away";
            else
                up = "home";
            var home_runs = linescore.home.runs;
            var away_runs = linescore.away.runs;
            var home_hits = linescore.home.hits;
            var away_hits = linescore.away.hits;
            var home_errs = linescore.home.errs;
            var away_errs = linescore.away.errs;
            $("#home-runs").html(home_runs);
            $("#away-runs").html(away_runs);
            $("#home-hits").html(home_hits);
            $("#away-hits").html(away_hits);
            $("#home-errs").html(home_errs);
            $("#away-errs").html(away_errs);
            var inning_data = linescore.innings;
            $.each( inning_data, function( key, val ) {
                var home_inning = "#home-inn-" + (key + 1);
                var away_inning = "#away-inn-" + (key + 1);
                $("#" + up + "-inn-" + current_inning).addClass("current");
                $(home_inning).html(val["home"]);
                $(away_inning).html(val["away"]);
            });

            
            var plays = game_data.plays.allPlays;
            var last_play = plays[plays.length - 1];
            var current_pitcher = last_play.matchup.pitcher;
            cp_info = game_data.players.allPlayers["ID" + current_pitcher];
            $("#current_pitcher").html(cp_info.name.last);
            var atbat = last_play.matchup.batter;
            bat_info = game_data.players.allPlayers["ID" + atbat];
            $("#current_batter").html(bat_info.name.last);
            var count = last_play.count;
            $.each(count, function(key, val){
                var tag = "#" + key;
                if(key == "balls" && val == 4){
                    $("span").html(0);
                }
                else if(key == "strikes" && val == 3){
                    $("span").html(0);
                }
                else if(key == "outs" && val == 3){
                    $("span").html(0);
                }
                else{
                    $(tag).html(val);
                }
            });
    
            var play_result = last_play.result.description;
            $("#play_result").html(play_result);
        });
    }

    function setTeamCssId(id, homeAway){
        $.getJSON("http://statsapi.mlb.com/api/v1/teams/" + id, {
        }).done(function(data){
            var teamCode = data.teams[0].teamCode;
            $("#" + homeAway).addClass(teamCode);
        });
    }

    function setFinalInfo(linescore){
        var time = fetchDateParts();
        var formattedDate = time.monthNum + "/" + time.day + "/" + time.year
        var wp = linescore.pitchers.win;
        var wp_info = game_data.players.allPlayers["ID" + wp];
        var wp_name = wp_info.name.last;

        var lp = linescore.pitchers.loss;
        var lp_info = game_data.players.allPlayers["ID" + lp];
        var lp_name = lp_info.name.last;

        if(linescore.pitchers.save > 0){
            var sv = linescore.pitchers.save;
            var sv_info = game_data.players.allPlayers["ID" + sv];
            var sv_name = sv_info.name.last;
        }
        else { var sv_name = " "; }

        $(".count").html("<table><tr></tr><td colspan='2'>Final:  "+ formattedDate  +"</td><tr><td>W:</td><td>" + wp_name + "</td><tr><td>L:</td><td>" + lp_name + "</td></tr><tr><td>S:</td><td>" + sv_name + "</td></tr></table>");
    }

    function setTimeOnScoreboard(){
        $(".inning").empty();
        time = fetchDateParts();
        // console.log(time.seconds);
        var month = time.monthString;
        var day = time.day;
        var hours = time.hour;
        var minutes = time.minutes;

        for(var i = 0; i < month.length; i++){
            $("#away-inn-" + (i + 2)).html(month[i]);
        }
        if(hours == 0)
            hours = 12;
        if(hours > 12)
            hours -= 12;
        if(hours < 10 && hours != 0){
            $("#home-inn-4").html(hours);
            $("#home-inn-5").html(":");
        }
        else{
            var hour_parts = hours.toString();
            $("#home-inn-3").html(hour_parts[0]);
            $("#home-inn-4").html(hour_parts[1]);
            $("#home-inn-5").html(":");
        }
        if(day < 10){
            $("#away-inn-7").html("0");
            $("#away-inn-8").html(day);
        }
        else{
            var day_parts = day.toString();
            $("#away-inn-7").html(day_parts[0]);
            $("#away-inn-8").html(day_parts[1]);
        }
        if(minutes < 10){
            $("#home-inn-6").html("0");
            $("#home-inn-7").html(minutes);
        }
        else{
            var minute_parts = minutes.toString();
            $("#home-inn-6").html(minute_parts[0]);
            $("#home-inn-7").html(minute_parts[1]);
        } 
    }

});