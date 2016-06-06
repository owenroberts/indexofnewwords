var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
var stop = false;
var nounset;


$('#stop').on('click', function(ev) {
	ev.preventDefault();
	stop = true;
});

$("#word").on('click', function() { 
	$('#set-nouns').removeClass('hidden');
	$('#text-gen').hide();	
});

var updateBreadcrumb = function(link) {
	var l = $(link).clone();
	$('#breadcrumb').append(" > ").append(l);
}
$('body').on('click', '#breadcrumb a',  function() {
	var n = this.hash.split("#")[1];
	$('#nouns').html("");
});


var setNouns = function(string) {

	var n = this.hash.split("#")[1];
	updateBreadcrumb(this);
	$('#set-nouns').addClass('hidden');
	if (n == "input") $('#choose-noun').removeClass('hidden');
	/*nounset = string;
	
	loadPrefixes();*/
};
$('#set-nouns a').on('click', setNouns);

$('#input-noun').on('change', function() {
	$('#choose-noun').addClass('hidden');
	updateBreadcrumb("<a href=#" + this.value + ">"+this.value+"</a>");
	loadPrefixes(this.value);
});

var loadPrefixes = function(noun) {
	$.ajax({
		url: "./data/prefix.csv",
			success: function(data) {
			var csv = CSVToArray(data);
			var prefixes = [];
			for (var i = 0; i < csv.length; i++) {
				prefixes.push( csv[i][0].split(/[^a-zA-Z]/)[0].toLowerCase() );
			}			
			if (noun) {
				asyncLoop({
					length:prefixes.length,
					functionToLoop : function(loop, i) {
						setTimeout(function() {
							addEntry(prefixes[i], noun);
							loop();
						}, 1);
					},
					callback : function() {
						console.log("done!");
					}
				});
			} else {
				var prefixes = data.split('\n');
				prefixes.sort();
				for (var i = 0; i < prefixes.length; i++) {
					var prefDiv = $('<a>')
						.attr({"href":"#"+prefixes[i]})
						.addClass("pref")
						.text(prefixes[i]);
					prefDiv.on('click', function() {
						loadNouns(this.innerHTML);
					});
					$('#prefixes').append(prefDiv);
					$('#prefixes').append("<br>");
				}
				$('#prefix').removeClass('hidden');
			}
		}
	});
}

var addEntry = function(p, n) {
	var n = $('<a>')
		.text(p + n)
		.attr("href", "#" + p + "-" + n)
		.addClass("newword");
	$('#nouns').append(n).append("<br>");
}

$('#input-prefix').on('change', function() {
	loadNouns(this.value);
});

var loadNouns = function(prefix) {
	$('#prefix').addClass('hidden');
	$.ajax({
		url: "./data/"+nounset+".txt",
		success: function(data) {
			var nouns = data.split(',\n');
			nouns.sort();
			$("#counter").removeClass("hidden");				
			asyncLoop({
				length:nouns.length,
				functionToLoop : function(loop, i) {
					setTimeout(function() {
						addEntry(prefix, nouns[i]);
						loop();
					}, 1);
				},
				callback : function() {
					console.log("done!");
				}
			});

			$('#alpha').on('click', function(ev) {
				ev.preventDefault();
				stop = true;
				$('#nouns').addClass('hidden');
				for (var i = 0; i < alphabet.length; i++) {
					var alphaheader = $("<div>")
						.attr({id:"alphaheader"})
						.css({float:"right"});
					$('#alphabetical').append("<strong>" + alphabet[i] + "</strong> ");
					$('#alphabetical').append(alphaheader);
					$('#alphabetical').append("<hr>");
					var newalpha = $("<div>")
						.addClass("prefix")
						.attr({id:"al"+i});
					$('#alphabetical').append(newalpha);
					var count = 0;
					var matches = 0;
					for (var n = 0; n < nouns.length; n++) {
						if (nouns[n][0] == alphabet[i]) {
							if (count < 25) {
								matches++;
								var prefDiv = $('<a>')
									.attr({"href":"#"+ prefix + "-" + nouns[n]})
									.css({color: 
										"rgba(255,0,255)"
									})
									.addClass("newword")
									.text(prefix + nouns[n]);
								$('#al'+i).append(prefDiv);
								$('#al'+i).append("<br>");
							}
							count++;
						}
					}
					
					var letterLink = $('<a>')
						.attr({"href":"#" + alphabet[i]})
						.text("See all " + alphabet[i] + " ⟶")
						.on('click', function(ev) {
							ev.preventDefault();
							var letter = this.href.split("#")[1];
							$('#alphabetical').addClass('hidden');
							$('#prefix').empty().removeClass('hidden').addClass("prefix");
							
							for (var n = 0; n < nouns.length; n++) {
								if (nouns[n][0] == letter) {
									var prefDiv = $('<a>')
										.attr({"href":"#"+ prefix + "-" + nouns[n]})
										.addClass("newword")
										.css({color: 
											"rgba(255,0,255)"
										})
										.text(prefix + nouns[n]);
									$('#prefix').append(prefDiv);
									$('#prefix').append("<br>");
									
								}
							}
						});
					alphaheader.append("( " + matches + " / " + count + " ) ");
					alphaheader.append(letterLink);
					$('#alphabetical').append("<br><br>");
				}
			});
		}
	});
}

$('body').on("mouseover", ".newword", function(){
	$(this).css({color:"hsla("+getRandomInt(30,300, 200)+","+getRandomInt(60,90)+"%,"+getRandomInt(50, 80)+"%,1)"});
})
.on("mouseout", ".newword", function(){
	$(this).css({color:"black"});
})

var getDef = function() {
	updateBreadcrumb(this);
	$("#nouns").addClass('hidden');
	$("#prefix").addClass('hidden');
	$("#alphabetical").addClass('hidden');
	$("#counter").addClass('hidden');
	$('#def-wrap').removeClass("hidden");
	var pair = this.hash.split("-");
	pair[0] = pair[0].replace('#', '');
	$('#prefix-word').html(pair[0]);
	$('#noun-word').html(pair[1]);


	$.ajax({
		url: "https://en.wiktionary.org/w/api.php",
    	dataType: 'jsonp', 
    	data: { 
        	action: "query", 
        	prop: 'extracts', 
        	
        	titles: pair[1],
        	format: "json",
        	
    	},
		success: function(data) {
			console.log(data.query);
			var html = "";
			for (var obj in data.query.pages) {
				console.log(data.query.pages[obj].extract);
				html = data.query.pages[obj].extract;
			}
			
			$('#noun-def').html(html);
		},
		error: function(error) {
			console.log(error);
		}
	});
};
$('body').on('click', '.newword', getDef);


//if ( location.href.includes("#") ) getDef();
