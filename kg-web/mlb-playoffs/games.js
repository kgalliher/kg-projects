$(document).ready(function(){
	var time = new Date();
	var day = time.getDate();
	var url = "http://gd2.mlb.com/components/game/mlb/year_2015/month_10/day_"+ day +"/miniscoreboard.json";

function loadScoreboard(){
	$("#scores").empty();
	console.log("hello")
	 $.getJSON(url, function(result){
		$.each(result.data.games.game, function(i, field){
			var up = "*";
			var inning = this.inning;
			var away_team_name = this.away_team_name;
			var home_team_name = this.home_team_name;
			var away_team_runs = this.away_team_runs;
			var home_team_runs = this.home_team_runs;
			var away_team_hits = this.away_team_hits;
			var home_team_hits = this.home_team_hits;
			var away_team_errors = this.away_team_errors;
			var home_team_errors = this.home_team_errors;
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
				outs = "";
				
			}
			else {
				outs = this.outs + " outs";
				if (this.top_inning == "Y") {
					away_team_name = away_team_name + " *";
				}
				else {
					home_team_name = home_team_name + " *";
				}
			}

			var linescore = "<tr class='active'><td>" + this.away_team_name +  " " + up + "</td><td>" + inning + "</td><td>" + away_team_hits + "</td><td>" + away_team_runs + "</td><td>" + away_team_errors + "</td></tr>" +
							"<tr class='active'><td>" + this.home_team_name +  " " + "</td><td></td><td>" + home_team_hits + "</td><td>" + home_team_runs + "</td><td>" + home_team_errors + "</td></tr>";
						
			var html = "<table class='tablesorter'>" +
						"<th><a href='http://mlb.mlb.com/mlb/gameday/index.jsp?gid="+ this.gid +"=mlb#game="+ this.gameday_link+",game_state=Live' target='_blank'>" + this.description + "</a></th>" +
						"<th>Inning</th>" +
						"<th>Hits</th>" +
						"<th>Runs</th>" +
						"<th>Errors</th>" + linescore +
						"</table>" +
						"<br />";
			
			$("#scores").append(html);
		});
	});	
}
 setInterval(loadScoreboard, 5000);
});	
		
	
