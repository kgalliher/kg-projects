$(document).ready(function(){
	$( function() {
		$( "#accordion" ).accordion({heightStyle: "content", collapsible: true});
		
	});
	
	$("form#uploadTrace").submit(function(event){
      event.preventDefault();
      
      var formData = new FormData($(this)[0]);
      $.ajax({
        url: "process_file.php",
        type: "POST",
        data: formData,
        async: true,
        success: function (data) {
            console.log(formData);
          window.location.reload();
        },
        cache: false,
        contentType: false,
        processData: false
      });
      
      return false;
  });
	
	$("button#filtered-intercept").click(function(event){
      event.preventDefault();
      
      var fields = $(".get-intercept").serializeArray();
	  console.log(fields);
	  var url = "dispatch.php?trace_name=" + fields[2]['value'] + "&start=" + fields[0]['value'] + "&end=" + fields[1]['value'];
	  console.log(url);
	  $.get(url,
	  function(data){
		$("#intercept-out").empty();
		 $("#intercept-out").html(data); 
	  });
  });

$("button#full-intercept").click(function(event){
      event.preventDefault();
      
      var fields = $(".get-intercept").serializeArray();
	  console.log(fields);
	  var url = "dispatch.php?trace_name=" + fields[2]['value'];
	  console.log(url);
	  $.get(url, function(data){
		$("#intercept-out").empty();
		 $("#intercept-out").html(data); 
	  });
  });
$("a.get-return-duration").click(function(event){
      event.preventDefault();
      var check = $(this).attr("data-code");
      var line = $(this).attr("data-linenum");
	  var trace_name = $(this).attr("data-trace_name");
	  var linenum = line;
	  var url = "dispatch.php?trace_name=" + trace_name + "&line_num=" + linenum + "&title=" + check;
	  console.log(url);
	  $.get(url, function(data){
		 $("#intercept-out").empty();
		 $("#intercept-out").html(data); 
	  });
  });

  $(function() {
    $('tr.parent')
        .css("cursor","pointer")
        .click(function(){
            $(this).siblings('.child-'+this.id).toggle('slow');
        });
    $('tr.parent').siblings('[class^=child]').hide();
});
  
  var $loading = $('#loadingDiv').hide();
  $(document)
    .ajaxStart(function () {
      $loading.show();
    })
    .ajaxStop(function () {
      $loading.hide();
    });
	
	
});
