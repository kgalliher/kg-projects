<!DOCTYPE html>
	<html>
		<head>
			<title>
				MLB Playoffs
			</title>
			<script src="https://code.jquery.com/jquery-1.11.3.js"></script>			
			<style>
				body {
					background-color: #004080;
					
				}
				
				.active td {
					width: 300px;
					font-weight: bold;
					font-size: 16px;
				}
				
				#final {
					float: right;
					color: white;
					padding: 5px;
				}

			</style>
			<script src="games.js"></script>
		</head>
		<body>
			<div style="width:400px;">
			<div class="scores" id="scores"><span id="final"></span></div>
			<p style="color:white">* = at-bat</p>
			</div>
		</body>
	</html>