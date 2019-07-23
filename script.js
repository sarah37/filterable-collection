d3.csv(
	"https://docs.google.com/spreadsheets/d/e/2PACX-1vSw8TQqogki3JTHU-jdofvhu0RjSwgzSM65Z5w-5vDYYSbewBazuZHuxYOqkCUHgP5t-K_MoxStLocX/pub?gid=0&single=true&output=csv"
)
	.then(function(data) {
		console.log(data);

		// display count in heading
		d3.select("#count").text(data.length);

		// draw boxes for papers
		var container = d3.select(".grid");

		var div = container
			.selectAll("div")
			.data(data)
			.enter()
			.append("div")
			.classed("grid-item", true);

		div.append("img").attr("src", d => "img/" + d.image + ".png");
		div.append("h2").text(d => d.Title);
		div.append("span").text(d => d.Author);
		div.append("br");
		div.append("span").text(d => d["Publication Year"]);
		div.append("br");
		div
			.append("a")
			.attr("href", d => "https://doi.org/" + d.DOI)
			.attr("target", "_blank")
			.text("[DOI Link]");
		div.append("br");

		[
			"paper_type",
			"geography_representation",
			"network_representation",
			"integration"
		].forEach(function(tag) {
			div
				.append("div")
				.classed("tag", true)
				.classed(tag, true)
				.html(d => d[tag]);
		});
	})
	.then(function() {
		imagesLoaded(".grid", function() {
			var elem = document.querySelector(".grid");
			var msnry = new Masonry(elem, {
				// options
				itemSelector: ".grid-item",
				columnWidth: 270,
				gutter: 20
			});
		});
	})
	.catch(function(error) {
		throw error;
	});
