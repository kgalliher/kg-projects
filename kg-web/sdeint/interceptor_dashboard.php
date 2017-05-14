<?php
include_once("header.php");
require("Database.php");
$database = new Database();
$trace_name = htmlentities($_GET['trace_name']);
$title = $database->retrieveTopTableFileName($trace_name);
?>
  <nav class="navbar navbar-toggleable-md navbar-inverse fixed-top bg-inverse">
      <button class="navbar-toggler navbar-toggler-right hidden-lg-up" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
      </button>
      <a class="navbar-brand" href="http://keng:82/sdeint">SDE Interceptor</a>
      <div class="collapse navbar-collapse" id="navbarsExampleDefault">
		  <h2 style="color:white">Dashboard for <?php echo basename($title[0]['line']); ?></h2>
      </div>
  </nav>
  <div class="container-fluid">
  <div class="row">
  <nav style=""class="col-sm-4 col-md-3 hidden-xs-down bg-faded sidebar">
      <div id="accordion">
	<h3>View Intercept</h3>
		<div class="info-table">	
			<form class="form-group upload-form" id="show-intercept" action="#" method="post" enctype="multipart/form-data">
			  <table>
				<div class="form-group"><label for="start">From line:</label><input size='10' class="get-intercept form-control" type="text" name="start" /></div>
				<div class="form-group"><label for="incno">To Line:  </label><input size='10' class="get-intercept form-control" type="text" name="end" /></div>
				<div class="form-group"><input type="hidden" class="get-intercept" name="trace_name" value="<?php echo $trace_name; ?>" /></div>
				<div class="form-group"><button id="filtered-intercept">Get Filtered Intercept</button></div>
				<div class="form-group"><button id="full-intercept">Get Full Intercept (!)</button></div>
				<div class="form-group"><button id="next-buffer">NextBuffer Analysis</button></div>
			  </table>
			</form>
			<?php 
				$line_count = $database->retrieveLineCount($trace_name);
				echo "<p>{$trace_name} contains " . number_format($line_count['max_line_count']) . " rows.</p>";
				echo "<p>Getting the full trace or running NextBuffer Analysis can take a while.</p>" 
			?>	
	</div>
	<h3>View Return Codes (errors)</h3>
		<div class="info-table">
			<table class="table table-striped">
				<thead>
					<th>Line</th>
					<th>Command</th>
					<th>Duration</th>
				</thead>
				<tbody>
					<?php
					$rows = $database->retrieveLongValueErrors($trace_name);
					foreach($rows as $row){
						echo "<tr class='danger'><td><a style='text-decoration:underline' class='get-return-duration' href='#' data-code='return_code' data-trace_name={$trace_name} data-linenum={$row['linenum']}>" . $row['linenum'] . "</td><td>" . $row['theerror'] . "</td><td>" . $row['thecommand'] . "</td></tr>";
					}
                    ?>
				</tbody>
			</table>
		</div>
<h3>Top 10 Longest Queries</h3>
	<div class="info-table">
		<table class="table table-striped">
			<thead>
				<th>Line</th>
				<th>Command</th>
				<th>Duration</th>
			</thead>
			<tbody>
				<?php
				$rows = $database->retrieveLongCommands($trace_name);
				if(empty($rows)){
					echo "<p><strong>No long durations found.</strong></p>";
					echo "<p>It is possible that there were no commands that took longer";
					echo "than 0.05 seconds to complete.</p>";
					echo "<p>This tool detects missing timestamps and replaces them with '00:00:00.000'</p>";
					echo "<p><strong>Check the trace file for valid time infomation.</strong><br />";
					echo "If no time info was found, the line will contain only [R] or [W]<br />";
					echo "with no time information.</p><br />";
					echo "You can set the SDEINTERCEPT variable with the following flags to intercept network broadcasts:<br/>";
					echo "<pre>c-Intercept the API command name<br/>";
					echo "r-Intercept the Channel broadcasts read-only<br/>";
					echo "w-Intercept the Channel broadcasts write-only<br/>";
					echo "<strong>t-Intercept log time (minute:second)</strong><br/>";
					echo "<strong>T-Intercept log time (hour:minute:second)</strong><br/>";
					echo "f-Intercept flush immediate</pre>";
					
				}
				foreach($rows as $row){
					echo "<tr class='warning'><td><a style='text-decoration:underline' id='long-duration-commands' href='#' data-code='long_query' data-trace-name='" . $trace_name . "'data-start='" .$row['inf_num'] . "' data-end='" . $row['line_num'] . "'>" . $row['line_num'] . "</td><td>" . $row['command'] . "</td><td>" . $row['delta'] . "</td></tr>";
				}
                ?>
			</tbody>
		</table>
	</div>
	<h3>Command Count</h3>
		<div class="info-table">
			<table class="table table-striped">
				<thead>
					<th>Command</th>
					<th>Total</th>
				</thead>
				<tbody>
					<?php
					$rows = $database->retrieveCommandCount($trace_name);
					foreach($rows as $row){
						echo "<tr><td>" . $row['command'] . "</td><td>" . $row['cnt'] . "</td></tr>";
					}
                    ?>
				</tbody>
			</table>
			</div>
	</div>
</section>
  </nav>

  <main class="col-sm-9 offset-sm-3 col-md-10 offset-md-3 pt-3">
      <h1 style="padding-top:8px;"><?php echo basename($title[0]['line']); ?></h1>

      <section class="row text-center placeholders">
		  <table class="table table-striped table-bordered info-table" style="width:400px;">
			<tbody>
				<?php
				$rows = $database->retrieveTopTable($trace_name);
				foreach($rows as $row){
					echo "<tr><td>" . $row['descriptor'] . "</td><td>" . $row['line'] . "</td></tr>";
				}
                ?>
			</tbody>
		</table>
      </section>

	  <div background-color="#a1a1a1"  id="trace-container">
		  <div id="intercept-out"></div>
	  </div>
</main>
</div>
	  </div>

<?php include("footer.php");