var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
var stop = false;
var nounset;
var prefdef = [];

var asyncLoop = function(o) {
	var i=-1;
	var loop = function() {
		if (stop) return;
		i++;
		if (i==o.length){o.callback(); return;}
		o.functionToLoop(loop, i);
	}
	loop();
}

$('#stop').on('click', function(ev) {
	ev.preventDefault();
	stop = true;
});

$("#word").on('click', function() { 
	$('#set-nouns').removeClass('hidden');
	$('#set-nouns li').removeClass('hidden');
	$('#nouns').addClass("hidden");
	$('#def-wrap').addClass("hidden");
	collapse(this);
});

var collapse = function(e) {
	var list = e.parentNode.parentNode;
	var items = list.childNodes;

	for (var i = 0; i < items.length; i++) {
		if (items[i] != e.parentNode) {
			$(items[i]).addClass("hidden");
		}
	}	
}

var setNouns = function(string) {
	$('prefixes').html("");
	$('#nouns').addClass("hidden");
	nounset = this.hash.split("#")[1] + "nouns";
	collapse(this);
	loadPrefixes();
};
$('.numnouns').on('click', setNouns);

$('#choose-noun').on('click', function() {
	$('#nouns').html("");
	$('#def-wrap').addClass("hidden");
	$('#input-noun').removeClass('hidden');
});

$('#input-noun input').on('change', function() {
	$('#input-noun').addClass('hidden');
	$('#nouns').removeClass("hidden");
	loadPrefixes(this.value);
	collapse(this.parentNode);
});

$('#input-prefix').on('change', function() {
	loadNouns(this.value);
});

var randomNoun = function() {
	$('#nouns').html("");
	$('#def-wrap').addClass("hidden");
	$('#nouns').removeClass("hidden");
	collapse(this);
	$.ajax({
		url: "./data/somenouns.txt",
		success: function(data) {
			var nouns = data.split(',\n');
			loadPrefixes( nouns[getRandomInt(0, nouns.length - 1)] );
		}
	});
}
$('#random').on('click', randomNoun);

var loadPrefixes = function(noun) {
	$.ajax({
		url: "./data/prefix.csv",
		success: function(data) {
			prefloaded = true;
			var csv = CSVToArray(data);
			var prefixes = [];
			for (var i = 0; i < csv.length; i++) {
				var pref = csv[i][0].split(/[^a-zA-Z]/)[0].toLowerCase(); 
				prefixes.push(  pref  );
				prefdef[pref] = csv[i][1];
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

var loadNouns = function(prefix) {
	$('#nouns').removeClass("hidden");
	$('#nouns').html("");
	$('#prefix').addClass('hidden');
	$.ajax({
		url: "./data/"+nounset+".txt",
		success: function(data) {
			var nouns = data.split(',\n');
			nouns.sort();
			$("#counter").removeClass("hidden");
			stop = false;		
			asyncLoop({
				length:nouns.length,
				functionToLoop : function(loop, i) {
					setTimeout(function() {
						addEntry(prefix, nouns[i]);
						$('#counter span').text(+i+1 + " / " + nouns.length);
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
});


var getDef = function() {
	$("#nouns").addClass('hidden');
	$("#prefix").addClass('hidden');
	$("#alphabetical").addClass('hidden');
	$("#counter").addClass('hidden');
	$('#def-wrap').removeClass("hidden");
	var pair = this.hash.split("-");
	pair[0] = pair[0].replace('#', '');
	$('#prefix-word').html(pair[0]);
	$('#prefix-def').html( prefdef[pair[0]] );
	$('#noun-word').html(pair[1]);


	$.ajax({
		url: "https://en.wiktionary.org/w/api.php",
    	dataType: 'jsonp', 
    	data: { 
        	action: "query", 
        	prop: 'extracts', 
        	titles: pair[1],
        	format: "json"
    	},
		success: function(data) {
			var html = "";
			for (var obj in data.query.pages) {
				if (data.query.pages[obj].extract) 
					html = data.query.pages[obj].extract;
				else 
					$('#noun-def').html("Not found.");
			}
			$('#noun-def').html(html);
		},
		error: function(error) {
			console.log(error);
			$('#noun-def').html("Not found.");

		}
	});
};
$('body').on('click', '.newword', getDef);


//if ( location.href.includes("#") ) getDef();
