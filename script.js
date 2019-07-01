d3.csv("Papers.csv")
	.then(function(data) {
		console.log(data);

		// var options = ["tbd", "include", "unsure", "exclude"];
		var options = ["include"];

		options.forEach(function(opt) {
			var container = d3.select("#container_" + opt);

			var div = container
				.selectAll("div")
				.data(data.filter(d => d.include == opt))
				.enter()
				.append("div")
				.classed("paperBox", true)
				.classed("grid-item", true);

			d3.select("#count_" + opt).text(
				data.filter(d => d.include == opt).length
			);
		});

		var div = d3.selectAll(".paperBox");

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
	})
	.catch(function(error) {
		throw error;
	});

// Javascript
// var container = document.querySelector(".grid");
// var msnry = new Masonry(container, {
// 	// options
// 	// columnWidth: 270,
// 	itemSelector: ".paperBox",
// 	gutter: 20,
// 	isFitWidth: true
// });
