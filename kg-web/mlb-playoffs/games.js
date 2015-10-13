$(document).ready(function(){
var time = new Date();
var day = time.getDate();

var url = "games.php";

// Need to not do this.  How to fix?
setInterval(function(){
	location.reload();
	}, 10000);

 $.getJSON(url, function(result){
	$.each(result.data.games.game, function(i, field){
		var up = "*";
		var inning = this.inning;
		var home_team_runs;
		var away_team_runs;
		var away_team_hits;
		var home_team_hits;
		var away_team_errors;
		var home_team_errors;
		var outs;
		var starttime = this.home_time;
		
		if (this.status == "Preview" || this.status == "Pre-Game") {
			inning = starttime;
			away_team_runs = "";
			home_team_runs = "";
			away_team_hits = this.status;
			home_team_hits = "";
			away_team_errors = "";
			home_team_errors = "";
			outs = "";
			
		}
		else if (this.status == "Game Over" || this.status == "Final") {
			inning = "Final";
			away_team_runs = this.away_team_runs;
			home_team_runs = this.home_team_runs;
			away_team_hits = this.away_team_hits;
			home_team_hits = this.home_team_hits;
			away_team_errors = this.away_team_errors;
			home_team_errors = this.home_team_errors;
			outs = "";
			
		}
		else {
			away_team_runs = this.away_team_runs;
			home_team_runs = this.home_team_runs;
			away_team_hits = this.away_team_hits;
			home_team_hits = this.home_team_hits;
			away_team_errors = this.away_team_errors;
			home_team_errors = this.home_team_errors;
			outs = this.outs + " outs";
		}
	
		if (this.top_inning == "Y") {
			
			var linescore = "<tr class='active'><td>" + this.away_team_name +  " " + up + "</td><td>" + inning + "</td><td>" + away_team_hits + "</td><td>" + away_team_runs + "</td><td>" + away_team_errors + "</td></tr>" +
						"<tr class='active'><td>" + this.home_team_name +  " " + "</td><td></td><td>" + home_team_hits + "</td><td>" + home_team_runs + "</td><td>" + home_team_errors + "</td></tr>";
		}
		else {
			var linescore = "<tr class='active'><td>" + this.away_team_name +  " " + "</td><td>" + inning + "</td><td>" + away_team_hits + "</td><td>" + away_team_runs + "</td><td>" + away_team_errors + "</td></tr>" +
						"<tr class='active'><td>" + this.home_team_name +  " " + up +  "</td><td>" + outs + "</td><td>" + home_team_hits + "</td><td>" + home_team_runs + "</td><td>" + home_team_errors + "</td></tr>";

		}
				
		var html = "<table class='tablesorter'>" +
			"<th><a href='http://mlb.mlb.com/mlb/gameday/index.jsp?gid="+ this.gid +"=mlb#game="+ this.gameday_link+",game_state=Live' target='_blank'>" + this.description + "</a></th>" +
			"<th>Inning</th>" +
			"<th>Hits</th>" +
			"<th>Runs</th>" +
			"<th>Errors</th>" + linescore +
			"</table>" +
			"<div class='gameinfo'></div>" +
			"<br />";
		
		$("#scores").append(html);
	});
});
				
});	
	
