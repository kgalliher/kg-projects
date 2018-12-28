$(document).ready(function(){
    //TODO:  Get onto GitHub
    //TODO: Parse date to get game info...
    var now = new Date(Date.now());
    var base_url = "http://statsapi.mlb.com/api/v1/schedule/games/?sportId=1&teamId=111&season=2019&startDate=2018-06-03&endDate=2018-06-03";
    var game_id = 0;
    var liveGameData;

    //TODO: Use schedule (base_url) to get the game ID for live game.
    //TODO: Set home and away teams on the scoreboard.
    $.get(base_url, function( data ) { 
        game_id = data["dates"][0]["games"][0]["gamePk"];   
    }).done(function(){ console.log(game_id); });

    //TODO:  If no game, display current date and time
    // on the scoreboard.

    //Live line score
    //TODO: Set refresh interval.
    var live_url = "http://statsapi.mlb.com/api/v1/game/530285/feed/live";
    game_data = "";
    $.getJSON(live_url, function( data ) {
        game_data = data["liveData"];
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
            var hs = $(home_inning).html(val["home"]);
            var as = $(away_inning).html(val["away"]);
        });
        var plays = game_data.plays.allPlays;
        var last_play = plays[plays.length - 1];
        console.log(last_play);
        console.log(game_data);
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

        if(linescore.pitchers.win){
            setFinalInfo(linescore);
            setTimeout(function(){
                setTimeOnScoreboard();
            }, 3000);
            
        }
    });

    function setFinalInfo(linescore){
        var wp = linescore.pitchers.win;
            var wp_info = game_data.players.allPlayers["ID" + wp];
            var wp_name = wp_info.name.last;

            var lp = linescore.pitchers.loss;
            var lp_info = game_data.players.allPlayers["ID" + lp];
            var lp_name = lp_info.name.last;

            if(linescore.pitchers.save){
                var sv = linescore.pitchers.save;
                var sv_info = game_data.players.allPlayers["ID" + lp];
                var sv_name = sv_info.name.last;
            }
            else {
                var sv_name = " ";
            }
            $(".count").html("<table><tr></tr><td colspan='2'>Final</td><tr><td>W:</td><td>" + wp_name + "</td><tr><td>L:</td><td>" + lp_name + "</td></tr></table>");
    }

    function setTimeOnScoreboard(){
        $(".inning").empty();
        var monthNames = [ "JAN", "FEB", "MAR", "APR", "MAY", "JUN", 
                       "JUL", "AUG", "SEP", "OCT", "NOV", "DEC" ];
        var standardHours = [12,11,10,9,8,7,6,5,4,3,2,1];

        var month = now.getMonth();
        var day = now.getDay();
        var hours = now.getHours();
        var minutes = now.getMinutes();

        var monthString = monthNames[month];
        for(var i = 0; i < monthString.length; i++){
            $("#away-inn-" + (i + 3)).html(monthString[i]);
        }
        $("#away-inn-7").html(day);
        if(hours < 10){
            $("#home-inn-4").html(hours);
            $("#home-inn-5").html(":");
        }
        else{
            var hour_parts = hours.toString();
            $("#home-inn-3").html(hours[0]);
            $("#home-inn-4").html(hours[1]);
            $("#home-inn-5").html(":");
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