<?php

include_once("header.php");

?>

<form class="delete" action="#" method="GET">
    <input type="text" id="kill" name="kill" />
    <input type="submit" value="Kill 'Em All!'" />
</form>

<div id="messageDiv"></div>
<script>
    $(".delete").submit(function(event){
      event.preventDefault();
      
      var fields = $("#kill").val();
	  console.log(fields);
	  var url = "cleanup_func.php?kill=" + fields;
	  console.log(url);
	  $.get(url, function(data){
		$("#messageDiv").empty();
		 $("#messageDiv").html(data); 
	  });
  });
</script>