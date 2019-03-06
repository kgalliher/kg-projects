$(document).ready(function(){

    function Linescore(linescore){
        this.innings = linescore.innings;
        this.currentInning = linescore.currentInning;
        this.inningHalf = linescore.inningHalf;
        this.home_runs = linescore.teams.home.runs;
        this.away_runs = linescore.teams.away.runs;
        this.home_hits = linescore.teams.home.hits;
        this.away_hits = linescore.teams.away.hits;
        this.home_errors = linescore.teams.home.errors;
        this.away_errors = linescore.teams.away.erros;
        this.currentPitcherId = "ID" + linescore.defense.pitcher.id;
        this.currentBatterId = "ID" + linescore.offense.batter.id;
        this.dueUp = {
            "batter": ["At Bat", this.currentBatterId],
            "onDeck": ["On Deck", "ID" + linescore.offense.onDeck.id],
            "inHole": ["In The Hole", "ID" + linescore.offense.inHole.id]
        }
     }
     
     function Player(playerData, id){
        var playerInfo = playerData[id];
        if(playerInfo){
            this.boxscoreName = playerInfo.boxscoreName;
            this.shirtNumber = playerInfo.primaryNumber;
        }
        else{
            this.boxscoreName = "";
            this.shirtNumber = 99;
        }
     }

     function Count(count){
        this.balls = count.balls;
        this.strikes = count.strikes;
        this.outs = count.outs;
        if(this.balls == 4){
           this.balls = 0;
           this.strikes = 0;
        }
        if(this.strikes == 3){
           this.balls = 0;
           this.strikes = 0;
        }
        if(this.strikes == 3){
           this.outs = 0;
           this.balls = 0;
           this.strikes = 0;
        }
     }
     
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
        // var nowStr = "2018-6-10";
        // var now = new Date(nowStr);
        var now = new Date();
        
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
        var base_url = "http://statsapi.mlb.com/api/v1/schedule/games?sportId=1&season=" + currentTime.year;

        //Build up date for url.  Pad days and months if necessary.
        base_url += "&startDate=";
        base_url += currentTime.todayFormatted;
        if(monthIdx > 10 && monthIdx <= 12){
            base_url += "&endDate=";
            base_url += nextSeasonStartDate(currentTime.now.getFullYear()).seasons[0].preSeasonStartDate;
        }
        else if(monthIdx >= 1 && monthIdx <= 2){
			var seasonStartDate = nextSeasonStartDate(currentTime.now.getFullYear()).seasons[0].preSeasonStartDate;
			if(currentTime.todayFormatted >= seasonStartDate)
			{
				base_url += "&endDate=";
				base_url += currentTime.todayFormatted;
			}
			else{
				base_url += "&endDate=";
				base_url += nextSeasonStartDate(currentTime.now.getFullYear()).seasons[0].preSeasonStartDate;
			}  
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
    // console.log(schedule);
    // Displays the time if no game, starts game action when it's game time.
    (function gameData(){
        var times = fetchDateParts();
        var refreshTime = 10000;
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
            var live_url = "http://statsapi.mlb.com/api/v1.1/game/" + game_id + "/feed/live";
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

            if(status.detailedState == "In Progress"){
                getGameAction(live_url);
                refreshTime = 5000;
            }

            if(status.detailedState == "Final"){
                $(".inning.current").removeClass("current");
                finalPlay = getGameAction(live_url);
                var home_score = game.teams.home.score;
                var away_score = game.teams.away.score;

                if(game.teams["home"].team.name == "Boston Red Sox" && home_score > away_score){
                    setFinalInfo(live_url, home_score, away_score, true, "home");
                }
                else if(game.teams["home"].team.name == "Boston Red Sox" && home_score < away_score){
                    setFinalInfo(live_url, home_score, away_score, false, "home");
                }
                else if(game.teams["away"].team.name == "Boston Red Sox" && away_score > home_score){
                    setFinalInfo(live_url, home_score, away_score, true, "away");
                }
                else if(game.teams["away"].team.name == "Boston Red Sox" && away_score < home_score){
                    setFinalInfo(live_url, home_score, away_score, false, "away");
                }
                setTimeOnScoreboard();
                refreshTime = 20000;
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
            setTimeout(gameData,refreshTime);   
        });
    }());

    function getGameAction(live_url){
        $.ajax({
            url: live_url,
            async: false,
            dataType: "json",
        }).done(function(data){
            console.log(live_url);
            var live_data = data.liveData;
            var linescore = new Linescore(live_data.linescore);
            var players = data.gameData.players;
            var currentPlay = live_data.plays.currentPlay;
            var previousPlay = 
            var current_pitcher = new Player(players, linescore.currentPitcherId);
            $("#current_pitcher").html(current_pitcher.boxscoreName);
            
            var current_batter = new Player(players, linescore.currentBatterId);
            $("#current_batter").html(current_batter.boxscoreName);
            $("#atbat").html(current_batter.shirtNumber);

            var current_inning = linescore.currentInning;
            if(current_inning > 10)
                current_inning -= 10;
            var current_half = linescore.inningHalf;

            if(current_half != "Bottom"){
                $("#away-inn-" + current_inning).addClass("current");
                $("#home-inn-" + (current_inning - 1)).removeClass("current");
            }
            else{
                $("#home-inn-" + current_inning).addClass("current");
                $("#away-inn-" + (current_inning)).removeClass("current");
            }

            var home_runs = linescore.home_runs || 0;
            var away_runs = linescore.away_runs || 0;
            var home_hits = linescore.home_hits || 0;
            var away_hits = linescore.away_hits || 0;
            var home_errs = linescore.home_errors || 0;
            var away_errs = linescore.away_errors || 0;
            $("#wall-text").html("")
            $("#home-runs").html(home_runs);
            $("#away-runs").html(away_runs);
            $("#home-hits").html(home_hits);
            $("#away-hits").html(away_hits);
            $("#home-errs").html(home_errs);
            $("#away-errs").html(away_errs);
            var inning_data = linescore.innings;
            for(var i = 0; i < inning_data.length; i++){
                var home_inning = "#home-inn-" + (inning_data[i].num);
                var away_inning = "#away-inn-" + (inning_data[i].num);
                $(home_inning).html(inning_data[i].home.runs);
                $(away_inning).html(inning_data[i].away.runs);
            }
            
            var count = new Count(currentPlay.count);
            var outs = count.outs;
            var balls = count.balls;
            var strikes = count.strikes;

            var currentPlayEvents = currentPlay.playEvents;
            if(currentPlayEvents.length > 0){
                var currentEvent = currentPlayEvents[currentPlayEvents.length - 1].details.description || "";
                $("#wall-text").html("<h2>" + currentEvent + "</h2>");
            }
            
            var play_result = currentPlay.result.description;
            if(play_result)
                $("#play_result").html(play_result);
            
            if(outs == 3){
                $("ul#ball").find("li[id^=ball-]").removeAttr("style");
                $("ul#strike").find("li[id^=strike-]").removeAttr("style");
                $("ul#out").find("li[id^=out-]").removeAttr("style");
                console.log("DUE UP");
                $.each( linescore.dueUp, function( key, value ) {
                    var player = new Player(players, value);
                    $("#play_result").html(player.boxscoreName);
                  });
            }
            else{
                for(var b = 0; b < balls; b++){
                    $("#ball-" + (b + 1)).css("color","lightgreen");
                } 
                for(var s = 0; s < strikes; s++){
                    $("#strike-" + (s + 1)).css("color","red");
                } 
                for(var b = 0; b < outs; b++){
                    $("#out-" + (b + 1)).css("color","red");
                }
            }  
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
			if(linescore.innings.length > 0)
			{
				var wp = game_data.decisions.winner;
				var wp_name = wp.fullName;

				var lp = game_data.decisions.loser;
				var lp_name = lp.fullName;

				$("#action").append("<table id='final-stats'><tr></tr><td colspan='2'>Final:  "+ time.todayFormatted  +"</td><tr><td>W:</td><td>" + wp_name + "</td><tr><td>L:</td><td>" + lp_name + "</td></tr></table>");

				if(game_data.decisions.save){
					var sv = game_data.decisions.save;
					var sv_name = sv.fullName;
					$('#final-stats tr:last').after("<tr><td>S:</td><td>" + sv_name + "</td></tr>");
				}
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

            $("#wall-text").append("<h1>" + winText + "</h1><h2><span>" + score + "</span></h2>");
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
    function getStandings(){
        // Standings: http://statsapi-default-elb-prod-876255662.us-east-1.elb.amazonaws.com/api/v1/standings?leagueId=103&season=2018
        var time = fetchDateParts();
        var standingsUrl = "http://statsapi-default-elb-prod-876255662.us-east-1.elb.amazonaws.com/api/v1/standings?leagueId=103&season=" + time.year;
        var alEast = []

        $.ajax({
            url: standingsUrl,
            async: false,
            dataType: "json",
        }).done(function(data){
            if(data["records"].length <= 0){
                alEast.push({"Name" : "------", "W": "------", "L": "------", "GB": "------"});
            }
            else{
                for( var i = 0; i < 5; i++){
                    var name = "";
                    if(data["records"][1]["teamRecords"][i]["team"]["name"] == "Boston Red Sox"){
                        name = "BOSTON";
                    }
                    if(data["records"][1]["teamRecords"][i]["team"]["name"] == "New York Yankees"){
                        name = "NEW YORK";
                    }
                    if(data["records"][1]["teamRecords"][i]["team"]["name"] == "Tampa Bay Rays"){
                        name = "TAMPA BAY";
                    }
                    if(data["records"][1]["teamRecords"][i]["team"]["name"] == "Toronto Blue Jays"){
                        name = "TORONTO";
                    }
                    if(data["records"][1]["teamRecords"][i]["team"]["name"] == "Baltimore Orioles"){
                        name = "BALTIMORE"
                    }
                    obj = {"Name": name,
                                "GB" : data["records"][1]["teamRecords"][i]["leagueGamesBack"], 
                                "W" : data["records"][1]["teamRecords"][i]["leagueRecord"]["wins"], 
                                "L" : data["records"][1]["teamRecords"][i]["leagueRecord"]["losses"]
                            }
                    alEast.push(obj);
                }
            }
        });
        return alEast;
    }

    function setStandings(){
        var standings = getStandings();
        for(var i =  0; i < standings.length; i++){
            var row = "<tr><td>" + standings[i]["Name"] + "</td><td>" + standings[i]["W"] + "</td><td>" + standings[i]["L"] + "</td><td>" + standings[i]["GB"] + "</td></tr>";
            $(".standings").append(row);
        }
    }
    setStandings();
});
