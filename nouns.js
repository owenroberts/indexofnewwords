var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
var stop = false;
var nounset;
var prefix;
$('#stop').on('click', function(ev) {
	ev.preventDefault();
	stop = true;
});

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

var setNouns = function(string) {
	nounset = string;
	$('#set').addClass('hidden');
	loadPrefixes();
}

var loadPrefixes = function() {
	$.ajax({
		url: "./pref.txt",
		success: function(data) {
			var prefixes = data.split('\n');
			for (var i = 0; i < prefixes.length; i++) {
				var prefDiv = $('<a>')
					.attr({"href":"#"+prefixes[i]})
					.addClass("pref")
					.text(prefixes[i]);
				prefDiv.on('click', function() {
					prefix = this.innerHTML;
					$('#prefix').addClass('hidden');
					loadNouns();
				});
				$('#prefix').append(prefDiv);
				$('#prefix').append("<br>");
			}
			$('#prefix').removeClass('hidden');
		}
	});
}

var loadNouns = function(set) {
	$.ajax({
		url: "./"+nounset+".txt",
		success: function(data) {
			var nouns = data.split(',\n');
			nouns.sort();
			$("#counter").removeClass("hidden");				

			asyncLoop({
				length:nouns.length,
				functionToLoop : function(loop, i) {
					setTimeout(function() {
						$('#nouns').append(prefix + nouns[i] + "<br>");
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
					$('#alphabetical').append("<strong>" + alphabet[i] + "<strong>");
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
									.attr({"href":"#"+ prefix + nouns[n]})
									.addClass("pref")
									.text(prefix + nouns[n]);
								$('#al'+i).append(prefDiv);
								$('#al'+i).append("<br>");
							}
							count++;
						}
					}
					$('#alphabetical').append("<br>");
					$('#alphabetical').append("( " + matches + " / " + count + " ) ");
					var letterLink = $('<a>')
						.attr({"href":"#" + alphabet[i]})
						.text("See all " + alphabet[i] + " ⟶")
						.on('click', function(ev) {
							ev.preventDefault();
							var letter = this.href.split("#")[1];
							$('#alphabetical').addClass('hidden');
							$('#prefix').empty().removeClass('hidden');
							
							for (var n = 0; n < nouns.length; n++) {
								if (nouns[n][0] == letter) {
									var prefDiv = $('<a>')
										.attr({"href":"#"+ prefix + nouns[n]})
										.addClass("pref")
										.text(prefix + nouns[n]);
									$('#prefix').append(prefDiv);
									$('#prefix').append("<br>");
									
								}
							}
						});
					$('#alphabetical').append(letterLink);
					$('#alphabetical').append("<br><br>");
				}
			});
		}
	});
}

