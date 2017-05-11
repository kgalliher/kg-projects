<?php
	require("Database.php");
	include_once("header.php");
?>
<!---->
<nav class="navbar navbar-toggleable-md navbar-inverse fixed-top bg-inverse">
	<button class="navbar-toggler navbar-toggler-right hidden-lg-up" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
		<span class="navbar-toggler-icon"></span>
	</button>
	<div class="collapse navbar-collapse" id="navbarsExampleDefault">
		<h2 style="color:white">
			SDE Interceptor Trace Formatting.
		</h2>
	</div>

	<div class="collapse navbar-collapse" id="navbarsExampleDefault">

	</div>
</nav>
<div class="container-fluid">
	<div class="row">
		<nav class="col-sm-3 col-md-2 hidden-xs-down bg-faded sidebar">
			<ul class="nav nav-pills flex-column">
				<li class="nav-item">
					<a class="nav-link active" href="#">
						Overview
						<span class="sr-only">(current)</span>
					</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" href="http://gdbcloud/">GDB Cloud Tools</a>
				</li>
			</ul>
			<hr />
			<h4>Upload New Trace</h4>
			<form style="margin: 0;" class="form-horizontal center-block" id="uploadTrace" action="#" method="post" enctype="multipart/form-data">
				<div class="form-group">
					<!--<label for="empno" class="col-sm-2 control-label">Employee #:</label>-->
					<div class="col-sm-10">
						<input class="form-control" type="text" name="empno" placeholder="i.e. 1234" />
					</div>
				</div>
				<div class="form-group">
					<!--<label for="incno" class="col-sm-2 control-label">Incident #</label>-->
					<div class="col-sm-10">
						<input class="form-control" type="text" name="incno" placeholder="i.e. 01923456" />
					</div>
				</div>
				<div class="form-group">
					<!--<label for="trcno" class="col-sm-2 control-label">Trace ID</label>-->
					<div class="col-sm-10">
						<input class="form-control" type="text" name="trcno" placeholder="i.e. 001" />
					</div>
				</div>
				<div class="form-group">
					<!--<label for="description" class="col-sm-2 control-label">Description</label>-->
					<div class="col-sm-10">
						<textarea class="form-control" rows="2" cols="25" name="description" placeholder="Quick note about the trace"></textarea>
					</div>
				</div>
                <div class="form-group">
                    <div class="col-sm-10">
                        <input type="file" name="filename" id="file" />
					</div>
				</div>
                <div class="form-group">
                    <div class="col-sm-10">
                        <input type="submit" class="btn btn-default" value="Upload" />
                    </div>
                </div>
		</form>
		<div id="loadingDiv"><img src="img/loading.gif" alt="processing..." class="img-responsive center-block" /></div>
		<div id="messageDiv"></div>
		</nav>
		<main class="col-sm-9 offset-sm-3 col-md-10 offset-md-2 pt-3">
			<div class="table-responsive">
				<table class="table table-striped">
					<thead>
						<tr>
							<th>Date</th>
							<th>Employee number</th>
							<th>Incident number</th>
							<th>Trace name</th>
							<th>File Name</th>
							<th>Description</th>
							<th></th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						<?php
					  $database = new Database();
					  $traces = $database->retrieveTraceInfo();
					  foreach($traces as $trace){
						echo "<tr class='info-table'><td>" . $trace['stamp']
						  . "</td><td>" . $trace['empno']
						  . "</td><td>" . $trace['incno']
						  . "</td><td>" . $trace['trace_name']
						  . "</td><td>" . $trace['file_name']
						  . "</td><td>" . $trace['description']
						  . "</td><td>" . "<a href='interceptor_dashboard.php?trace_name=" . $trace['trace_name'] . "' target='_blank'>Open</a>"
						  . "</td><td>" . "<a href='#' id='delete_trace' data-trace_name='" . $trace['trace_name'] . "' data-id='" .  $trace['id'] . "'>Delete</a>"
						  . "</td></tr>";
					  }
						?>
					</tbody>
				</table>
			</div>
		</main>
	</div>
</div>
<?php include("footer.php"); ?>
