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

    function nextSeasonStartDate(season){
        var nextSeasonStartDate = {};
        var url = "http://statsapi.mlb.com/api/v1/seasons?sportId=1&season=" + season;
        $.ajax({
            url: url,
            async: false,
            dataType: "json",
        }).done(function(data){
            nextSeasonStartDate = data;
        })
        return nextSeasonStartDate;
    }

    function fetchDateParts(){
        var nowStr = "2018-7-10";
        var now = new Date(nowStr);
        // var now = new Date();
        
        var tomorrow = getTomorrow(now);
        var monthNames = ["", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC" ];
        var dateParts = {
            "now" : now,
            "tomorrow" : tomorrow,
            "year" : now.getFullYear(),
            "monthString" : monthNames[now.getMonth() + 1],
            "monthNum" : now.getMonth() + 1,
            "hour" : now.getHours(),
            "minutes" : now.getMinutes(),
            "day" : now.getDate(),
            "seconds" : now.getSeconds(),
            "todayFormatted" : now.getFullYear() + "-" + (now.getMonth() + 1)+ "-" + now.getDate(),
            "tomorrowFormatted" : tomorrow.getFullYear() + "-" + (tomorrow.getMonth() + 1) + "-" + tomorrow.getDate(),
        };
        return dateParts;
    }

    ///Get all the stuff from the schedule URL.
    // Get the game schedule url
    function fetchTodaysGameSchedule(){
        var currentTime = fetchDateParts();
        var monthIdx = currentTime.monthNum;
        var base_url = "http://statsapi.mlb.com/api/v1/schedule/games/?sportId=1&season=" + currentTime.year;

        //Build up date for url.  Pad days and months if necessary.
        base_url += "&startDate=";
        base_url += currentTime.todayFormatted;
        if(monthIdx > 10 && monthIdx <= 12){
            base_url += "&endDate=";
            base_url += nextSeasonStartDate(currentTime.now.getFullYear() + 1).seasons[0].regularSeasonStartDate;
        }
        else if(monthIdx >= 1 && monthIdx <= 2){
            base_url += "&endDate=";
            base_url += nextSeasonStartDate(currentTime.now.getFullYear()).seasons[0].regularSeasonStartDate;
        }
        else{
            base_url += "&endDate=";
            base_url += currentTime.tomorrowFormatted;
        }
        return base_url;
    }

    // Function that checks schedule for game data.
    function getSchedule(checkAsg){
        var games = {}
        if(!checkAsg)
            url = fetchTodaysGameSchedule() + "&teamId=111";
        else
            url = fetchTodaysGameSchedule();
        $.ajax({
            url: url,
            async: false,
            dataType: "json",
        }).done(function(data){
            games = data;
        });
        return games;
    }
    
    var schedule = getSchedule(false);
    console.log(schedule);
    // Displays the time if no game, starts game action when it's game time.
    (function gameData(){
        var times = fetchDateParts();

        // Since we're typically checking for sox games, that result will be empty
        // during the all-star break.  If it's July, check to see if the all-star game is on.
        if(schedule.dates.length == 0 && times.monthNum == 7){
            // true because we're looking for the ASG.
            schedule = getSchedule(true);
            var game_type = schedule["dates"][0]["games"][0]["gameType"];
            if(game_type == "A"){
                var home_team = schedule.dates[0].games[0].teams["away"].team.name;
                setASGWallAndVenue(home_team);
            }
            else if(schedule.dates.length == 0 && game_type !== "A"){
                setTimeOnScoreboard();
                setNoGameToday();
            }
        }
        
        if(schedule.dates.length > 0){
            schDateVal = schedule.dates[0].date.split("-");
        schDate = new Date(schDateVal[0], schDateVal[1] - 1, schDateVal[2]);
        schDateString = schDate.getFullYear() + "-" + (schDate.getMonth() + 1) + "-" + schDate.getDate();
        todayDate = times.todayFormatted;
        
        // There is a game on today's schedule.
        // It could be an active game or it could be postponed.
        if(schDateString == todayDate){
            var game = schedule["dates"][0]["games"][0]
            var status = game.status;
            var game_id = game["gamePk"];
            var live_url = "http://statsapi.mlb.com/api/v1/game/" + game_id + "/feed/live";
            var awayTeamId = game.teams["away"].team.id;
            var homeTeamId = game.teams["home"].team.id;

            setTeamCssId(homeTeamId, "home");
            setTeamCssId(awayTeamId, "away");

            if(status.detailedState == "Scheduled"){ 
                setTimeOnScoreboard();
            }

            if(status.detailedState == "Postponed"){
                var reason = status.reason;
                var reSched = game.rescheduleDate;
                setPostponedInfo(reason, reSched);
            }

            // console out all the winners and names
            if(status.detailedState == "Final"){
                $(".inning.current").removeClass("current");
                finalPlay = getGameAction(live_url);
                var home_score = game.teams["home"].score;
                var away_score = game.teams["away"].score;

                if(game.teams["home"].team.name == "Boston Red Sox" && game.teams["home"].isWinner){
                    setFinalInfo(live_url, away_score, home_score, true, "home");
                }
                else if(game.teams["home"].team.name == "Boston Red Sox" && !game.teams["home"].isWinner){
                    setFinalInfo(live_url, away_score, home_score, false, "home");
                }
                else if(game.teams["away"].team.name == "Boston Red Sox" && game.teams["away"].isWinner){
                    setFinalInfo(live_url, away_score, home_score, true, "away");
                }
                else if(game.teams["away"].team.name == "Boston Red Sox" && !game.teams["away"].isWinner){
                    setFinalInfo(live_url, away_score, home_score, false, "away");
                }
                setTimeOnScoreboard();
            }
            }
        }
        
        else{
            setNoGameToday();
            setTimeOnScoreboard();
        }
        $.ajax({
            url: "/"
        }).done(function(){
        }).fail(function(){
            setTimeOnScoreboard();
            console.log("Errors occurring...");
        }).always(function(){
            setTimeout(gameData,10000);   
        });
    }());

    function getGameAction(live_url){
        $.ajax({
            url: live_url,
            async: false,
            dataType: "json",
        }).done(function(data){
            var game_data = data.liveData;
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
            var atbatShirtNum = bat_info.shirtNum;
            $("#atbat").html(atbatShirtNum);
            var count = last_play.count;
            $.each(count, function(key, val){
                var tag = "#" + key;
                if(key == "balls" && val < 4){
                    for(var b = 0; b < val; b++){
                        $("#ball-" + b).css("color","lightgreen");
                    } 
                }
                if(key == "strikes" && val < 3){
                    for(var s = 0; s < val; s++){
                        $("#strike-" + s).css("color","red");
                    } 
                }
                if(key == "outs" && val < 3){
                    for(var b = 0; b < val; b++){
                        $("#out-" + b).css("color","red");
                    } 
                }
            });
            var play_result = last_play.result.description;
            $("#play_result").html(play_result);
        });
    }

    function setASGWallAndVenue(home_team){
        $("#venue").html(schedule.dates[0].games[0].venue.name);     
        if(home_team.includes("American")){
            $("#home-img").attr("src", "./logos/AL.svg");
            $("#away-img").attr("src", "./logos/NL.svg");
            $("#home").html("AL");
            $("#away").html("NL");
        }
        else{
            $("#home-img").attr("src", "./logos/NL.svg");
            $("#away-img").attr("src", "./logos/AL.svg");
            $("#home").html("NL");
            $("#away").html("AL");
        }
    }

    function setNoGameToday(){
        var times = fetchDateParts();
        $("#action").empty();
        if(times.monthNum > 10 || times.monthNum <= 2){
            nextStartDate = nextSeasonStartDate(times.year);
            $("#action").html("<p>Spring Training starts: <span>" + nextStartDate.seasons[0].preSeasonStartDate + "</span></p><p>Regular Season starts: <span>" + nextStartDate.seasons[0].regularSeasonStartDate + "</span></p>")
        }
        $("#wall-text").empty();
        $("#wall-text").html("<p>No game today</p>");
        $("#wall-away").empty();
        $("#versus").empty();
        $("#home-img").attr("src", "./logos/BOS.svg");
    }

    function setPostponedInfo(reason, reSched){
        var rsdStr = "";
        if(reSched){
            var rsd = new Date(reSched);
            rsdStr = (rsd.getMonth() + 1) + "/" + rsd.getDate() + "/" + rsd.getFullYear();
        }
        $("#wall-text").empty();
        $("#wall-text").html("<p>Postponed <span>" + reason + "</span></p>");
        $("#wall-text").append("<p>Rescheduled: <span>" + rsdStr + "</span></p>");
        $("#wall-away").empty();
        $("#versus").empty();
        $("#home-img").attr("src", "./logos/BOS.svg");
    }

    function setTeamCssId(id, homeAway){
        $.getJSON("http://statsapi.mlb.com/api/v1/teams/" + id, {
        }).done(function(data){
            var teamCode = data.teams[0].abbreviation;
            $("#" + homeAway +"-img").attr("src", "./logos/" + teamCode.toUpperCase() + ".svg");
            if(teamCode == "BOS")
            {
                $("#" + homeAway).html("BOSTON");
            }
            else{
                $("#" + homeAway).html(teamCode.toUpperCase());
            }
            if(teamCode !== "BOS" && homeAway == "home")
                $("#venue").html("@ " + teamCode);
        });
    }


    function setFinalInfo(live_url, away_score, home_score, soxWin, homeAway){
        var time = fetchDateParts();
        $.getJSON(live_url, function( ) {
            
        }).done(function(data){
            $("#action").empty();
            $(".current").removeClass("current");
            var game_data = data.liveData;
            var linescore = game_data.linescore;
            var wp = linescore.pitchers.win;
            var wp_info = game_data.players.allPlayers["ID" + wp];
            var wp_name = wp_info.name.last;

            var lp = linescore.pitchers.loss;
            var lp_info = game_data.players.allPlayers["ID" + lp];
            var lp_name = lp_info.name.last;

            $("#action").append("<table id='final-stats'><tr></tr><td colspan='2'>Final:  "+ time.todayFormatted  +"</td><tr><td>W:</td><td>" + wp_name + "</td><tr><td>L:</td><td>" + lp_name + "</td></tr></table>");

            if(linescore.pitchers.save > 0){
                var sv = linescore.pitchers.save;
                var sv_info = game_data.players.allPlayers["ID" + sv];
                var sv_name = sv_info.name.last;
                $('#final-stats tr:last').after("<tr><td>S:</td><td>" + sv_name + "</td></tr>");
            }
            $("#wall-text").empty();

            var score = away_score + "</span>&nbsp;-&nbsp;<span>" + home_score;
            var winText = "";
            if(soxWin && homeAway == "home"){
                score = home_score + "</span>&nbsp;-&nbsp;<span>" + away_score;
                winText = "Sox win!";
            }
            if(soxWin && homeAway == "away"){
                score = away_score + "</span>&nbsp;-&nbsp;<span>" + home_score;
                winText = "Sox win!";
            }
            if(!soxWin && homeAway == "home"){
                score = home_score + "</span>&nbsp;-&nbsp;<span>" + away_score;
                winText = "Sox lose";
            }
            if(!soxWin && homeAway == "away"){
                score = home_score + "</span>&nbsp;-&nbsp;<span>" + away_score;
                winText = "Sox lose";
            }   

            $("#wall-text").append("<h2>" + winText + "</h2><h3><span>" + score + "</span></h3>");
        });
    }

    function setTimeOnScoreboard(){
        $(".inning").empty();
        time = fetchDateParts();
        var month = time.monthString;
        var day = time.day;
        var hours = time.hour;
        var minutes = time.minutes;

        for(var i = 0; i < month.length; i++){
            $("#away-inn-" + (i + 3)).html(month[i]);
        }
        if(hours == 0)
            hours = 12;
        if(hours > 12)
            hours -= 12;
        if(hours < 10 && hours != 0){
            $("#home-inn-5").html(hours);
            $("#home-inn-6").html(":");
        }
        else{
            var hour_parts = hours.toString();
            $("#home-inn-4").html(hour_parts[0]);
            $("#home-inn-5").html(hour_parts[1]);
            $("#home-inn-6").html(":");
        }
        if(day < 10){
            $("#away-inn-8").html("0");
            $("#away-inn-9").html(day);
        }
        else{
            var day_parts = day.toString();
            $("#away-inn-8").html(day_parts[0]);
            $("#away-inn-9").html(day_parts[1]);
        }
        if(minutes < 10){
            $("#home-inn-7").html("0");
            $("#home-inn-8").html(minutes);
        }
        else{
            var minute_parts = minutes.toString();
            $("#home-inn-7").html(minute_parts[0]);
            $("#home-inn-8").html(minute_parts[1]);
        } 
    }

    //Standings:
    // Red Sox: 111
    // Yanks: 147
    // O's: 110
    // Jays: 141
    // Rays: 139
    function getStandings(date){
        var time = fetchDateParts();
        var soxUrl = "http://statsapi.mlb.com/api/v1/schedule/games/?sportId=1&teamId=" + 111 + "&season=" + time.year + "&startDate=" + time.todayFormatted + "&endDate=" + time.todayFormatted;
        var yanksUrl = "http://statsapi.mlb.com/api/v1/schedule/games/?sportId=1&teamId=" + 147 + "&season=" + time.year + "&startDate=" + time.todayFormatted + "&endDate=" + time.todayFormatted;
        var oriolesUrl = "http://statsapi.mlb.com/api/v1/schedule/games/?sportId=1&teamId=" + 110 + "&season=" + time.year + "&startDate=" + time.todayFormatted + "&endDate=" + time.todayFormatted;
        var jaysUrl = "http://statsapi.mlb.com/api/v1/schedule/games/?sportId=1&teamId=" + 141 + "&season=" + time.year + "&startDate=" + time.todayFormatted + "&endDate=" + time.todayFormatted;
        var raysUrl = "http://statsapi.mlb.com/api/v1/schedule/games/?sportId=1&teamId=" + 139 + "&season=" + time.year + "&startDate=" + time.todayFormatted + "&endDate=" + time.todayFormatted;
        
        
        $.ajax({
            url: fetchTodaysGameSchedule(),
            async: false,
            dataType: "json",
        }).done(function(data){
            wl = [];

        });
        /*
        <tr>
              <td>BOSTON</td>
              <td>108</td>
              <td>54</td>
              <td>—</td>
            </tr>
            <tr>
              <td>NEW YORK</td>
              <td>100</td>
              <td>62</td>
              <td>8</td>
            </tr>
            <tr>
              <td>TAMPA BAY</td>
              <td>90</td>
              <td>72</td>
              <td>18</td>
            </tr>
            <tr>
              <td>TORONTO</td>
              <td>73</td>
              <td>89</td>
              <td>35</td>
            </tr>
            <tr>
              <td>BALTIMORE</td>
              <td>47</td>
              <td>115</td>
              <td>61</td>
            </tr>
        */

    }
});